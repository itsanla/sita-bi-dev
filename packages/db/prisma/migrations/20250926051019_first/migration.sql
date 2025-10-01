-- CreateEnum
CREATE TYPE "public"."Prodi" AS ENUM ('D3', 'D4');

-- CreateEnum
CREATE TYPE "public"."StatusTugasAkhir" AS ENUM ('DRAFT', 'DIAJUKAN', 'DISETUJUI', 'BIMBINGAN', 'REVISI', 'MENUNGGU_PEMBATALAN', 'DIBATALKAN', 'LULUS_TANPA_REVISI', 'LULUS_DENGAN_REVISI', 'SELESAI', 'DITOLAK', 'GAGAL');

-- CreateEnum
CREATE TYPE "public"."PeranDosen" AS ENUM ('pembimbing1', 'pembimbing2', 'penguji1', 'penguji2', 'penguji3', 'penguji4');

-- CreateEnum
CREATE TYPE "public"."JenisSidang" AS ENUM ('PROPOSAL', 'AKHIR');

-- CreateEnum
CREATE TYPE "public"."StatusVerifikasi" AS ENUM ('menunggu_verifikasi', 'disetujui', 'ditolak', 'berkas_tidak_lengkap');

-- CreateEnum
CREATE TYPE "public"."StatusPersetujuan" AS ENUM ('menunggu', 'disetujui', 'ditolak');

-- CreateEnum
CREATE TYPE "public"."HasilSidang" AS ENUM ('menunggu_penjadwalan', 'dijadwalkan', 'lulus', 'lulus_revisi', 'tidak_lulus');

-- CreateEnum
CREATE TYPE "public"."StatusBimbingan" AS ENUM ('dijadwalkan', 'ditolak', 'selesai', 'berjalan', 'diajukan', 'dibatalkan');

-- CreateEnum
CREATE TYPE "public"."AudiensPengumuman" AS ENUM ('guest', 'registered_users', 'all_users', 'dosen', 'mahasiswa');

-- CreateEnum
CREATE TYPE "public"."TipeDokumenBimbingan" AS ENUM ('bimbingan');

