import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { LaporanService } from '../services/laporan.service';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '@repo/types';

const router: Router = Router();
const laporanService = new LaporanService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(jwtAuthMiddleware);

router.get(
  '/statistik',
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const statistik = await laporanService.getStatistik();
    res.status(200).json({ status: 'sukses', data: statistik });
  }),
);

export default router;
