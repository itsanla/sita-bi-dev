import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { BimbinganService } from '../services/bimbingan.service';
import { insecureAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '@repo/types';
import { createCatatanSchema, setJadwalSchema } from '../dto/bimbingan.dto';

const router: Router = Router();
const bimbinganService = new BimbinganService();

// Apply JWT Auth and Roles Guard globally for this router
router.use(asyncHandler(insecureAuthMiddleware));

router.get(
  '/sebagai-dosen',
  asyncHandler(async (req, res): Promise<void> => {
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const page =
      req.query['page'] != null
        ? parseInt(req.query['page'] as string)
        : undefined;
    const limit =
      req.query['limit'] != null
        ? parseInt(req.query['limit'] as string)
        : undefined;
    const bimbingan = await bimbinganService.getBimbinganForDosen(
      dosenId,
      page,
      limit,
    );
    res.status(200).json({ status: 'sukses', data: bimbingan });
  }),
);

router.get(
  '/sebagai-mahasiswa',
  asyncHandler(async (req, res): Promise<void> => {
    const mahasiswaId = req.user?.mahasiswa?.id;
    if (mahasiswaId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil mahasiswa.',
      });
      return;
    }
    const bimbingan =
      await bimbinganService.getBimbinganForMahasiswa(mahasiswaId);
    res.status(200).json({ status: 'sukses', data: bimbingan });
  }),
);

router.post(
  '/catatan',
  authorizeRoles([Role.dosen, Role.mahasiswa]),
  validate(createCatatanSchema),
  asyncHandler(async (req, res): Promise<void> => {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: ID pengguna tidak ditemukan.',
      });
      return;
    }
    const { bimbingan_ta_id, catatan } = req.body;
    const newCatatan = await bimbinganService.createCatatan(
      bimbingan_ta_id,
      userId,
      catatan,
    );
    res.status(201).json({ status: 'sukses', data: newCatatan });
  }),
);

router.post(
  '/:tugasAkhirId/jadwal',
  authorizeRoles([Role.dosen]),
  validate(setJadwalSchema),
  asyncHandler(async (req, res): Promise<void> => {
    const { tugasAkhirId } = req.params;
    if (tugasAkhirId == null) {
      res
        .status(400)
        .json({ status: 'gagal', message: 'ID Tugas Akhir diperlukan' });
      return;
    }
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const { tanggal_bimbingan, jam_bimbingan } = req.body;
    const jadwal = await bimbinganService.setJadwal(
      parseInt(tugasAkhirId, 10),
      dosenId,
      tanggal_bimbingan,
      jam_bimbingan,
    );
    res.status(201).json({ status: 'sukses', data: jadwal });
  }),
);

router.post(
  '/sesi/:id/cancel',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res.status(400).json({ status: 'gagal', message: 'ID Sesi diperlukan' });
      return;
    }
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const result = await bimbinganService.cancelBimbingan(
      parseInt(id, 10),
      dosenId,
    );
    if (result === null) {
      res.status(404).json({
        status: 'gagal',
        message: 'Sesi bimbingan tidak ditemukan atau tidak diizinkan.',
      });
      return;
    }
    res.status(200).json({
      status: 'sukses',
      message: 'Sesi bimbingan dibatalkan.',
      data: result,
    });
  }),
);

router.post(
  '/sesi/:id/selesaikan',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res.status(400).json({ status: 'gagal', message: 'ID Sesi diperlukan' });
      return;
    }
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const result = await bimbinganService.selesaikanSesi(
      parseInt(id, 10),
      dosenId,
    );
    if (result === null) {
      res.status(404).json({
        status: 'gagal',
        message: 'Sesi bimbingan tidak ditemukan atau tidak diizinkan.',
      });
      return;
    }
    res.status(200).json({
      status: 'sukses',
      message: 'Sesi bimbingan telah diselesaikan.',
      data: result,
    });
  }),
);

export default router;
