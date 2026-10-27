/**
 * Authenticated org APIs — company departments + employees.
 * Tenant scope: ALWAYS req.admin.id (never trust body/query adminId).
 */
import type { Response } from 'express';
import type { AuthRequest } from './authMiddleware';
import {
  listDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployee,
  getOrgSummary,
} from './orgStore';
import { DatabaseConfigurationError } from './database';

function adminId(req: AuthRequest): string {
  if (!req.admin?.id) {
    throw Object.assign(new Error('Non authentifié'), { status: 401 });
  }
  return req.admin.id;
}

function handleError(res: Response, error: unknown) {
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? Number(error.status)
      : error instanceof DatabaseConfigurationError
        ? 503
        : 500;
  if (status >= 500) console.error('[Organisation] Requête échouée:', error);
  const message =
    status < 500 && error instanceof Error
      ? error.message
      : status === 503
        ? 'Base de données indisponible ou non configurée'
        : 'Erreur serveur';
  return res.status(status).json({ success: false, error: message });
}

// ─── Summary ────────────────────────────────────────────────────────────────

export async function handleOrgSummary(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const summary = await getOrgSummary(id, req.admin!.companySize);
    return res.json({ success: true, data: summary });
  } catch (error) {
    return handleError(res, error);
  }
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function handleListDepartments(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    return res.json({ success: true, data: await listDepartments(id) });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleCreateDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const { name } = req.body as { name?: string };
    const dept = await createDepartment(id, name || '');
    return res.status(201).json({ success: true, data: dept });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleUpdateDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId = String(req.params.id || '');
    const { name } = req.body as { name?: string };
    const dept = await updateDepartment(id, departmentId, name || '');
    return res.json({ success: true, data: dept });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleDeleteDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId = String(req.params.id || '');
    await deleteDepartment(id, departmentId);
    return res.json({ success: true });
  } catch (error) {
    return handleError(res, error);
  }
}

// ─── Employees ───────────────────────────────────────────────────────────────

export async function handleListEmployees(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId =
      typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
    return res.json({ success: true, data: await listEmployees(id, departmentId) });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleGetEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const employeeId = String(req.params.id || '');
    const emp = await getEmployee(id, employeeId);
    if (!emp) return res.status(404).json({ success: false, error: 'Collaborateur introuvable' });
    return res.json({ success: true, data: emp });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleCreateEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const body = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      departmentId?: string;
      role?: string;
    };
    const emp = await createEmployee(id, req.admin!.companySize, {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      departmentId: body.departmentId || '',
      role: body.role,
    });
    return res.status(201).json({ success: true, data: emp });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleUpdateEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const employeeId = String(req.params.id || '');
    const body = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      departmentId?: string;
      role?: string;
      riskScore?: number;
    };
    const emp = await updateEmployee(id, employeeId, body);
    return res.json({ success: true, data: emp });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function handleDeleteEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const employeeId = String(req.params.id || '');
    await deleteEmployee(id, employeeId);
    return res.json({ success: true });
  } catch (error) {
    return handleError(res, error);
  }
}
