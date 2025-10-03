import type { Request, Response } from 'express';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@repo/db';
import { getUploadPath, getMonorepoRoot } from '../utils/upload.config';
import * as fs from 'fs';

const router: Router = Router();
const prisma = new PrismaClient();

// Debug endpoint untuk check database dan file system
router.get('/check', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const checks = {
    timestamp: new Date().toISOString(),
    monorepoRoot: getMonorepoRoot(),
    uploadsPath: getUploadPath(),
    uploadsDirExists: false,
    sidangFilesDirExists: false,
    database: {
      connected: false,
      userCount: 0,
      mahasiswaCount: 0,
      tugasAkhirCount: 0,
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      UPLOADS_DIR: process.env.UPLOADS_DIR,
      MAX_FILE_SIZE: process.env.MAX_FILE_SIZE,
    }
  };

  try {
    // Check filesystem
    const uploadsPath = getUploadPath();
    const sidangFilesPath = getUploadPath('sidang-files');
    
    checks.uploadsDirExists = fs.existsSync(uploadsPath);
    checks.sidangFilesDirExists = fs.existsSync(sidangFilesPath);

    // Check database
    const userCount = await prisma.user.count();
    const mahasiswaCount = await prisma.mahasiswa.count();
    const tugasAkhirCount = await prisma.tugasAkhir.count();

    checks.database = {
      connected: true,
      userCount,
      mahasiswaCount,
      tugasAkhirCount,
    };

    // Check for approved thesis
    const approvedThesis = await prisma.tugasAkhir.findMany({
      where: { status: 'DISETUJUI' },
      include: { mahasiswa: { include: { user: true } } }
    });

    res.json({
      status: 'success',
      data: {
        ...checks,
        approvedThesis: approvedThesis.map(ta => ({
          id: ta.id,
          mahasiswa_id: ta.mahasiswa_id,
          judul: ta.judul,
          status: ta.status,
          mahasiswa: {
            nim: ta.mahasiswa.nim,
            name: ta.mahasiswa.user.name,
          }
        }))
      }
    });

  } catch (error) {
    res.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      data: checks
    });
  }
}));

// Create test data endpoint
router.post('/create-test-data', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    // Create test user and mahasiswa if they don't exist
    let testUser = await prisma.user.findUnique({
      where: { email: 'test.mahasiswa@test.com' }
    });

    testUser ??= await prisma.user.create({
      data: {
        name: 'Test Mahasiswa',
        email: 'test.mahasiswa@test.com',
        password: 'hashed_password_test',
        phone_number: '+6281234567890', // Add phone number
      }
    });

    let mahasiswa = await prisma.mahasiswa.findUnique({
      where: { user_id: testUser.id }
    });

    mahasiswa ??= await prisma.mahasiswa.create({
      data: {
        user_id: testUser.id,
        nim: '12345678',
        prodi: 'D4',
        kelas: 'A',
      }
    });

    // Create approved tugas akhir if it doesn't exist
    let tugasAkhir = await prisma.tugasAkhir.findFirst({
      where: { mahasiswa_id: mahasiswa.id, status: 'DISETUJUI' }
    });

    tugasAkhir ??= await prisma.tugasAkhir.create({
      data: {
        mahasiswa_id: mahasiswa.id,
        judul: 'Test Thesis for Upload Testing',
        status: 'DISETUJUI',
        tanggal_pengajuan: new Date(),
      }
    });

    res.json({
      status: 'success',
      message: 'Test data created successfully',
      data: {
        user: testUser,
        mahasiswa: mahasiswa,
        tugasAkhir: tugasAkhir
      }
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create test data'
    });
  }
}));

export default router;