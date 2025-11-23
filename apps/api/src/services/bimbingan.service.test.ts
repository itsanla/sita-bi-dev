
import { BimbinganService } from './bimbingan.service';

// Mock @repo/db
jest.mock('@repo/db', () => {
  const mPrisma = {
    bimbinganTA: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    jadwalSidang: {
      findMany: jest.fn(),
    },
    peranDosenTa: {
      findFirst: jest.fn(),
    },
    dosen: {
      findUnique: jest.fn(),
    },
    log: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mPrisma)),
  };
  return {
    PrismaClient: jest.fn(() => mPrisma),
    StatusTugasAkhir: {},
  };
});

// Import PrismaClient AFTER mocking
const { PrismaClient } = require('@repo/db');

describe('BimbinganService - Smart Scheduling', () => {
  let service: BimbinganService;
  let prisma: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BimbinganService();
    prisma = new PrismaClient();
  });

  describe('detectScheduleConflicts', () => {
    it('should return true if there is a conflict with another bimbingan', async () => {
      prisma.bimbinganTA.findMany.mockResolvedValue([
        { jam_bimbingan: '10:00' },
      ]);
      prisma.jadwalSidang.findMany.mockResolvedValue([]);

      const conflict = await service.detectScheduleConflicts(
        1,
        new Date(),
        '10:30'
      );
      expect(conflict).toBe(true);
    });

    it('should return false if there are no conflicts', async () => {
      prisma.bimbinganTA.findMany.mockResolvedValue([]);
      prisma.jadwalSidang.findMany.mockResolvedValue([]);

      const conflict = await service.detectScheduleConflicts(
        1,
        new Date(),
        '10:00'
      );
      expect(conflict).toBe(false);
    });
  });

  describe('suggestAvailableSlots', () => {
    it('should return available slots excluding busy times', async () => {
        // Mock busy at 08:00 - 09:00
      prisma.bimbinganTA.findMany.mockResolvedValue([
        { jam_bimbingan: '08:00' },
      ]);
      prisma.jadwalSidang.findMany.mockResolvedValue([]);

      const slots = await service.suggestAvailableSlots(1, '2023-01-01');

      // Should include 09:00 but not 08:00
      expect(slots).not.toContain('08:00');
      expect(slots).toContain('09:00');
    });
  });
});
