import type { Request, Response } from 'express';
import { Router } from 'express';
import asyncHandler from 'express-async-handler';
import * as path from 'path';
import * as fs from 'fs';
import { getMonorepoRoot, getAbsolutePath } from '../utils/upload.config';

const router: Router = Router();

// Endpoint untuk download file berdasarkan path
router.get(
  '/download/*',
  asyncHandler((req: Request, res: Response): Promise<void> => {
    try {
      // Extract file path from URL
      const filePath = req.params[0]; // This captures everything after /download/
      const fullPath = getAbsolutePath(`uploads/${filePath}`);

      // Security check: pastikan file berada dalam uploads directory
      const monorepoRoot = getMonorepoRoot();
      const uploadsDir = path.join(monorepoRoot, 'uploads');
      const resolvedPath = path.resolve(fullPath);
      const resolvedUploadsDir = path.resolve(uploadsDir);

      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        res.status(403).json({
          status: 'gagal',
          message: 'Akses file tidak diizinkan',
        });
        return;
      }

      // Check if file exists
      if (!fs.existsSync(fullPath)) {
        res.status(404).json({
          status: 'gagal',
          message: 'File tidak ditemukan',
        });
        return;
      }

      // Get file stats
      const stats = fs.statSync(fullPath);
      if (!stats.isFile()) {
        res.status(400).json({
          status: 'gagal',
          message: 'Path bukan file',
        });
        return;
      }

      // Set appropriate headers
      const filename = path.basename(fullPath);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stats.size);

      // Stream file to response
      const fileStream = fs.createReadStream(fullPath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Download error:', error);
      res.status(500).json({
        status: 'gagal',
        message: 'Terjadi kesalahan saat mengunduh file',
      });
    }
  }),
);

// Endpoint untuk mendapatkan informasi file
router.get(
  '/info/*',
  asyncHandler((req: Request, res: Response): Promise<void> => {
    try {
      const filePath = req.params[0];
      const fullPath = getAbsolutePath(`uploads/${filePath}`);

      // Security check
      const monorepoRoot = getMonorepoRoot();
      const uploadsDir = path.join(monorepoRoot, 'uploads');
      const resolvedPath = path.resolve(fullPath);
      const resolvedUploadsDir = path.resolve(uploadsDir);

      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        res.status(403).json({
          status: 'gagal',
          message: 'Akses file tidak diizinkan',
        });
        return;
      }

      if (!fs.existsSync(fullPath)) {
        res.status(404).json({
          status: 'gagal',
          message: 'File tidak ditemukan',
        });
        return;
      }

      const stats = fs.statSync(fullPath);
      const filename = path.basename(fullPath);
      const extension = path.extname(fullPath);

      res.json({
        status: 'sukses',
        data: {
          filename,
          extension,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath,
          downloadUrl: `/api/files/download/${filePath}`,
          viewUrl: `/uploads/${filePath}`,
        },
      });
    } catch (error) {
      console.error('File info error:', error);
      res.status(500).json({
        status: 'gagal',
        message: 'Terjadi kesalahan saat mendapatkan informasi file',
      });
    }
  }),
);

export default router;