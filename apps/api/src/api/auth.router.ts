import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../services/auth.service';
import { validate } from '../middlewares/validation.middleware';
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from '../dto/auth.dto';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();
const authService = new AuthService();

router.post(
  '/login',
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    res.status(200).json({ status: 'sukses', data: result });
  }),
);

router.post(
  '/register',
  validate(registerSchema),
  asyncHandler(async (req, res) => {
    await authService.register(req.body);
    res.status(201).json({
      status: 'sukses',
      message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
    });
  }),
);

router.post(
  '/verify-email',
  validate(verifyEmailSchema),
  asyncHandler(async (req, res) => {
    await authService.verifyEmail(req.body);
    res.status(200).json({
      status: 'sukses',
      message: 'Email berhasil diverifikasi. Silakan login.',
    });
  }),
);

// Logout endpoint
router.post('/logout', authMiddleware, (_req, res) => {
  res.status(200).json({
    status: 'sukses',
    message: 'Logout berhasil',
  });
});

export default router;
