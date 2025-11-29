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
				data: { projectId, type: "PROJECT" },
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

// === DM Routes ===

// GET mis chats (DMs y Proyectos donde participo)
router.get("/user/:userId/all", async (req, res) => {
	try {
		const { userId } = req.params;
		// Find chats where user is participant OR linked to projects where user is member
		// For simplicity, let's assume we create participants for PROJECT chats too?
		// Currently we don't. PROJECT chats rely on Project membership.
		// So we fetch DIRECT chats via participants, and PROJECT chats via ProjectMember.

		const directChats = await prisma.chat.findMany({
			where: {
				type: "DIRECT",
				participants: { some: { userId } },
			},
			include: {
				participants: {
					include: { user: { select: { id: true, name: true, avatar: true } } },
				},
				messages: { orderBy: { createdAt: "desc" }, take: 1 },
			},
		});

		res.json({ data: directChats });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error loading chats" });
	}
});

// POST crear/obtener DM
router.post("/direct", async (req, res) => {
	try {
		const { userId, targetUserId } = req.body;

		// Check if exists
		const myChats = await prisma.chat.findMany({
			where: {
				type: "DIRECT",
				participants: { some: { userId } },
			},
			include: { participants: true },
		});

		const existing = myChats.find((c) =>
			c.participants.some((p) => p.userId === targetUserId),
		);

		if (existing) return res.json({ data: existing });

		// Create
		const chat = await prisma.chat.create({
			data: {
				type: "DIRECT",
				participants: {
					create: [{ userId }, { userId: targetUserId }],
				},
			},
		});
		res.json({ data: chat });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error creating DM" });
	}
});

// GET messages for specific chat (by ID)
router.get("/conversation/:chatId/messages", async (req, res) => {
	try {
		const { chatId } = req.params;
		const messages = await prisma.message.findMany({
			where: { chatId },
			include: { user: true },
			orderBy: { createdAt: "asc" },
		});
		res.json({ data: messages });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error fetching messages" });
	}
});

// POST message to specific chat (by ID)
router.post("/conversation/:chatId/messages", async (req, res) => {
	try {
		const { chatId } = req.params;
		const { userId, content } = req.body;

		const message = await prisma.message.create({
			data: {
				chatId,
				userId,
				content,
			},
			include: { user: true },
		});

		// Notificar a los otros participantes (DM)
		const chat = await prisma.chat.findUnique({
			where: { id: chatId },
			include: { participants: true },
		});

		if (chat && chat.type === "DIRECT") {
			const recipients = chat.participants.filter((p) => p.userId !== userId);
			for (const recipient of recipients) {
				await prisma.notification.create({
					data: {
						userId: recipient.userId,
						title: "Nuevo Mensaje Directo",
						message: `${message.user.name} te ha enviado un mensaje`,
						type: "MESSAGE",
					},
				});
			}
		}

		res.status(201).json({ data: message });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Error sending message" });
	}
});

export default router;
