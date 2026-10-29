import { randomUUID } from 'crypto';
import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import type { AuthRequest } from './authMiddleware';
import { getDatabase, unwrapDatabaseResult } from './database';

const CATEGORIES = [
  'Phishing',
  'Fake Invoice',
  'WhatsApp Phishing',
  'Smishing',
  'MFA Fatigue',
  'Social Engineering',
  'Ransomware',
  'QR Code (Quishing)',
] as const;
const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile'] as const;

function requiredText(value: unknown, field: string, maxLength: number): string {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw Object.assign(new Error(`${field} invalide`), { status: 400 });
  }
  return value.trim();
}

function mapCampaignRow(row: Record<string, unknown>) {
  const campaignData =
    row.campaign_data && typeof row.campaign_data === 'object' && !Array.isArray(row.campaign_data)
      ? row.campaign_data as Record<string, unknown>
      : {};
  const targeted = Number(row.targeted) || 0;
  const clicked = Number(row.clicked) || 0;
  const reported = Number(row.reported) || 0;
  const category = CATEGORIES.find((value) => value === campaignData.category) || 'Phishing';
  const difficulty = DIFFICULTIES.find((value) => value === campaignData.difficulty) || 'Moyen';
  return {
    ...campaignData,
    id: row.id,
    name: row.name,
    status: row.status,
    createdAt: row.created_at,
    description: typeof campaignData.description === 'string' ? campaignData.description : '',
    scenarioId: typeof campaignData.scenarioId === 'string' ? campaignData.scenarioId : '',
    scenarioName: typeof campaignData.scenarioName === 'string' ? campaignData.scenarioName : '',
    category,
    difficulty,
    targetGroup: typeof campaignData.targetGroup === 'string'
      ? campaignData.targetGroup
      : `${targeted} collaborateur(s)`,
    targetEmployeeIds: Array.isArray(campaignData.targetEmployeeIds)
      ? campaignData.targetEmployeeIds.filter((id): id is string => typeof id === 'string')
      : [],
    targetDepartmentIds: Array.isArray(campaignData.targetDepartmentIds)
      ? campaignData.targetDepartmentIds.filter((id): id is string => typeof id === 'string')
      : [],
    departments: Array.isArray(campaignData.departments) ? campaignData.departments : [],
    medianReactionTimeMinutes: Number(campaignData.medianReactionTimeMinutes) || 0,
    isReTest: campaignData.isReTest === true,
    targeted,
    delivered: Number(row.delivered) || 0,
    opened: Number(row.opened) || 0,
    clicked,
    reported,
    clickRate: targeted ? Number(((clicked / targeted) * 100).toFixed(1)) : 0,
    reportRate: targeted ? Number(((reported / targeted) * 100).toFixed(1)) : 0,
  };
}

export async function handleListCampaigns(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });

  try {
    const result = await getDatabase()
      .from('campaigns')
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });
    const rows = unwrapDatabaseResult('lecture des campagnes', result) as Record<string, unknown>[];
    return res.json({ success: true, data: rows.map(mapCampaignRow) });
  } catch (error) {
    console.error('[Campagnes] Lecture échouée:', error);
    return res.status(503).json({ success: false, error: 'Impossible de charger les campagnes' });
  }
}

