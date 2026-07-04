import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const role = req.headers['x-user-role'];
  if (role !== 'ADMIN') {
    res.status(403).json({ error: 'Forbidden: ADMIN role required' });
    return;
  }
  next();
};
