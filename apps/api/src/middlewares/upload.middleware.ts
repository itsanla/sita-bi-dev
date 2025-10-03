import multer from 'multer';
import * as path from 'path';
import type { RequestHandler } from 'express';
import { uploadConfig, getUploadPath, generateFileName } from '../utils/upload.config';

// Konfigurasi Local Storage
const localStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      // Buat subdirectory berdasarkan jenis file
      const subDir = getUploadPath('sidang-files');
      cb(null, subDir);
    } catch (error) {
      cb(error as Error, '');
    }
  },
  filename: function (req, file, cb) {
    try {
      const fileName = generateFileName(file.originalname, file.fieldname);
      cb(null, fileName);
    } catch (error) {
      cb(error as Error, '');
    }
  },
});

const uploadLocal = multer({
  storage: localStorage,
  limits: { fileSize: uploadConfig.maxFileSize },
  fileFilter: function (req, file, cb) {
    
    // Filter file types
    const allowedTypes = new RegExp(uploadConfig.allowedFileTypes.join('|'), 'i');
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase().slice(1));
    const mimetype = allowedTypes.test(file.mimetype.split('/')[1] ?? '');

    if (mimetype !== false && extname !== false) {
      cb(null, true); return;
    } else {
      const allowedTypesStr = uploadConfig.allowedFileTypes.join(', ');
      const error = new Error(`File type not allowed. Only ${allowedTypesStr} files are allowed.`);
      cb(error);
    }
  },
});

export const uploadSidangFiles: RequestHandler = (req, res, next) => {
  
  const multerMiddleware = uploadLocal.fields([
    { name: 'file_ta', maxCount: 1 },
    { name: 'file_toeic', maxCount: 1 },
    { name: 'file_rapor', maxCount: 1 },
    { name: 'file_ijazah', maxCount: 1 },
    { name: 'file_bebas_jurusan', maxCount: 1 },
  ]);

  multerMiddleware(req, res, (err: unknown) => {
    if (err) {
      next(err); return;
    }
    
    next();
  });
};
