import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { UsersService } from '../services/users.service';
import { jwtAuthMiddleware } from '../middlewares/auth.middleware';
import { authorizeRoles } from '../middlewares/roles.middleware';
import { validate } from '../middlewares/validation.middleware';
import { Role } from '../types/roles';
import { createDosenSchema, updateDosenSchema, updateMahasiswaSchema } from '../dto/users.dto';

const router: Router = Router();
const usersService = new UsersService();

// Apply JWT Auth and Roles Guard globally for this router
router.use(jwtAuthMiddleware);

router.post(
  '/dosen',
  authorizeRoles([Role.admin]),
  validate(createDosenSchema),
  asyncHandler(async (req, res) => {
    const newDosen = await usersService.createDosen(req.body);
    res.status(201).json({ status: 'sukses', data: newDosen });
  })
);

router.get(
  '/dosen',
  // authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const dosenList = await usersService.findAllDosen(page, limit);
    res.status(200).json({ status: 'sukses', data: dosenList });
  })
);

router.get(
  '/mahasiswa',
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const page = req.query.page ? parseInt(req.query.page as string) : undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const mahasiswaList = await usersService.findAllMahasiswa(page, limit);
    res.status(200).json({ status: 'sukses', data: mahasiswaList });
  })
);

router.patch(
  '/dosen/:id',
  authorizeRoles([Role.admin]),
  validate(updateDosenSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Dosen diperlukan' });
      return;
    }
    const updatedDosen = await usersService.updateDosen(parseInt(id, 10), req.body);
    res.status(200).json({ status: 'sukses', data: updatedDosen });
  })
);

router.patch(
  '/mahasiswa/:id',
  authorizeRoles([Role.admin]),
  validate(updateMahasiswaSchema),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Mahasiswa diperlukan' });
      return;
    }
    const updatedMahasiswa = await usersService.updateMahasiswa(parseInt(id, 10), req.body);
    res.status(200).json({ status: 'sukses', data: updatedMahasiswa });
  })
);

router.delete(
  '/:id',
  authorizeRoles([Role.admin]),
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: 'gagal', message: 'ID Pengguna diperlukan' });
      return;
    }
    await usersService.deleteUser(parseInt(id, 10));
    res.status(200).json({ status: 'sukses', message: 'Pengguna berhasil dihapus.' });
  })
);

export default router;