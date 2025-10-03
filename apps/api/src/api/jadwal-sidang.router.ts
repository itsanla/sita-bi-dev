import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { JadwalSidangService } from '../services/jadwal-sidang.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '@repo/types';
import { createJadwalSchema } from '../dto/jadwal-sidang.dto';

const router: Router = Router();
const jadwalSidangService = new JadwalSidangService();

router.get(
  '/approved-registrations',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res): Promise<void> => {
    const page =
      req.query.page != null ? parseInt(req.query.page as string) : undefined;
    const limit =
      req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const registrations = await jadwalSidangService.getApprovedRegistrations(
      page,
      limit,
    );
    res.status(200).json({ status: 'sukses', data: registrations });
  }),
);

router.post(
  '/',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.admin]),
  validate(createJadwalSchema),
  asyncHandler(async (req, res): Promise<void> => {
    const newJadwal = await jadwalSidangService.createJadwal(req.body);
    res.status(201).json({ status: 'sukses', data: newJadwal });
  }),
);

router.get(
  '/for-penguji',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.dosen]),
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
      req.query.page != null ? parseInt(req.query.page as string) : undefined;
    const limit =
      req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
    const sidang = await jadwalSidangService.getSidangForPenguji(
      dosenId,
      page,
      limit,
    );
    res.status(200).json({ status: 'sukses', data: sidang });
  }),
);

router.get(
  '/for-mahasiswa',
  asyncHandler(jwtAuthMiddleware),
  authorizeRoles([Role.mahasiswa]),
  asyncHandler(async (req, res): Promise<void> => {
    const mahasiswaId = req.user?.mahasiswa?.id;
    if (mahasiswaId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil mahasiswa.',
      });
      return;
    }
    const sidang = await jadwalSidangService.getSidangForMahasiswa(mahasiswaId);
    res.status(200).json({ status: 'sukses', data: sidang });
  }),
);

export default router;
