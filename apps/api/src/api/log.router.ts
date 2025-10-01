import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { LogService } from '../services/log.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '../types/roles';

const router: Router = Router();
const logService = new LogService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(jwtAuthMiddleware);

router.get(
  '/',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || undefined;
    const limit = parseInt(req.query.limit as string) || undefined;
    const logs = await logService.findAll(page, limit);
    res.status(200).json({ status: 'sukses', data: logs });
  })
);

export default router;