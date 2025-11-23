import { PrismaClient } from '@repo/db';
const prisma = new PrismaClient();

async function createTestUser() {
  // Create a specific student for testing
  const studentUser = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@test.com',
      phone_number: '081234567890',
      password: '$2b$10$EpIxT.K.e.p.u.s.h.e.r.e.H.a.s.h.e.d.P.a.s.s.w.o.r.d', // You might need a real hash or rely on the seed's password
      mahasiswa: {
        create: {
          nim: '12345678',
          prodi: 'D4',
          kelas: '4A'
        }
      }
    },
    include: { mahasiswa: true }
  });

  // Create a specific lecturer for testing
  const lecturerUser = await prisma.user.create({
    data: {
      name: 'Test Lecturer',
      email: 'lecturer@test.com',
      phone_number: '081234567891',
      password: '$2b$10$EpIxT.K.e.p.u.s.h.e.r.e.H.a.s.h.e.d.P.a.s.s.w.o.r.d',
      dosen: {
        create: {
          nidn: '1234567890'
        }
      }
    },
    include: { dosen: true }
  });

  console.log('Test users created');
}

createTestUser()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
