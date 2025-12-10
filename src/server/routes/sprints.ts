import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET todos los sprints
router.get("/", async (_req, res) => {
	try {
		const sprints = await prisma.sprint.findMany({
			include: {
				project: true,
				tasks: true,
				userStories: true,
				evaluations: true,
			},
		});
		res.json({ data: sprints });
	} catch (error) {
		console.error("Error al obtener sprints:", error);
		res.status(500).json({
			error: "Error al obtener sprints",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// GET sprint por ID
router.get("/:id", async (req, res) => {
	try {
		const sprint = await prisma.sprint.findUnique({
			where: { id: req.params.id },
			include: {
				project: true,
				tasks: true,
				userStories: true,
				evaluations: true,
			},
		});
		if (!sprint) return res.status(404).json({ error: "Sprint no encontrado" });
		res.json({ data: sprint });
	} catch (error) {
		console.error("Error al obtener sprint:", error);
		res.status(500).json({
			error: "Error al obtener sprint",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// POST crear sprint
router.post("/", async (req, res) => {
	try {
		const { name, description, projectId, startDate, endDate, status } =
			req.body;

		if (!name || !projectId) {
			return res.status(400).json({ error: "Faltan campos requeridos" });
		}

		const sprint = await prisma.sprint.create({
			data: {
				name,
				description,
				projectId,
				startDate: startDate ? new Date(startDate) : undefined,
				endDate: endDate ? new Date(endDate) : undefined,
				status: status || "PLANNING",
			},
		});
		res.status(201).json({ data: sprint });
	} catch (error) {
		console.error("Error al crear sprint:", error);
		res.status(500).json({
			error: "Error al crear sprint",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// PUT actualizar sprint
router.put("/:id", async (req, res) => {
	try {
		const sprint = await prisma.sprint.update({
			where: { id: req.params.id },
			data: req.body,
		});
		res.json({ data: sprint });
	} catch (error) {
		console.error("Error al actualizar sprint:", error);
		res.status(500).json({
			error: "Error al actualizar sprint",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// POST agregar historia de usuario a sprint
router.post("/:id/add-story", async (req, res) => {
	try {
		const { userStoryId } = req.body;
		const sprintId = req.params.id;

		if (!userStoryId) {
			return res.status(400).json({ error: "Falta userStoryId" });
		}

		// Verificar si la historia existe
		const userStory = await prisma.userStory.findUnique({
			where: { id: userStoryId },
		});

		if (!userStory) {
			return res.status(404).json({ error: "Historia no encontrada" });
		}

		// Verificar si ya está en ESTE sprint
		if (userStory.sprintId === sprintId) {
			return res
				.status(400)
				.json({ error: "La historia ya está en el sprint" });
		}

		// Actualizar la historia directamente
		const updatedStory = await prisma.userStory.update({
			where: { id: userStoryId },
			data: { sprintId },
		});

		res.status(201).json({ data: updatedStory });
	} catch (error) {
		console.error("Error al agregar historia al sprint:", error);
		res.status(500).json({
			error: "Error al agregar historia al sprint",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

// DELETE sprint
router.delete("/:id", async (req, res) => {
	try {
		await prisma.sprint.delete({
			where: { id: req.params.id },
		});
		res.json({ data: { message: "Sprint eliminado" } });
	} catch (error) {
		console.error("Error al eliminar sprint:", error);
		res.status(500).json({
			error: "Error al eliminar sprint",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

export default router;