-- CreateEnum
CREATE TYPE "public"."TipeDokumenSidang" AS ENUM ('NASKAH_TA', 'TOEIC', 'RAPOR', 'IJAZAH_SLTA', 'BEBAS_JURUSAN');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified_at" TIMESTAMP(3),
    "password" TEXT NOT NULL,
    "photo" TEXT,
    "remember_token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'api',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "guard_name" TEXT NOT NULL DEFAULT 'api',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."mahasiswa" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nim" TEXT NOT NULL,
    "prodi" "public"."Prodi" NOT NULL,
    "angkatan" TEXT NOT NULL,
    "kelas" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dosen" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "nidn" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tawaran_topik" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "judul_topik" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kuota" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tawaran_topik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."history_topik_mahasiswa" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "tawaran_topik_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_topik_mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tugas_akhir" (
    "id" SERIAL NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "tawaran_topik_id" INTEGER,
    "judul" TEXT NOT NULL,
    "status" "public"."StatusTugasAkhir" NOT NULL DEFAULT 'DRAFT',
    "tanggal_pengajuan" TIMESTAMP(3),
    "disetujui_oleh" INTEGER,
    "ditolak_oleh" INTEGER,
    "alasan_penolakan" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tugas_akhir_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."peran_dosen_ta" (
    "id" SERIAL NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "peran" "public"."PeranDosen" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peran_dosen_ta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bimbingan_ta" (
    "id" SERIAL NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "peran" TEXT NOT NULL,
    "sesi_ke" INTEGER,
    "tanggal_bimbingan" TIMESTAMP(3),
    "jam_bimbingan" TEXT,
    "status_bimbingan" "public"."StatusBimbingan" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bimbingan_ta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."catatan_bimbingan" (
    "id" SERIAL NOT NULL,
    "bimbingan_ta_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "catatan" TEXT NOT NULL,
    "author_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "catatan_bimbingan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."history_perubahan_jadwal" (
    "id" SERIAL NOT NULL,
    "bimbingan_ta_id" INTEGER NOT NULL,
    "mahasiswa_id" INTEGER NOT NULL,
    "tanggal_lama" TIMESTAMP(3),
    "jam_lama" TEXT,
    "tanggal_baru" TIMESTAMP(3),
    "jam_baru" TEXT,
    "alasan_perubahan" TEXT,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "history_perubahan_jadwal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pendaftaran_sidang" (
    "id" SERIAL NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "status_verifikasi" "public"."StatusVerifikasi" NOT NULL DEFAULT 'menunggu_verifikasi',
    "status_pembimbing_1" "public"."StatusPersetujuan" NOT NULL DEFAULT 'menunggu',
    "status_pembimbing_2" "public"."StatusPersetujuan" NOT NULL DEFAULT 'menunggu',
    "catatan_admin" TEXT,
    "catatan_pembimbing_1" TEXT,
    "catatan_pembimbing_2" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pendaftaran_sidang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pendaftaran_sidang_files" (
    "id" SERIAL NOT NULL,
    "pendaftaran_sidang_id" INTEGER NOT NULL,
    "file_path" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "tipe_dokumen" "public"."TipeDokumenSidang" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pendaftaran_sidang_files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sidang" (
    "id" SERIAL NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "pendaftaran_sidang_id" INTEGER,
    "jenis_sidang" "public"."JenisSidang" NOT NULL,
    "status_hasil" "public"."HasilSidang" NOT NULL DEFAULT 'menunggu_penjadwalan',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sidang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jadwal_sidang" (
    "id" SERIAL NOT NULL,
    "sidang_id" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu_mulai" TEXT NOT NULL,
    "waktu_selesai" TEXT NOT NULL,
    "ruangan_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_sidang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ruangan" (
    "id" SERIAL NOT NULL,
    "nama_ruangan" TEXT NOT NULL,
    "lokasi" TEXT,
    "kapasitas" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."nilai_sidang" (
    "id" SERIAL NOT NULL,
    "sidang_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "aspek" TEXT NOT NULL,
    "komentar" TEXT,
    "skor" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nilai_sidang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."dokumen_ta" (
    "id" SERIAL NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "tipe_dokumen" "public"."TipeDokumenBimbingan" NOT NULL,
    "status_validasi" TEXT NOT NULL DEFAULT 'menunggu',
    "divalidasi_oleh_p1" INTEGER,
    "divalidasi_oleh_p2" INTEGER,
    "file_path" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumen_ta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pengumuman" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "isi" TEXT NOT NULL,
    "dibuat_oleh" INTEGER NOT NULL,
    "audiens" "public"."AudiensPengumuman" NOT NULL,
    "tanggal_dibuat" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "url" TEXT,
    "method" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."email_verification_tokens" (
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "public"."notifikasi_ta" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "tugas_akhir_id" INTEGER NOT NULL,
    "pesan" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifikasi_ta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_RoleToUser" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_PermissionToRole" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_user_id_key" ON "public"."mahasiswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "public"."mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_user_id_key" ON "public"."dosen"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "public"."dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "tugas_akhir_mahasiswa_id_key" ON "public"."tugas_akhir"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "peran_dosen_ta_tugas_akhir_id_peran_key" ON "public"."peran_dosen_ta"("tugas_akhir_id", "peran");

-- CreateIndex
CREATE UNIQUE INDEX "sidang_pendaftaran_sidang_id_key" ON "public"."sidang"("pendaftaran_sidang_id");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_email_key" ON "public"."email_verification_tokens"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "public"."email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "public"."_RoleToUser"("B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "public"."_PermissionToRole"("B");

-- AddForeignKey
ALTER TABLE "public"."mahasiswa" ADD CONSTRAINT "mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dosen" ADD CONSTRAINT "dosen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tawaran_topik" ADD CONSTRAINT "tawaran_topik_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history_topik_mahasiswa" ADD CONSTRAINT "history_topik_mahasiswa_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history_topik_mahasiswa" ADD CONSTRAINT "history_topik_mahasiswa_tawaran_topik_id_fkey" FOREIGN KEY ("tawaran_topik_id") REFERENCES "public"."tawaran_topik"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tugas_akhir" ADD CONSTRAINT "tugas_akhir_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tugas_akhir" ADD CONSTRAINT "tugas_akhir_tawaran_topik_id_fkey" FOREIGN KEY ("tawaran_topik_id") REFERENCES "public"."tawaran_topik"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tugas_akhir" ADD CONSTRAINT "tugas_akhir_disetujui_oleh_fkey" FOREIGN KEY ("disetujui_oleh") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tugas_akhir" ADD CONSTRAINT "tugas_akhir_ditolak_oleh_fkey" FOREIGN KEY ("ditolak_oleh") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."peran_dosen_ta" ADD CONSTRAINT "peran_dosen_ta_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."peran_dosen_ta" ADD CONSTRAINT "peran_dosen_ta_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bimbingan_ta" ADD CONSTRAINT "bimbingan_ta_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bimbingan_ta" ADD CONSTRAINT "bimbingan_ta_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catatan_bimbingan" ADD CONSTRAINT "catatan_bimbingan_bimbingan_ta_id_fkey" FOREIGN KEY ("bimbingan_ta_id") REFERENCES "public"."bimbingan_ta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."catatan_bimbingan" ADD CONSTRAINT "catatan_bimbingan_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history_perubahan_jadwal" ADD CONSTRAINT "history_perubahan_jadwal_bimbingan_ta_id_fkey" FOREIGN KEY ("bimbingan_ta_id") REFERENCES "public"."bimbingan_ta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history_perubahan_jadwal" ADD CONSTRAINT "history_perubahan_jadwal_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "public"."mahasiswa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pendaftaran_sidang" ADD CONSTRAINT "pendaftaran_sidang_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pendaftaran_sidang_files" ADD CONSTRAINT "pendaftaran_sidang_files_pendaftaran_sidang_id_fkey" FOREIGN KEY ("pendaftaran_sidang_id") REFERENCES "public"."pendaftaran_sidang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sidang" ADD CONSTRAINT "sidang_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sidang" ADD CONSTRAINT "sidang_pendaftaran_sidang_id_fkey" FOREIGN KEY ("pendaftaran_sidang_id") REFERENCES "public"."pendaftaran_sidang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_sidang" ADD CONSTRAINT "jadwal_sidang_sidang_id_fkey" FOREIGN KEY ("sidang_id") REFERENCES "public"."sidang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."jadwal_sidang" ADD CONSTRAINT "jadwal_sidang_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "public"."ruangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nilai_sidang" ADD CONSTRAINT "nilai_sidang_sidang_id_fkey" FOREIGN KEY ("sidang_id") REFERENCES "public"."sidang"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."nilai_sidang" ADD CONSTRAINT "nilai_sidang_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "public"."dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_ta" ADD CONSTRAINT "dokumen_ta_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_ta" ADD CONSTRAINT "dokumen_ta_divalidasi_oleh_p1_fkey" FOREIGN KEY ("divalidasi_oleh_p1") REFERENCES "public"."dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."dokumen_ta" ADD CONSTRAINT "dokumen_ta_divalidasi_oleh_p2_fkey" FOREIGN KEY ("divalidasi_oleh_p2") REFERENCES "public"."dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pengumuman" ADD CONSTRAINT "pengumuman_dibuat_oleh_fkey" FOREIGN KEY ("dibuat_oleh") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."logs" ADD CONSTRAINT "logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_email_fkey" FOREIGN KEY ("email") REFERENCES "public"."users"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi_ta" ADD CONSTRAINT "notifikasi_ta_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notifikasi_ta" ADD CONSTRAINT "notifikasi_ta_tugas_akhir_id_fkey" FOREIGN KEY ("tugas_akhir_id") REFERENCES "public"."tugas_akhir"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_RoleToUser" ADD CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
