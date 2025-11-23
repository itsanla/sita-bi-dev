import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { LogService } from '../services/log.service';
import { authMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { Role } from '@repo/types';

const router: Router = Router();
const logService = new LogService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(authMiddleware);

router.get(
  '/',
  authMiddleware,
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

    const filters = {
      module: req.query['module'],
      user_id: req.query['user_id'],
      entity_id: req.query['entity_id'],
    };

    const logs = await logService.findAll(page, limit, filters);
    res.status(200).json({ status: 'sukses', data: logs });
  }),
);

export default router;
