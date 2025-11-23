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

  /**
   * Mengecek konflik jadwal untuk Ruangan dan Dosen.
   */
  async checkScheduleConflict(
    tanggal: Date,
    waktuMulai: string,
    waktuSelesai: string,
    ruanganId: number,
    dosenIds: number[], // Array ID Dosen yang terlibat
    ignoreSidangId?: number, // Opsional: ID Sidang yang sedang diedit (untuk exclude diri sendiri)
  ): Promise<{ hasConflict: boolean; messages: string[] }> {
    const conflicts: string[] = [];

    // 1. Cek Konflik Ruangan
    const conflictingRoom = await this.prisma.jadwalSidang.findFirst({
      where: {
        ruangan_id: ruanganId,
        tanggal: tanggal,
        sidang_id: ignoreSidangId !== undefined ? { not: ignoreSidangId } : undefined,
        OR: [
          {
            waktu_mulai: { lt: waktuSelesai },
            waktu_selesai: { gt: waktuMulai },
          },
        ],
      },
      include: {
        ruangan: true,
        sidang: { include: { tugasAkhir: { include: { mahasiswa: { include: { user: true } } } } } }
      }
    });

    if (conflictingRoom !== null) {
      const mhsName = conflictingRoom.sidang.tugasAkhir.mahasiswa.user.name;
      conflicts.push(
        `Ruangan ${conflictingRoom.ruangan.nama_ruangan} bentrok dengan sidang mahasiswa ${mhsName} (${conflictingRoom.waktu_mulai} - ${conflictingRoom.waktu_selesai}).`,
      );
    }

    // 2. Cek Konflik Dosen (Sebagai Penguji atau Pembimbing di Sidang Lain)
    const potentialConflictingJadwals = await this.prisma.jadwalSidang.findMany({
      where: {
        tanggal: tanggal,
        sidang_id: ignoreSidangId !== undefined ? { not: ignoreSidangId } : undefined,
        OR: [
          {
            waktu_mulai: { lt: waktuSelesai },
            waktu_selesai: { gt: waktuMulai },
          },
        ],
      },
      include: {
        sidang: {
          include: {
            tugasAkhir: {
              include: {
                peranDosenTa: {
                  include: {
                    dosen: {
                      include: { user: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    for (const jadwal of potentialConflictingJadwals) {
      const dosenDiJadwalLain = jadwal.sidang.tugasAkhir.peranDosenTa.map((pd: { dosen_id: number }) => pd.dosen_id);
      const intersection = dosenIds.filter(id => dosenDiJadwalLain.includes(id));

      if (intersection.length > 0) {
        const bentrokDosenDetails = jadwal.sidang.tugasAkhir.peranDosenTa
          .filter((pd: { dosen_id: number }) => intersection.includes(pd.dosen_id))
          .map((pd: { dosen: { user: { name: string } } }) => pd.dosen.user.name);

        conflicts.push(
          `Dosen berikut memiliki jadwal sidang lain pada waktu bersamaan: ${bentrokDosenDetails.join(', ')} (Sidang TA ID: ${jadwal.sidang.tugas_akhir_id}).`
        );
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      messages: conflicts,
    };
  }

  async createJadwal(dto: CreateJadwalDto, userId?: number): Promise<unknown> {
    const {
      sidangId,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      ruangan_id,
      pengujiIds,
    } = dto;

    return this.prisma.$transaction(async (prisma) => {
      // 1. Find the existing Sidang
      const sidang = await prisma.sidang.findUnique({
        where: { id: sidangId },
        include: {
          tugasAkhir: {
             include: {
                peranDosenTa: true
             }
          }
        },
      });

      if (sidang === null) {
        throw new Error(`Sidang with ID ${sidangId} not found`);
      }

      // Get existing advisors
      const pembimbingIds = sidang.tugasAkhir.peranDosenTa
        .filter(p => p.peran === PeranDosen.pembimbing1 || p.peran === PeranDosen.pembimbing2)
        .map(p => p.dosen_id);

      const allDosenIds = [...new Set([...pembimbingIds, ...pengujiIds])];

      // 2. Check for conflicts
      const conflictCheck = await this.checkScheduleConflict(
        new Date(tanggal),
        waktu_mulai,
        waktu_selesai,
        ruangan_id,
        allDosenIds,
        sidang.id
      );

      if (conflictCheck.hasConflict) {
        throw new Error(`Konflik Jadwal: ${conflictCheck.messages.join(' ')}`);
      }

      // 3. Create Jadwal
      const jadwal = await prisma.jadwalSidang.create({
        data: {
          sidang_id: sidang.id,
          tanggal: new Date(tanggal),
          waktu_mulai: waktu_mulai,
          waktu_selesai: waktu_selesai,
          ruangan_id: ruangan_id,
        },
      });

      // 4. Update Examiners
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

      if (pengujiIds.length > 0) {
        const newPengujiData = pengujiIds.map((dosenId: number, i: number) => ({
          tugas_akhir_id: sidang.tugas_akhir_id,
          dosen_id: dosenId,
          peran: `penguji${i + 1}` as PeranDosen,
        }));
        await prisma.peranDosenTa.createMany({ data: newPengujiData });
      }

      // 5. Log History
      const ruangan = await prisma.ruangan.findUnique({ where: { id: ruangan_id } });
      await prisma.historyPerubahanSidang.create({
        data: {
          sidang_id: sidang.id,
          user_id: userId ?? undefined,
          perubahan: JSON.stringify({
            action: 'CREATE_SCHEDULE',
            tanggal: tanggal,
            waktu: `${waktu_mulai}-${waktu_selesai}`,
            ruangan: ruangan?.nama_ruangan,
            penguji: pengujiIds
          }),
          alasan_perubahan: 'Penjadwalan awal sidang',
        }
      });

      await prisma.sidang.update({
        where: { id: sidang.id },
        data: { status_hasil: 'dijadwalkan' }
      });

      return jadwal;
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
        nilaiSidang: { where: { dosen_id: dosenId } },
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
        historyPerubahan: {
          include: { user: true },
          orderBy: { created_at: 'desc' }
        }
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
