import { PrismaClient, PeranDosen } from '@repo/db';
import type { StatistikDto } from '../dto/laporan.dto';

export class LaporanService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getStatistik(): Promise<StatistikDto> {
    const mahasiswaPerProdi = await this.prisma.mahasiswa.groupBy({
      by: ['prodi'],
      _count: { prodi: true },
    });

    const sidangStatistik = await this.prisma.sidang.groupBy({
      by: ['jenis_sidang', 'status_hasil'],
      _count: { _all: true },
    });

    const bimbinganPerDosen = await this.prisma.bimbinganTA.groupBy({
      by: ['dosen_id'],
      _count: { _all: true },
    });

    const dokumenStatistik = await this.prisma.dokumenTa.groupBy({
      by: ['tipe_dokumen', 'status_validasi'],
      _count: { _all: true },
    });

    // Manual aggregation for pengujiStat to avoid circular reference error
    const pengujiData = await this.prisma.peranDosenTa.findMany({
      where: {
        peran: {
          in: [
            PeranDosen.penguji1,
            PeranDosen.penguji2,
            PeranDosen.penguji3,
            PeranDosen.penguji4,
          ],
        },
      },
      select: { dosen_id: true },
    });

    const pengujiStatCounts = pengujiData.reduce<Record<number, number>>(
      (acc, curr) => {
        if (curr.dosen_id) {
          acc[curr.dosen_id] = (acc[curr.dosen_id] ?? 0) + 1;
        }
        return acc;
      },
      {},
    );

    const pengujiStat = Object.entries(pengujiStatCounts).map(
      ([dosen_id, count]) => ({
        dosen_id: parseInt(dosen_id),
        _count: { _all: count },
      }),
    );

    return {
      mahasiswaPerProdi,
      sidangStatistik,
      bimbinganPerDosen,
      dokumenStatistik,
      pengujiStat,
    };
  }
}
