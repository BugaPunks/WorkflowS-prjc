import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET notificaciones de un usuario
router.get("/", async (req, res) => {
	try {
		const { userId } = req.query;
		if (!userId) return res.status(400).json({ error: "Falta userId" });

		const notifications = await prisma.notification.findMany({
			where: { userId: String(userId) },
			orderBy: { createdAt: "desc" },
			take: 20, // Limit to last 20
		});
		res.json({ data: notifications });
	} catch (_error) {
		res.status(500).json({ error: "Error al obtener notificaciones" });
	}
});

// PUT marcar como leída
router.put("/:id/read", async (req, res) => {
	try {
		const { id } = req.params;
		await prisma.notification.update({
			where: { id },
			data: { read: true },
		});
		res.json({ message: "Marcada como leída" });
	} catch (_error) {
		res.status(500).json({ error: "Error al actualizar notificación" });
	}
});

export default router;
