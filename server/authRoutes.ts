import type { Response } from 'express';
import type { AuthRequest } from './authMiddleware';
import {
  registerAdmin,
  verifyLogin,
  type CompanySize,
  type VigiloService,
} from './authStore';
import {
  signSession,
  setSessionCookie,
  clearSessionCookie,
} from './authMiddleware';

export async function handleRegister(req: AuthRequest, res: Response) {
  try {
    const { email, password, companyName, companySize, services } = req.body as {
      email?: string;
      password?: string;
      companyName?: string;
      companySize?: CompanySize;
      services?: VigiloService[];
    };
    const admin = await registerAdmin({
      email: email || '',
      password: password || '',
      companyName: companyName || '',
      companySize: companySize || '1-10',
      services: services || [],
    });
    const token = signSession(admin);
    setSessionCookie(res, token);
    return res.status(201).json({ success: true, data: admin });
  } catch (e: any) {
    return res.status(e.status || 500).json({ success: false, error: e.message });
  }
}

export async function handleLogin(req: AuthRequest, res: Response) {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email et mot de passe requis' });
    }
    const admin = await verifyLogin(email, password);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' });
    }
    const token = signSession(admin);
    setSessionCookie(res, token);
    return res.json({ success: true, data: admin });
  } catch (e: any) {
    return res.status(500).json({ success: false, error: e.message });
  }
}

export function handleLogout(_req: AuthRequest, res: Response) {
  clearSessionCookie(res);
  return res.json({ success: true });
}

export function handleMe(req: AuthRequest, res: Response) {
  return res.json({ success: true, data: req.admin });
}
