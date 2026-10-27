import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import {
  handleRegister,
  handleLogin,
  handleLogout,
  handleMe,
} from './server/authRoutes';
import { assertSessionConfiguration, requireAuth, type AuthRequest } from './server/authMiddleware';
import {
  handleOrgSummary,
  handleListDepartments,
  handleCreateDepartment,
  handleUpdateDepartment,
  handleDeleteDepartment,
  handleListEmployees,
  handleGetEmployee,
  handleCreateEmployee,
  handleUpdateEmployee,
  handleDeleteEmployee,
  handleGetCompanyProfile,
  handleUpdateCompanyProfile,
} from './server/orgRoutes';
import {
  handleAnalyzeResults,
  handleGenerateScenario,
  handleGenerateTraining,
} from './server/aiRoutes';
import {
  handleCompleteTrainingInvitation,
  handleGetTrainingInvitation,
  handleSendTrainingInvite,
} from './server/emailRoutes';
import { handleGophishCampaigns } from './server/gophishRoutes';
import { handleCreateCampaignDraft, handleListCampaigns } from './server/campaignRoutes';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable('x-powered-by');
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});
app.use(express.json({ limit: '256kb' }));
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.body === undefined || req.body === null) req.body = {};
  if (typeof req.body !== 'object' || Array.isArray(req.body)) {
    res.status(400).json({ success: false, error: 'Le corps JSON doit être un objet' });
    return;
  }
  next();
});
app.use(cookieParser());

function createRateLimiter(limit: number, windowMs: number, keyPrefix: string) {
  const entries = new Map<string, { count: number; resetAt: number }>();
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const identity = (req as AuthRequest).admin?.id || req.ip || 'unknown';
    const key = `${keyPrefix}:${identity}`;
    const current = entries.get(key);
    if (!current || current.resetAt <= now) {
      entries.set(key, { count: 1, resetAt: now + windowMs });
    } else if (current.count >= limit) {
      res.setHeader('Retry-After', String(Math.ceil((current.resetAt - now) / 1000)));
      res.status(429).json({ success: false, error: 'Trop de requêtes. Réessayez plus tard.' });
      return;
    } else {
      current.count += 1;
    }

    if (entries.size > 5_000) {
      for (const [entryKey, entry] of entries) {
        if (entry.resetAt <= now) entries.delete(entryKey);
      }
    }
    next();
  };
}

app.post('/api/auth/register', createRateLimiter(5, 60 * 60 * 1000, 'register'), handleRegister);
app.post('/api/auth/login', createRateLimiter(10, 15 * 60 * 1000, 'login'), handleLogin);
app.post('/api/auth/logout', handleLogout);
app.get('/api/auth/me', requireAuth, handleMe);

app.get('/api/health', (_req: Request, res: Response) => {
  const providers = [
    ...(process.env.GEMINI_API_KEY ? ['gemini'] : []),
    ...(process.env.RODIUM_API_KEY ? ['rodium'] : []),
  ];
  res.json({
    status: 'ok',
    service: 'VIGILO',
    databaseConfigured: Boolean(
      process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ),
    aiProvidersConfigured: providers,
    smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    liveSimulationDelivery: 'disabled',
  });
});

app.get('/api/public/training-invitations/:token', handleGetTrainingInvitation);
app.post('/api/public/training-invitations/:token/complete', handleCompleteTrainingInvitation);

app.use('/api', (req, res, next) => {
  if (req.path === '/health') return next();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.get('origin');
    let originHost: string | null = null;
    try {
      originHost = origin ? new URL(origin).host : null;
    } catch {
      originHost = null;
    }
    if (!originHost || originHost !== req.get('host')) {
      res.status(403).json({ success: false, error: 'Origine de requête invalide' });
      return;
    }
  }
  return requireAuth(req as AuthRequest, res, next);
});

app.get('/api/org/summary', handleOrgSummary);
app.get('/api/org/profile', handleGetCompanyProfile);
app.patch('/api/org/profile', handleUpdateCompanyProfile);
app.get('/api/org/departments', handleListDepartments);
app.post('/api/org/departments', handleCreateDepartment);
app.patch('/api/org/departments/:id', handleUpdateDepartment);
app.delete('/api/org/departments/:id', handleDeleteDepartment);
app.get('/api/org/employees', handleListEmployees);
app.get('/api/org/employees/:id', handleGetEmployee);
app.post('/api/org/employees', handleCreateEmployee);
app.patch('/api/org/employees/:id', handleUpdateEmployee);
app.delete('/api/org/employees/:id', handleDeleteEmployee);

const aiRateLimit = createRateLimiter(20, 5 * 60 * 1000, 'ai');
app.get('/api/campaigns', handleListCampaigns);
app.post('/api/campaigns', createRateLimiter(20, 60 * 60 * 1000, 'campaign-draft'), handleCreateCampaignDraft);
app.post('/api/vigilo-ai/generate-scenario', aiRateLimit, handleGenerateScenario);
app.post('/api/rodium-ai/generate-scenario', aiRateLimit, handleGenerateScenario);
app.post('/api/vigilo-ai/analyze-results', aiRateLimit, handleAnalyzeResults);
app.post('/api/rodium-ai/analyze-results', aiRateLimit, handleAnalyzeResults);
app.post('/api/vigilo-ai/generate-training', aiRateLimit, handleGenerateTraining);
app.post('/api/rodium-ai/generate-training', aiRateLimit, handleGenerateTraining);

app.post('/api/send-training-invite', createRateLimiter(10, 60 * 60 * 1000, 'training-invite'), handleSendTrainingInvite);
app.get('/api/integrations/gophish/campaigns', handleGophishCampaigns);
app.post('/api/send-live-test', (_req: Request, res: Response) => {
  res.status(410).json({
    success: false,
    error: 'L’envoi réel de simulations trompeuses est désactivé. Utilisez le simulateur pédagogique intégré.',
  });
});

app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Route API introuvable' });
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[HTTP] Requête échouée:', error);
  if (res.headersSent) return;
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number(error.status)
      : 500;
  res.status(status >= 400 && status < 500 ? status : 500).json({
    success: false,
    error: status === 413
      ? 'Requête trop volumineuse'
      : status >= 400 && status < 500
        ? 'Requête invalide'
        : 'Erreur serveur',
  });
});

async function startServer() {
  assertSessionConfiguration();
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VIGILO listening on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((error: unknown) => {
    console.error('[Startup] Impossible de démarrer VIGILO:', error);
    process.exitCode = 1;
  });
}

export default app;
