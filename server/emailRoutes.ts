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
import { getCompanyProfile, listEmployees } from './orgStore';

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
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
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

export function publicAppUrl(req?: Request): URL {
  let target = '';
  if (req?.body && typeof req.body.origin === 'string' && req.body.origin.startsWith('http')) {
    target = req.body.origin;
  } else if (req?.get('origin') && req.get('origin')?.startsWith('http')) {
    target = req.get('origin')!;
  } else if (process.env.VERCEL_URL) {
    target = `https://${process.env.VERCEL_URL}`;
  } else if (req?.get('x-forwarded-host')) {
    const proto = req.get('x-forwarded-proto') || 'https';
    target = `${proto}://${req.get('x-forwarded-host')}`;
  } else if (process.env.APP_URL && !process.env.APP_URL.includes('localhost')) {
    target = process.env.APP_URL;
  } else if (process.env.APP_URL) {
    target = process.env.APP_URL;
  } else {
    target = 'http://localhost:3000';
  }

  try {
    return new URL(target);
  } catch {
    return new URL('http://localhost:3000');
  }
}


function smtpErrorDetails(error: unknown): { code?: string; responseCode?: number; command?: string } {
  if (!error || typeof error !== 'object') return {};
  const details = error as Record<string, unknown>;
  return {
    ...(typeof details.code === 'string' && /^[A-Z0-9_]+$/i.test(details.code)
      ? { code: details.code }
      : {}),
    ...(typeof details.responseCode === 'number' ? { responseCode: details.responseCode } : {}),
    ...(typeof details.command === 'string' && /^[A-Z0-9 ]{1,32}$/i.test(details.command)
      ? { command: details.command }
      : {}),
  };
}

