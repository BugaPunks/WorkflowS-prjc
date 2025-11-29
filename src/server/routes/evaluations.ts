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

// GET evaluaciones de un estudiante (Tareas asignadas + Sprints/Proyectos de sus equipos)
router.get("/student/:studentId", async (req, res) => {
	try {
		const { studentId } = req.params;

		// 1. Evaluaciones de tareas asignadas al estudiante
		const taskEvaluations = await prisma.evaluation.findMany({
			where: {
				task: { assigneeId: studentId },
			},
			include: {
				project: { select: { name: true } },
				task: { select: { title: true } },
				sprint: { select: { name: true } },
				evaluator: { select: { name: true } },
			},
		});

		// 2. Evaluaciones de equipo (Sprint y Proyecto)
		// Primero obtenemos los proyectos donde es miembro
		const memberships = await prisma.projectMember.findMany({
			where: { userId: studentId },
			select: { projectId: true },
		});
		const projectIds = memberships.map((m) => m.projectId);

		const teamEvaluations = await prisma.evaluation.findMany({
			where: {
				projectId: { in: projectIds },
				taskId: null, // Excluir tareas (ya cubiertas arriba si son asignadas, o ignoradas si son de otros)
			},
			include: {
				project: { select: { name: true } },
				sprint: { select: { name: true } },
				evaluator: { select: { name: true } },
			},
		});

		// Combinar y ordenar por fecha más reciente
		const allEvaluations = [...taskEvaluations, ...teamEvaluations].sort(
			(a, b) =>
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);

		res.json({ data: allEvaluations });
	} catch (error) {
		console.error("Error getting student evaluations:", error);
		res.status(500).json({ error: "Error al obtener mis calificaciones" });
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

// PUT actualizar evaluación (Corregir nota/criterios)
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { feedback, criteriaScores, score } = req.body;

		// We need at least scores to make sense of an update
		if (!Array.isArray(criteriaScores)) {
			return res.status(400).json({ error: "Datos de criterios inválidos" });
		}

		const updatedEvaluation = await prisma.$transaction(async (tx) => {
			// Update main fields
			const _ev = await tx.evaluation.update({
				where: { id },
				data: {
					feedback,
					score, // Optional: if frontend calculates it, otherwise we can sum criteria
				},
			});

			// Update criteria
			// Strategy: Delete old details and re-insert (simplest for full overwrite)
			// OR upsert if we had stable IDs for evaluation_criteria (we do, but frontend might not send them)
			// Re-inserting is safer to match the "form state".

			await tx.evaluationCriteria.deleteMany({
				where: { evaluationId: id },
			});

			for (const cs of criteriaScores) {
				await tx.evaluationCriteria.create({
					data: {
						evaluationId: id,
						criteriaId: cs.criteriaId,
						score: cs.score,
						comment: cs.comment,
					},
				});
			}

			return tx.evaluation.findUnique({
				where: { id },
				include: { criteria: true },
			});
		});

		res.json({ data: updatedEvaluation });
	} catch (error) {
		console.error("Error updating evaluation:", error);
		res.status(500).json({ error: "Error al actualizar evaluación" });
	}
});

export default router;
