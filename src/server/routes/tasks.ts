import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET todas las tareas
router.get('/', async (req, res) => {
  try {
    const { assigneeId, projectId } = req.query;
    const where: Record<string, string> = {};

    if (assigneeId) where.assigneeId = String(assigneeId);
    if (projectId) where.projectId = String(projectId);

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: {
          select: { id: true, name: true, email: true },
        },
        project: {
          select: { id: true, name: true },
        },
        evaluations: true,
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
    const {
      title,
      description,
      projectId,
      assigneeId,
      priority,
      deadline,
      status,
    } = req.body;

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
        status: status || 'TODO',
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

// POST evaluar tarea
router.post('/:id/evaluate', async (req, res) => {
  try {
    const { score, feedback, evaluatorId } = req.body;
    const taskId = req.params.id;

    if (score === undefined || !evaluatorId) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return res.status(404).json({ error: 'Tarea no encontrada' });

    const evaluation = await prisma.evaluation.create({
      data: {
        taskId,
        projectId: task.projectId,
        evaluatorId,
        score,
        feedback,
        status: 'COMPLETED',
      },
    });

    res.status(201).json({ data: evaluation });
  } catch (error) {
    console.error('Error al evaluar tarea:', error);
    res.status(500).json({ error: 'Error al guardar la evaluación' });
  }
});

export default router;