function smtpPublicFailure(error: unknown): Error & { status: number; publicMessage: string } {
  const details = smtpErrorDetails(error);
  let publicMessage = 'Le serveur email est indisponible. Réessayez plus tard.';
  if (details.code === 'EAUTH') {
    publicMessage = 'Authentification SMTP refusée. Vérifiez le compte et le mot de passe SMTP.';
  } else if (['ECONNECTION', 'ETIMEDOUT', 'ESOCKET', 'ENOTFOUND'].includes(details.code || '')) {
    publicMessage = 'Connexion SMTP impossible. Vérifiez l’hôte, le port, TLS et l’accès réseau.';
  } else if (details.responseCode && details.responseCode >= 500) {
    publicMessage = 'Le serveur SMTP a refusé le message. Vérifiez l’expéditeur et les règles de relais.';
  }
  return Object.assign(new Error(publicMessage), { status: 503, publicMessage });
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
    const companyProfile = await getCompanyProfile(adminId);

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return res.status(503).json({
        success: false,
        error: 'Service email indisponible : la configuration SMTP serveur est incomplète.',
      });
    }
    const smtpPort = Number(SMTP_PORT || 587);
    if (!Number.isInteger(smtpPort) || smtpPort < 1 || smtpPort > 65535) {
      return res.status(503).json({
        success: false,
        error: 'Configuration SMTP invalide : vérifiez SMTP_PORT.',
      });
    }
    const trainingUrl = publicAppUrl(req);

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      pool: true,
      maxConnections: 5,
      maxMessages: 50,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    try {
      await transporter.verify();
    } catch (error) {
      console.error('[Email formation] Vérification SMTP échouée:', smtpErrorDetails(error));
      transporter.close();
      const failure = smtpPublicFailure(error);
      return res.status(failure.status).json({ success: false, error: failure.publicMessage });
    }

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
    const safeCompanyName = escapeHtml(companyProfile.companyName);
    const isEnglish = companyProfile.preferredLanguage === 'en';
    const safeBrandColor = /^#[0-9a-f]{6}$/i.test(companyProfile.brandColor)
      ? companyProfile.brandColor
      : '#f97316';
    const fromName = escapeHtml(process.env.SMTP_FROM_NAME || 'VIGILO Formations');
    try {
      await transporter.sendMail({
      from: `"${fromName}" <${SMTP_USER}>`,
      to: employee.email,
      subject: `[${companyProfile.companyName}] ${isEnglish ? 'Training assigned' : 'Formation assignée'}: ${moduleTitle}`,
      text: `${isEnglish ? 'Hello' : 'Bonjour'} ${employee.firstName},\n\n${companyProfile.companyName} ${isEnglish ? 'invites you to complete the training' : 'vous invite à suivre la micro-formation'} « ${moduleTitle} » (${duration} min).\n\n${isEnglish ? 'Open the training' : 'Ouvrir la formation'}: ${trainingUrl.toString()}`,
      html: `<div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-top:5px solid ${safeBrandColor};border-radius:8px;">
  <p style="color:${safeBrandColor};font-weight:700;">${safeCompanyName}</p>
  <p>${isEnglish ? 'Hello' : 'Bonjour'} ${safeFirstName},</p>
  <p>${safeCompanyName} ${isEnglish ? 'invites you to complete the training' : 'vous invite à suivre la micro-formation'} <strong>${safeTitle}</strong> (${duration} min).</p>
  <p><a href="${escapeHtml(trainingUrl.toString())}">${isEnglish ? 'Open the training' : 'Ouvrir la formation'}</a></p>
  <p>${isEnglish ? 'This is a VIGILO learning invitation.' : 'Cette invitation est un contenu pédagogique VIGILO.'}</p>
</div>`,
      });
    } catch (error) {
      console.error('[Email formation] Envoi SMTP échoué:', smtpErrorDetails(error));
      try {
        const cleanupResult = await database
          .from('training_invitations')
          .delete()
          .eq('admin_id', adminId)
          .eq('token_hash', tokenHash);
        unwrapDatabaseResult('nettoyage de l’invitation non envoyée', cleanupResult);
      } catch (cleanupError) {
        console.error('[Email formation] Nettoyage de l’invitation échoué:', cleanupError);
      }
      throw smtpPublicFailure(error);
    } finally {
      transporter.close();
    }

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
    const hasPublicMessage = typeof error === 'object' && error !== null && 'publicMessage' in error;
    if (status >= 500 && !hasPublicMessage) {
      console.error('[Email formation] Échec de l’envoi:', error);
    }
    return res.status(status).json({
      success: false,
      error: status < 500 && error instanceof Error
        ? error.message
        : typeof error === 'object' && error !== null && 'publicMessage' in error
          ? String(error.publicMessage)
          : 'Service email indisponible',
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
    const database = getDatabase();
    const result = await database
      .from('training_invitations')
      .select('id,admin_id,module_id,expires_at,completed_at')
      .eq('token_hash', tokenHash)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();
    const invitation = unwrapDatabaseResult('lecture du lien de formation', result) as {
      id: string;
      admin_id: string;
      module_id: string;
      expires_at: string;
      completed_at: string | null;
    } | null;

    if (!invitation) {
      return res.status(404).json({ success: false, error: 'Lien de formation invalide ou expiré' });
    }

    const modResult = await database
      .from('training_modules')
      .select('module_data')
      .eq('admin_id', invitation.admin_id)
      .eq('id', invitation.module_id)
      .maybeSingle();
    const modRow = unwrapDatabaseResult('lecture du module de formation', modResult) as { module_data: unknown } | null;

    if (!modRow || !validTrainingModule(modRow.module_data)) {
      return res.status(404).json({ success: false, error: 'Contenu de formation introuvable ou invalide' });
    }

    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      success: true,
      data: modRow.module_data,
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

export async function handleSendTrainingInvitesBatch(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });

  const { employeeIds, module: trainingModule } = req.body as {
    employeeIds?: string[];
    module?: unknown;
  };

  if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
    return res.status(400).json({ success: false, error: 'Sélection de collaborateurs vide ou invalide' });
  }

  if (!validTrainingModule(trainingModule)) {
    return res.status(400).json({ success: false, error: 'Module de formation invalide' });
  }

  const moduleId = requiredText(trainingModule.id, 'Identifiant de formation', 120);
  const moduleTitle = requiredText(trainingModule.title, 'Titre de formation', 120);
  const duration = Number(trainingModule.durationMinutes ?? 4);

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(503).json({
      success: false,
      error: 'Service email indisponible : la configuration SMTP serveur est incomplète.',
    });
  }

  try {
    const database = getDatabase();
    const allEmployees = await listEmployees(adminId);
    const targets = allEmployees.filter((emp) => employeeIds.includes(emp.id));
    if (targets.length === 0) {
      return res.status(404).json({ success: false, error: 'Aucun collaborateur trouvé' });
    }

    const companyProfile = await getCompanyProfile(adminId);
    const smtpPort = Number(SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const moduleData = { ...trainingModule, id: moduleId, title: moduleTitle, durationMinutes: duration };
    await database.from('training_modules').upsert({
      admin_id: adminId,
      id: moduleId,
      title: moduleTitle,
      module_data: moduleData,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'admin_id,id' });

    const safeTitle = escapeHtml(moduleTitle);
    const safeCompanyName = escapeHtml(companyProfile.companyName);
    const isEnglish = companyProfile.preferredLanguage === 'en';
    const safeBrandColor = /^#[0-9a-f]{6}$/i.test(companyProfile.brandColor) ? companyProfile.brandColor : '#f97316';
    const fromName = escapeHtml(SMTP_FROM_NAME || 'VIGILO Formations');

    const sendPromises = targets.map(async (emp) => {
      if (!emp.email || !emp.email.includes('@')) return false;
      const token = randomBytes(32).toString('hex');
      const tokenHash = createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      try {
        await database.from('training_invitations').insert({
          id: randomUUID(),
          admin_id: adminId,
          module_id: moduleId,
          token_hash: tokenHash,
          expires_at: expiresAt,
        });

        const trainingUrl = publicAppUrl(req);
        trainingUrl.searchParams.set('trainingInvite', token);
        const safeFirstName = escapeHtml(emp.firstName);

        await transporter.sendMail({
          from: `"${fromName}" <${SMTP_USER}>`,
          to: emp.email,
          subject: `[${companyProfile.companyName}] ${isEnglish ? 'Training assigned' : 'Formation assignée'}: ${moduleTitle}`,
          text: `${isEnglish ? 'Hello' : 'Bonjour'} ${emp.firstName},\n\n${companyProfile.companyName} ${isEnglish ? 'invites you to complete the training' : 'vous invite à suivre la micro-formation'} « ${moduleTitle} » (${duration} min).\n\n${isEnglish ? 'Open the training' : 'Ouvrir la formation'}: ${trainingUrl.toString()}`,
          html: `<div style="font-family:Segoe UI,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-top:5px solid ${safeBrandColor};border-radius:8px;">
  <p style="color:${safeBrandColor};font-weight:700;">${safeCompanyName}</p>
  <p>${isEnglish ? 'Hello' : 'Bonjour'} ${safeFirstName},</p>
  <p>${safeCompanyName} ${isEnglish ? 'invites you to complete the training' : 'vous invite à suivre la micro-formation'} <strong>${safeTitle}</strong> (${duration} min).</p>
  <p><a href="${escapeHtml(trainingUrl.toString())}" style="background-color:${safeBrandColor};color:white;padding:10px 20px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">${isEnglish ? 'Open the training' : 'Ouvrir la formation'}</a></p>
  <p style="font-size:11px;color:#94a3b8;margin-top:20px;">${isEnglish ? 'This is a VIGILO learning invitation.' : 'Cette invitation est un contenu pédagogique VIGILO.'}</p>
</div>`,
        });
        return true;
      } catch (err) {
        console.error(`[Email formation batch] Erreur envoi à ${emp.email}:`, err);
        return false;
      }
    });

    const results = await Promise.allSettled(sendPromises);
    transporter.close();
    const sentCount = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    return res.json({
      success: true,
      sentCount,
      failedCount: targets.length - sentCount,
      message: `${sentCount} invitation(s) de formation envoyée(s) avec succès !`,
    });
  } catch (error) {
    console.error('[Email formation batch] Échec:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Échec de l’envoi groupé',
    });
  }
}

