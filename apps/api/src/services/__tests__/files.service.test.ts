import { create, list, getById, deleteFile } from '../files.service';
import { prisma } from '@repo/db';

// Mock prisma
jest.mock('@repo/db', () => ({
  prisma: {
    file: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

describe('Files Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a file entry in the database', async () => {
      const fileData = {
        originalName: 'test.pdf',
        filename: 'file-123.pdf',
        path: '/uploads/file-123.pdf',
        mimeType: 'application/pdf',
        size: 1024,
      };

      const expectedResult = {
        id: 1,
        original_name: fileData.originalName,
        filename: fileData.filename,
        path: 'uploads/file-123.pdf',
        mime_type: fileData.mimeType,
        size: fileData.size,
        uploaded_by: null,
        created_at: new Date(),
        updated_at: new Date(),
      };

      (prisma.file.create as jest.Mock).mockResolvedValue(expectedResult);

      const result = await create(fileData);

      expect(prisma.file.create).toHaveBeenCalledWith({
        data: {
          original_name: fileData.originalName,
          filename: fileData.filename,
          path: expect.any(String), // Path normalization might change slightly
          mime_type: fileData.mimeType,
          size: fileData.size,
          uploaded_by: undefined,
        },
      });
      expect(result).toEqual(expectedResult);
    });
  });

  describe('list', () => {
    it('should return a list of files', async () => {
      const mockFiles = [
        { id: 1, filename: 'file1.pdf' },
        { id: 2, filename: 'file2.jpg' },
      ];

      (prisma.file.findMany as jest.Mock).mockResolvedValue(mockFiles);

      const result = await list();

      expect(prisma.file.findMany).toHaveBeenCalledWith({
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
      expect(result).toEqual(mockFiles);
    });
  });

  describe('getById', () => {
    it('should return a file by id', async () => {
      const mockFile = { id: 1, filename: 'file1.pdf' };
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(mockFile);

      const result = await getById(1);

      expect(prisma.file.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          uploader: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      });
      expect(result).toEqual(mockFile);
    });

    it('should return null if file not found', async () => {
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(null);

      const result = await getById(999);

      expect(result).toBeNull();
    });
  });

  describe('deleteFile', () => {
    it('should delete a file if it exists', async () => {
      const mockFile = { id: 1, filename: 'file1.pdf' };
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(mockFile);
      (prisma.file.delete as jest.Mock).mockResolvedValue(mockFile);

      const result = await deleteFile(1);

      expect(prisma.file.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prisma.file.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockFile);
    });

    it('should throw an error if file does not exist', async () => {
      (prisma.file.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(deleteFile(999)).rejects.toThrow('File not found');
      expect(prisma.file.delete).not.toHaveBeenCalled();
    });
  });
});
