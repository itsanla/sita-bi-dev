import prisma from '../config/database';
import { PeranDosen } from '@prisma/client';

/**
 * Memvalidasi apakah komposisi tim TA valid sesuai aturan.
 * Aturan:
 * - 2 Pembimbing (Pembimbing 1 & 2)
 * - 3 Penguji
 *
 * Fungsi ini mengecek apakah penambahan peran baru akan melanggar aturan.
 * @param tugasAkhirId ID Tugas Akhir
 * @param newRole Peran yang akan ditambahkan
 */
export const validateTeamComposition = async (tugasAkhirId: number, newRole: PeranDosen): Promise<boolean> => {
  const currentRoles = await prisma.peranDosenTa.findMany({
    where: { tugas_akhir_id: tugasAkhirId },
  });

  const countByRole = currentRoles.reduce<Record<string, number>>((acc, curr) => {
    acc[curr.peran] = (acc[curr.peran] ?? 0) + 1;
    return acc;
  }, {});

  // Check pembimbing limit
  if (newRole === PeranDosen.pembimbing1 || newRole === PeranDosen.pembimbing2) {
    if (newRole === PeranDosen.pembimbing1 && (countByRole[PeranDosen.pembimbing1] ?? 0) > 0) {
      throw new Error('Pembimbing 1 sudah terisi.');
    }
    if (newRole === PeranDosen.pembimbing2 && (countByRole[PeranDosen.pembimbing2] ?? 0) > 0) {
      throw new Error('Pembimbing 2 sudah terisi.');
    }
    // Total pembimbing check (redundant but safe)
    const totalPembimbing = (countByRole[PeranDosen.pembimbing1] ?? 0) + (countByRole[PeranDosen.pembimbing2] ?? 0);
    if (totalPembimbing >= 2) {
      throw new Error('Maksimal 2 pembimbing.');
    }
  }

  // Check penguji limit (max 3 penguji defined in rule, but enum has 4?)
  // Rule: "3 Penguji"
  if (newRole.startsWith('penguji')) {
      // Cast to any to check inclusion if Typescript complains about exact enum match
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pengujiRoles: any[] = [PeranDosen.penguji1, PeranDosen.penguji2, PeranDosen.penguji3];
      if (!pengujiRoles.includes(newRole)) {
          // If enum has penguji4 but rule says 3, maybe we block penguji4?
          // For now allow up to penguji3 as per "3 Penguji"
          if (newRole === PeranDosen.penguji4) {
             throw new Error('Maksimal 3 penguji.');
          }
      }

      if ((countByRole[newRole] ?? 0) > 0) {
          throw new Error(`Posisi ${newRole} sudah terisi.`);
      }
  }

  return true;
};

/**
 * Memvalidasi beban kerja dosen.
 * Aturan: Maksimal bimbing 4 mahasiswa bersamaan.
 * @param dosenId ID Dosen
 */
export const validateDosenWorkload = async (dosenId: number): Promise<boolean> => {
  const dosen = await prisma.dosen.findUnique({
    where: { id: dosenId },
    select: { kuota_bimbingan: true }
  });

  if (!dosen) throw new Error('Dosen tidak ditemukan');

  const activeBimbinganCount = await prisma.peranDosenTa.count({
    where: {
      dosen_id: dosenId,
      peran: {
        in: [PeranDosen.pembimbing1, PeranDosen.pembimbing2]
      },
      tugasAkhir: {
        status: {
          notIn: ['LULUS_TANPA_REVISI', 'LULUS_DENGAN_REVISI', 'SELESAI', 'GAGAL', 'DITOLAK', 'DIBATALKAN']
        }
      }
    }
  });

  if (activeBimbinganCount >= dosen.kuota_bimbingan) {
    throw new Error(`Dosen telah mencapai batas kuota bimbingan (${dosen.kuota_bimbingan} mahasiswa).`);
  }

  return true;
};
