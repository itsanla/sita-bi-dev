import { PrismaClient, StatusTugasAkhir, type TugasAkhir } from '@repo/db';
import type { CreateTugasAkhirDto } from '../dto/tugas-akhir.dto';
import { calculateSimilarities } from '../utils/similarity';

// Custom Error for similarity check
export class SimilarityError extends Error {
  constructor(public similarities: unknown[]) {
    super('High similarity found with existing titles.');
    this.name = 'SimilarityError';
  }
}

export class TugasAkhirService {
  private prisma: PrismaClient;
  private readonly SIMILARITY_THRESHOLD = 80; // 80%

  constructor() {
    this.prisma = new PrismaClient();
  }

  async checkSimilarity(judul: string): Promise<unknown[]> {
    const allTitles = await this.prisma.tugasAkhir.findMany({
      select: { id: true, judul: true },
    });

    if (allTitles.length === 0) {
      return [];
    }

    const similarities = await calculateSimilarities(judul, allTitles);

    // Return top 5 results or any result above 50%
    return similarities.filter((res) => res.similarity > 50).slice(0, 5);
  }

  async createFinal(
    dto: CreateTugasAkhirDto,
    userId: number,
  ): Promise<TugasAkhir> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
    });

    if (mahasiswa === null) {
      throw new Error('Profil mahasiswa tidak ditemukan.');
    }

    const existingTugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: { mahasiswa_id: mahasiswa.id },
    });

    if (existingTugasAkhir !== null) {
      throw new Error(
        'Anda sudah memiliki Tugas Akhir dan tidak dapat mengajukan lagi.',
      );
    }

    // Check for exact title match just in case
    const existingTitle = await this.prisma.tugasAkhir.findFirst({
      where: { judul: { equals: dto.judul } },
    });

    if (existingTitle !== null) {
      throw new Error(`Judul "${dto.judul}" sudah pernah diajukan.`);
    }

    return await this.prisma.tugasAkhir.create({
      data: {
        judul: dto.judul,
        mahasiswa_id: mahasiswa.id,
        status: StatusTugasAkhir.DIAJUKAN,
        tanggal_pengajuan: new Date(),
      },
    });
  }

  async findMyTugasAkhir(userId: number): Promise<TugasAkhir | null> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
    });

    if (mahasiswa === null) {
      throw new Error('Profil mahasiswa tidak ditemukan.');
    }

    return await this.prisma.tugasAkhir.findFirst({
      where: {
        mahasiswa_id: mahasiswa.id,
        NOT: {
          status: {
            in: [
              StatusTugasAkhir.DIBATALKAN,
              StatusTugasAkhir.LULUS_DENGAN_REVISI,
              StatusTugasAkhir.LULUS_TANPA_REVISI,
              StatusTugasAkhir.SELESAI,
            ],
          },
        },
      },
      include: {
        mahasiswa: {
          include: {
            user: true,
          },
        },
        peranDosenTa: {
          orderBy: {
            peran: 'asc',
          },
          include: {
            dosen: {
              include: {
                user: true,
              },
            },
          },
        },
        pendaftaranSidang: true,
      },
      orderBy: {
        tanggal_pengajuan: 'desc',
      },
    });
  }

  async deleteMyTa(userId: number): Promise<TugasAkhir> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
      include: { tugasAkhir: true },
    });

    if (mahasiswa?.tugasAkhir == null) {
      throw new Error('Tugas Akhir not found for this student.');
    }

    const { tugasAkhir } = mahasiswa;

    if (
      tugasAkhir.status !== StatusTugasAkhir.DIAJUKAN &&
      tugasAkhir.status !== StatusTugasAkhir.DITOLAK
    ) {
      throw new Error(
        `Cannot delete submission with status "${tugasAkhir.status}".`,
      );
    }

    return await this.prisma.tugasAkhir.delete({
      where: { id: tugasAkhir.id },
    });
  }

  async findAllTitles(): Promise<{ judul: string }[]> {
    return await this.prisma.tugasAkhir.findMany({
      select: {
        judul: true,
      },
      orderBy: {
        judul: 'asc',
      },
    });
  }

  async findById(id: number): Promise<TugasAkhir | null> {
    return await this.prisma.tugasAkhir.findUnique({
      where: { id },
    });
  }

  async findAllForValidation(
    _user: Express.Request['user'],
    page = 1,
    limit = 50,
  ): Promise<{
    data: TugasAkhir[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      status: StatusTugasAkhir.DIAJUKAN,
    };

    const total = await this.prisma.tugasAkhir.count({ where: whereClause });
    const data = await this.prisma.tugasAkhir.findMany({
      where: whereClause,
      include: {
        mahasiswa: {
          include: {
            user: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        tanggal_pengajuan: 'asc',
      },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async approveTugasAkhir(
    id: number,
    _approverId: number,
  ): Promise<TugasAkhir> {
    return await this.prisma.tugasAkhir.update({
      where: { id },
      data: {
        status: StatusTugasAkhir.DISETUJUI,
      },
    });
  }

  async rejectTugasAkhir(
    id: number,
    _rejecterId: number,
    alasan_penolakan: string,
  ): Promise<TugasAkhir> {
    return await this.prisma.tugasAkhir.update({
      where: { id },
      data: {
        status: StatusTugasAkhir.DITOLAK,
        alasan_penolakan: alasan_penolakan,
      },
    });
  }
  // NOTE: The old `cekKemiripan` method is now removed.
}
