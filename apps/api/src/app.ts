import express from 'express';
import cors from 'cors';
import linksRouter from './api/links.router';
import contohPrismaRouter from './api/contoh-prisma.router';
import bimbinganRouter from './api/bimbingan.router';
import jadwalSidangRouter from './api/jadwal-sidang.router';
import laporanRouter from './api/laporan.router';
import logRouter from './api/log.router';
import pendaftaranSidangRouter from './api/pendaftaran-sidang.router';
import pengumumanRouter from './api/pengumuman.router';
import pengajuanRouter from './api/pengajuan.router'; // Import the new router
import penilaianRouter from './api/penilaian.router';
import penugasanRouter from './api/penugasan.router';
import profileRouter from './api/profile.router';
import tawaranTopikRouter from './api/tawaran-topik.router';
import tugasAkhirRouter from './api/tugas-akhir.router';
import usersRouter from './api/users.router';
import testUploadRouter from './api/test-upload.router'; // Router untuk testing upload lokal
import uploadTestRouter from './api/upload-test.router'; // Router untuk testing upload tanpa auth
import filesRouter from './api/files.router'; // Router untuk file management
import debugRouter from './api/debug.router'; // Router untuk debugging
import ruanganRouter from './api/ruangan.router';
import sidangRouter from './api/sidang.router';
import authRouter from './api/auth.router';
import { errorHandler } from './middlewares/error.middleware';
import { getUploadPath, getMonorepoRoot } from './utils/upload.config';

const app: express.Express = express();

// Global Middlewares
app.use(express.json());

// Explicit CORS configuration
const corsOptions = {
  origin: 'http://localhost:3001', // Allow frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // Allow cookies to be sent
};

app.use(cors(corsOptions));

// Pastikan directory uploads exists di monorepo root
const uploadsPath = getUploadPath();

// Serve static files from uploads directory (from monorepo root)
app.use('/uploads', express.static(uploadsPath));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uploadsPath: uploadsPath,
    monorepoRoot: getMonorepoRoot(),
  });
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/debug', debugRouter); // Debug routes
app.use('/api/upload-test', uploadTestRouter); // Upload test routes (no auth)
app.use('/api/links', linksRouter);
app.use('/api/contoh-prisma', contohPrismaRouter);
app.use('/api/bimbingan', bimbinganRouter);
app.use('/api/jadwal-sidang', jadwalSidangRouter);
app.use('/api/laporan', laporanRouter);
app.use('/api/logs', logRouter);
app.use('/api/pendaftaran-sidang', pendaftaranSidangRouter);
app.use('/api/pengumuman', pengumumanRouter);
app.use('/api/pengajuan', pengajuanRouter); // Use the new router
app.use('/api/penilaian', penilaianRouter);
app.use('/api/penugasan', penugasanRouter);
app.use('/api/profile', profileRouter);
app.use('/api/tawaran-topik', tawaranTopikRouter);
app.use('/api/tugas-akhir', tugasAkhirRouter);
app.use('/api/users', usersRouter);
app.use('/api/test-upload', testUploadRouter); // Rute untuk testing upload lokal
app.use('/api/files', filesRouter); // Rute untuk file management
app.use('/api/ruangan', ruanganRouter);
app.use('/api/sidang', sidangRouter);

// Error Handling Middleware
app.use(errorHandler);

export default app;
