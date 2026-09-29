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

function adminId(req: AuthRequest): string {
  if (!req.admin?.id) {
    throw Object.assign(new Error('Non authentifié'), { status: 401 });
  }
  return req.admin.id;
}

function handleError(res: Response, e: any) {
  return res.status(e.status || 500).json({ success: false, error: e.message || 'Erreur serveur' });
}

// ─── Summary ────────────────────────────────────────────────────────────────

export function handleOrgSummary(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const summary = getOrgSummary(id, req.admin!.companySize);
    return res.json({ success: true, data: summary });
  } catch (e: any) {
    return handleError(res, e);
  }
}

// ─── Departments ─────────────────────────────────────────────────────────────

export function handleListDepartments(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    return res.json({ success: true, data: listDepartments(id) });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleCreateDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const { name } = req.body as { name?: string };
    const dept = createDepartment(id, name || '');
    return res.status(201).json({ success: true, data: dept });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleUpdateDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId = String(req.params.id || '');
    const { name } = req.body as { name?: string };
    const dept = updateDepartment(id, departmentId, name || '');
    return res.json({ success: true, data: dept });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleDeleteDepartment(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId = String(req.params.id || '');
    deleteDepartment(id, departmentId);
    return res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e);
  }
}

// ─── Employees ───────────────────────────────────────────────────────────────

export function handleListEmployees(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const departmentId =
      typeof req.query.departmentId === 'string' ? req.query.departmentId : undefined;
    return res.json({ success: true, data: listEmployees(id, departmentId) });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleGetEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const employeeId = String(req.params.id || '');
    const emp = getEmployee(id, employeeId);
    if (!emp) return res.status(404).json({ success: false, error: 'Collaborateur introuvable' });
    return res.json({ success: true, data: emp });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleCreateEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const body = req.body as {
      firstName?: string;
      lastName?: string;
      email?: string;
      departmentId?: string;
      role?: string;
    };
    const emp = createEmployee(id, req.admin!.companySize, {
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      email: body.email || '',
      departmentId: body.departmentId || '',
      role: body.role,
    });
    return res.status(201).json({ success: true, data: emp });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleUpdateEmployee(req: AuthRequest, res: Response) {
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
    const emp = updateEmployee(id, employeeId, body);
    return res.json({ success: true, data: emp });
  } catch (e: any) {
    return handleError(res, e);
  }
}

export function handleDeleteEmployee(req: AuthRequest, res: Response) {
  try {
    const id = adminId(req);
    const employeeId = String(req.params.id || '');
    deleteEmployee(id, employeeId);
    return res.json({ success: true });
  } catch (e: any) {
    return handleError(res, e);
  }
}
