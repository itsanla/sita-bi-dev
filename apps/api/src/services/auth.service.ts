import type { Dosen, Mahasiswa, Role, User } from '@repo/db';
import type { LoginDto, RegisterDto } from '../dto/auth.dto';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { HttpError } from '../middlewares/error.middleware';
import { EmailService } from './email.service';
import prisma from '../config/database';

export class AuthService {
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async login(dto: LoginDto): Promise<{
    userId: number;
    user: Omit<
      User & {
        roles: Role[];
        mahasiswa: Mahasiswa | null;
        dosen: Dosen | null;
      },
      'password'
    >;
  }> {
    const { identifier, password } = dto;

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { mahasiswa: { nim: identifier } },
          { dosen: { nidn: identifier } },
        ],
      },
      include: {
        roles: true,
        mahasiswa: true,
        dosen: true,
      },
    });

    const isDosen = user?.roles.some(
      (role: { name: string }) => role.name === 'dosen',
    );

    if (user == null) {
      throw new HttpError(401, 'Email atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Email atau password salah.');
    }

    // Bypass email verification for dosen
    if (isDosen !== true && user.email_verified_at === null) {
      throw new HttpError(401, 'Email belum diverifikasi.');
    }

    const { password: _, ...userWithoutPassword } = user;

    // Return userId instead of JWT token
    return { userId: user.id, user: userWithoutPassword };
  }

  async register(dto: RegisterDto): Promise<void> {
    const { name, email, password, phone_number, nim, prodi, kelas } = dto;

    // Helper function to format phone number
    const formatPhoneNumber = (phone: string): string => {
      if (phone.startsWith('08')) {
        return `+628${phone.substring(2)}`;
      }
      // Return as is if it doesn't start with 08 (e.g., already formatted)
      return phone;
    };

    const formattedPhoneNumber = formatPhoneNumber(phone_number);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { mahasiswa: { nim } },
          { phone_number: formattedPhoneNumber },
        ],
      },
    });

    if (existingUser !== null) {
      throw new HttpError(
        409,
        'User dengan email, NIM, atau nomor HP tersebut sudah ada.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 4);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone_number: formattedPhoneNumber,
        roles: {
          connect: { name: 'mahasiswa' },
        },
        mahasiswa: {
          create: {
            nim,
            prodi,
            kelas,
          },
        },
      },
    });

    // Buat dan kirim token verifikasi email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerificationToken.upsert({
      where: { email: user.email },
      update: { token: verificationToken, created_at: new Date() },
      create: { email: user.email, token: verificationToken },
    });

    await this.emailService.sendVerificationEmail(
      user.email,
      verificationToken,
    );
  }

  async verifyEmail(dto: { token: string }): Promise<void> {
    const { token } = dto;

    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (verificationToken === null) {
      throw new HttpError(
        404,
        'Token verifikasi tidak valid atau sudah digunakan.',
      );
    }

    // Cek apakah token sudah kedaluwarsa (misal: 1 jam)
    const oneHour = 60 * 60 * 1000;
    if (
      new Date().getTime() - verificationToken.created_at.getTime() >
      oneHour
    ) {
      // Hapus token yang sudah expired
      await prisma.emailVerificationToken.delete({ where: { token } });
      throw new HttpError(410, 'Token verifikasi sudah kedaluwarsa.');
    }

    // Gunakan transaksi untuk memastikan konsistensi data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.$transaction(async (tx: any) => {
      // 1. Update status verifikasi user
      await tx.user.update({
        where: { email: verificationToken.email },
        data: { email_verified_at: new Date() },
      });

      // 2. Hapus token yang sudah digunakan
      await tx.emailVerificationToken.delete({
        where: { token },
      });
    });
  }
}
