import type { Ruangan } from '@repo/db';
import { PrismaClient } from '@repo/db';

export class RuanganService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(): Promise<Ruangan[]> {
    return await this.prisma.ruangan.findMany({
      orderBy: {
        nama_ruangan: 'asc',
      },
    });
  }
}
