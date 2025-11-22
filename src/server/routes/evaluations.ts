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

// POST crear evaluación (Calificar)
router.post("/", async (req, res) => {
	try {
		const { projectId, taskId, evaluatorId, feedback, criteriaScores, score } =
			req.body;

		if (
			!projectId ||
			!taskId ||
			!evaluatorId ||
			!Array.isArray(criteriaScores)
		) {
			return res.status(400).json({ error: "Datos inválidos" });
		}

		const user = await prisma.user.findUnique({ where: { id: evaluatorId } });
		if (!user)
			return res.status(404).json({ error: "Evaluador no encontrado" });

		const evaluation = await prisma.$transaction(async (tx) => {
			// Create evaluation record
			const evalRecord = await tx.evaluation.create({
				data: {
					projectId,
					taskId,
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

			// Update total score on evaluation. Use provided score from frontend (normalized)
			// or default to 0 if not provided (for backward compatibility/safety)
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
