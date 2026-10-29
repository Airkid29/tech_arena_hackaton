import type { Response } from 'express';
import type { AuthRequest } from './authMiddleware';

interface GophishResult {
  status?: unknown;
}

interface GophishCampaign {
  id?: unknown;
  name?: unknown;
  status?: unknown;
  results?: unknown;
}

function isLocalHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

function readStatus(value: unknown): string {
  return typeof value === 'string' ? value.slice(0, 40) : 'inconnu';
}

export async function handleGophishCampaigns(req: AuthRequest, res: Response) {
  const configuredUrl = process.env.GOPHISH_URL;
  const apiKey = process.env.GOPHISH_API_KEY;
  const assignedAdminId = process.env.GOPHISH_ADMIN_ID;
  if (!configuredUrl || !apiKey || !assignedAdminId) {
    return res.json({
      success: true,
      data: { configured: false, campaigns: [] },
    });
  }
  if (req.admin?.id !== assignedAdminId) {
    return res.status(403).json({
      success: false,
      error: 'Cette instance Gophish n’est pas assignée à cette organisation.',
    });
  }

  try {
    const base = new URL(configuredUrl);
    if (
      base.username ||
      base.password ||
      base.search ||
      base.hash ||
      (base.protocol !== 'https:' &&
        !(process.env.NODE_ENV !== 'production' && base.protocol === 'http:' && isLocalHost(base.hostname)))
    ) {
      return res.status(503).json({
        success: false,
        error: 'La configuration Gophish doit utiliser HTTPS et une URL de base sans identifiants.',
      });
    }

    const endpoint = new URL('/api/campaigns/', base);
    const response = await fetch(endpoint, {
      headers: { Authorization: apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(10_000),
      redirect: 'manual',
    });
    if (!response.ok || response.status >= 300) {
      console.error(`[Gophish] Lecture des campagnes refusée (HTTP ${response.status})`);
      return res.status(502).json({
        success: false,
        error: response.status === 401 || response.status === 403
          ? 'Authentification Gophish refusée. Vérifiez la clé API configurée côté serveur.'
          : 'Gophish est temporairement indisponible.',
      });
    }

    const responseBody = await response.text();
    if (responseBody.length > 2_000_000) {
      return res.status(502).json({ success: false, error: 'Réponse Gophish trop volumineuse.' });
    }
    const payload: unknown = JSON.parse(responseBody);
    if (!Array.isArray(payload)) {
      return res.status(502).json({ success: false, error: 'Réponse Gophish invalide.' });
    }

    const campaigns = (payload as GophishCampaign[]).slice(0, 100).map((campaign) => {
      const results = Array.isArray(campaign.results)
        ? campaign.results as GophishResult[]
        : [];
      const statuses = results.map((result) => readStatus(result.status).toLowerCase());
      return {
        id: Number.isInteger(campaign.id) ? Number(campaign.id) : 0,
        name: typeof campaign.name === 'string' ? campaign.name.slice(0, 120) : 'Campagne sans nom',
        status: readStatus(campaign.status),
        targeted: results.length,
        opened: statuses.filter((status) => status.includes('opened')).length,
        clicked: statuses.filter((status) => status.includes('clicked') || status.includes('submitted')).length,
        reported: statuses.filter((status) => status.includes('reported')).length,
      };
    });

    return res.json({
      success: true,
      data: { configured: true, campaigns },
    });
  } catch (error) {
    console.error('[Gophish] Impossible de lire les campagnes:', error);
    return res.status(502).json({
      success: false,
      error: 'Connexion à Gophish impossible. Vérifiez son URL, son certificat TLS et sa disponibilité.',
    });
  }
}
