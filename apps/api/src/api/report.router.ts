import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { ReportService } from '../services/report.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '@repo/types';

const router: Router = Router();
const reportService = new ReportService();

router.use(authMiddleware);

router.get(
  '/dashboard',
  authorizeRoles([Role.admin, Role.dosen]),
  asyncHandler(async (req, res) => {
    const stats = await reportService.getDashboardStats();
    res.json({ status: 'success', data: stats });
  }),
);

router.get(
  '/workload',
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const data = await reportService.getLecturerWorkload();
    res.json({ status: 'success', data });
  }),
);

export default router;
