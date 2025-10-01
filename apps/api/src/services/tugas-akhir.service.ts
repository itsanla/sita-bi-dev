import { PrismaClient, StatusTugasAkhir, TugasAkhir, Prisma } from '@repo/db';
import { CreateTugasAkhirDto } from '../dto/tugas-akhir.dto';
import * as stringSimilarity from 'string-similarity';
import { paginate } from '../utils/pagination.util';
import { Role } from '../types/roles';

export class TugasAkhirService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(dto: CreateTugasAkhirDto, userId: number): Promise<TugasAkhir> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
    });

    if (!mahasiswa) {
      throw new Error('Profil mahasiswa tidak ditemukan.');
    }

    const activeTugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: {
        mahasiswa_id: mahasiswa.id,
        NOT: {
          status: {
            in: [StatusTugasAkhir.DIBATALKAN, StatusTugasAkhir.LULUS_DENGAN_REVISI, StatusTugasAkhir.LULUS_TANPA_REVISI, StatusTugasAkhir.SELESAI, StatusTugasAkhir.DITOLAK]
          }
        }
      }
    });

    if (activeTugasAkhir) {
      throw new Error('Anda sudah memiliki Tugas Akhir yang aktif.');
    }

    const existingTitle = await this.prisma.tugasAkhir.findFirst({
        where: { judul: { equals: dto.judul } }
    });

    if (existingTitle) {
        throw new Error(`Judul "${dto.judul}" sudah pernah diajukan.`);
    }

    return this.prisma.tugasAkhir.create({
      data: {
        judul: dto.judul,
        mahasiswa_id: mahasiswa.id,
        status: StatusTugasAkhir.DIAJUKAN,
        tanggal_pengajuan: new Date(),
      },
    });
  }

  async findAllForValidation(user: Express.User, page = 1, limit = 50): Promise<unknown> {
    const whereClause: Prisma.TugasAkhirWhereInput = {
      status: StatusTugasAkhir.DIAJUKAN,
    };

    const userRoles = [user.role]; // user.role is now a single role string

    if (userRoles.includes(Role.kaprodi_d3) === true) {
      whereClause.mahasiswa = { prodi: 'D3' };
    } else if (userRoles.includes(Role.kaprodi_d4) === true) {
      whereClause.mahasiswa = { prodi: 'D4' };
    } else if (userRoles.includes(Role.admin) === false && userRoles.includes(Role.kajur) === false) {
      // If not a general viewer and not a specific kaprodi, they can see nothing.
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }
    // Admins and Kajur have no prodi filter, they see all.

    const total = await this.prisma.tugasAkhir.count({ where: whereClause });
    const data = await this.prisma.tugasAkhir.findMany({
      where: whereClause,
      include: { mahasiswa: { include: { user: true } } },
      orderBy: { tanggal_pengajuan: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approve(id: number, approverId: number): Promise<TugasAkhir> {
    await this.findTugasAkhirById(id); // Ensure it exists
    return this.prisma.tugasAkhir.update({
      where: { id },
      data: {
        status: StatusTugasAkhir.DISETUJUI,
        disetujui_oleh: approverId,
        ditolak_oleh: null,
        alasan_penolakan: null,
      },
    });
  }

  async reject(id: number, rejecterId: number, alasan: string): Promise<TugasAkhir> {
    await this.findTugasAkhirById(id); // Ensure it exists
    return this.prisma.tugasAkhir.update({
      where: { id },
      data: {
        status: StatusTugasAkhir.DITOLAK,
        ditolak_oleh: rejecterId,
        alasan_penolakan: alasan,
        disetujui_oleh: null,
      },
    });
  }

  async cekKemiripan(id: number): Promise<unknown> {
    const targetTa = await this.findTugasAkhirById(id);
    const allOtherTa = await this.prisma.tugasAkhir.findMany({
      where: { id: { not: id } },
      select: { id: true, judul: true, mahasiswa: { include: { user: true } } },
    });

    const allTitles = allOtherTa.map(ta => ta.judul);
    const ratings = stringSimilarity.findBestMatch(targetTa.judul, allTitles);

    const results = ratings.ratings
      .filter((rating: any) => rating.rating > 0.3) // Threshold 30%
      .map((rating: any) => {
        const match = allOtherTa.find(ta => ta.judul === rating.target);
        return {
          similarity: rating.rating,
          judul: rating.target,
          mahasiswa: match?.mahasiswa?.user?.name,
          nim: match?.mahasiswa?.nim,
        };
      })
      .sort((a: any, b: any) => b.similarity - a.similarity);

    return {
      target: targetTa.judul,
      results,
    };
  }

  async findTugasAkhirById(id: number): Promise<Prisma.TugasAkhirGetPayload<{ include: { mahasiswa: true } }>> {
    const tugasAkhir = await this.prisma.tugasAkhir.findUnique({
      where: { id },
      include: { mahasiswa: true },
    });
    if (!tugasAkhir) {
      throw new Error(`Tugas Akhir with ID ${id} not found`);
    }
    return tugasAkhir;
  }
}
