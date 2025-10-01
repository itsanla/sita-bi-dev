# API Route Audit

This file documents all the API routes in the Express.js backend and their usage in the Next.js frontend.

## `/api/auth`

-   `POST /login`: **Used** in `apps/web/app/login/page.tsx`
-   `POST /register`: **Used** in `apps/web/app/register/page.tsx`
-   `POST /verify-email`: **Used** in `apps/web/app/verify-otp/page.tsx`

## `/api/bimbingan`

-   `GET /sebagai-dosen`: **Used** in `apps/web/app/dashboard/dosen/bimbingan/page.tsx`
-   `GET /sebagai-mahasiswa`: **Used** in `apps/web/app/dashboard/mahasiswa/bimbingan/page.tsx`
-   `POST /catatan`: **Used** in `apps/web/app/dashboard/dosen/bimbingan/page.tsx` and `apps/web/app/dashboard/mahasiswa/bimbingan/page.tsx`
-   `POST /:tugasAkhirId/jadwal`: **Used** in `apps/web/app/dashboard/dosen/bimbingan/page.tsx`
-   `POST /sesi/:id/cancel`: **Used** in `apps/web/app/dashboard/dosen/bimbingan/page.tsx`
-   `POST /sesi/:id/selesaikan`: **Used** in `apps/web/app/dashboard/dosen/bimbingan/page.tsx`

## `/api/contoh-prisma`

-   `GET /`: **Not Used**

## `/api/jadwal-sidang`

-   `GET /approved-registrations`: **Used** in `apps/web/app/dashboard/admin/jadwal-sidang/page.tsx`
-   `POST /`: **Used** in `apps/web/app/dashboard/admin/jadwal-sidang/page.tsx`
-   `GET /for-penguji`: **Used** in `apps/web/app/dashboard/dosen/penilaian/page.tsx`, `apps/web/app/dashboard/jadwal-sidang/page.tsx`
-   `GET /for-mahasiswa`: **Used** in `apps/web/app/dashboard/jadwal-sidang/page.tsx`

## `/api/laporan`

-   `GET /statistik`: **Used** in `apps/web/app/dashboard/admin/laporan/page.tsx`

## `/api/links`

-   `POST /`: **Used** in `apps/web/app/dashboard/admin/links/page.tsx`
-   `GET /`: **Used** in `apps/web/app/dashboard/admin/links/page.tsx`
-   `GET /:id`: **Not Used**
-   `PATCH /:id`: **Used** in `apps/web/app/dashboard/admin/links/page.tsx`
-   `DELETE /:id`: **Used** in `apps/web/app/dashboard/admin/links/page.tsx`

## `/api/logs`

-   `GET /`: **Not Used**

## `/api/pendaftaran-sidang`

-   `POST /`: **Used** in `apps/web/app/dashboard/mahasiswa/sidang/page.tsx`
-   `GET /pending-approvals`: **Used** in `apps/web/app/dashboard/dosen/sidang-approvals/page.tsx`
-   `POST /:id/approve`: **Used** in `apps/web/app/dashboard/dosen/sidang-approvals/page.tsx`
-   `POST /:id/reject`: **Used** in `apps/web/app/dashboard/dosen/sidang-approvals/page.tsx`

## `/api/pengumuman`

-   `POST /`: **Used** in `apps/web/app/dashboard/admin/pengumuman/create/page.tsx`
-   `GET /all`: **Used** in `apps/web/app/dashboard/admin/pengumuman/page.tsx`
-   `PATCH /:id`: **Used** in `apps/web/app/dashboard/admin/pengumuman/edit/[id]/page.tsx`
-   `DELETE /:id`: **Used** in `apps/web/app/dashboard/admin/pengumuman/page.tsx`
-   `GET /public`: **Used** in `apps/web/app/pengumuman/page.tsx`
-   `GET /mahasiswa`: **Used** in `apps/web/app/dashboard/pengumuman/page.tsx`
-   `GET /dosen`: **Used** in `apps/web/app/dashboard/pengumuman/page.tsx`
-   `GET /:id`: **Used** in `apps/web/app/dashboard/admin/pengumuman/edit/[id]/page.tsx`

## `/api/penilaian`

-   `POST /`: **Used** in `apps/web/app/dashboard/dosen/penilaian/page.tsx`
-   `GET /sidang/:sidangId`: **Not Used**

## `/api/penugasan`

-   `GET /unassigned`: **Used** in `apps/web/app/dashboard/admin/penugasan/page.tsx`
-   `POST /:tugasAkhirId/assign`: **Used** in `apps/web/app/dashboard/admin/penugasan/page.tsx`

## `/api/profile`

-   `GET /`: **Used** in `apps/web/context/AuthContext.tsx` (implicitly)
-   `PATCH /`: **Used** in `apps/web/app/dashboard/profile/page.tsx`

## `/api/ruangan`

-   `GET /`: **Used** in `apps/web/app/dashboard/admin/jadwal-sidang/page.tsx`

## `/api/tawaran-topik`

-   `POST /`: **Used** in `apps/web/app/dashboard/dosen/tawaran-topik/page.tsx`
-   `GET /`: **Used** in `apps/web/app/dashboard/dosen/tawaran-topik/page.tsx`
-   `GET /available`: **Used** in `apps/web/app/dashboard/mahasiswa/tugas-akhir/page.tsx` and `apps/web/app/tawaran-topik/page.tsx`
-   `GET /applications`: **Used** in `apps/web/app/dashboard/dosen/tawaran-topik/page.tsx`
-   `POST /applications/:id/approve`: **Used** in `apps/web/app/dashboard/dosen/tawaran-topik/page.tsx`
-   `POST /applications/:id/reject`: **Used** in `apps/web/app/dashboard/dosen/tawaran-topik/page.tsx`
-   `POST /:id/apply`: **Used** in `apps/web/app/dashboard/mahasiswa/tugas-akhir/page.tsx`

## `/api/test-upload`

-   `POST /`: **Not Used**

## `/api/tugas-akhir`

-   `POST /`: **Used** in `apps/web/app/dashboard/mahasiswa/tugas-akhir/page.tsx`
-   `GET /validasi`: **Used** in `apps/web/app/dashboard/admin/validasi-ta/page.tsx`
-   `PATCH /:id/approve`: **Used** in `apps/web/app/dashboard/admin/validasi-ta/page.tsx`
-   `PATCH /:id/reject`: **Used** in `apps/web/app/dashboard/admin/validasi-ta/page.tsx`
-   `POST /:id/cek-kemiripan`: **Used** in `apps/web/app/dashboard/admin/validasi-ta/page.tsx`

## `/api/users`

-   `POST /dosen`: **Not Used**
-   `GET /dosen`: **Used** in `apps/web/app/dashboard/admin/users/page.tsx`, `apps/web/app/dashboard/admin/penugasan/page.tsx`, and `apps/web/app/dashboard/admin/jadwal-sidang/page.tsx`
-   `GET /mahasiswa`: **Used** in `apps/web/app/dashboard/admin/users/page.tsx`
-   `PATCH /dosen/:id`: **Not Used**
-   `PATCH /mahasiswa/:id`: **Not Used**
-   `DELETE /:id`: **Not Used**