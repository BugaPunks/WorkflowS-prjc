import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET Rúbricas de un proyecto
router.get("/:projectId", async (req, res) => {
	try {
		const { projectId } = req.params;
		const rubrics = await prisma.rubric.findMany({
			where: { projectId },
			include: { criteria: true },
			orderBy: { createdAt: "desc" },
		});
		res.json({ data: rubrics });
	} catch (error) {
		console.error("Error getting rubrics:", error);
		res.status(500).json({ error: "Error al obtener rúbricas" });
	}
});

// POST crear Rúbrica
router.post("/", async (req, res) => {
	try {
		const { projectId, name, description, criteria } = req.body;

		if (!projectId || !name || !criteria || !Array.isArray(criteria)) {
			return res.status(400).json({ error: "Datos inválidos" });
		}

		const rubric = await prisma.rubric.create({
			data: {
				projectId,
				name,
				description,
				criteria: {
					create: criteria.map(
						(c: { name: string; maxScore: number; weight: number }) => ({
							name: c.name,
							maxScore: c.maxScore || 10,
							weight: c.weight || 1,
						}),
					),
				},
			},
			include: { criteria: true },
		});

		res.status(201).json({ data: rubric });
	} catch (error) {
		console.error("Error creating rubric:", error);
		res.status(500).json({ error: "Error al crear rúbrica" });
	}
});

// PUT actualizar Rúbrica
router.put("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		const { name, description, criteria } = req.body;

		if (!name || !criteria || !Array.isArray(criteria)) {
			return res.status(400).json({ error: "Datos inválidos" });
		}

		// Transaction to handle criteria updates (delete missing, update existing, create new)
		const updatedRubric = await prisma.$transaction(async (tx) => {
			// 1. Update Rubric basic info
			const _rubric = await tx.rubric.update({
				where: { id },
				data: { name, description },
			});

			// 2. Handle Criteria
			// Get existing criteria IDs
			const existingCriteria = await tx.criteria.findMany({
				where: { rubricId: id },
				select: { id: true },
			});
			const existingIds = existingCriteria.map((c) => c.id);

			// IDs from request
			const requestIds = criteria
				.filter((c: { id?: string }) => c.id && existingIds.includes(c.id))
				.map((c: { id?: string }) => c.id);

			// Delete criteria not in request
			const toDelete = existingIds.filter((id) => !requestIds.includes(id));
			if (toDelete.length > 0) {
				await tx.criteria.deleteMany({
					where: { id: { in: toDelete } },
				});
			}

			// Update existing and Create new
			for (const c of criteria) {
				if (c.id && existingIds.includes(c.id)) {
					await tx.criteria.update({
						where: { id: c.id },
						data: {
							name: c.name,
							maxScore: c.maxScore,
							weight: c.weight,
						},
					});
				} else {
					await tx.criteria.create({
						data: {
							rubricId: id,
							name: c.name,
							maxScore: c.maxScore || 10,
							weight: c.weight || 1,
						},
					});
				}
			}

			return tx.rubric.findUnique({
				where: { id },
				include: { criteria: true },
			});
		});

		res.json({ data: updatedRubric });
	} catch (error) {
		console.error("Error updating rubric:", error);
		res.status(500).json({ error: "Error al actualizar rúbrica" });
	}
});

// DELETE eliminar Rúbrica
router.delete("/:id", async (req, res) => {
	try {
		const { id } = req.params;
		await prisma.rubric.delete({
			where: { id },
		});
		res.json({ message: "Rúbrica eliminada" });
	} catch (error) {
		console.error("Error deleting rubric:", error);
		res.status(500).json({ error: "Error al eliminar rúbrica" });
	}
});

export default router;
