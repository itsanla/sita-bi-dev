import { PrismaClient, Prodi } from '@repo/db';
import { parse } from 'csv-parse/sync';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { EmailService } from './email.service';

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: { row: number; error: string }[];
}

export class ImportService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
  }

  async validateMahasiswaCsv(fileBuffer: Buffer): Promise<{ valid: number; invalid: number; errors: any[] }> {
    const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    const errors: any[] = [];
    let valid = 0;
    let invalid = 0;

    for (const [index, record] of records.entries()) {
      const rowNum = index + 1; // 1-based index (ignoring header)
      const errorList = [];

      if (!record.nim) errorList.push('NIM is required');
      if (!record.nama) errorList.push('Nama is required');
      if (!record.email) errorList.push('Email is required');
      if (!record.prodi || !['D3', 'D4'].includes(record.prodi.toUpperCase())) errorList.push('Prodi must be D3 or D4');

      // Check uniqueness (expensive, but necessary for validation)
      if (record.email) {
        const existingUser = await this.prisma.user.findUnique({ where: { email: record.email } });
        if (existingUser) errorList.push(`Email ${record.email} already exists`);
      }
      if (record.nim) {
        const existingMhs = await this.prisma.mahasiswa.findUnique({ where: { nim: record.nim } });
        if (existingMhs) errorList.push(`NIM ${record.nim} already exists`);
      }

      if (errorList.length > 0) {
        invalid++;
        errors.push({ row: rowNum, data: record, messages: errorList });
      } else {
        valid++;
      }
    }

    return { valid, invalid, errors };
  }

  async validateDosenCsv(fileBuffer: Buffer): Promise<{ valid: number; invalid: number; errors: any[] }> {
    const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    const errors: any[] = [];
    let valid = 0;
    let invalid = 0;

    for (const [index, record] of records.entries()) {
        const rowNum = index + 1;
        const errorList = [];

        if (!record.nidn) errorList.push('NIDN is required');
        if (!record.nama) errorList.push('Nama is required');
        if (!record.email) errorList.push('Email is required');

        if (record.email) {
            const existingUser = await this.prisma.user.findUnique({ where: { email: record.email } });
            if (existingUser) errorList.push(`Email ${record.email} already exists`);
        }
        if (record.nidn) {
            const existingDosen = await this.prisma.dosen.findUnique({ where: { nidn: record.nidn } });
            if (existingDosen) errorList.push(`NIDN ${record.nidn} already exists`);
        }

        if (errorList.length > 0) {
            invalid++;
            errors.push({ row: rowNum, data: record, messages: errorList });
        } else {
            valid++;
        }
    }

    return { valid, invalid, errors };
  }

  async executeImportMahasiswa(fileBuffer: Buffer): Promise<ImportResult> {
    const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    let success = 0;
    let failed = 0;
    const errors: { row: number; error: string }[] = [];

    // Assuming validation passed or user ignores remaining errors.
    // We try to insert all valid ones.

    // Fetch role ID for mahasiswa
    const roleMhs = await this.prisma.role.findUnique({ where: { name: 'mahasiswa' } });
    if (!roleMhs) throw new Error('Role mahasiswa not found');

    for (const [index, record] of records.entries()) {
        const rowNum = index + 1;
        try {
            await this.prisma.$transaction(async (tx) => {
                // Double check uniqueness inside transaction to be safe or catch error
                const password = crypto.randomBytes(8).toString('hex');
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = await tx.user.create({
                    data: {
                        name: record.nama,
                        email: record.email,
                        password: hashedPassword,
                        phone_number: `TEMP-${Date.now()}-${Math.random()}`, // Needs valid phone or temp
                        roles: {
                            connect: { id: roleMhs.id }
                        }
                    }
                });

                await tx.mahasiswa.create({
                    data: {
                        user_id: user.id,
                        nim: record.nim,
                        prodi: record.prodi.toUpperCase() as Prodi,
                        kelas: record.kelas || 'A', // Default or from CSV
                    }
                });

                // Send email
                await this.emailService.sendEmail(
                    record.email,
                    'Akun SITA BI',
                    `Selamat Datang. Password anda adalah: ${password}`
                );
            });
            success++;
        } catch (e: any) {
            failed++;
            errors.push({ row: rowNum, error: e.message });
        }
    }

    return { total: records.length, success, failed, errors };
  }

  async executeImportDosen(fileBuffer: Buffer): Promise<ImportResult> {
    const records = parse(fileBuffer, { columns: true, skip_empty_lines: true });
    let success = 0;
    let failed = 0;
    const errors: { row: number; error: string }[] = [];

    const roleDosen = await this.prisma.role.findUnique({ where: { name: 'dosen' } });
    if (!roleDosen) throw new Error('Role dosen not found');

    for (const [index, record] of records.entries()) {
        const rowNum = index + 1;
        try {
            await this.prisma.$transaction(async (tx) => {
                const password = crypto.randomBytes(8).toString('hex');
                const hashedPassword = await bcrypt.hash(password, 10);

                const user = await tx.user.create({
                    data: {
                        name: record.nama,
                        email: record.email,
                        password: hashedPassword,
                        phone_number: `TEMP-${Date.now()}-${Math.random()}`,
                        roles: {
                            connect: { id: roleDosen.id }
                        }
                    }
                });

                await tx.dosen.create({
                    data: {
                        user_id: user.id,
                        nidn: record.nidn,
                        prodi: record.prodi ? (record.prodi.toUpperCase() as Prodi) : null,
                    }
                });

                await this.emailService.sendEmail(
                    record.email,
                    'Akun SITA BI - Dosen',
                    `Selamat Datang. Password anda adalah: ${password}`
                );
            });
            success++;
        } catch (e: any) {
            failed++;
            errors.push({ row: rowNum, error: e.message });
        }
    }

    return { total: records.length, success, failed, errors };
  }
}
