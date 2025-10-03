import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PendaftaranSidangService } from '../services/pendaftaran-sidang.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '@repo/types';
import { rejectPendaftaranSchema } from '../dto/pendaftaran-sidang.dto';
import { uploadSidangFiles } from '../middlewares/upload.middleware';

const router: Router = Router();
const pendaftaranSidangService = new PendaftaranSidangService();

// Apply JWT Auth and Roles Guard globally for this router
router.use(asyncHandler(jwtAuthMiddleware));

router.post(
  '/',
  // authorizeRoles([Role.mahasiswa]), // Dikomenkan untuk sementara untuk testing
  uploadSidangFiles, // Multer middleware to handle file uploads
  asyncHandler(async (req, res): Promise<void> => {
    // ID Mahasiswa di-hardcode untuk testing karena otentikasi dinonaktifkan
    const mahasiswaId = 1; // Ganti dengan ID mahasiswa yang valid dari database Anda jika perlu
    /*
    const mahasiswaId = req.user?.mahasiswa?.id;
    if (mahasiswaId === undefined) {
      res.status(401).json({ status: 'gagal', message: 'Akses ditolak: Pengguna tidak memiliki profil mahasiswa.' });
      return;
    }
    */
    // req.files will contain the uploaded files after multer processes them
    const pendaftaran = await pendaftaranSidangService.registerForSidang(
      mahasiswaId,
      req.files,
    );
    res.status(201).json({ status: 'sukses', data: pendaftaran });
  }),
);

router.get(
  '/pending-approvals',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res): Promise<void> => {
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const pendingRegistrations =
      await pendaftaranSidangService.getPendingRegistrations(dosenId);
    res.status(200).json({ status: 'sukses', data: pendingRegistrations });
  }),
);

router.post(
  '/:id/approve',
  authorizeRoles([Role.dosen]),
  asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res
        .status(400)
        .json({ status: 'gagal', message: 'ID Pendaftaran diperlukan' });
      return;
    }
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const approvedRegistration =
      await pendaftaranSidangService.approveRegistration(
        parseInt(id, 10),
        dosenId,
      );
    res.status(200).json({ status: 'sukses', data: approvedRegistration });
  }),
);

router.post(
  '/:id/reject',
  authorizeRoles([Role.dosen]),
  validate(rejectPendaftaranSchema),
  asyncHandler(async (req, res): Promise<void> => {
    const { id } = req.params;
    if (id == null) {
      res
        .status(400)
        .json({ status: 'gagal', message: 'ID Pendaftaran diperlukan' });
      return;
    }
    const dosenId = req.user?.dosen?.id;
    if (dosenId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil dosen.',
      });
      return;
    }
    const { catatan } = req.body;
    const rejectedRegistration =
      await pendaftaranSidangService.rejectRegistration(
        parseInt(id, 10),
        dosenId,
        catatan,
      );
    res.status(200).json({ status: 'sukses', data: rejectedRegistration });
  }),
);

router.get(
  '/my-registration',
  authorizeRoles([Role.mahasiswa]),
  asyncHandler(async (req, res): Promise<void> => {
    const mahasiswaId = req.user?.mahasiswa?.id;
    if (mahasiswaId === undefined) {
      res.status(401).json({
        status: 'gagal',
        message: 'Akses ditolak: Pengguna tidak memiliki profil mahasiswa.',
      });
      return;
    }
    const registration =
      await pendaftaranSidangService.findMyRegistration(mahasiswaId);
    res.status(200).json({ status: 'sukses', data: registration });
  }),
);

export default router;
