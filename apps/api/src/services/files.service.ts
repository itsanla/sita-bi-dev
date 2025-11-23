import { prisma } from '@repo/db';
import { getRelativePath } from '../utils/upload.config';
import type { File, User } from '@prisma/client';

interface FileUploadData {
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedBy?: number;
}

type FileWithUploader = File & {
  uploader: Pick<User, 'email' | 'name'> | null;
};

export const create = async (data: FileUploadData): Promise<File> => {
  const relativePath = getRelativePath(data.path);
  return await prisma.file.create({
    data: {
      original_name: data.originalName,
      filename: data.filename,
      path: relativePath,
      mime_type: data.mimeType,
      size: data.size,
      uploaded_by: data.uploadedBy,
    },
  });
};

export const list = async (): Promise<FileWithUploader[]> => {
  return await prisma.file.findMany({
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
};

export const getById = async (id: number): Promise<FileWithUploader | null> => {
  return await prisma.file.findUnique({
    where: { id },
    include: {
      uploader: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

export const deleteFile = async (id: number): Promise<File> => {
  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (file === null) {
    throw new Error('File not found');
  }

  // Delete from database
  await prisma.file.delete({
    where: { id },
  });

  return file;
};
