import { z } from 'zod';

// Define schemas for the nested objects based on LaporanService's return structure
const mahasiswaPerProdiSchema = z.object({
  prodi: z.string(),
  _count: z.object({ prodi: z.number() }),
});

const mahasiswaPerAngkatanSchema = z.object({
  angkatan: z.string(),
  _count: z.object({ angkatan: z.number() }),
});

const sidangStatistikSchema = z.object({
  jenis_sidang: z.string(),
  status_hasil: z.string(),
  _count: z.object({ _all: z.number() }),
});

const bimbinganPerDosenSchema = z.object({
  dosen_id: z.number(),
  _count: z.object({ _all: z.number() }),
});

const dokumenStatistikSchema = z.object({
  tipe_dokumen: z.string(),
  status_validasi: z.string(),
  _count: z.object({ _all: z.number() }),
});

const pengujiStatSchema = z.object({
  dosen_id: z.number(),
  _count: z.object({ _all: z.number() }),
});

export const statistikDtoSchema = z.object({
  mahasiswaPerProdi: z.array(mahasiswaPerProdiSchema),
  mahasiswaPerAngkatan: z.array(mahasiswaPerAngkatanSchema),
  sidangStatistik: z.array(sidangStatistikSchema),
  bimbinganPerDosen: z.array(bimbinganPerDosenSchema),
  dokumenStatistik: z.array(dokumenStatistikSchema),
  pengujiStat: z.array(pengujiStatSchema),
});

export type StatistikDto = z.infer<typeof statistikDtoSchema>;
