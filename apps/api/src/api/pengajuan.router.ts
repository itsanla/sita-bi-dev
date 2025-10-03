import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PengajuanService } from '../services/pengajuan.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();
const pengajuanService = new PengajuanService();

// All routes in this router are protected
router.use(asyncHandler(jwtAuthMiddleware));

// Endpoint for student to send a request
router.post(
  '/mahasiswa',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const mahasiswaId = req.user.id;
    const { dosenId } = req.body;
    const result = await pengajuanService.ajukanKeDosen(mahasiswaId, dosenId);
    res.status(201).json({ status: 'sukses', data: result });
  }),
);

// Endpoint for lecturer to send an offer
router.post(
  '/dosen',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const dosenId = req.user.id;
    const { mahasiswaId } = req.body;
    const result = await pengajuanService.tawariMahasiswa(dosenId, mahasiswaId);
    res.status(201).json({ status: 'sukses', data: result });
  }),
);

// Endpoint to accept a proposal
router.post(
  '/:id/terima',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (id == null) {
      return res
        .status(400)
        .json({ status: 'gagal', message: 'ID is required' });
    }
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const result = await pengajuanService.terimaPengajuan(parseInt(id), userId);
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

// Endpoint to reject a proposal
router.post(
  '/:id/tolak',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (id == null) {
      return res
        .status(400)
        .json({ status: 'gagal', message: 'ID is required' });
    }
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const result = await pengajuanService.tolakPengajuan(parseInt(id), userId);
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

// Endpoint to cancel a proposal
router.post(
  '/:id/batalkan',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (id == null) {
      return res
        .status(400)
        .json({ status: 'gagal', message: 'ID is required' });
    }
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const userId = req.user.id;
    const result = await pengajuanService.batalkanPengajuan(
      parseInt(id),
      userId,
    );
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

// Endpoint to get proposals for the logged-in lecturer
router.get(
  '/dosen',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const dosenId = req.user.id;
    const result = await pengajuanService.getPengajuanUntukDosen(dosenId);
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

// Endpoint to get proposals for the logged-in student
router.get(
  '/mahasiswa',
  asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ status: 'gagal', message: 'Unauthorized' });
    }
    const mahasiswaId = req.user.id;
    const result =
      await pengajuanService.getPengajuanUntukMahasiswa(mahasiswaId);
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

export default router;
