import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findAdminById, type AdminPublic } from './authStore';

const COOKIE_NAME = 'vigilo_session';

export interface AuthRequest extends Request {
  admin?: AdminPublic;
}

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('SESSION_SECRET manquant ou trop court (≥ 16) dans .env');
  }
  return secret;
}

export function signSession(admin: AdminPublic): string {
  const days = Number(process.env.AUTH_TOKEN_TTL_DAYS || 7);
  return jwt.sign(
    { sub: admin.id, email: admin.email, companyName: admin.companyName },
    getSessionSecret(),
    { expiresIn: `${days}d` }
  );
}

export function setSessionCookie(res: Response, token: string): void {
  const days = Number(process.env.AUTH_TOKEN_TTL_DAYS || 7);
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: days * 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = (req.cookies?.[COOKIE_NAME] as string | undefined) || bearer;
    if (!token) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }
    const payload = jwt.verify(token, getSessionSecret()) as { sub: string };
    const admin = findAdminById(payload.sub);
    if (!admin) {
      res.status(401).json({ success: false, error: 'Session invalide' });
      return;
    }
    req.admin = admin;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Session expirée ou invalide' });
  }
}

export { COOKIE_NAME };
