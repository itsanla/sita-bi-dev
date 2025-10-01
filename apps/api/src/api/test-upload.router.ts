import { Router, type Request, type Response } from 'express';
import asyncHandler from 'express-async-handler';
import multer from 'multer';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multerS3 from 'multer-s3';
import path from 'path';

const router: Router = Router();

// Define a type for the S3 file object
interface S3File extends Express.Multer.File {
  bucket: string;
  key: string;
  location: string;
}

// --- Konfigurasi S3 ---
const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const testUpload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'test-upload-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB
});
// --- End of Konfigurasi S3 ---

router.post(
  '/',
  testUpload.single('file'),
  asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (req.file == null) {
      res.status(400).json({ status: 'gagal', message: 'Tidak ada file yang diunggah.' });
      return;
    }

    const uploadedFile = req.file as S3File;

    const getCommand = new GetObjectCommand({
      Bucket: uploadedFile.bucket,
      Key: uploadedFile.key,
    });

    // URL berlaku selama 15 menit (900 detik)
    const signedUrl = await getSignedUrl(s3, getCommand, { expiresIn: 900 });

    res.status(200).json({
      status: 'sukses',
      message: 'File berhasil diunggah! Gunakan signedUrl untuk mengakses.',
      data: {
        signedUrl: signedUrl,
        originalUrl: uploadedFile.location,
        ...uploadedFile,
      },
    });
  })
);

export default router;