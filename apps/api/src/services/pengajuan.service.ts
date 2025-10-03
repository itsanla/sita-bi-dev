import { PrismaClient } from '@repo/db';
import { PenugasanService } from './penugasan.service';

export class PengajuanService {
  private prisma: PrismaClient;
  private penugasanService: PenugasanService;

  constructor() {
    this.prisma = new PrismaClient();
    this.penugasanService = new PenugasanService();
  }

  // Method untuk mahasiswa mengajukan ke dosen
  async ajukanKeDosen(mahasiswaId: number, dosenId: number): Promise<unknown> {

    // Cek apakah mahasiswa sudah punya pembimbing
    const existingTugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: { mahasiswa_id: mahasiswaId },
      include: { peranDosenTa: true }
    });

    if (existingTugasAkhir && existingTugasAkhir.peranDosenTa.length > 0) {
      throw new Error('Anda sudah memiliki pembimbing');
    }

    // Cek apakah mahasiswa sudah mengajukan ke dosen ini
    const existingPengajuan = await this.prisma.pengajuanBimbingan.findFirst({
      where: {
        mahasiswa_id: mahasiswaId,
        dosen_id: dosenId,
        status: { in: ['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'] }
      }
    });

    if (existingPengajuan) {
      throw new Error('Pengajuan ke dosen ini sudah ada');
    }

    // Cek jumlah pengajuan aktif mahasiswa (maksimal 3)
    const activePengajuan = await this.prisma.pengajuanBimbingan.count({
      where: {
        mahasiswa_id: mahasiswaId,
        diinisiasi_oleh: 'mahasiswa',
        status: 'MENUNGGU_PERSETUJUAN_DOSEN'
      }
    });

    if (activePengajuan >= 3) {
      throw new Error('Anda sudah memiliki 3 pengajuan aktif. Batalkan salah satu untuk mengajukan yang baru.');
    }

    // Buat pengajuan baru
    const pengajuan = await this.prisma.pengajuanBimbingan.create({
      data: {
        mahasiswa_id: mahasiswaId,
        dosen_id: dosenId,
        diinisiasi_oleh: 'mahasiswa',
        status: 'MENUNGGU_PERSETUJUAN_DOSEN'
      },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    return pengajuan;
  }

  // Method untuk dosen menawarkan ke mahasiswa
  async tawariMahasiswa(dosenId: number, mahasiswaId: number): Promise<unknown> {

    // Cek apakah mahasiswa sudah punya pembimbing
    const existingTugasAkhir = await this.prisma.tugasAkhir.findFirst({
      where: { mahasiswa_id: mahasiswaId },
      include: { peranDosenTa: true }
    });

    if (existingTugasAkhir && existingTugasAkhir.peranDosenTa.length > 0) {
      throw new Error('Mahasiswa sudah memiliki pembimbing');
    }

    // Cek apakah sudah ada pengajuan antara dosen dan mahasiswa ini
    const existingPengajuan = await this.prisma.pengajuanBimbingan.findFirst({
      where: {
        mahasiswa_id: mahasiswaId,
        dosen_id: dosenId,
        status: { in: ['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'] }
      }
    });

    if (existingPengajuan) {
      throw new Error('Pengajuan dengan mahasiswa ini sudah ada');
    }

    // Cek jumlah tawaran aktif dosen (maksimal 3)
    const activeTawaran = await this.prisma.pengajuanBimbingan.count({
      where: {
        dosen_id: dosenId,
        diinisiasi_oleh: 'dosen',
        status: 'MENUNGGU_PERSETUJUAN_MAHASISWA'
      }
    });

    if (activeTawaran >= 3) {
      throw new Error('Anda sudah memiliki 3 tawaran aktif. Batalkan salah satu untuk menawarkan yang baru.');
    }

    // Buat tawaran baru
    const pengajuan = await this.prisma.pengajuanBimbingan.create({
      data: {
        mahasiswa_id: mahasiswaId,
        dosen_id: dosenId,
        diinisiasi_oleh: 'dosen',
        status: 'MENUNGGU_PERSETUJUAN_MAHASISWA'
      },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    return pengajuan;
  }

  // Method untuk menerima pengajuan
  async terimaPengajuan(pengajuanId: number, userId: number): Promise<unknown> {

    return this.prisma.$transaction(async (tx) => {
      // Cari pengajuan
      const pengajuan = await tx.pengajuanBimbingan.findUnique({
        where: { id: pengajuanId },
        include: {
          mahasiswa: { include: { user: true } },
          dosen: { include: { user: true } }
        }
      });

      if (!pengajuan) {
        throw new Error('Pengajuan tidak ditemukan');
      }

      // Validasi user yang berhak menerima
      const isValidUser = 
        (pengajuan.diinisiasi_oleh === 'mahasiswa' && pengajuan.dosen.user.id === userId) ||
        (pengajuan.diinisiasi_oleh === 'dosen' && pengajuan.mahasiswa.user.id === userId);

      if (!isValidUser) {
        throw new Error('Anda tidak berhak menerima pengajuan ini');
      }

      // Cek status pengajuan
      if (!['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'].includes(pengajuan.status)) {
        throw new Error('Pengajuan ini sudah diproses');
      }

      // Cek apakah mahasiswa sudah punya tugas akhir dengan pembimbing
      const existingTugasAkhir = await tx.tugasAkhir.findFirst({
        where: { mahasiswa_id: pengajuan.mahasiswa_id },
        include: { peranDosenTa: true }
      });

      let tugasAkhir;
      if (existingTugasAkhir) {
        if (existingTugasAkhir.peranDosenTa.length > 0) {
          throw new Error('Mahasiswa sudah memiliki pembimbing');
        }
        tugasAkhir = existingTugasAkhir;
      } else {
        // Buat tugas akhir baru
        tugasAkhir = await tx.tugasAkhir.create({
          data: {
            mahasiswa_id: pengajuan.mahasiswa_id,
            judul: 'Judul Tugas Akhir (Belum Ditentukan)',
            status: 'DISETUJUI'
          }
        });
      }

      // Tambahkan dosen sebagai pembimbing
      await tx.peranDosenTa.create({
        data: {
          tugas_akhir_id: tugasAkhir.id,
          dosen_id: pengajuan.dosen_id,
          peran: 'pembimbing1'
        }
      });

      // Update status pengajuan menjadi disetujui
      const updatedPengajuan = await tx.pengajuanBimbingan.update({
        where: { id: pengajuanId },
        data: { status: 'DISETUJUI' },
        include: {
          mahasiswa: { include: { user: true } },
          dosen: { include: { user: true } }
        }
      });

      // Batalkan semua pengajuan lain untuk mahasiswa ini
      await tx.pengajuanBimbingan.updateMany({
        where: {
          mahasiswa_id: pengajuan.mahasiswa_id,
          id: { not: pengajuanId },
          status: { in: ['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'] }
        },
        data: { status: 'DIBATALKAN' }
      });

      return updatedPengajuan;
    });
  }

  // Method untuk menolak pengajuan
  async tolakPengajuan(pengajuanId: number, userId: number): Promise<unknown> {

    // Cari pengajuan
    const pengajuan = await this.prisma.pengajuanBimbingan.findUnique({
      where: { id: pengajuanId },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    if (!pengajuan) {
      throw new Error('Pengajuan tidak ditemukan');
    }

    // Validasi user yang berhak menolak
    const isValidUser = 
      (pengajuan.diinisiasi_oleh === 'mahasiswa' && pengajuan.dosen.user.id === userId) ||
      (pengajuan.diinisiasi_oleh === 'dosen' && pengajuan.mahasiswa.user.id === userId);

    if (!isValidUser) {
      throw new Error('Anda tidak berhak menolak pengajuan ini');
    }

    // Cek status pengajuan
    if (!['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'].includes(pengajuan.status)) {
      throw new Error('Pengajuan ini sudah diproses');
    }

    // Update status menjadi ditolak
    const updatedPengajuan = await this.prisma.pengajuanBimbingan.update({
      where: { id: pengajuanId },
      data: { status: 'DITOLAK' },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    return updatedPengajuan;
  }

  // Method untuk membatalkan pengajuan
  async batalkanPengajuan(pengajuanId: number, userId: number): Promise<unknown> {

    // Cari pengajuan
    const pengajuan = await this.prisma.pengajuanBimbingan.findUnique({
      where: { id: pengajuanId },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    if (!pengajuan) {
      throw new Error('Pengajuan tidak ditemukan');
    }

    // Validasi user yang berhak membatalkan (hanya yang menginisiasi)
    const isValidUser = 
      (pengajuan.diinisiasi_oleh === 'mahasiswa' && pengajuan.mahasiswa.user.id === userId) ||
      (pengajuan.diinisiasi_oleh === 'dosen' && pengajuan.dosen.user.id === userId);

    if (!isValidUser) {
      throw new Error('Anda tidak berhak membatalkan pengajuan ini');
    }

    // Cek status pengajuan
    if (!['MENUNGGU_PERSETUJUAN_DOSEN', 'MENUNGGU_PERSETUJUAN_MAHASISWA'].includes(pengajuan.status)) {
      throw new Error('Pengajuan ini sudah diproses');
    }

    // Update status menjadi dibatalkan
    const updatedPengajuan = await this.prisma.pengajuanBimbingan.update({
      where: { id: pengajuanId },
      data: { status: 'DIBATALKAN' },
      include: {
        mahasiswa: { include: { user: true } },
        dosen: { include: { user: true } }
      }
    });

    return updatedPengajuan;
  }

  // Method untuk mendapatkan pengajuan mahasiswa
  async getPengajuanMahasiswa(mahasiswaId: number): Promise<unknown> {

    const pengajuan = await this.prisma.pengajuanBimbingan.findMany({
      where: { mahasiswa_id: mahasiswaId },
      include: {
        dosen: { include: { user: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return pengajuan;
  }

  // Method untuk mendapatkan pengajuan dosen
  async getPengajuanDosen(dosenId: number): Promise<unknown> {

    const pengajuan = await this.prisma.pengajuanBimbingan.findMany({
      where: { dosen_id: dosenId },
      include: {
        mahasiswa: { include: { user: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    return pengajuan;
  }
}
