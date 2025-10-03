import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { SidangService } from '../services/sidang.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '@repo/types';

const router: Router = Router();
const sidangService = new SidangService();

router.use(asyncHandler(jwtAuthMiddleware));

router.get(
  '/unscheduled',
  authorizeRoles([Role.admin]),
  asyncHandler(async (_req, res) => {
    const result = await sidangService.findUnscheduled();
    res.status(200).json({ status: 'sukses', data: result });
  })
);

export default router;
