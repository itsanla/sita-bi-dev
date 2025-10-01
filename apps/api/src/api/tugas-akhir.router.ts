import { Router, type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import { TugasAkhirService } from '../services/tugas-akhir.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '../types/roles';
import { createTugasAkhirSchema, rejectTugasAkhirSchema } from '../dto/tugas-akhir.dto';
import { tugasAkhirGuard } from '../middlewares/tugas-akhir.middleware';

const router: Router = Router();
const tugasAkhirService = new TugasAkhirService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(jwtAuthMiddleware);

router.post(
  '/',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.mahasiswa]),
  validate(createTugasAkhirSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (userId === undefined) {
      res.status(401).json({ status: 'gagal', message: 'Akses ditolak: ID pengguna tidak ditemukan.' });
      return;
    }
    const newTugasAkhir = await tugasAkhirService.create(req.body, userId);
    res.status(201).json({ status: 'sukses', data: newTugasAkhir });
  })
);

router.get(
  '/validasi',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.admin, Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4]),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const page = req.query.page != null ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const tugasAkhirList = await tugasAkhirService.findAllForValidation(req.user!, page, limit);
    res.status(200).json({ status: 'sukses', data: tugasAkhirList });
  })
);

router.patch(
  '/:id/approve',
  asyncHandler(jwtAuthMiddleware),
  asyncHandler(tugasAkhirGuard), // Custom guard for Tugas Akhir
  authorizeRoles([Role.admin, Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4]),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res.status(400).json({ status: 'gagal', message: 'ID Tugas Akhir diperlukan' });
      return;
    }
    const approverId = req.user?.id;
    if (approverId === undefined) {
      res.status(401).json({ status: 'gagal', message: 'Akses ditolak: ID pemberi persetujuan tidak ditemukan.' });
      return;
    }
    const approvedTugasAkhir = await tugasAkhirService.approve(parseInt(id, 10), approverId);
    res.status(200).json({ status: 'sukses', data: approvedTugasAkhir });
  })
);

router.patch(
  '/:id/reject',
  asyncHandler(jwtAuthMiddleware),
  asyncHandler(tugasAkhirGuard), // Custom guard for Tugas Akhir
  authorizeRoles([Role.admin, Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4]),
  validate(rejectTugasAkhirSchema),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res.status(400).json({ status: 'gagal', message: 'ID Tugas Akhir diperlukan' });
      return;
    }
    const rejecterId = req.user?.id;
    if (rejecterId === undefined) {
      res.status(401).json({ status: 'gagal', message: 'Akses ditolak: ID penolak tidak ditemukan.' });
      return;
    }
    const { alasan_penolakan } = req.body;
    const rejectedTugasAkhir = await tugasAkhirService.reject(parseInt(id, 10), rejecterId, alasan_penolakan);
    res.status(200).json({ status: 'sukses', data: rejectedTugasAkhir });
  })
);

router.post(
  '/:id/cek-kemiripan',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.admin, Role.kajur, Role.kaprodi_d3, Role.kaprodi_d4]),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res.status(400).json({ status: 'gagal', message: 'ID Tugas Akhir diperlukan' });
      return;
    }
    const kemiripanResult = await tugasAkhirService.cekKemiripan(parseInt(id, 10));
    res.status(200).json({ status: 'sukses', data: kemiripanResult });
  })
);

export default router;