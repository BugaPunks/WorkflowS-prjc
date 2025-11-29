import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create Users
  const password = await bcrypt.hash('password123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@workflow.com' },
    update: {},
    create: {
      email: 'admin@workflow.com',
      name: 'Admin Docente',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    },
  });

  const users = [
    { email: 'dev1@workflow.com', name: 'Ana Developer', role: 'TEAM_DEVELOPER' },
    { email: 'dev2@workflow.com', name: 'Carlos Backend', role: 'TEAM_DEVELOPER' },
    { email: 'sm@workflow.com', name: 'Sarah Master', role: 'TEAM_DEVELOPER' }, // System role is dev/student
    { email: 'po@workflow.com', name: 'Pedro Owner', role: 'TEAM_DEVELOPER' },
  ];

  const createdUsers = [];
  for (const u of users) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        password,
        role: u.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name.replace(' ', '')}`,
      },
    });
    createdUsers.push(user);
  }

  const [dev1, dev2, sm, po] = createdUsers;

  // 2. Create Global Rubric
  // Use create explicitly but check if similar name exists to prevent duplicates on re-runs if needed.
  // However, this script is mostly for dev. Let's create a new one every time or just one.
  const globalRubric = await prisma.rubric.create({
    data: {
      name: 'Rúbrica General de Desarrollo ' + Date.now(),
      description: 'Estándares de calidad de código y documentación',
      criteria: {
        create: [
          { name: 'Calidad de Código', description: 'Clean Code, patrones de diseño', maxScore: 40, weight: 4 },
          { name: 'Documentación', description: 'Comentarios y documentación técnica', maxScore: 30, weight: 3 },
          { name: 'Testing', description: 'Cobertura de pruebas unitarias', maxScore: 30, weight: 3 },
        ],
      },
    },
    include: { // Include criteria in the response
        criteria: true
    }
  });

  // 3. Project 1: Sistema de Gestión Académica (Active)
  const project1 = await prisma.project.create({
    data: {
      name: 'Sistema de Gestión Académica ' + Date.now(), // Unique name
      description: 'Plataforma para gestión de notas y asistencia',
      status: 'ACTIVE',
      ownerId: admin.id,
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-12-31'),
      members: {
        create: [
          { userId: dev1.id, role: 'TEAM_DEVELOPER' },
          { userId: dev2.id, role: 'TEAM_DEVELOPER' },
          { userId: sm.id, role: 'SCRUM_MASTER' },
          { userId: po.id, role: 'PRODUCT_OWNER' },
        ],
      },
    },
  });

  // Project 1 Rubric
  const p1Rubric = await prisma.rubric.create({
    data: {
      projectId: project1.id,
      name: 'Rúbrica de Backend SGA',
      description: 'Evaluación específica del módulo de backend',
      criteria: {
        create: [
          { name: 'API RESTful', description: 'Diseño correcto de endpoints', maxScore: 50, weight: 5 },
          { name: 'Seguridad', description: 'Implementación de JWT y roles', maxScore: 50, weight: 5 },
        ],
      },
    },
    include: {
        criteria: true
    }
  });

  // Sprint 1 (Completed)
  const sprint1 = await prisma.sprint.create({
    data: {
      projectId: project1.id,
      name: 'Sprint 1: Autenticación',
      description: 'Implementación del sistema de login y roles',
      status: 'COMPLETED',
      startDate: new Date('2023-10-01'),
      endDate: new Date('2023-10-14'),
    },
  });

  // Stories for Sprint 1
  const story1 = await prisma.userStory.create({
    data: {
      projectId: project1.id,
      sprintId: sprint1.id,
      title: 'Login de Usuarios',
      description: 'Como usuario quiero loguearme para acceder al sistema',
      priority: 'HIGH',
      storyPoints: 5,
      status: 'DONE',
      completedAt: new Date('2023-10-12'),
      assigneeId: dev1.id,
    },
  });

  // Tasks for Story 1
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      sprintId: sprint1.id,
      userStoryId: story1.id,
      title: 'Diseñar tabla de usuarios',
      status: 'DONE',
      priority: 'HIGH',
      assigneeId: dev1.id,
      completedAt: new Date('2023-10-05'),
    },
  });

  // Evaluation for Task 1
  // Use criteria IDs from the included result
  if (globalRubric.criteria.length > 0) {
      await prisma.evaluation.create({
        data: {
          projectId: project1.id,
          taskId: task1.id,
          evaluatorId: admin.id,
          status: 'COMPLETED',
          score: 90,
          feedback: 'Buen diseño de base de datos, faltaron índices.',
          criteria: {
            create: [
              { criteriaId: globalRubric.criteria[0].id, score: 90, comment: 'Casi perfecto' },
            ],
          },
        },
      });
  }


  // Evaluation for Sprint 1
  if (p1Rubric.criteria.length >= 2) {
      await prisma.evaluation.create({
        data: {
            projectId: project1.id,
            sprintId: sprint1.id,
            evaluatorId: admin.id,
            status: 'COMPLETED',
            score: 85,
            feedback: 'Buen sprint, pero se entregó un día tarde.',
            criteria: {
                create: [
                    { criteriaId: p1Rubric.criteria[0].id, score: 80, comment: 'API bien documentada' },
                    { criteriaId: p1Rubric.criteria[1].id, score: 90, comment: 'Seguridad robusta' }
                ]
            }
        }
      });
  }


  // Sprint 2 (Active)
  const sprint2 = await prisma.sprint.create({
    data: {
      projectId: project1.id,
      name: 'Sprint 2: Dashboard',
      description: 'Panel principal para alumnos y docentes',
      status: 'ACTIVE',
      startDate: new Date('2023-10-15'),
      endDate: new Date('2023-10-29'),
    },
  });

  const story2 = await prisma.userStory.create({
    data: {
      projectId: project1.id,
      sprintId: sprint2.id,
      title: 'Ver calificaciones',
      description: 'Como alumno quiero ver mis notas',
      priority: 'MEDIUM',
      storyPoints: 8,
      status: 'IN_PROGRESS',
      assigneeId: dev2.id,
    },
  });

  await prisma.task.create({
    data: {
      projectId: project1.id,
      sprintId: sprint2.id,
      userStoryId: story2.id,
      title: 'Frontend Componente Tabla',
      status: 'IN_PROGRESS',
      assigneeId: dev2.id,
    },
  });

  // 4. Project 2: E-Commerce App (Planning)
  const project2 = await prisma.project.create({
    data: {
      name: 'App de Comercio Electrónico ' + Date.now(),
      description: 'Tienda en línea con carrito de compras',
      status: 'ACTIVE',
      ownerId: admin.id,
      startDate: new Date('2023-11-01'),
      endDate: new Date('2024-02-01'),
      members: {
        create: [
          { userId: dev1.id, role: 'PRODUCT_OWNER' },
          { userId: sm.id, role: 'TEAM_DEVELOPER' },
        ],
      },
    },
  });

  // Backlog for Project 2
  await prisma.userStory.create({
    data: {
      projectId: project2.id,
      title: 'Catálogo de Productos',
      description: 'Listado de productos con filtros',
      priority: 'HIGH',
      status: 'BACKLOG',
      storyPoints: 13,
    },
  });

   await prisma.userStory.create({
    data: {
      projectId: project2.id,
      title: 'Carrito de Compras',
      description: 'Persistencia del carrito',
      priority: 'HIGH',
      status: 'BACKLOG',
    },
  });

  console.log('✅ Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
