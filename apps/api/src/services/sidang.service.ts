import { PrismaClient } from '@repo/db';

export class SidangService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findUnscheduled() {
    return this.prisma.sidang.findMany({
      where: { status_hasil: 'menunggu_penjadwalan' },
      include: {
        tugasAkhir: {
          include: {
            mahasiswa: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }
}
