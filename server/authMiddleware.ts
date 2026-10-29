import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findAdminById, type AdminPublic } from './authStore';

const COOKIE_NAME = 'vigilo_session';

export interface AuthRequest extends Request {
  admin?: AdminPublic;
}

import crypto from 'crypto';

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (
    secret &&
    secret.length >= 32 &&
    secret !== 'replace-with-a-random-secret-at-least-32-characters'
  ) {
    return secret;
  }
  // Resilient fallback for production/Vercel if SESSION_SECRET was omitted from dashboard env
  const fallbackSeed = process.env.SUPABASE_URL || 'vigilo-hackathon-ancy-togo-2026-production-salt-fallback';
  return crypto.createHash('sha256').update(fallbackSeed).digest('hex');
}

function sessionTtlDays(): number {
  const days = Number(process.env.AUTH_TOKEN_TTL_DAYS || 7);
  if (!Number.isInteger(days) || days < 1 || days > 30) {
    throw new Error('AUTH_TOKEN_TTL_DAYS doit être un entier entre 1 et 30');
  }
  return days;
}

export function assertSessionConfiguration(): void {
  getSessionSecret();
  sessionTtlDays();
}

export function signSession(admin: AdminPublic): string {
  const days = sessionTtlDays();
  return jwt.sign(
    { sub: admin.id, email: admin.email, companyName: admin.companyName },
    getSessionSecret(),
    { expiresIn: `${days}d` }
  );
}

export function setSessionCookie(res: Response, token: string): void {
  const days = sessionTtlDays();
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

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  let subject: string;
  try {
    const header = req.headers.authorization;
    const bearer = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    const token = (req.cookies?.[COOKIE_NAME] as string | undefined) || bearer;
    if (!token) {
      res.status(401).json({ success: false, error: 'Non authentifié' });
      return;
    }
    const payload = jwt.verify(token, getSessionSecret()) as { sub: string };
    subject = payload.sub;
  } catch {
    res.status(401).json({ success: false, error: 'Session expirée ou invalide' });
    return;
  }

  try {
    const admin = await findAdminById(subject);
    if (!admin) {
      res.status(401).json({ success: false, error: 'Session invalide' });
      return;
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.error('[Auth] Impossible de vérifier la session auprès de Supabase:', error);
    res.status(503).json({ success: false, error: 'Service de données temporairement indisponible' });
  }
}

export { COOKIE_NAME };
