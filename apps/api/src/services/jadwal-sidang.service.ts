import {
  PrismaClient,
  PeranDosen,
  StatusPersetujuan,
  StatusVerifikasi,
} from '@repo/db';
import type { CreateJadwalDto } from '../dto/jadwal-sidang.dto';

export class JadwalSidangService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getApprovedRegistrations(
    page = 1,
    limit = 50,
  ): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      status_pembimbing_1: StatusPersetujuan.disetujui,
      status_pembimbing_2: StatusPersetujuan.disetujui,
      status_verifikasi: StatusVerifikasi.disetujui,
      sidang: null,
    };

    const total = await this.prisma.pendaftaranSidang.count({
      where: whereClause,
    });
    const data = await this.prisma.pendaftaranSidang.findMany({
      where: whereClause,
      include: {
        tugasAkhir: {
          include: {
            mahasiswa: { include: { user: true } },
            peranDosenTa: { include: { dosen: { include: { user: true } } } },
          },
        },
      },
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

  async createJadwal(dto: CreateJadwalDto): Promise<unknown> {
    const {
      pendaftaranSidangId,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      ruangan_id,
      pengujiIds,
    } = dto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Check for scheduling conflicts
      const conflictingJadwal = await prisma.jadwalSidang.findFirst({
        where: {
          ruangan_id: ruangan_id,
          tanggal: new Date(tanggal),
          OR: [
            {
              // New schedule starts during an existing schedule
              waktu_mulai: { lt: waktu_selesai },
              waktu_selesai: { gt: waktu_mulai },
            },
          ],
        },
      });

      if (conflictingJadwal !== null) {
        throw new Error(
          `Ruangan sudah terpakai pada waktu tersebut (konflik dengan jadwal ID: ${conflictingJadwal.id}).`,
        );
      }

      // 2. Find the existing Sidang record linked to the PendaftaranSidang
      const sidang = await prisma.sidang.findUnique({
        where: { pendaftaran_sidang_id: pendaftaranSidangId },
        include: { tugasAkhir: true },
      });

      if (sidang === null) {
        throw new Error(
          `Sidang for Pendaftaran Sidang with ID ${pendaftaranSidangId} not found. It should have been created automatically upon approval.`,
        );
      }

      // 3. Create the JadwalSidang record
      await prisma.jadwalSidang.create({
        data: {
          sidang_id: sidang.id,
          tanggal: new Date(tanggal),
          waktu_mulai: waktu_mulai,
          waktu_selesai: waktu_selesai,
          ruangan_id: ruangan_id,
        },
      });

      // 4. Delete existing examiners for this TA
      await prisma.peranDosenTa.deleteMany({
        where: {
          tugas_akhir_id: sidang.tugas_akhir_id,
          peran: {
            in: [
              PeranDosen.penguji1,
              PeranDosen.penguji2,
              PeranDosen.penguji3,
              PeranDosen.penguji4,
            ],
          },
        },
      });

      // 5. Assign new examiners (penguji)
      if (pengujiIds.length > 0) {
        const newPengujiData = pengujiIds.map((dosenId, i) => ({
          tugas_akhir_id: sidang.tugas_akhir_id,
          dosen_id: dosenId,
          peran: `penguji${i + 1}` as PeranDosen,
        }));
        await prisma.peranDosenTa.createMany({ data: newPengujiData });
      }

      return sidang;
    });
  }

  async getSidangForPenguji(
    dosenId: number,
    page = 1,
    limit = 50,
  ): Promise<{
    data: unknown[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const whereClause = {
      tugasAkhir: {
        peranDosenTa: {
          some: {
            dosen_id: dosenId,
            peran: {
              in: [
                PeranDosen.penguji1,
                PeranDosen.penguji2,
                PeranDosen.penguji3,
                PeranDosen.penguji4,
              ],
            },
          },
        },
      },
    };

    const total = await this.prisma.sidang.count({ where: whereClause });
    const data = await this.prisma.sidang.findMany({
      where: whereClause,
      include: {
        tugasAkhir: { include: { mahasiswa: { include: { user: true } } } },
        jadwalSidang: { include: { ruangan: true } },
        nilaiSidang: { where: { dosen_id: dosenId } }, // Eager load scores given by this examiner
      },
      orderBy: { created_at: 'desc' },
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

  async getSidangForMahasiswa(mahasiswaId: number): Promise<unknown> {
    const data = await this.prisma.sidang.findMany({
      where: {
        tugasAkhir: {
          mahasiswa_id: mahasiswaId,
        },
      },
      include: {
        tugasAkhir: {
          include: {
            peranDosenTa: {
              where: {
                peran: {
                  in: [
                    PeranDosen.pembimbing1,
                    PeranDosen.pembimbing2,
                    PeranDosen.penguji1,
                    PeranDosen.penguji2,
                    PeranDosen.penguji3,
                    PeranDosen.penguji4,
                  ],
                },
              },
              include: {
                dosen: { include: { user: true } },
              },
            },
          },
        },
        jadwalSidang: { include: { ruangan: true } },
        nilaiSidang: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return {
      data: data,
      total: data.length,
      page: 1,
      limit: data.length,
      totalPages: 1,
    };
  }
}
