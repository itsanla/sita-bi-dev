-- CreateTable
CREATE TABLE "pengajuan_bimbingan" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mahasiswa_id" INTEGER NOT NULL,
    "dosen_id" INTEGER NOT NULL,
    "diinisiasi_oleh" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'MENUNGGU_PERSETUJUAN_DOSEN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "pengajuan_bimbingan_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "pengajuan_bimbingan_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "pengajuan_bimbingan_mahasiswa_id_dosen_id_key" ON "pengajuan_bimbingan"("mahasiswa_id", "dosen_id");
