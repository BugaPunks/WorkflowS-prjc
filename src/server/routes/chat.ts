import { Router } from "express";
import { prisma } from "../db";

const router = Router();

// GET mensajes de un proyecto
router.get("/:projectId/messages", async (req, res) => {
	try {
		const { projectId } = req.params;

		// Buscar el chat del proyecto
		let chat = await prisma.chat.findFirst({
			where: { projectId },
			include: {
				messages: {
					include: { user: true },
					orderBy: { createdAt: "asc" },
				},
			},
		});

		// Si no existe, crearlo
		if (!chat) {
			chat = await prisma.chat.create({
				data: { projectId },
				include: {
					messages: { include: { user: true } },
				},
			});
		}

		res.json({ data: chat.messages || [] });
	} catch (error) {
		console.error("Error fetching messages:", error);
		res.status(500).json({ error: "Error al obtener mensajes" });
	}
});

// POST enviar mensaje
router.post("/:projectId/messages", async (req, res) => {
	try {
		const { projectId } = req.params;
		const { userId, content } = req.body;

		if (!content || !userId) {
			return res.status(400).json({ error: "Faltan datos" });
		}

		// Buscar chat
		let chat = await prisma.chat.findFirst({
			where: { projectId },
		});

		if (!chat) {
			chat = await prisma.chat.create({
				data: { projectId },
			});
		}

		const message = await prisma.message.create({
			data: {
				chatId: chat.id,
				userId,
				content,
			},
			include: { user: true },
		});

		res.status(201).json({ data: message });
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ error: "Error al enviar mensaje" });
	}
});

export default router;
