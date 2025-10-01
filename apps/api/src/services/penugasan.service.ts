import { PrismaClient, PeranDosen, StatusTugasAkhir } from '@repo/db';
import { AssignPembimbingDto } from '../dto/penugasan.dto';

export class PenugasanService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async findUnassignedTugasAkhir(page = 1, limit = 50): Promise<unknown> {
    const whereClause = {
      status: StatusTugasAkhir.DISETUJUI,
      peranDosenTa: {
        none: { // The TA has no related PeranDosenTa records
          peran: {
            in: [PeranDosen.pembimbing1, PeranDosen.pembimbing2]
          }
        },
      },
    };

    const total = await this.prisma.tugasAkhir.count({ where: whereClause });
    const data = await this.prisma.tugasAkhir.findMany({
      where: whereClause,
      include: {
        mahasiswa: { include: { user: true } },
      },
      orderBy: {
        updated_at: 'asc',
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

  async assignPembimbing(tugasAkhirId: number, dto: AssignPembimbingDto): Promise<unknown> {
    const { pembimbing1Id, pembimbing2Id } = dto;

    const queries = [];

    // Prepare query for Pembimbing 1
    queries.push(
      this.prisma.peranDosenTa.upsert({
        where: { tugas_akhir_id_peran: { tugas_akhir_id: tugasAkhirId, peran: PeranDosen.pembimbing1 } },
        update: { dosen_id: pembimbing1Id },
        create: { tugas_akhir_id: tugasAkhirId, dosen_id: pembimbing1Id, peran: PeranDosen.pembimbing1 },
      }),
    );

    // Prepare query for Pembimbing 2 if provided
    if (pembimbing2Id != null) {
      queries.push(
        this.prisma.peranDosenTa.upsert({
          where: { tugas_akhir_id_peran: { tugas_akhir_id: tugasAkhirId, peran: PeranDosen.pembimbing2 } },
          update: { dosen_id: pembimbing2Id },
          create: { tugas_akhir_id: tugasAkhirId, dosen_id: pembimbing2Id, peran: PeranDosen.pembimbing2 },
        }),
      );
    }

    // Add a query to update the TugasAkhir status
    queries.push(
      this.prisma.tugasAkhir.update({
        where: { id: tugasAkhirId },
        data: { status: StatusTugasAkhir.BIMBINGAN },
      })
    );

    // Execute all queries in a single transaction
    return this.prisma.$transaction(queries);
  }
}
