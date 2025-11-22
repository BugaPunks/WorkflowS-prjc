import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET evaluación por ID
router.get("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const evaluation = await prisma.evaluation.findUnique({
			where: { id },
			include: {
				criteria: {
					include: { criteria: true },
				},
				evaluator: {
					select: { name: true, id: true },
				},
			},
		});
		if (!evaluation)
			return res.status(404).json({ error: "Evaluación no encontrada" });
		res.json({ data: evaluation });
	} catch (error) {
		console.error("Error getting evaluation:", error);
		res.status(500).json({ error: "Error al obtener evaluación" });
	}
});

// GET evaluaciones de una tarea
router.get("/task/:taskId", async (req, res) => {
	try {
		const { taskId } = req.params;
		const evaluations = await prisma.evaluation.findMany({
			where: { taskId },
			include: {
				evaluator: {
					select: { name: true, id: true },
				},
				criteria: true,
			},
			orderBy: { createdAt: "desc" },
		});
		res.json({ data: evaluations });
	} catch (error) {
		console.error("Error getting task evaluations:", error);
		res.status(500).json({ error: "Error al obtener evaluaciones" });
	}
});

// GET evaluaciones de un sprint
router.get("/sprint/:sprintId", async (req, res) => {
	try {
		const { sprintId } = req.params;
		const evaluations = await prisma.evaluation.findMany({
			where: { sprintId },
			include: {
				evaluator: {
					select: { name: true, id: true },
				},
				criteria: true,
			},
			orderBy: { createdAt: "desc" },
		});
		res.json({ data: evaluations });
	} catch (error) {
		console.error("Error getting sprint evaluations:", error);
		res.status(500).json({ error: "Error al obtener evaluaciones" });
	}
});

// GET evaluaciones de un proyecto (generales, sin task ni sprint)
router.get("/project/:projectId/general", async (req, res) => {
	try {
		const { projectId } = req.params;
		const evaluations = await prisma.evaluation.findMany({
			where: {
				projectId,
				taskId: null,
				sprintId: null,
			},
			include: {
				evaluator: {
					select: { name: true, id: true },
				},
				criteria: true,
			},
			orderBy: { createdAt: "desc" },
		});
		res.json({ data: evaluations });
	} catch (error) {
		console.error("Error getting project evaluations:", error);
		res.status(500).json({ error: "Error al obtener evaluaciones" });
	}
});

// POST crear evaluación (Calificar Tarea, Sprint o Proyecto)
router.post("/", async (req, res) => {
	try {
		const {
			projectId,
			taskId,
			sprintId,
			evaluatorId,
			feedback,
			criteriaScores,
			score,
		} = req.body;

		// Validate required fields (projectId, evaluatorId are always required)
		// At least one context (taskId, sprintId) or none (Project Level) is allowed,
		// but if taskId is missing, sprintId might be missing too for Project Level.
		if (!projectId || !evaluatorId || !Array.isArray(criteriaScores)) {
			return res
				.status(400)
				.json({ error: "Datos inválidos: Faltan campos básicos" });
		}

		const user = await prisma.user.findUnique({ where: { id: evaluatorId } });
		if (!user)
			return res.status(404).json({ error: "Evaluador no encontrado" });

		const evaluation = await prisma.$transaction(async (tx) => {
			// Create evaluation record
			// taskId and sprintId are optional (can be null)
			const evalRecord = await tx.evaluation.create({
				data: {
					projectId,
					taskId: taskId || null,
					sprintId: sprintId || null,
					evaluatorId,
					feedback,
					status: "COMPLETED",
				},
			});

			// Create criteria records
			for (const cs of criteriaScores) {
				await tx.evaluationCriteria.create({
					data: {
						evaluationId: evalRecord.id,
						criteriaId: cs.criteriaId,
						score: cs.score,
						comment: cs.comment,
					},
				});
			}

			// Update total score on evaluation
			return tx.evaluation.update({
				where: { id: evalRecord.id },
				data: { score: score || 0 },
				include: { criteria: true },
			});
		});

		res.status(201).json({ data: evaluation });
	} catch (error) {
		console.error("Error creating evaluation:", error);
		res.status(500).json({ error: "Error al guardar evaluación" });
	}
});

export default router;
