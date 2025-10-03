import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient } from '@repo/db';
import { Role } from '@repo/types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET ?? 'supersecretjwtkey';

// Interface untuk JWT payload yang kita expect
interface CustomJwtPayload extends JwtPayload {
  sub: string;
}

function isJsonWebTokenError(error: unknown): error is jwt.JsonWebTokenError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as Error).name === 'JsonWebTokenError'
  );
}

// Type guard untuk memastikan decoded token memiliki struktur yang benar
function isValidJwtPayload(decoded: unknown): decoded is CustomJwtPayload {
  return (
    typeof decoded === 'object' &&
    decoded !== null &&
    'sub' in decoded &&
    typeof (decoded as { sub: unknown }).sub === 'string'
  );
}

export const jwtAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ') !== true) {
      res.status(401).json({ message: 'Unauthorized: No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    // Pastikan token ada setelah split
    if (token === undefined || token === null || token === '') {
      res.status(401).json({ message: 'Unauthorized: Invalid token format' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // Gunakan type guard untuk memvalidasi payload
    if (!isValidJwtPayload(decoded)) {
      res.status(401).json({ message: 'Unauthorized: Invalid token payload' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.sub) },
      include: {
        dosen: true,
        mahasiswa: true,
        roles: true,
      },
    });

    // Pastikan user dan roles ada sebelum mengakses
    if (user === null) {
      res.status(401).json({ message: 'Unauthorized: User not found' });
      return;
    }

    if (user.roles === null || user.roles.length === 0) {
      res.status(401).json({ message: 'Unauthorized: User has no roles' });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.roles[0]!.name as Role, // Non-null assertion karena sudah dicek di atas
      dosen:
        user.dosen !== null
          ? { id: user.dosen.id, nidn: user.dosen.nidn }
          : undefined,
      mahasiswa:
        user.mahasiswa !== null
          ? { id: user.mahasiswa.id, nim: user.mahasiswa.nim }
          : undefined,
    };

    next();
  } catch (error: unknown) {
    if (isJsonWebTokenError(error)) {
      res.status(401).json({ message: 'Unauthorized: Invalid token' });
      return;
    }
    // console.error('Auth Middleware Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
