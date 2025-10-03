import { PrismaClient, StatusTugasAkhir, TugasAkhir, Prisma } from '@repo/db';
import { CreateTugasAkhirDto } from '../dto/tugas-akhir.dto';
import { calculateSimilarities } from '../utils/similarity';
import { Role } from '@repo/types';

// Custom Error for similarity check
export class SimilarityError extends Error {
  constructor(public similarities: any[]) {
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

  async checkSimilarity(judul: string): Promise<any[]> {
    const allTitles = await this.prisma.tugasAkhir.findMany({
      select: { id: true, judul: true },
    });

    if (allTitles.length === 0) {
      return [];
    }

    const similarities = await calculateSimilarities(judul, allTitles);
    
    // Return top 5 results or any result above 50%
    return similarities
      .filter(res => res.similarity > 50)
      .slice(0, 5);
  }

  async createFinal(dto: CreateTugasAkhirDto, userId: number): Promise<TugasAkhir> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
    });

    if (!mahasiswa) {
      throw new Error('Profil mahasiswa tidak ditemukan.');
    }

    const existingTugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: { mahasiswa_id: mahasiswa.id },
    });

    if (existingTugasAkhir) {
      throw new Error('Anda sudah memiliki Tugas Akhir dan tidak dapat mengajukan lagi.');
    }

    // Check for exact title match just in case
    const existingTitle = await this.prisma.tugasAkhir.findFirst({
        where: { judul: { equals: dto.judul } },
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

  async findMyTugasAkhir(userId: number): Promise<TugasAkhir | null> {
    const mahasiswa = await this.prisma.mahasiswa.findUnique({
      where: { user_id: userId },
    });

    if (!mahasiswa) {
      throw new Error('Profil mahasiswa tidak ditemukan.');
    }

    return this.prisma.tugasAkhir.findFirst({
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

    if (!mahasiswa?.tugasAkhir) {
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

    return this.prisma.tugasAkhir.delete({
      where: { id: tugasAkhir.id },
    });
  }

  async findAllTitles(): Promise<{ judul: string }[]> {
    return this.prisma.tugasAkhir.findMany({
      select: {
        judul: true,
      },
      orderBy: {
        judul: 'asc',
      },
    });
  }
  // NOTE: The old `cekKemiripan` method is now removed.
}
