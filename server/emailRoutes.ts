import { createHash, randomBytes, randomUUID } from 'crypto';
import nodemailer from 'nodemailer';
import type { Response } from 'express';
import type { Request } from 'express';
import type { AuthRequest } from './authMiddleware';
import {
  DatabaseConfigurationError,
  getDatabase,
  unwrapDatabaseResult,
} from './database';
import { listEmployees } from './orgStore';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > maxLength) {
    throw Object.assign(new Error(`${field} invalide`), { status: 400 });
  }
  return value.trim();
}

function validTrainingModule(value: unknown): value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const module = value as Record<string, unknown>;
  const situation = module.situation;
  const reaction = module.correctReaction;
  const quiz = module.miniQuiz;
  if (!situation || typeof situation !== 'object' || !reaction || typeof reaction !== 'object' ||
      !quiz || typeof quiz !== 'object') return false;
  const situationFields = situation as Record<string, unknown>;
  const reactionFields = reaction as Record<string, unknown>;
  const quizFields = quiz as Record<string, unknown>;
  const options = quizFields.options;
  const warningSigns = module.warningSigns;
  const steps = reactionFields.steps;
  return (
    typeof module.id === 'string' &&
    typeof module.title === 'string' &&
    typeof module.category === 'string' &&
    typeof module.durationMinutes === 'number' &&
    typeof situationFields.context === 'string' &&
    typeof situationFields.sampleSnippet === 'string' &&
    Array.isArray(warningSigns) &&
    warningSigns.every((sign) => {
      if (!sign || typeof sign !== 'object' || Array.isArray(sign)) return false;
      const item = sign as Record<string, unknown>;
      return typeof item.sign === 'string' && typeof item.description === 'string';
    }) &&
    typeof reactionFields.rule === 'string' &&
    Array.isArray(steps) &&
    steps.every((step) => typeof step === 'string') &&
    typeof quizFields.question === 'string' &&
    Array.isArray(options) &&
    options.length >= 2 &&
    options.every((option) => typeof option === 'string') &&
    Number.isInteger(quizFields.correctIndex) &&
    Number(quizFields.correctIndex) >= 0 &&
    Number(quizFields.correctIndex) < options.length &&
    typeof quizFields.explanation === 'string'
  );
}

function publicAppUrl(): URL {
  const configured = process.env.APP_URL || 'http://localhost:3000';
  const url = new URL(configured);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw Object.assign(new Error('APP_URL doit utiliser HTTPS en dehors du développement local'), { status: 500 });
  }
  return url;
}

export async function handleSendTrainingInvite(req: AuthRequest, res: Response) {
  try {
    const adminId = req.admin?.id;
    if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });

    const email = requiredText(req.body.email, 'Email', 254).toLowerCase();
    const trainingModule = req.body.module;
    if (!validTrainingModule(trainingModule)) {
      return res.status(400).json({ success: false, error: 'Module de formation invalide' });
    }
    const moduleId = requiredText(trainingModule.id, 'Identifiant de formation', 120);
    const moduleTitle = requiredText(trainingModule.title, 'Titre de formation', 120);
    const duration = Number(trainingModule.durationMinutes ?? 4);
    if (!Number.isFinite(duration) || duration < 1 || duration > 60) {
      return res.status(400).json({ success: false, error: 'Durée de formation invalide' });
    }
    if (JSON.stringify(trainingModule).length > 32_000) {
      return res.status(413).json({ success: false, error: 'Module de formation trop volumineux' });
    }

    const employees = await listEmployees(adminId);
    const employee = employees.find((candidate) => candidate.email.toLowerCase() === email);
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: 'Le destinataire ne fait pas partie de votre annuaire autorisé',
      });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return res.status(503).json({
        success: false,
        error: 'Service email indisponible : la configuration SMTP serveur est incomplète.',
      });
    }

    const trainingUrl = publicAppUrl();
    const token = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const database = getDatabase();
    const moduleData = { ...trainingModule, id: moduleId, title: moduleTitle, durationMinutes: duration };
    const moduleResult = await database
      .from('training_modules')
      .upsert({
        admin_id: adminId,
        id: moduleId,
        title: moduleTitle,
        module_data: moduleData,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'admin_id,id' });
    unwrapDatabaseResult('enregistrement du module de formation', moduleResult);

    const invitationResult = await database
      .from('training_invitations')
      .insert({
        id: randomUUID(),
        admin_id: adminId,
        module_id: moduleId,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });
    unwrapDatabaseResult('création du lien de formation', invitationResult);

    trainingUrl.searchParams.set('trainingInvite', token);
    const safeTitle = escapeHtml(moduleTitle);
    const safeFirstName = escapeHtml(employee.firstName);
    const fromName = escapeHtml(process.env.SMTP_FROM_NAME || 'VIGILO Formations');
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_USER}>`,
      to: employee.email,
      subject: `[VIGILO] Micro-formation assignée : ${moduleTitle}`,
      text: `Bonjour ${employee.firstName},\n\nVotre équipe vous invite à suivre la micro-formation « ${moduleTitle} » (${duration} min).\n\nOuvrir la formation : ${trainingUrl.toString()}`,
      html: `<div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:8px;">
  <p>Bonjour ${safeFirstName},</p>
  <p>Votre équipe vous invite à suivre la micro-formation <strong>${safeTitle}</strong> (${duration} min).</p>
  <p><a href="${escapeHtml(trainingUrl.toString())}">Ouvrir la formation</a></p>
  <p>Cette invitation est un contenu pédagogique VIGILO.</p>
