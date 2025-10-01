import { PrismaClient, Prisma, StatusTugasAkhir } from '@repo/db';

// Interface untuk return types
interface BimbinganForDosen {
  data: unknown[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface TugasAkhirWithBimbingan {
  id: number;
  mahasiswa_id: number;
  status: string;
  peranDosenTa: unknown[];
  bimbinganTa: unknown[];
  pendaftaranSidang: unknown[];
}

export class BimbinganService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getBimbinganForDosen(dosenId: number, page = 1, limit = 50): Promise<BimbinganForDosen> {
    const whereClause: Prisma.TugasAkhirWhereInput = {
      peranDosenTa: {
        some: {
          dosen_id: dosenId,
          peran: { in: ['pembimbing1', 'pembimbing2'] },
        },
      },
      NOT: {
        status: { in: [StatusTugasAkhir.DIBATALKAN, StatusTugasAkhir.LULUS_DENGAN_REVISI, StatusTugasAkhir.LULUS_TANPA_REVISI, StatusTugasAkhir.SELESAI, StatusTugasAkhir.DITOLAK] }
      }
    };

    const total = await this.prisma.tugasAkhir.count({ where: whereClause });
    const data = await this.prisma.tugasAkhir.findMany({
      where: whereClause,
      include: {
        mahasiswa: { include: { user: true } },
        bimbinganTa: { orderBy: { created_at: 'desc' } },
      },
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

  async getBimbinganForMahasiswa(mahasiswaId: number): Promise<TugasAkhirWithBimbingan | null> {
    const tugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: {
        mahasiswa_id: mahasiswaId,
        NOT: {
          status: { in: [StatusTugasAkhir.DIBATALKAN, StatusTugasAkhir.LULUS_DENGAN_REVISI, StatusTugasAkhir.LULUS_TANPA_REVISI, StatusTugasAkhir.SELESAI, StatusTugasAkhir.DITOLAK] }
        }
      },
      include: {
        peranDosenTa: { include: { dosen: { include: { user: true } } } },
        bimbinganTa: {
          include: { catatan: { include: { author: true } } },
          orderBy: { created_at: 'desc' }
        },
        pendaftaranSidang: { orderBy: { created_at: 'desc' } },
      },
    });

    if (tugasAkhir === null) {
      return null;
    }

    return tugasAkhir as TugasAkhirWithBimbingan;
  }

  async createCatatan(bimbinganTaId: number, authorId: number, catatan: string): Promise<unknown> {
    const bimbingan = await this.prisma.bimbinganTA.findUnique({
      where: { id: bimbinganTaId },
      include: {
        tugasAkhir: {
          include: {
            mahasiswa: { include: { user: true } },
            peranDosenTa: true,
          }
        }
      }
    });

    if (bimbingan === null || bimbingan.tugasAkhir === null) {
      throw new Error('Bimbingan session or associated final project not found.');
    }

    const isMahasiswa = bimbingan.tugasAkhir.mahasiswa.user.id === authorId;
    const peranDosenList = bimbingan.tugasAkhir.peranDosenTa as Array<{ dosen_id: number | null }>;
    const isPembimbing = bimbingan.dosen_id !== null && (peranDosenList?.some(p => p.dosen_id === bimbingan.dosen_id) ?? false);

    if (!(isMahasiswa || isPembimbing)) {
      throw new Error('You are not authorized to add a catatan to this bimbingan session.');
    }

    return this.prisma.catatanBimbingan.create({
      data: {
        bimbingan_ta_id: bimbinganTaId,
        author_id: authorId,
        catatan: catatan,
        author_type: 'user',
      },
    });
  }

  async setJadwal(tugasAkhirId: number, dosenId: number, tanggal: string, jam: string): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const peranDosen = await tx.peranDosenTa.findFirst({
        where: { tugas_akhir_id: tugasAkhirId, dosen_id: dosenId },
      });

      if (peranDosen === null || String(peranDosen.peran).startsWith('pembimbing') === false) {
        throw new Error('You are not a supervisor for this final project.');
      }

      // TODO: Check for conflicting schedules

      return tx.bimbinganTA.create({
        data: {
          tugas_akhir_id: tugasAkhirId,
          dosen_id: dosenId,
          peran: peranDosen.peran,
          tanggal_bimbingan: new Date(tanggal),
          jam_bimbingan: jam,
          status_bimbingan: 'dijadwalkan',
        },
      });
    });
  }

  async cancelBimbingan(bimbinganId: number, dosenId: number): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const bimbingan = await tx.bimbinganTA.findFirst({
        where: { id: bimbinganId, dosen_id: dosenId }
      });

      if (bimbingan === null) {
        throw new Error('Supervision session not found or you are not authorized to modify it.');
      }

      return tx.bimbinganTA.update({
        where: { id: bimbinganId },
        data: { status_bimbingan: 'dibatalkan' }
      });
    });
  }

  async selesaikanSesi(bimbinganId: number, dosenId: number): Promise<unknown> {
    return this.prisma.$transaction(async (tx) => {
      const bimbingan = await tx.bimbinganTA.findFirst({
        where: { id: bimbinganId, dosen_id: dosenId },
        include: { tugasAkhir: true },
      });

      if (bimbingan === null) {
        throw new Error('Supervision session not found or you are not authorized to modify it.');
      }

      if (bimbingan.status_bimbingan !== 'dijadwalkan') {
        throw new Error('Only a "dijadwalkan" session can be completed.');
      }

      // 1. Update bimbingan status
      const updatedBimbingan = await tx.bimbinganTA.update({
        where: { id: bimbinganId },
        data: { status_bimbingan: 'selesai' },
      });

      // 2. Start document validation logic (mimicking Laravel)
      const dokumenTerkait = await tx.dokumenTa.findFirst({
        where: { tugas_akhir_id: bimbingan.tugas_akhir_id },
        orderBy: { version: 'desc' },
      });

      if (dokumenTerkait === null) {
        return updatedBimbingan;
      }

      const peranDosen = await tx.peranDosenTa.findFirst({
        where: { tugas_akhir_id: bimbingan.tugas_akhir_id, dosen_id: dosenId },
      });

      if (peranDosen !== null) {
        const updateData: Prisma.DokumenTaUpdateInput = {};
        if (peranDosen.peran === 'pembimbing1') {
          updateData.validatorP1 = { connect: { id: dosenId } };
        } else if (peranDosen.peran === 'pembimbing2') {
          updateData.validatorP2 = { connect: { id: dosenId } };
        }

        if (Object.keys(updateData).length > 0) {
          const updatedDokumen = await tx.dokumenTa.update({
            where: { id: dokumenTerkait.id },
            data: updateData,
          });

          // Check if both supervisors have now validated
          if (updatedDokumen.divalidasi_oleh_p1 !== null && updatedDokumen.divalidasi_oleh_p2 !== null) {
            await tx.dokumenTa.update({
              where: { id: updatedDokumen.id },
              data: { status_validasi: 'disetujui' }, // Assuming 'disetujui' is a valid enum value
            });
          }
        }
      }

      return updatedBimbingan;
    });
  }
}