import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PengumumanService } from '../services/pengumuman.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '../types/roles';
import { createPengumumanSchema, updatePengumumanSchema } from '../dto/pengumuman.dto';

const router: Router = Router();
const pengumumanService = new PengumumanService();

// --- Admin Routes (Protected) ---
router.post(
  '/',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin]),
  validate(createPengumumanSchema),
  asyncHandler(async (req, res) => {
    const newPengumuman = await pengumumanService.create(req.body, req.user!.id);
    res.status(201).json({ status: 'sukses', data: newPengumuman });
  })
);

router.get(
  '/all',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const pengumumans = await pengumumanService.findAll(page, limit);
    res.status(200).json({ status: 'sukses', data: pengumumans });
  })
);

router.patch(
  '/:id',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin]),
  validate(updatePengumumanSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Pengumuman diperlukan' });
      return;
    }
    const updatedPengumuman = await pengumumanService.update(parseInt(id, 10), req.body);
    res.status(200).json({ status: 'sukses', data: updatedPengumuman });
  })
);

router.delete(
  '/:id',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Pengumuman diperlukan' });
      return;
    }
    await pengumumanService.remove(parseInt(id, 10));
    res.status(200).json({ status: 'sukses', message: 'Pengumuman berhasil dihapus.' });
  })
);

// --- Public/User Routes ---
router.get(
  '/public',
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const publicPengumumans = await pengumumanService.findPublic(page, limit);
    res.status(200).json({ status: 'sukses', data: publicPengumumans });
  })
);

router.get(
  '/mahasiswa',
  jwtAuthMiddleware,
  authorizeRoles([Role.mahasiswa]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const mahasiswaPengumumans = await pengumumanService.findForMahasiswa(page, limit);
    res.status(200).json({ status: 'sukses', data: mahasiswaPengumumans });
  })
);

router.get(
  '/dosen',
  jwtAuthMiddleware,
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const dosenPengumumans = await pengumumanService.findForDosen(page, limit);
    res.status(200).json({ status: 'sukses', data: dosenPengumumans });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Pengumuman diperlukan' });
      return;
    }
    const pengumuman = await pengumumanService.findOne(parseInt(id, 10));
    if (pengumuman === null) {
      res.status(404).json({ status: 'gagal', message: 'Pengumuman tidak ditemukan' });
      return;
    }
    res.status(200).json({ status: 'sukses', data: pengumuman });
  })
);

export default router;