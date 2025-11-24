import { PrismaClient } from '@repo/db';
import type { Log, LogLevel } from '@repo/db';

interface CreateLogDto {
  user_id?: number | undefined | null; // Loosen type
  action: string;
  ip_address?: string | undefined | null;
  user_agent?: string | undefined | null;
  url?: string | undefined | null;
  method?: string | undefined | null;
  details?: string | undefined | null;
  module?: string | undefined | null;
  entity_id?: number | undefined | null;
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
        user_id: data.user_id ?? null,
        action: data.action,
        ip_address: data.ip_address ?? null,
        user_agent: data.user_agent ?? null,
        url: data.url ?? null,
        method: data.method ?? null,
        details: data.details ?? null,
        module: data.module ?? null,
        entity_id: data.entity_id ?? null,
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
    if (filters.module) where.module = filters.module;
    if (filters.level) where.level = filters.level;
    if (filters.user_id) where.user_id = parseInt(filters.user_id);
    if (filters.entity_id) where.entity_id = parseInt(filters.entity_id);

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
