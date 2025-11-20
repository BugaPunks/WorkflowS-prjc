import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET todas las tareas
router.get('/', async (_req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });
    res.json(tasks);
  } catch {
    res.status(500).json({ error: 'Error al obtener tareas' });
  }
});

// GET tarea por ID
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        assignee: true,
        project: true,
        evaluations: true,
      },
    });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al obtener tarea' });
  }
});

// POST crear tarea
router.post('/', async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, priority, deadline } =
      req.body;

    if (!title || !projectId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
      },
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Error al crear tarea' });
  }
});

// PUT actualizar tarea
router.put('/:id', async (req, res) => {
  try {
    const { deadline, ...updateData } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...updateData,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Error al actualizar tarea' });
  }
});

// DELETE tarea
router.delete('/:id', async (req, res) => {
  try {
    await prisma.task.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Tarea eliminada' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar tarea' });
  }
});

export default router;