export async function handleBroadcastFlashAlert(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });

  const { title, category, summary, content, keyTakeaway } = req.body as {
    title?: string;
    category?: string;
    summary?: string;
    content?: string;
    keyTakeaway?: string;
  };

  if (!title || !content) {
    return res.status(400).json({ success: false, error: 'Titre et contenu de l’alerte requis' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(503).json({
      success: false,
      error: 'Service email indisponible : SMTP non configuré sur le serveur.',
    });
  }

  try {
    const employees = await listEmployees(adminId);
    if (!employees || employees.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Aucun collaborateur dans votre annuaire pour recevoir cette alerte.',
      });
    }

    const companyProfile = await getCompanyProfile(adminId);
    const smtpPort = Number(SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const origin = publicAppUrl(req).toString().replace(/\/+$/, '');
    const safeTitle = escapeHtml(title);
    const safeSummary = escapeHtml(summary || title);
    const safeContent = escapeHtml(content);
    const safeTakeaway = escapeHtml(keyTakeaway || 'Toujours vérifier l’expéditeur avant toute action.');
    const safeBrandColor = /^#[0-9a-f]{6}$/i.test(companyProfile.brandColor) ? companyProfile.brandColor : '#dc2626';
    const fromName = escapeHtml(SMTP_FROM_NAME || 'VIGILO Alerte Sécurité');

    const sendPromises = employees.map(async (emp) => {
      if (!emp.email || !emp.email.includes('@')) return false;
      const safeFirstName = escapeHtml(emp.firstName || '');
      const ackUrl = `${origin}/?flashAck=true&empId=${encodeURIComponent(emp.id)}`;

      const html = `<div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-top:6px solid ${safeBrandColor};border-radius:8px;background:#ffffff;">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
    <span style="background:#fee2e2;color:#b91c1c;padding:4px 10px;border-radius:4px;font-size:12px;font-weight:bold;text-transform:uppercase;">🚨 ${escapeHtml(category || 'Alerte Urgente')}</span>
    <span style="color:#64748b;font-size:12px;font-weight:600;">${escapeHtml(companyProfile.companyName)}</span>
  </div>
  <h2 style="color:#0f172a;margin-top:8px;margin-bottom:16px;font-size:18px;">${safeTitle}</h2>
  <p style="color:#334155;font-size:14px;line-height:1.6;">Bonjour ${safeFirstName},</p>
  <p style="color:#334155;font-size:14px;line-height:1.6;background:#f8fafc;padding:12px;border-left:3px solid #3b82f6;border-radius:4px;">${safeSummary}</p>
  <div style="color:#334155;font-size:13px;line-height:1.6;margin:16px 0;white-space:pre-line;">${safeContent}</div>
  <div style="background:#fef3c7;border:1px solid #fde68a;padding:12px;border-radius:6px;margin:16px 0;">
    <strong style="color:#92400e;font-size:13px;display:block;margin-bottom:4px;">🛡️ Réflexe de sécurité immédiat :</strong>
    <span style="color:#78350f;font-size:13px;">${safeTakeaway}</span>
  </div>
  <div style="text-align:center;margin-top:24px;">
    <a href="${ackUrl}" style="background:#0f172a;color:#ffffff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;font-size:13px;display:inline-block;">J'ai pris connaissance de cette alerte</a>
  </div>
  <p style="font-size:11px;color:#94a3b8;margin-top:24px;border-top:1px solid #f1f5f9;padding-top:12px;text-align:center;">Bulletin de sensibilisation diffusé par VIGILO pour ${escapeHtml(companyProfile.companyName)}.</p>
</div>`;

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${SMTP_USER}>`,
          to: emp.email,
          subject: `🚨 [Alerte Sécurité] ${title}`,
          text: `Bonjour ${emp.firstName},\n\nAlerte sécurité : ${title}\n\n${summary || ''}\n\n${content}\n\nRéflexe immédiat : ${keyTakeaway || ''}`,
          html,
        });
        return true;
      } catch (err) {
        console.error(`[Alerte Flash] Erreur envoi à ${emp.email}:`, err);
        return false;
      }
    });

    const results = await Promise.allSettled(sendPromises);
    transporter.close();
    const sentCount = results.filter((r) => r.status === 'fulfilled' && r.value === true).length;
    return res.json({
      success: true,
      sentCount,
      totalTargets: employees.length,
      message: `Alerte Flash diffusée avec succès à ${sentCount} collaborateur(s) par email !`,
    });
  } catch (error) {
    console.error('[Alerte Flash] Erreur diffusion:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Échec de diffusion de l’alerte',
    });
  }
}
