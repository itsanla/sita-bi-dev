import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { LogService } from '../services/log.service';
import {
  authMiddleware,
  insecureAuthMiddleware,
} from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '@repo/types';

const router: Router = Router();
const logService = new LogService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(authMiddleware);

router.get(
  '/',
  asyncHandler(authMiddleware),
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res): Promise<void> => {
    const page =
      req.query['page'] != null
        ? parseInt(req.query['page'] as string)
        : undefined;
    const limit =
      req.query['limit'] != null
        ? parseInt(req.query['limit'] as string)
        : undefined;
    const logs = await logService.findAll(page, limit);
    res.status(200).json({ status: 'sukses', data: logs });
  }),
);

// Endpoint to get logs for the current logged-in user (Mahasiswa/Dosen viewing their own history)
router.get(
  '/me',
  asyncHandler(insecureAuthMiddleware),
  asyncHandler(async (req, res): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
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
    const logs = await logService.findByUserId(userId, page, limit);
    res.status(200).json({ status: 'sukses', data: logs });
  }),
);

export default router;
