import { PrismaClient } from '@repo/db';
import { StatistikDto } from '../dto/laporan.dto';
import { PeranDosen } from '@prisma/client';

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

    const mahasiswaPerAngkatan = await this.prisma.mahasiswa.groupBy({
      by: ['angkatan'],
      _count: { angkatan: true },
      orderBy: { angkatan: 'asc' },
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
        where: { peran: { in: [PeranDosen.penguji1, PeranDosen.penguji2, PeranDosen.penguji3, PeranDosen.penguji4] } },
        select: { dosen_id: true }
    });

    const pengujiStatCounts = pengujiData.reduce((acc, curr) => {
        acc[curr.dosen_id] = (acc[curr.dosen_id] ?? 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const pengujiStat = Object.entries(pengujiStatCounts).map(([dosen_id, count]) => ({
        dosen_id: parseInt(dosen_id),
        _count: { _all: count }
    }));

    return {
        mahasiswaPerProdi,
        mahasiswaPerAngkatan,
        sidangStatistik,
        bimbinganPerDosen,
        dokumenStatistik,
        pengujiStat
    };
  }
}
