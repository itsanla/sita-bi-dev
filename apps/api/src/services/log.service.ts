import { PrismaClient } from '@repo/db';

export class LogService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findAll(page = 1, limit = 50): Promise<unknown> {
    const skip = (page - 1) * limit;
    const take = limit;

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.log.findMany({
        skip,
        take,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.log.count(),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
