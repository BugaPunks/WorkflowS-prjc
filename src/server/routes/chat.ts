import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET mensajes de un proyecto (a través de su chat por defecto)
router.get('/:projectId/messages', async (req, res) => {
  try {
    const { projectId } = req.params;

    // Buscar el chat del proyecto (asumimos uno por proyecto por ahora)
    let chat = await prisma.chat.findFirst({
      where: { projectId },
      include: {
        conversations: {
          include: {
            messages: {
              include: { user: true },
              orderBy: { createdAt: 'asc' },
            },
          },
        },
      },
    });

    // Si no existe, crearlo
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          projectId,
          conversations: {
            create: { topic: 'General' },
          },
        },
        include: {
          conversations: {
            include: {
              messages: { include: { user: true } },
            },
          },
        },
      });
    }

    // Retornar mensajes de la conversación principal
    const messages = chat.conversations[0]?.messages || [];
    res.json({ data: messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Error al obtener mensajes' });
  }
});

// POST enviar mensaje
router.post('/:projectId/messages', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId, content } = req.body;

    if (!content || !userId) {
      return res.status(400).json({ error: 'Faltan datos' });
    }

    // Buscar conversación principal
    const chat = await prisma.chat.findFirst({
      where: { projectId },
      include: { conversations: true },
    });

    if (!chat || chat.conversations.length === 0) {
      return res.status(404).json({ error: 'Chat no inicializado' });
    }

    const conversationId = chat.conversations[0].id;

    const message = await prisma.message.create({
      data: {
        conversationId,
        userId,
        content,
      },
      include: { user: true },
    });

    res.status(201).json({ data: message });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
});

export default router;
