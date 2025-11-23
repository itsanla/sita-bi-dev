import { PrismaClient } from '@repo/db';
const prisma = new PrismaClient();

async function main() {
  const student = await prisma.mahasiswa.findFirst({
    include: { user: true }
  });

  const lecturer = await prisma.dosen.findFirst({
    include: { user: true }
  });

  if (student) {
    console.log(`STUDENT_EMAIL=${student.user.email}`);
  }
  if (lecturer) {
    console.log(`LECTURER_EMAIL=${lecturer.user.email}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
