import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { TawaranTopikService } from '../services/tawaran-topik.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '../types/roles';
import { createTawaranTopikSchema } from '../dto/tawaran-topik.dto';

const router: Router = Router();
const tawaranTopikService = new TawaranTopikService();

// Apply JWT Auth and Roles Guard globally for this router
router.use(jwtAuthMiddleware);

router.post(
  '/',
  authorizeRoles([Role.dosen]),
  validate(createTawaranTopikSchema),
  asyncHandler(async (req, res) => {
    const newTawaranTopik = await tawaranTopikService.create(req.body, req.user!.id);
    res.status(201).json({ status: 'sukses', data: newTawaranTopik });
  })
);

router.get(
  '/',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const tawaranTopik = await tawaranTopikService.findByDosen(req.user!.id, page, limit);
    res.status(200).json({ status: 'sukses', data: tawaranTopik });
  })
);

router.get(
  '/available',
  authorizeRoles([Role.mahasiswa]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const availableTopics = await tawaranTopikService.findAvailable(page, limit);
    res.status(200).json({ status: 'sukses', data: availableTopics });
  })
);

router.get(
  '/applications',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const applications = await tawaranTopikService.getApplicationsForDosen(req.user!.id, page, limit);
    res.status(200).json({ status: 'sukses', data: applications });
  })
);

router.post(
  '/applications/:id/approve',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Aplikasi diperlukan' });
      return;
    }
    const approvedApplication = await tawaranTopikService.approveApplication(parseInt(id, 10), req.user!.id);
    res.status(200).json({ status: 'sukses', data: approvedApplication });
  })
);

router.post(
  '/applications/:id/reject',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Aplikasi diperlukan' });
      return;
    }
    const rejectedApplication = await tawaranTopikService.rejectApplication(parseInt(id, 10), req.user!.id);
    res.status(200).json({ status: 'sukses', data: rejectedApplication });
  })
);

router.post(
  '/:id/apply',
  authorizeRoles([Role.mahasiswa]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Topik diperlukan' });
      return;
    }
    const mahasiswaId = req.user?.mahasiswa?.id;
    if (mahasiswaId === undefined) {
      throw new Error('User is not a mahasiswa or profile is not loaded.');
    }
    const application = await tawaranTopikService.applyForTopic(parseInt(id, 10), mahasiswaId);
    res.status(201).json({ status: 'sukses', data: application });
  })
);

export default router;