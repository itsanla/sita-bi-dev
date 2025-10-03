import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PengajuanService } from '../services/pengajuan.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();
const pengajuanService = new PengajuanService();

// All routes in this router are protected
router.use(asyncHandler(jwtAuthMiddleware));

// Endpoint untuk mahasiswa mengajukan ke dosen
router.post(
  '/mahasiswa',
  asyncHandler(async (req, res) => {
    if (typeof req.user?.mahasiswa?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Akses ditolak: Anda bukan mahasiswa' 
      });
    }

    const mahasiswaId = req.user.mahasiswa.id;
    const { dosenId } = req.body;

    if (typeof dosenId !== 'number' && typeof dosenId !== 'string') {
      return res.status(400).json({
        status: 'gagal',
        message: 'ID dosen diperlukan'
      });
    }

    try {
      const result = await pengajuanService.ajukanKeDosen(mahasiswaId, parseInt(String(dosenId), 10));
      res.status(201).json({ status: 'sukses', data: result });
    } catch (_error) {
      res.status(400).json({ 
        status: 'gagal', 
        message: _error instanceof Error ? _error.message : 'Terjadi kesalahan'
      });
    }
  }),
);

// Endpoint untuk mendapatkan pengajuan mahasiswa
router.get(
  '/mahasiswa',
  asyncHandler(async (req, res) => {
    if (typeof req.user?.mahasiswa?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Akses ditolak: Anda bukan mahasiswa' 
      });
    }

    const mahasiswaId = req.user.mahasiswa.id;
    
    try {
      const result = await pengajuanService.getPengajuanMahasiswa(mahasiswaId);
      res.status(200).json({ status: 'sukses', data: result });
    } catch (_error) {
      res.status(500).json({ 
        status: 'gagal', 
        message: 'Gagal mendapatkan data pengajuan'
      });
    }
  }),
);

// Endpoint untuk dosen menawarkan ke mahasiswa
router.post(
  '/dosen',
  asyncHandler(async (req, res) => {
    if (typeof req.user?.dosen?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Akses ditolak: Anda bukan dosen' 
      });
    }

    const dosenId = req.user.dosen.id;
    const { mahasiswaId } = req.body;

    if (typeof mahasiswaId !== 'number' && typeof mahasiswaId !== 'string') {
      return res.status(400).json({
        status: 'gagal',
        message: 'ID mahasiswa diperlukan'
      });
    }

    try {
      const result = await pengajuanService.tawariMahasiswa(dosenId, parseInt(String(mahasiswaId), 10));
      res.status(201).json({ status: 'sukses', data: result });
    } catch (_error) {
      res.status(400).json({ 
        status: 'gagal', 
        message: _error instanceof Error ? _error.message : 'Terjadi kesalahan'
      });
    }
  }),
);

// Endpoint untuk mendapatkan pengajuan dosen
router.get(
  '/dosen',
  asyncHandler(async (req, res) => {
    if (typeof req.user?.dosen?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Akses ditolak: Anda bukan dosen' 
      });
    }

    const dosenId = req.user.dosen.id;
    
    try {
      const result = await pengajuanService.getPengajuanDosen(dosenId);
      res.status(200).json({ status: 'sukses', data: result });
    } catch (_error) {
      res.status(500).json({ 
        status: 'gagal', 
        message: 'Gagal mendapatkan data pengajuan'
      });
    }
  }),
);

// Endpoint untuk menerima pengajuan
router.post(
  '/:id/terima',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({ 
        status: 'gagal', 
        message: 'ID pengajuan diperlukan' 
      });
    }

    if (typeof req.user?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Unauthorized' 
      });
    }

    try {
      const result = await pengajuanService.terimaPengajuan(parseInt(id, 10), req.user.id);
      res.status(200).json({ status: 'sukses', data: result });
    } catch (error) {
      res.status(400).json({ 
        status: 'gagal', 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan'
      });
    }
  }),
);

// Endpoint untuk menolak pengajuan
router.post(
  '/:id/tolak',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({ 
        status: 'gagal', 
        message: 'ID pengajuan diperlukan' 
      });
    }

    if (typeof req.user?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Unauthorized' 
      });
    }

    try {
      const result = await pengajuanService.tolakPengajuan(parseInt(id, 10), req.user.id);
      res.status(200).json({ status: 'sukses', data: result });
    } catch (error) {
      res.status(400).json({ 
        status: 'gagal', 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan'
      });
    }
  }),
);

// Endpoint untuk membatalkan pengajuan
router.post(
  '/:id/batalkan',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (typeof id !== 'string' || id.length === 0) {
      return res.status(400).json({ 
        status: 'gagal', 
        message: 'ID pengajuan diperlukan' 
      });
    }

    if (typeof req.user?.id !== 'number') {
      return res.status(401).json({ 
        status: 'gagal', 
        message: 'Unauthorized' 
      });
    }

    try {
      const result = await pengajuanService.batalkanPengajuan(parseInt(id, 10), req.user.id);
      res.status(200).json({ status: 'sukses', data: result });
    } catch (error) {
      res.status(400).json({ 
        status: 'gagal', 
        message: error instanceof Error ? error.message : 'Terjadi kesalahan'
      });
    }
  }),
);

export default router;