export async function handleCreateCampaignDraft(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });

  try {
    const name = requiredText(req.body.name, 'Nom de campagne', 120);
    const description = requiredText(req.body.description, 'Objectif', 1200);
    const scenarioId = requiredText(req.body.scenarioId, 'Scénario', 120);
    const scenarioName = requiredText(req.body.scenarioName, 'Nom du scénario', 160);
    const category = req.body.category;
    const difficulty = req.body.difficulty;
    if (!(CATEGORIES as readonly unknown[]).includes(category)) {
      return res.status(400).json({ success: false, error: 'Catégorie de scénario invalide' });
    }
    if (!(DIFFICULTIES as readonly unknown[]).includes(difficulty)) {
      return res.status(400).json({ success: false, error: 'Difficulté invalide' });
    }

    const submittedIds = req.body.targetEmployeeIds;
    if (!Array.isArray(submittedIds) || submittedIds.length === 0 || submittedIds.length > 500 ||
        submittedIds.some((id: unknown) => typeof id !== 'string' || !id.trim() || id.length > 80)) {
      return res.status(400).json({ success: false, error: 'La sélection de collaborateurs est invalide' });
    }
    const employeeIds = [...new Set(submittedIds as string[])];
    if (employeeIds.length !== submittedIds.length) {
      return res.status(400).json({ success: false, error: 'La sélection contient des doublons' });
    }

    const database = getDatabase();
    const employeesResult = await database
      .from('employees')
      .select('id,department_id')
      .eq('admin_id', adminId)
      .in('id', employeeIds);
    const employees = unwrapDatabaseResult('validation des collaborateurs ciblés', employeesResult) as {
      id: string;
      department_id: string;
    }[];
    if (employees.length !== employeeIds.length) {
      return res.status(400).json({
        success: false,
        error: 'La sélection contient des collaborateurs absents de votre annuaire',
      });
    }

    let baselineCampaignId: string | undefined;
    if (req.body.isReTest === true) {
      baselineCampaignId = requiredText(req.body.baselineCampaignId, 'Campagne de référence', 120);
      const baselineResult = await database
        .from('campaigns')
        .select('id')
        .eq('admin_id', adminId)
        .eq('id', baselineCampaignId)
        .maybeSingle();
      const baseline = unwrapDatabaseResult('validation de la campagne de référence', baselineResult);
      if (!baseline) {
        return res.status(400).json({ success: false, error: 'Campagne de référence introuvable' });
      }
    }

    const departmentIds = [...new Set(employees.map((employee) => employee.department_id).filter(Boolean))];
    const departmentsResult = departmentIds.length
      ? await database
          .from('departments')
          .select('id,name')
          .eq('admin_id', adminId)
          .in('id', departmentIds)
      : { data: [], error: null };
    const departments = unwrapDatabaseResult('lecture des services ciblés', departmentsResult) as {
      id: string;
      name: string;
    }[];
    const departmentNames = new Map(departments.map((department) => [department.id, department.name]));
    const departmentCounts = new Map<string, number>();
    for (const employee of employees) {
      const departmentName = departmentNames.get(employee.department_id) || 'Autre';
      departmentCounts.set(departmentName, (departmentCounts.get(departmentName) || 0) + 1);
    }
    const targetGroup = departmentCounts.size === 1
      ? `${departmentCounts.keys().next().value} (${employees.length})`
      : `Sélection personnalisée (${employees.length})`;
    const launchImmediately = req.body.launchImmediately === true || req.body.status === 'en_cours';
    const sendRealEmails = req.body.sendRealEmails === true;
    const now = new Date().toISOString();

    const campaignId = randomUUID();
    const campaignData = {
      description,
      scenarioId,
      scenarioName,
      category,
      difficulty,
      targetGroup,
      targetEmployeeIds: employeeIds,
      targetDepartmentIds: departmentIds,
      isReTest: req.body.isReTest === true,
      ...(baselineCampaignId ? { baselineCampaignId } : {}),
      medianReactionTimeMinutes: 0,
      ...(launchImmediately ? { launchedAt: now } : {}),
      departments: [...departmentCounts].map(([departmentName, targeted]) => ({
        name: departmentName,
        targeted,
        delivered: launchImmediately ? targeted : 0,
        opened: 0,
        clicked: 0,
        reported: 0,
        clickRate: 0,
        reportRate: 0,
      })),
    };

    let emailsSent = 0;
    if (launchImmediately && sendRealEmails) {
      const origin = req.get('origin') || process.env.APP_URL || 'http://localhost:3000';
      const emailRes = await sendCampaignEmails(
        adminId,
        employeeIds,
        campaignId,
        scenarioId,
        scenarioName,
        typeof req.body.scenarioBody === 'string' ? req.body.scenarioBody : '',
        origin
      );
      emailsSent = emailRes.sent;
    }

    const insertResult = await database
      .from('campaigns')
      .insert({
        id: campaignId,
        admin_id: adminId,
        name,
        status: launchImmediately ? 'en_cours' : 'brouillon',
        targeted: employees.length,
        delivered: launchImmediately ? employees.length : 0,
        opened: 0,
        clicked: 0,
        reported: 0,
        campaign_data: campaignData,
      })
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .single();
    const row = unwrapDatabaseResult('création de la campagne', insertResult) as Record<string, unknown>;
    return res.status(201).json({
      success: true,
      data: mapCampaignRow(row),
      emailsSent,
      message: launchImmediately
        ? (emailsSent > 0 ? `Campagne lancée ! ${emailsSent} email(s) envoyés.` : 'Campagne lancée en mode simulation interactive.')
        : 'Brouillon enregistré avec succès.'
    });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 503;
    if (status >= 500) console.error('[Campagnes] Création échouée:', error);
    return res.status(status).json({
      success: false,
      error: status < 500 && error instanceof Error ? error.message : 'Impossible d’enregistrer la campagne',
    });
  }
}

