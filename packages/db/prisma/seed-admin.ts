import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding essential data...');

  // 1. Seed all essential roles
  console.log('Seeding roles...');
  const rolesToSeed: string[] = ['admin', 'dosen', 'mahasiswa', 'kajur', 'kaprodi_d3', 'kaprodi_d4'];
  for (const roleName of rolesToSeed) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName, guard_name: 'api' },
    });
  }
  console.log('Roles seeded.');


  // 2. Seed the admin user
  console.log('Seeding admin user...');
  const adminEmail = 'admin@sita.bi';
  const adminPassword = 'password123';
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (adminRole) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminUser = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        email_verified_at: new Date(),
        roles: {
          connect: { id: adminRole.id },
        },
      },
      create: {
        email: adminEmail,
        name: 'Super Admin',
        password: hashedPassword,
        email_verified_at: new Date(),
        roles: {
          connect: { id: adminRole.id },
        },
      },
    });
    console.log(`Admin user seeded successfully:`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${adminPassword}`);
  } else {
    console.error('Could not find admin role to seed admin user.');
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
