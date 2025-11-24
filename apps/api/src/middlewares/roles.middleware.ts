import type { Request, Response, NextFunction } from 'express';
// import type { Role } from '@repo/types'; // Fix rootDir error

// Define Role locally
export enum Role {
  mahasiswa = 'mahasiswa',
  dosen = 'dosen',
  admin = 'admin',
  kajur = 'kajur',
  kaprodi_d3 = 'kaprodi_d3',
  kaprodi_d4 = 'kaprodi_d4',
}

export const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!allowedRoles.includes(req.user.role as any)) {
      res
        .status(403)
        .json({ message: 'Forbidden: Insufficient role permissions' });
      return;
    }

    next();
  };
};
