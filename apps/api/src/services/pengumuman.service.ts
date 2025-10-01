import { PrismaClient, AudiensPengumuman, Pengumuman } from '@repo/db';
import { CreatePengumumanDto, UpdatePengumumanDto } from '../dto/pengumuman.dto';
import { paginate } from '../utils/pagination.util';

export class PengumumanService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(dto: CreatePengumumanDto, authorId: number): Promise<Pengumuman> {
    return this.prisma.pengumuman.create({
      data: {
        ...dto,
        dibuat_oleh: authorId,
        tanggal_dibuat: new Date(),
      },
    });
  }

  async findAll(page = 1, limit = 50): Promise<{
    data: Pengumuman[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const total = await this.prisma.pengumuman.count();
    const data = await this.prisma.pengumuman.findMany({
      orderBy: { tanggal_dibuat: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data,
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findPublic(page = 1, limit = 50): Promise<{
    data: Pengumuman[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      audiens: { in: [AudiensPengumuman.all_users, AudiensPengumuman.guest] },
    };
    const total = await this.prisma.pengumuman.count({ where: whereClause });
    const data = await this.prisma.pengumuman.findMany({
      where: whereClause,
      orderBy: { tanggal_dibuat: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data,
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findForMahasiswa(page = 1, limit = 50): Promise<{
    data: Pengumuman[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      audiens: { in: [AudiensPengumuman.all_users, AudiensPengumuman.mahasiswa] },
    };
    const total = await this.prisma.pengumuman.count({ where: whereClause });
    const data = await this.prisma.pengumuman.findMany({
      where: whereClause,
      orderBy: { tanggal_dibuat: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data,
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findForDosen(page = 1, limit = 50): Promise<{
    data: Pengumuman[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      audiens: { in: [AudiensPengumuman.all_users, AudiensPengumuman.registered_users, AudiensPengumuman.dosen] },
    };
    const total = await this.prisma.pengumuman.count({ where: whereClause });
    const data = await this.prisma.pengumuman.findMany({
      where: whereClause,
      orderBy: { tanggal_dibuat: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      data: data,
      total: total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Pengumuman | null> {
    return this.prisma.pengumuman.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdatePengumumanDto): Promise<Pengumuman> {
    return this.prisma.pengumuman.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number): Promise<Pengumuman> {
    return this.prisma.pengumuman.delete({ where: { id } });
  }
}
