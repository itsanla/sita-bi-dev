import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@repo/db';
import { PendaftaranSidangService } from '../services/pendaftaran-sidang.service';
import { uploadSidangFiles } from '../middlewares/upload.middleware';

const router: Router = Router();
const pendaftaranSidangService = new PendaftaranSidangService();

// Route untuk testing upload TANPA authentication middleware
router.post(
  '/sidang',
  uploadSidangFiles, // Multer middleware to handle file uploads
  asyncHandler(async (req, res): Promise<void> => {
    
    try {
      // ID Mahasiswa di-hardcode untuk testing
      const mahasiswaId = 1;
      
      // Check if mahasiswa exists, if not create test data
      const prisma = new PrismaClient();
      
      let mahasiswa = await prisma.mahasiswa.findUnique({
        where: { id: mahasiswaId },
        include: { tugasAkhir: true }
      });
      
      mahasiswa ??= await prisma.mahasiswa.create({
        data: {
          user_id: testUser.id,
          nim: '12345678',
          prodi: 'D4',
          kelas: 'A',
        },
        include: { tugasAkhir: true }
      });
      
      // Check if approved tugas akhir exists, create if not
      let tugasAkhir = await prisma.tugasAkhir.findFirst({
        where: { mahasiswa_id: mahasiswa.id, status: 'DISETUJUI' }
      });
      
      tugasAkhir ??= await prisma.tugasAkhir.create({
        data: {
          mahasiswa_id: mahasiswa.id,
          judul: 'Test Thesis Title for Upload',
          status: 'DISETUJUI',
          tanggal_pengajuan: new Date(),
        }
      });
      
      // Process the upload
      const pendaftaran = await pendaftaranSidangService.registerForSidang(
        mahasiswa.id,
        req.files,
      );
      
      res.status(201).json({ 
        status: 'sukses', 
        message: 'File upload test berhasil!',
        data: pendaftaran 
      });
    } catch (error) {
      console.error('Upload test error:', error);
      throw error; // Re-throw to be handled by error middleware
    }
  }),
);

export default router;