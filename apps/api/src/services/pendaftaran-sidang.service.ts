import { PrismaClient, PendaftaranSidang, TipeDokumenSidang, Prisma } from '@repo/db';


// Interface untuk return type getPendingRegistrations
interface PendingRegistration {
  id: number;
  tugas_akhir_id: number;
  status_verifikasi: string;
  status_pembimbing_1: string;
  status_pembimbing_2: string;
  catatan_pembimbing_1?: string | null;
  catatan_pembimbing_2?: string | null;
  created_at: Date;
  updated_at: Date;
  tugasAkhir: {
    id: number;
    judul: string;
    mahasiswa_id: number;
    status: string;
    mahasiswa: {
      id: number;
      nim: string;
      user: {
        id: number;
        name: string;
        email: string;
      };
    };
  };
}

export class PendaftaranSidangService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async registerForSidang(mahasiswaId: number, files: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[] | undefined): Promise<PendaftaranSidang> {
    return this.prisma.$transaction(async (tx) => {
      const tugasAkhir = await tx.tugasAkhir.findFirst({
        where: { mahasiswa_id: mahasiswaId, status: 'DISETUJUI' },
      });

      if (!tugasAkhir) {
        throw new Error('Active and approved final project not found for this student.');
      }

      const existingRegistration = await tx.pendaftaranSidang.findFirst({
        where: {
          tugas_akhir_id: tugasAkhir.id,
          status_verifikasi: { in: ['menunggu_verifikasi', 'disetujui'] },
        },
      });

      if (existingRegistration) {
        throw new Error('A registration for this final project already exists or is being processed.');
      }

      // TODO: Add more business logic checks (e.g., minimum supervisions)

      const pendaftaran = await tx.pendaftaranSidang.create({
        data: {
          tugas_akhir_id: tugasAkhir.id,
          status_verifikasi: 'menunggu_verifikasi',
          status_pembimbing_1: 'menunggu',
          status_pembimbing_2: 'menunggu',
        },
      });

      if (files && typeof files === 'object' && !Array.isArray(files)) {
        for (const fieldname in files) {
          const fileArray = files[fieldname];
          if (fileArray) {
            for (const file of fileArray) {
              // The file object from multer-s3 has a 'location' property which is the public URL.
              const uploadedFilePath = (file as any).location;

              if (!uploadedFilePath) {
                throw new Error(`Failed to upload ${file.originalname} to S3.`);
              }

              await tx.pendaftaranSidangFile.create({
                data: {
                  pendaftaran_sidang_id: pendaftaran.id,
                  file_path: uploadedFilePath, // Save the S3 URL
                  original_name: file.originalname,
                  tipe_dokumen: this.mapFilenameToTipe(file.fieldname),
                },
              });
            }
          }
        }
      }

      return pendaftaran;
    });
  }

  async getPendingRegistrations(dosenId: number): Promise<PendingRegistration[]> {
    return this.prisma.pendaftaranSidang.findMany({
      where: {
        OR: [
          {
            status_pembimbing_1: 'menunggu',
            tugasAkhir: {
              peranDosenTa: {
                some: { dosen_id: dosenId, peran: 'pembimbing1' },
              },
            },
          },
          {
            status_pembimbing_2: 'menunggu',
            tugasAkhir: {
              peranDosenTa: {
                some: { dosen_id: dosenId, peran: 'pembimbing2' },
              },
            },
          },
        ],
      },
      include: {
        tugasAkhir: {
          include: {
            mahasiswa: { include: { user: true } },
          },
        },
      },
    }) as Promise<PendingRegistration[]>;
  }

  async approveRegistration(pendaftaranId: number, dosenId: number): Promise<PendaftaranSidang> {
    return this.prisma.$transaction(async (tx) => {
      const pendaftaran = await tx.pendaftaranSidang.findUnique({
        where: { id: pendaftaranId },
        include: { tugasAkhir: { include: { peranDosenTa: true } } },
      });

      if (!pendaftaran) {
        throw new Error('Registration not found.');
      }

      const peran = pendaftaran.tugasAkhir.peranDosenTa.find(p => p.dosen_id === dosenId);
      if (!peran || (peran.peran !== 'pembimbing1' && peran.peran !== 'pembimbing2')) {
        throw new Error('You are not a supervisor for this registration.');
      }

      const updateData: Prisma.PendaftaranSidangUpdateInput = {};
      if (peran.peran === 'pembimbing1') {
        updateData['status_pembimbing_1'] = 'disetujui';
      } else if (peran.peran === 'pembimbing2') {
        updateData['status_pembimbing_2'] = 'disetujui';
      }

      const updatedPendaftaran = await tx.pendaftaranSidang.update({
        where: { id: pendaftaranId },
        data: updateData,
      });

      // Check if both supervisors have approved
      if (updatedPendaftaran.status_pembimbing_1 === 'disetujui' && updatedPendaftaran.status_pembimbing_2 === 'disetujui') {
        // Create a new Sidang record
        await tx.sidang.create({
          data: {
            pendaftaran_sidang_id: updatedPendaftaran.id,
            tugas_akhir_id: updatedPendaftaran.tugas_akhir_id,
            jenis_sidang: 'AKHIR',
            status_hasil: 'dijadwalkan', // Initial status for a newly created sidang
          },
        });

        // Update the main verification status
        return tx.pendaftaranSidang.update({
          where: { id: pendaftaranId },
          data: { status_verifikasi: 'disetujui' },
        });
      }

      return updatedPendaftaran;
    });
  }

  async rejectRegistration(pendaftaranId: number, dosenId: number, catatan: string): Promise<PendaftaranSidang> {
    return this.prisma.$transaction(async (tx) => {
      const pendaftaran = await tx.pendaftaranSidang.findUnique({
        where: { id: pendaftaranId },
        include: { tugasAkhir: { include: { peranDosenTa: true } } },
      });

      if (!pendaftaran) {
        throw new Error('Registration not found.');
      }

      const peran = pendaftaran.tugasAkhir.peranDosenTa.find(p => p.dosen_id === dosenId);
      if (!peran || (peran.peran !== 'pembimbing1' && peran.peran !== 'pembimbing2')) {
        throw new Error('You are not a supervisor for this registration.');
      }

      const updateData: Prisma.PendaftaranSidangUpdateInput = {
        status_verifikasi: 'ditolak', // Update main status
      };

      if (peran.peran === 'pembimbing1') {
        updateData['status_pembimbing_1'] = 'ditolak';
        updateData['catatan_pembimbing_1'] = catatan;
      } else if (peran.peran === 'pembimbing2') {
        updateData['status_pembimbing_2'] = 'ditolak';
        updateData['catatan_pembimbing_2'] = catatan;
      }

      return tx.pendaftaranSidang.update({
        where: { id: pendaftaranId },
        data: updateData,
      });
    });
  }

  private mapFilenameToTipe(fieldname: string): TipeDokumenSidang {
    switch (fieldname) {
      case 'file_ta': return TipeDokumenSidang.NASKAH_TA;
      case 'file_toeic': return TipeDokumenSidang.TOEIC;
      case 'file_rapor': return TipeDokumenSidang.RAPOR;
      case 'file_ijazah': return TipeDokumenSidang.IJAZAH_SLTA;
      case 'file_bebas_jurusan': return TipeDokumenSidang.BEBAS_JURUSAN;
      default: throw new Error(`Unknown file field name: ${fieldname}`);
    }
  }
}