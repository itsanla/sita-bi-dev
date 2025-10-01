import { Router, type Request, type Response, type NextFunction } from 'express';
import { PenugasanService } from '../services/penugasan.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '../types/roles';
import { assignPembimbingSchema } from '../dto/penugasan.dto';

const router: Router = Router();
const penugasanService = new PenugasanService();

// Apply JWT Auth and Roles Guard globally for this router
// router.use(jwtAuthMiddleware);

router.get(
  '/unassigned',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin, Role.kajur]),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page != null ? parseInt(req.query.page as string) : undefined;
      const limit = req.query.limit != null ? parseInt(req.query.limit as string) : undefined;
      const unassignedTugasAkhir = await penugasanService.findUnassignedTugasAkhir(page, limit);
      res.status(200).json({ status: 'sukses', data: unassignedTugasAkhir });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/:tugasAkhirId/assign',
  jwtAuthMiddleware,
  authorizeRoles([Role.admin, Role.kajur]),
  validate(assignPembimbingSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tugasAkhirId } = req.params;
      if (tugasAkhirId == null) {
        res.status(400).json({ status: 'gagal', message: 'ID Tugas Akhir diperlukan' });
        return;
      }
      const assignedPembimbing = await penugasanService.assignPembimbing(parseInt(tugasAkhirId, 10), req.body);
      res.status(200).json({ status: 'sukses', data: assignedPembimbing });
    } catch (error) {
      next(error);
    }
  }
);

export default router;