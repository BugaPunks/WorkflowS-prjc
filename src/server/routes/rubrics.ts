import { Router } from 'express';
import { prisma } from '../db';

const router = Router();

// GET Rúbricas de un proyecto
router.get('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const rubrics = await prisma.rubric.findMany({
      where: { projectId },
      include: { criteria: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: rubrics });
  } catch (error) {
    console.error('Error getting rubrics:', error);
    res.status(500).json({ error: 'Error al obtener rúbricas' });
  }
});

// POST crear Rúbrica
router.post('/', async (req, res) => {
  try {
    const { projectId, name, description, criteria } = req.body;

    if (!projectId || !name || !criteria || !Array.isArray(criteria)) {
      return res.status(400).json({ error: 'Datos inválidos' });
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
    console.error('Error creating rubric:', error);
    res.status(500).json({ error: 'Error al crear rúbrica' });
  }
});

export default router;
