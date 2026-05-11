import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: '未登录' });
    return;
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, config.jwt_secret) as { sub: string };
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ success: false, error: '登录已过期' });
  }
}
