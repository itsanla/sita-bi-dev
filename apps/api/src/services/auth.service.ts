import { PrismaClient, Role } from '@repo/db';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { HttpError } from '../middlewares/error.middleware';
import { EmailService } from './email.service';

export class AuthService {
  private prisma: PrismaClient;
  private emailService: EmailService;

  constructor() {
    this.prisma = new PrismaClient();
    this.emailService = new EmailService();
  }

  async login(dto: LoginDto): Promise<{ token: string }> {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { roles: true },
    });

    const isDosen = user?.roles.some(role => role.name === 'dosen');

    if (!user) {
      throw new HttpError(401, 'Email atau password salah.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, 'Email atau password salah.');
    }

    // Bypass verifikasi email untuk dosen
    if (!isDosen && !user.email_verified_at) {
      throw new HttpError(401, 'Email belum diverifikasi.');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.warn('PERINGATAN: JWT_SECRET tidak diatur di environment. Menggunakan secret default yang tidak aman.');
    }

    const token = jwt.sign(
      {
        sub: user.id.toString(),
        name: user.name,
        email: user.email,
        roles: user.roles.map(role => role.name),
      },
      jwtSecret || 'supersecretjwtkey',
      { expiresIn: '7d' }
    );

    return { token };
  }

  async register(dto: RegisterDto): Promise<void> {
    const { name, email, password, nim, prodi, angkatan, kelas } = dto;

    const existingUser = await this.prisma.user.findFirst({
      where: { OR: [{ email }, { mahasiswa: { nim } }] },
    });

    if (existingUser) {
      throw new HttpError(409, 'User dengan email atau NIM tersebut sudah ada.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roles: {
          connect: { name: 'mahasiswa' },
        },
        mahasiswa: {
          create: {
            nim,
            prodi,
            angkatan,
            kelas,
          },
        },
      },
    });

    // Buat dan kirim token verifikasi email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await this.prisma.emailVerificationToken.upsert({
      where: { email: user.email },
      update: { token: verificationToken, created_at: new Date() },
      create: { email: user.email, token: verificationToken },
    });

    await this.emailService.sendVerificationEmail(user.email, verificationToken);
  }

  async verifyEmail(dto: { token: string }): Promise<void> {
    const { token } = dto;

    const verificationToken = await this.prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new HttpError(404, 'Token verifikasi tidak valid atau sudah digunakan.');
    }

    // Cek apakah token sudah kedaluwarsa (misal: 1 jam)
    const oneHour = 60 * 60 * 1000;
    if (new Date().getTime() - verificationToken.created_at.getTime() > oneHour) {
      // Hapus token yang sudah expired
      await this.prisma.emailVerificationToken.delete({ where: { token } });
      throw new HttpError(410, 'Token verifikasi sudah kedaluwarsa.');
    }

    // Gunakan transaksi untuk memastikan konsistensi data
    await this.prisma.$transaction(async (tx) => {
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
