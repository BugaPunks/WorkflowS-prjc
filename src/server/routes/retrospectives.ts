import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET items de retrospectiva por sprint
router.get("/:sprintId", async (req, res) => {
	try {
		const { sprintId } = req.params;
		const items = await prisma.retrospectiveItem.findMany({
			where: { sprintId },
			include: {
				user: {
					select: { id: true, name: true, avatar: true },
				},
			},
			orderBy: { createdAt: "asc" },
		});
		res.json({ data: items });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error al obtener retrospectiva" });
	}
});

// POST crear item
router.post("/", async (req, res) => {
	try {
		const { sprintId, type, content, userId } = req.body;
		if (!sprintId || !type || !content || !userId) {
			return res.status(400).json({ error: "Datos incompletos" });
		}

		const item = await prisma.retrospectiveItem.create({
			data: {
				sprintId,
				type,
				content,
				userId,
			},
			include: {
				user: {
					select: { id: true, name: true, avatar: true },
				},
				sprint: {
					include: {
						project: {
							include: {
								members: true,
							},
						},
					},
				},
			},
		});

		// Notificar a los miembros del equipo
		const projectMembers = item.sprint.project.members;
		const notifications = projectMembers
			.filter((member) => member.userId !== userId) // No notificar al autor
			.map((member) => ({
				userId: member.userId,
				title: "Nueva Nota en Retrospectiva",
				message: `Se ha añadido una nota "${type}" en el sprint ${item.sprint.name}`,
				type: "RETROSPECTIVE_ITEM",
			}));

		if (notifications.length > 0) {
			await prisma.notification.createMany({
				data: notifications,
			});
		}

		res.status(201).json({ data: item });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error al crear item" });
	}
});

// DELETE item
router.delete("/:id", async (req, res) => {
	try {
		await prisma.retrospectiveItem.delete({
			where: { id: req.params.id },
		});
		res.json({ message: "Item eliminado" });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error al eliminar item" });
	}
});

export default router;
