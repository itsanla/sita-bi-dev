import { Router } from 'express';
import { ContohPrismaService } from '../services/contoh-prisma.service';
import asyncHandler from 'express-async-handler';

const router: Router = Router();
const contohPrismaService = new ContohPrismaService();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query['page'] as string) || undefined;
    const limit = parseInt(req.query['limit'] as string) || undefined;
    const users = await contohPrismaService.findAll(page, limit);
    res.status(200).json({ status: 'sukses', data: users });
  }),
);

export default router;
