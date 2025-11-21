import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET Burndown Data for a Sprint
router.get("/sprints/:sprintId/burndown", async (req, res) => {
	try {
		const { sprintId } = req.params;

		const sprint = await prisma.sprint.findUnique({
			where: { id: sprintId },
			include: {
				backlogItems: {
					include: {
						tasks: true, // We need tasks to know when they were completed
					},
				},
			},
		});

		if (!sprint) {
			return res.status(404).json({ error: "Sprint not found" });
		}

		// Calculate total points
		const totalPoints = sprint.backlogItems.reduce(
			(acc, item) => acc + (item.storyPoints || 0),
			0,
		);

		if (!sprint.startDate || !sprint.endDate) {
			return res.json({ data: { totalPoints, series: [] } });
		}

		const start = new Date(sprint.startDate);
		const end = new Date(sprint.endDate);
		const daysDiff = Math.ceil(
			(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
		);

		// Generate daily data
		const series = [];
		const remainingPoints = totalPoints;

		// Map completions by day
		// A story is "done" when its status is DONE? Or when all tasks are DONE?
		// Let's assume BacklogItem status 'DONE' means it's burnt.
		// But we need the DATE it was done. Prisma `updatedAt` is the best proxy we have if we don't have a history table.
		// Or we check the tasks?
		// Let's use BacklogItem 'updatedAt' if status is DONE or COMPLETED.

		const completedItems = sprint.backlogItems
			.filter((item) => item.status === "DONE" || item.status === "COMPLETED")
			.map((item) => ({
				points: item.storyPoints || 0,
				date: new Date(item.updatedAt),
			}));

		// Ideal decrement per day
		const idealDecrement = totalPoints / daysDiff;

		for (let i = 0; i <= daysDiff; i++) {
			const currentDate = new Date(start);
			currentDate.setDate(start.getDate() + i);

			// Calculate actual remaining
			// Sum points of items completed ON or BEFORE currentDate
			const burnedSoFar = completedItems
				.filter((item) => item.date <= currentDate)
				.reduce((acc, item) => acc + item.points, 0);

			const actualRemaining = totalPoints - burnedSoFar;
			const idealRemaining = Math.max(0, totalPoints - idealDecrement * i);

			// Only show actual if currentDate is in the past/today
			const isFuture = currentDate > new Date();

			series.push({
				day: i,
				date: currentDate.toISOString().split("T")[0],
				ideal: idealRemaining,
				actual: isFuture ? null : actualRemaining,
			});
		}

		res.json({ data: { totalPoints, series } });
	} catch (error) {
		console.error("Error fetching burndown:", error);
		res.status(500).json({ error: "Error calculating metrics" });
	}
});

// GET Individual Contribution (Tasks completed)
router.get("/projects/:projectId/contribution", async (req, res) => {
	try {
		const { projectId } = req.params;

		// Get all completed tasks in the project
		const tasks = await prisma.task.findMany({
			where: {
				projectId,
				status: "COMPLETED",
			},
			include: {
				assignee: {
					select: { id: true, name: true, email: true, avatar: true },
				},
			},
		});

		// Group by user
		const contributionMap = new Map<string, { user: any; count: number }>();

		tasks.forEach((task) => {
			if (!task.assignee) return; // Unassigned tasks don't count

			const userId = task.assignee.id;
			if (!contributionMap.has(userId)) {
				contributionMap.set(userId, { user: task.assignee, count: 0 });
			}

			const entry = contributionMap.get(userId);
			if (entry) entry.count += 1; // Just counting tasks for now. Could verify story points if linked.
		});

		const data = Array.from(contributionMap.values()).sort(
			(a, b) => b.count - a.count,
		);

		res.json({ data });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error fetching contributions" });
	}
});

export default router;