</div>`,
    });

    return res.json({
      success: true,
      message: 'Invitation de formation envoyée.',
      expiresAt,
    });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : error instanceof DatabaseConfigurationError
          ? 503
          : 500;
    if (status >= 500) console.error('[Email formation] Échec de l’envoi:', error);
    return res.status(status).json({
      success: false,
      error: status < 500 && error instanceof Error ? error.message : 'Service email indisponible',
    });
  }
}

function hashInvitationToken(value: unknown): string | null {
  if (typeof value !== 'string' || !/^[a-f0-9]{64}$/i.test(value)) return null;
  return createHash('sha256').update(value).digest('hex');
}

export async function handleGetTrainingInvitation(req: Request, res: Response) {
  const tokenHash = hashInvitationToken(req.params.token);
  if (!tokenHash) {
    return res.status(404).json({ success: false, error: 'Lien de formation invalide ou expiré' });
  }

  try {
    const result = await getDatabase()
      .from('training_invitations')
      .select('id,admin_id,module_id,expires_at,completed_at,training_modules!inner(module_data)')
      .eq('token_hash', tokenHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    const invitation = unwrapDatabaseResult('lecture du lien de formation', result) as {
      id: string;
      admin_id: string;
      module_id: string;
      expires_at: string;
      completed_at: string | null;
      training_modules: { module_data: unknown };
    } | null;

    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Lien de formation invalide ou expiré' });
    }
    if (!validTrainingModule(invitation.training_modules.module_data)) {
      console.error('[Email formation] Module invalide associé à une invitation:', invitation.id);
      return res.status(500).json({ success: false, error: 'Contenu de formation invalide' });
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      success: true,
      data: invitation.training_modules.module_data,
      completed: Boolean(invitation.completed_at),
    });
  } catch (error) {
    console.error('[Email formation] Lecture du lien échouée:', error);
    return res.status(503).json({ success: false, error: 'Impossible de charger cette formation' });
  }
}

export async function handleCompleteTrainingInvitation(req: Request, res: Response) {
  const tokenHash = hashInvitationToken(req.params.token);
  if (!tokenHash) {
    return res.status(404).json({ success: false, error: 'Lien de formation invalide ou expiré' });
  }

  try {
    const result = await getDatabase()
      .from('training_invitations')
      .update({ completed_at: new Date().toISOString() })
      .eq('token_hash', tokenHash)
      .gt('expires_at', new Date().toISOString())
      .is('completed_at', null)
      .select('id')
      .maybeSingle();
    const invitation = unwrapDatabaseResult('confirmation de la formation', result);
    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Lien de formation invalide, expiré ou déjà utilisé' });
    }
    return res.json({ success: true });
  } catch (error) {
    console.error('[Email formation] Confirmation échouée:', error);
    return res.status(503).json({ success: false, error: 'Impossible d’enregistrer la fin de formation' });
  }
}