/**
 * Helper to dispatch simulated phishing decoy emails via SMTP with magic trap links
 */
async function sendCampaignEmails(
  adminId: string,
  employeeIds: string[],
  campaignId: string,
  scenarioId: string,
  scenarioName: string,
  scenarioBody: string,
  origin: string
): Promise<{ sent: number; error?: string }> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return { sent: 0, error: 'SMTP non configuré' };
  }

  try {
    const database = getDatabase();
    const empResult = await database
      .from('employees')
      .select('id, first_name, last_name, email')
      .eq('admin_id', adminId)
      .in('id', employeeIds);
    const emps = unwrapDatabaseResult('recherche collaborateurs pour envoi', empResult) as {
      id: string;
      first_name: string;
      last_name: string;
      email: string;
    }[];

    if (!emps || emps.length === 0) return { sent: 0 };

    const smtpPort = Number(SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const fromName = SMTP_FROM_NAME || 'VIGILO Sécurité';
    let sent = 0;

    for (const emp of emps) {
      if (!emp.email || !emp.email.includes('@')) continue;
      const trapUrl = `${origin}/?trap=true&scenarioId=${encodeURIComponent(scenarioId)}&campaignId=${encodeURIComponent(campaignId)}&empId=${encodeURIComponent(emp.id)}`;
      
      const emailHtml = (scenarioBody || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #1e293b;">Notification de sécurité importante</h2>
          <p>Bonjour ${emp.first_name || ''},</p>
          <p>Une mise à jour obligatoire de vos identifiants d'accès d'entreprise est requise sous 24h.</p>
          <p style="margin: 24px 0;">
            <a href="${trapUrl}" style="background-color: #f2620a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Vérifier mes identifiants
            </a>
          </p>
          <p style="font-size: 11px; color: #94a3b8;">Ceci est un test de simulation contrôlé VIGILO.</p>
        </div>
      `).replace(/#vigilo-trap-link/g, trapUrl);

      try {
        await transporter.sendMail({
          from: `"${fromName}" <${SMTP_USER}>`,
          to: emp.email,
          subject: scenarioName || 'Notification urgente de sécurité',
          html: emailHtml,
        });
        sent++;
      } catch (err) {
        console.error(`[Campagne Email] Erreur envoi à ${emp.email}:`, err);
      }
    }
    transporter.close();
    return { sent };
  } catch (error) {
    console.error('[Campagnes] Échec envoi emails:', error);
    return { sent: 0, error: String(error) };
  }
}

/**
 * Launch an existing campaign (transitions from draft to 'en_cours', marks delivered, optionally sends emails)
 */
export async function handleLaunchCampaign(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });
  const campaignId = req.params.id;
  if (!campaignId) return res.status(400).json({ success: false, error: 'ID de campagne manquant' });

  try {
    const database = getDatabase();
    const campResult = await database
      .from('campaigns')
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .maybeSingle();
    const existing = unwrapDatabaseResult('lecture campagne pour lancement', campResult) as Record<string, unknown> | null;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Campagne introuvable' });
    }

    const campaignData = (existing.campaign_data as Record<string, unknown>) || {};
    const targeted = Number(existing.targeted) || 0;
    const now = new Date().toISOString();

    const depts = Array.isArray(campaignData.departments)
      ? campaignData.departments.map((d: any) => ({
          ...d,
          delivered: Number(d.targeted) || 0,
        }))
      : [];

    const updatedCampaignData = {
      ...campaignData,
      launchedAt: now,
      status: 'en_cours',
      departments: depts,
    };

    let emailsSent = 0;
    if (req.body.sendRealEmails === true) {
      const origin = req.get('origin') || process.env.APP_URL || 'http://localhost:3000';
      const targetIds = Array.isArray(campaignData.targetEmployeeIds)
        ? (campaignData.targetEmployeeIds as string[])
        : [];
      const emailRes = await sendCampaignEmails(
        adminId,
        targetIds,
        campaignId,
        String(campaignData.scenarioId || ''),
        String(campaignData.scenarioName || existing.name),
        typeof req.body.scenarioBody === 'string' ? req.body.scenarioBody : '',
        origin
      );
      emailsSent = emailRes.sent;
    }

    const updateResult = await database
      .from('campaigns')
      .update({
        status: 'en_cours',
        delivered: targeted,
        campaign_data: updatedCampaignData,
      })
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .single();

    const row = unwrapDatabaseResult('lancement de la campagne', updateResult) as Record<string, unknown>;
    return res.json({
      success: true,
      data: mapCampaignRow(row),
      emailsSent,
      message: emailsSent > 0
        ? `Campagne lancée ! ${emailsSent} email(s) envoyés aux cibles.`
        : 'Campagne lancée avec succès en mode simulation active !',
    });
  } catch (error) {
    console.error('[Campagnes] Lancement échoué:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Impossible de lancer la campagne',
    });
  }
}

/**
 * Simulate live employee reactions for ANCy jury demo (open, click, report, auto_cohort)
 */
export async function handleSimulateCampaignEvent(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });
  const campaignId = req.params.id;
  const eventType = req.body.eventType as 'open' | 'click' | 'report' | 'auto_cohort';

  if (!['open', 'click', 'report', 'auto_cohort'].includes(eventType)) {
    return res.status(400).json({ success: false, error: 'Type d’événement de simulation invalide' });
  }

  try {
    const database = getDatabase();
    const campResult = await database
      .from('campaigns')
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .maybeSingle();
    const existing = unwrapDatabaseResult('lecture campagne', campResult) as Record<string, unknown> | null;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Campagne introuvable' });
    }

    const targeted = Math.max(1, Number(existing.targeted) || 1);
    let delivered = Math.max(targeted, Number(existing.delivered) || targeted);
    let opened = Number(existing.opened) || 0;
    let clicked = Number(existing.clicked) || 0;
    let reported = Number(existing.reported) || 0;
    const campaignData = (existing.campaign_data as Record<string, unknown>) || {};
    let depts = Array.isArray(campaignData.departments) ? [...campaignData.departments] : [];

    if (eventType === 'auto_cohort') {
      const difficulty = campaignData.difficulty || 'Moyen';
      const openPct = difficulty === 'Facile' ? 0.90 : difficulty === 'Difficile' ? 0.78 : 0.85;
      const clickPct = difficulty === 'Facile' ? 0.12 : difficulty === 'Difficile' ? 0.38 : 0.25;
      const reportPct = difficulty === 'Facile' ? 0.65 : difficulty === 'Difficile' ? 0.42 : 0.55;

      delivered = targeted;
      opened = Math.min(targeted, Math.max(1, Math.round(targeted * openPct)));
      clicked = Math.min(opened, Math.max(1, Math.round(targeted * clickPct)));
      reported = Math.min(targeted, Math.max(1, Math.round(targeted * reportPct)));

      depts = depts.map((d: any) => {
        const dTargeted = Math.max(1, Number(d.targeted) || 1);
        const dOpened = Math.min(dTargeted, Math.max(1, Math.round(dTargeted * openPct)));
        const dClicked = Math.min(dOpened, Math.round(dTargeted * clickPct));
        const dReported = Math.min(dTargeted, Math.round(dTargeted * reportPct));
        return {
          ...d,
          targeted: dTargeted,
          delivered: dTargeted,
          opened: dOpened,
          clicked: dClicked,
          reported: dReported,
          clickRate: Number(((dClicked / dTargeted) * 100).toFixed(1)),
          reportRate: Number(((dReported / dTargeted) * 100).toFixed(1)),
        };
      });
      campaignData.medianReactionTimeMinutes = difficulty === 'Facile' ? 18 : difficulty === 'Difficile' ? 8 : 13;
    } else if (eventType === 'open') {
      if (opened < delivered) {
        opened += 1;
        if (depts.length > 0) {
          const d = depts[Math.floor(Math.random() * depts.length)];
          d.opened = Math.min(d.targeted, (d.opened || 0) + 1);
        }
      }
    } else if (eventType === 'click') {
      opened = Math.min(delivered, Math.max(opened, clicked + 1));
      if (clicked < delivered) {
        clicked += 1;
        if (depts.length > 0) {
          const d = depts[Math.floor(Math.random() * depts.length)];
          d.opened = Math.min(d.targeted, Math.max(d.opened || 0, (d.clicked || 0) + 1));
          d.clicked = (d.clicked || 0) + 1;
          d.clickRate = Number(((d.clicked / d.targeted) * 100).toFixed(1));
        }
      }
      campaignData.medianReactionTimeMinutes = campaignData.medianReactionTimeMinutes || 12;
    } else if (eventType === 'report') {
      opened = Math.min(delivered, Math.max(opened, reported + 1));
      if (reported < delivered) {
        reported += 1;
        if (depts.length > 0) {
          const d = depts[Math.floor(Math.random() * depts.length)];
          d.reported = (d.reported || 0) + 1;
          d.reportRate = Number(((d.reported / d.targeted) * 100).toFixed(1));
        }
      }
    }

    const updatedCampaignData = {
      ...campaignData,
      departments: depts,
    };

    const updateResult = await database
      .from('campaigns')
      .update({
        status: existing.status === 'brouillon' ? 'en_cours' : existing.status,
        delivered,
        opened,
        clicked,
        reported,
        campaign_data: updatedCampaignData,
      })
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .single();

    const row = unwrapDatabaseResult('mise à jour simulation', updateResult) as Record<string, unknown>;
    return res.json({ success: true, data: mapCampaignRow(row) });
  } catch (error) {
    console.error('[Campagnes] Événement simulation échoué:', error);
    return res.status(500).json({ success: false, error: 'Erreur lors de la simulation' });
  }
}

/**
 * Complete a campaign (mark as 'terminée' for AI analysis & re-testing)
 */
export async function handleCompleteCampaign(req: AuthRequest, res: Response) {
  const adminId = req.admin?.id;
  if (!adminId) return res.status(401).json({ success: false, error: 'Non authentifié' });
  const campaignId = req.params.id;

  try {
    const database = getDatabase();
    const campResult = await database
      .from('campaigns')
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .maybeSingle();
    const existing = unwrapDatabaseResult('lecture campagne', campResult) as Record<string, unknown> | null;
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Campagne introuvable' });
    }

    const campaignData = (existing.campaign_data as Record<string, unknown>) || {};
    const now = new Date().toISOString();
    const updatedCampaignData = {
      ...campaignData,
      completedAt: now,
      status: 'terminée',
    };

    const updateResult = await database
      .from('campaigns')
      .update({
        status: 'terminée',
        campaign_data: updatedCampaignData,
      })
      .eq('admin_id', adminId)
      .eq('id', campaignId)
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .single();

    const row = unwrapDatabaseResult('clôture campagne', updateResult) as Record<string, unknown>;
    return res.json({ success: true, data: mapCampaignRow(row) });
  } catch (error) {
    console.error('[Campagnes] Clôture échouée:', error);
    return res.status(500).json({ success: false, error: 'Impossible de clôturer la campagne' });
  }
}

/**
 * Send a live test decoy email directly to an email address (for live demos with jury)
 */
export async function handleSendLiveTest(req: Request, res: Response) {
  try {
    const { email, scenario, origin } = req.body;
    if (!email || !scenario) {
      return res.status(400).json({ success: false, error: 'Email et scénario requis' });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME } = process.env;
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      return res.status(503).json({
        success: false,
        error: 'Configuration SMTP manquante dans le fichier .env (SMTP_HOST, SMTP_USER, SMTP_PASS).',
      });
    }

    const smtpPort = Number(SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      requireTLS: smtpPort !== 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const appOrigin = origin || process.env.APP_URL || 'http://localhost:3000';
    const magicLink = `${appOrigin}/?trap=true&scenarioId=${encodeURIComponent(scenario.id || scenario.category || 'scen-phishing-m365')}`;
    const modifiedBody = (scenario.body || '').replace(/#vigilo-trap-link/g, magicLink);

    const fromName = scenario.senderName || SMTP_FROM_NAME || 'VIGILO Sécurité';
    await transporter.sendMail({
      from: `"${fromName}" <${SMTP_USER}>`,
      replyTo: scenario.senderEmail || SMTP_USER,
      to: email,
      subject: scenario.subject || 'Simulation VIGILO',
      html: modifiedBody || `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h3>${scenario.subject}</h3>
          <p>Ceci est un test de simulation envoyé par VIGILO.</p>
          <p><a href="${magicLink}">Cliquez ici pour accéder au lien</a></p>
        </div>
      `,
    });
    transporter.close();

    return res.json({
      success: true,
      message: `✅ Email de simulation envoyé avec succès à ${email} ! Consultez la boîte de réception pour tester le piège.`,
    });
  } catch (error: any) {
    console.error('[Live Test] Erreur envoi email:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Erreur lors de l’envoi de l’email de test',
    });
  }
}

