// import { prisma } from '@repo/db'; // Removed because prisma named export doesn't exist
// import { getRelativePath } from '../utils/upload.config'; // Removed unused import
// import type { File, User } from '@prisma/client'; // REMOVE THIS: File is not a model in schema.prisma

interface FileUploadData {
  originalName: string;
  filename: string;
  path: string;
  mimeType: string;
  size: number;
  uploadedBy?: number;
}

/* eslint-disable @typescript-eslint/no-unused-vars */

// Dummy types to fix build
type File = {
  id: number;
  original_name: string;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  uploaded_by: number | null;
  created_at: Date;
  updated_at: Date;
};

type User = {
  id: number;
  name: string;
  email: string;
};

type FileWithUploader = File & {
  uploader: Pick<User, 'email' | 'name'> | null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const create = async (data: FileUploadData): Promise<File> => {
  // const relativePath = getRelativePath(data.path);
  // return await prisma.file.create({ ... });
  throw new Error('File model is missing in schema. Service unavailable.');
};

export const list = async (): Promise<FileWithUploader[]> => {
  // return await prisma.file.findMany({ ... });
  return [];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getById = async (id: number): Promise<FileWithUploader | null> => {
  // return await prisma.file.findUnique({ ... });
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const deleteFile = async (id: number): Promise<File> => {
  // const file = await prisma.file.findUnique({ where: { id } });
  // if (file === null) throw new Error('File not found');
  // await prisma.file.delete({ where: { id } });
  // return file;
  throw new Error('File model is missing in schema. Service unavailable.');
};
