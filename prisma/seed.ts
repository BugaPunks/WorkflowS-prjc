import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create Admin
  const adminEmail = 'admin@workflow.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Admin Docente',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Created Admin:', admin.email);

    // Create a Default Project
    await prisma.project.create({
      data: {
        name: 'Proyecto Demo',
        description: 'Proyecto para pruebas automatizadas',
        ownerId: admin.id,
        status: 'ACTIVE',
      },
    });
    console.log('Created Demo Project');
  } else {
    console.log('Admin already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
