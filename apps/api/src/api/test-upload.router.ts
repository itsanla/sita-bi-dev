import { Router, type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import * as path from 'path';
import { uploadConfig, getUploadPath, generateFileName, getFileUrl, getRelativePath } from '../utils/upload.config';

const router: Router = Router();

// Define a type for the local file object
interface LocalFile extends Express.Multer.File {
  path: string;
}

// --- Konfigurasi Local Storage ---
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = getUploadPath('test-uploads');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = generateFileName(file.originalname, 'test-upload');
    cb(null, fileName);
  },
});

const testUpload = multer({
  storage: localStorage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: function (req, file, cb) {
    // Filter file types
    const allowedTypes = new RegExp(uploadConfig.allowedFileTypes.join('|'), 'i');
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase().slice(1));
    const mimetype = allowedTypes.test(file.mimetype.split('/')[1] ?? '');

    if (mimetype && extname) {
      cb(null, true); return;
    } else {
      const allowedTypesStr = uploadConfig.allowedFileTypes.join(', ');
      cb(new Error(`File type not allowed. Only ${allowedTypesStr} files are allowed.`));
    }
  },
});
// --- End of Konfigurasi Local Storage ---

router.post(
  '/',
  testUpload.single('file'),
  asyncHandler((req: Request, res: Response): Promise<void> => {
    if (req.file == null) {
      res
        .status(400)
        .json({ status: 'gagal', message: 'Tidak ada file yang diunggah.' });
      return;
    }

    const uploadedFile = req.file as LocalFile;
    const relativePath = getRelativePath(uploadedFile.path);
    const fileUrl = getFileUrl(relativePath);

    res.status(200).json({
      status: 'sukses',
      message: 'File berhasil diunggah!',
      data: {
        fileUrl: fileUrl,
        downloadUrl: `/api/files/download${relativePath}`,
        infoUrl: `/api/files/info${relativePath}`,
        filePath: uploadedFile.path,
        relativePath: relativePath,
        filename: uploadedFile.filename,
        originalName: uploadedFile.originalname,
        size: uploadedFile.size,
        mimetype: uploadedFile.mimetype,
      },
    });
  }),
);

export default router;
