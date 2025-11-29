import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET todas las tareas
router.get("/", async (req, res) => {
	try {
		const { assigneeId, projectId } = req.query;
		const where: Record<string, string> = {};

		if (assigneeId) where.assigneeId = String(assigneeId);
		if (projectId) where.projectId = String(projectId);

		const tasks = await prisma.task.findMany({
			where,
			include: {
				assignee: {
					select: { id: true, name: true, email: true },
				},
				project: {
					select: { id: true, name: true },
				},
				evaluations: true,
			},
		});
		res.json({ data: tasks });
	} catch {
		res.status(500).json({ error: "Error al obtener tareas" });
	}
});

// GET tarea por ID
router.get("/:id", async (req, res) => {
	try {
		const task = await prisma.task.findUnique({
			where: { id: req.params.id },
			include: {
				assignee: true,
				project: true,
				evaluations: true,
			},
		});
		if (!task) return res.status(404).json({ error: "Tarea no encontrada" });
		res.json({ data: task });
	} catch {
		res.status(500).json({ error: "Error al obtener tarea" });
	}
});

// POST crear tarea
router.post("/", async (req, res) => {
	try {
		const {
			title,
			description,
			projectId,
			assigneeId,
			priority,
			deadline,
			status,
			sprintId,
			userStoryId,
		} = req.body;

		if (!title || !projectId) {
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		const task = await prisma.task.create({
			data: {
				title,
				description,
				projectId,
				assigneeId,
				priority: priority || "MEDIUM",
				deadline: deadline ? new Date(deadline) : null,
				status: status || "TODO",
				sprintId: sprintId || null,
				userStoryId: userStoryId || null,
			},
		});

		// Crear notificación si hay asignado
		if (assigneeId) {
			await prisma.notification.create({
				data: {
					userId: assigneeId,
					title: "Nueva Tarea Asignada",
					message: `Se te ha asignado la tarea: ${title}`,
					type: "TASK_ASSIGNED",
				},
			});
		}

		res.status(201).json({ data: task });
	} catch {
		res.status(500).json({ error: "Error al crear tarea" });
	}
});

// PUT actualizar tarea
router.put("/:id", async (req, res) => {
	try {
		const { deadline, status, ...updateData } = req.body;

		// Define a specific type for the update object
		interface TaskUpdateData {
			title?: string;
			description?: string;
			priority?: string;
			assigneeId?: string;
			sprintId?: string;
			userStoryId?: string;
			deadline?: Date | null;
			status?: string;
			completedAt?: Date | null;
		}

		const dataToUpdate: TaskUpdateData = { ...updateData };

		if (deadline) dataToUpdate.deadline = new Date(deadline);
		if (status) {
			dataToUpdate.status = status;
			if (status === "COMPLETED" || status === "DONE") {
				dataToUpdate.completedAt = new Date();
			} else if (
				status === "TODO" ||
				status === "IN_PROGRESS" ||
				status === "PENDING"
			) {
				dataToUpdate.completedAt = null;
			}
		}

		const task = await prisma.task.update({
			where: { id: req.params.id },
			data: dataToUpdate,
		});
		res.json({ data: task });
	} catch {
		res.status(500).json({ error: "Error al actualizar tarea" });
	}
});

// DELETE tarea
router.delete("/:id", async (req, res) => {
	try {
		await prisma.task.delete({
			where: { id: req.params.id },
		});
		res.json({ data: { message: "Tarea eliminada" } });
	} catch {
		res.status(500).json({ error: "Error al eliminar tarea" });
	}
});

// POST evaluar tarea
router.post("/:id/evaluate", async (req, res) => {
	try {
		const { score, feedback, evaluatorId, criteriaScores } = req.body; // criteriaScores: { criteriaId: string, score: number }[]
		const taskId = req.params.id;

		if (score === undefined || !evaluatorId) {
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		const task = await prisma.task.findUnique({ where: { id: taskId } });
		if (!task) return res.status(404).json({ error: "Tarea no encontrada" });

		// Use transaction for atomic creation
		const evaluation = await prisma.$transaction(async (tx) => {
			const newEvaluation = await tx.evaluation.create({
				data: {
					taskId,
					projectId: task.projectId,
					evaluatorId,
					score, // Total score calculated by frontend or re-verified here
					feedback,
					status: "COMPLETED",
				},
			});

			if (criteriaScores && Array.isArray(criteriaScores)) {
				await tx.evaluationCriteria.createMany({
					data: criteriaScores.map(
						(cs: { criteriaId: string; score: number }) => ({
							evaluationId: newEvaluation.id,
							criteriaId: cs.criteriaId,
							score: cs.score,
						}),
					),
				});
			}

			// Update task status if needed, or maybe it stays completed

			return newEvaluation;
		});

		// Notificar al asignado de la tarea
		if (task.assigneeId) {
			await prisma.notification.create({
				data: {
					userId: task.assigneeId,
					title: "Tarea Evaluada",
					message: `Tu tarea "${task.title}" ha sido evaluada con ${score}/100`,
					type: "EVALUATION_COMPLETED",
				},
			});
		}

		res.status(201).json({ data: evaluation });
	} catch (error) {
		console.error("Error al evaluar tarea:", error);
		res.status(500).json({ error: "Error al guardar la evaluación" });
	}
});

export default router;
