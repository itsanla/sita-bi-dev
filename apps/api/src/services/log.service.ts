import { PrismaClient } from '@repo/db';
import type { Log, LogLevel } from '@repo/db';

interface CreateLogDto {
  user_id?: number;
  action: string;
  ip_address?: string;
  user_agent?: string;
  url?: string;
  method?: string;
  details?: string;
  module?: string;
  entity_id?: number;
  level?: LogLevel;
}

interface LogFilters {
  module?: string;
  level?: LogLevel;
  user_id?: string;
  entity_id?: string;
}

export class LogService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(data: CreateLogDto): Promise<Log> {
    return this.prisma.log.create({
      data: {
        ...data,
        level: data.level ?? 'INFO',
      },
    });
  }

  async findAll(
    page = 1,
    limit = 50,
    filters: LogFilters = {},
  ): Promise<unknown> {
    const skip = (page - 1) * limit;
    const take = limit;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (filters.module !== undefined) where.module = filters.module;
    if (filters.level !== undefined) where.level = filters.level;
    if (filters.user_id !== undefined)
      where.user_id = parseInt(filters.user_id);
    if (filters.entity_id !== undefined)
      where.entity_id = parseInt(filters.entity_id);

    const [logs, total] = await this.prisma.$transaction([
      this.prisma.log.findMany({
        where,
        skip,
        take,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.log.count({ where }),
    ]);

    return {
      data: logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getByEntity(entityId: number, moduleName: string): Promise<Log[]> {
    return this.prisma.log.findMany({
      where: {
        entity_id: entityId,
        module: moduleName,
      },
      orderBy: { created_at: 'desc' },
      include: { user: { select: { name: true } } },
    });
  }
}
