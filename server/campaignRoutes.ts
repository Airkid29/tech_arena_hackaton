import { randomUUID } from 'crypto';
import type { Response } from 'express';
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
      departments: [...departmentCounts].map(([departmentName, targeted]) => ({
        name: departmentName,
        targeted,
        opened: 0,
        clicked: 0,
        reported: 0,
        clickRate: 0,
        reportRate: 0,
      })),
    };
    const insertResult = await database
      .from('campaigns')
      .insert({
        id: campaignId,
        admin_id: adminId,
        name,
        status: 'brouillon',
        targeted: employees.length,
        delivered: 0,
        opened: 0,
        clicked: 0,
        reported: 0,
        campaign_data: campaignData,
      })
      .select('id,name,status,targeted,delivered,opened,clicked,reported,campaign_data,created_at')
      .single();
    const row = unwrapDatabaseResult('création du brouillon', insertResult) as Record<string, unknown>;
    return res.status(201).json({ success: true, data: mapCampaignRow(row) });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 503;
    if (status >= 500) console.error('[Campagnes] Création du brouillon échouée:', error);
    return res.status(status).json({
      success: false,
      error: status < 500 && error instanceof Error ? error.message : 'Impossible d’enregistrer le brouillon',
    });
  }
}
