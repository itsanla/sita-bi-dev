import { PrismaClient, AudiensPengumuman, Prisma } from '@prisma/client';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt'; // New import

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding announcements...');

  // Find the admin user to be the author of the announcements
  const adminUser = await prisma.user.findUnique({
    where: { email: 'admin@sita.bi' },
  });

  if (!adminUser) {
    console.error('Admin user not found. Please seed the admin user first by running `pnpm db:seed:admin`');
    return;
  }

  const announcements = [];
  const audienceValues = Object.values(AudiensPengumuman);

  for (let i = 0; i < 500; i++) {
    const judul = faker.lorem.sentence();
    const isi = faker.lorem.paragraphs(3);
    const audiens = faker.helpers.arrayElement(audienceValues);
    const tanggal_dibuat = faker.date.past({ years: 2 });

    announcements.push({
      judul,
      isi,
      audiens,
      dibuat_oleh: adminUser.id,
      tanggal_dibuat,
    });
  }

  // Use createMany for efficient bulk insertion
  const result = await prisma.pengumuman.createMany({
    data: announcements,
  });

  console.log(`Seeding finished. ${result.count} announcements created.`);

  // --- New Dosen Seeding Logic ---
  console.log('Start seeding 50 Dosen...');

  const dosenRole = await prisma.role.findUnique({ where: { name: 'dosen' } });

  if (!dosenRole) {
    console.error('Dosen role not found. Please ensure roles are seeded.');
    return;
  }

  const dosenToSeed = [];
  for (let i = 0; i < 50; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const name = `${firstName} ${lastName}`;
    const email = faker.internet.email({ firstName, lastName }).toLowerCase().replace('@', `.${i}@`); // Ensure unique email
    const password = 'password123'; // Default password for seeded dosen
    const hashedPassword = await bcrypt.hash(password, 10);
    const nidn = `${faker.string.numeric(9)}${i}`; // Ensure unique NIDN

    dosenToSeed.push({
      user: {
        create: {
          name: name,
          email: email,
          password: hashedPassword,
          roles: {
            connect: { id: dosenRole.id },
          },
        },
      },
      nidn: nidn,
    });

    if ((i + 1) % 100 === 0) {
      console.log(`Generated ${i + 1} dosen data...`);
    }
  }

  // Using a loop for create as createMany for related records is complex
  for (const dosenData of dosenToSeed) {
    try {
      await prisma.dosen.create({
        data: dosenData,
      });
    } catch (e) {
      // Handle unique constraint errors if any
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        console.warn(`Skipping duplicate entry for dosen: ${dosenData.user.create.email}`);
      } else {
        console.error(`Error seeding dosen: ${(e as Error).message}`);
        throw e;
      }
    }
  }

  console.log('50 Dosen seeded successfully.');
  // --- End New Dosen Seeding Logic ---
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });