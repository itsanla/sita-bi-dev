import type { Request, Response, NextFunction } from 'express';
import type { Role } from '@repo/types';

export const authorizeRoles = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized: User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res
        .status(403)
        .json({ message: 'Forbidden: Insufficient role permissions' });
      return;
    }

    next();
  };
};
