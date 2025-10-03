import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import path from 'path';
import { RequestHandler } from 'express';

// Konfigurasi S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const uploadS3 = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname),
      );
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit
});

export const uploadSidangFiles: RequestHandler = uploadS3.fields([
  { name: 'file_ta', maxCount: 1 },
  { name: 'file_toeic', maxCount: 1 },
  { name: 'file_rapor', maxCount: 1 },
  { name: 'file_ijazah', maxCount: 1 },
  { name: 'file_bebas_jurusan', maxCount: 1 },
]);
