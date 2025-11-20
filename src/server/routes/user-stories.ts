import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET todos los User Stories
router.get('/', async (_req, res) => {
  try {
    const userStories = await prisma.userStory.findMany({
      include: {
        project: {
          select: { id: true, name: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    res.json(userStories);
  } catch {
    res.status(500).json({ error: 'Error al obtener user stories' });
  }
});

// GET user story por ID
router.get('/:id', async (req, res) => {
  try {
    const userStory = await prisma.userStory.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        assignee: true,
        tasks: true,
      },
    });
    if (!userStory)
      return res.status(404).json({ error: 'User story no encontrado' });
    res.json(userStory);
  } catch {
    res.status(500).json({ error: 'Error al obtener user story' });
  }
});

// POST crear user story
router.post('/', async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, priority, storyPoints } =
      req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const userStory = await prisma.userStory.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        priority: priority || 'MEDIUM',
        storyPoints,
      },
    });
    res.status(201).json(userStory);
  } catch {
    res.status(500).json({ error: 'Error al crear user story' });
  }
});

// PUT actualizar user story
router.put('/:id', async (req, res) => {
  try {
    const userStory = await prisma.userStory.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(userStory);
  } catch {
    res.status(500).json({ error: 'Error al actualizar user story' });
  }
});

// DELETE user story
router.delete('/:id', async (req, res) => {
  try {
    await prisma.userStory.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'User story eliminado' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar user story' });
  }
});

export default router;
