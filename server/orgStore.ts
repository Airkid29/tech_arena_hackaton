import { randomUUID } from 'crypto';
import type { CompanySize } from './authStore';
import { getDatabase, unwrapDatabaseResult } from './database';

export const COMPANY_SIZE_MAX_EMPLOYEES: Record<CompanySize, number> = {
  '1-10': 10,
  '11-50': 50,
  '51-100': 100,
  '101-150': 150,
  '150+': 200,
};

export function maxEmployeesForSize(size: CompanySize): number {
  return COMPANY_SIZE_MAX_EMPLOYEES[size] ?? 10;
}

export interface CompanyDepartment {
  id: string;
  adminId: string;
  name: string;
  createdAt: string;
}

export interface OrgEmployee {
  id: string;
  adminId: string;
  departmentId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  riskScore: number;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentRow {
  id: string;
  admin_id: string;
  name: string;
  created_at: string;
}

interface EmployeeRow {
  id: string;
  admin_id: string;
  department_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

function mapDepartment(row: DepartmentRow): CompanyDepartment {
  return {
    id: row.id,
    adminId: row.admin_id,
    name: row.name,
    createdAt: row.created_at,
  };
}

function mapEmployee(row: EmployeeRow): OrgEmployee {
  return {
    id: row.id,
    adminId: row.admin_id,
    departmentId: row.department_id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    role: row.role,
    riskScore: row.risk_score,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function httpError(message: string, status: number): Error {
  return Object.assign(new Error(message), { status });
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}

function throwOnDuplicate(error: { code?: string } | null, message: string): void {
  if (error?.code === '23505') throw httpError(message, 409);
}

export async function listDepartments(adminId: string): Promise<CompanyDepartment[]> {
  const result = await getDatabase()
    .from('departments')
    .select('id,admin_id,name,created_at')
    .eq('admin_id', adminId);
  const rows = unwrapDatabaseResult('liste des départements', result) as DepartmentRow[];
  return rows.map(mapDepartment).sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export async function getDepartment(
  adminId: string,
  departmentId: string
): Promise<CompanyDepartment | null> {
  const result = await getDatabase()
    .from('departments')
    .select('id,admin_id,name,created_at')
    .eq('admin_id', adminId)
    .eq('id', departmentId)
    .maybeSingle();
  const row = unwrapDatabaseResult('lecture du département', result) as DepartmentRow | null;
  return row ? mapDepartment(row) : null;
}

export async function createDepartment(adminId: string, name: string): Promise<CompanyDepartment> {
  if (typeof name !== 'string') throw httpError('Nom de service/département invalide', 400);
  const cleaned = normalizeName(name || '');
  if (cleaned.length < 2) throw httpError('Nom de service/département requis (min. 2 caractères)', 400);
  if (cleaned.length > 80) throw httpError('Nom trop long (max. 80 caractères)', 400);

  const result = await getDatabase()
    .from('departments')
    .insert({ id: randomUUID(), admin_id: adminId, name: cleaned })
    .select('id,admin_id,name,created_at')
    .single();
  throwOnDuplicate(result.error, 'Un service avec ce nom existe déjà');
  return mapDepartment(
    unwrapDatabaseResult('création du département', result) as DepartmentRow
  );
}

export async function updateDepartment(
  adminId: string,
  departmentId: string,
  name: string
): Promise<CompanyDepartment> {
  if (typeof name !== 'string') throw httpError('Nom de service/département invalide', 400);
  const cleaned = normalizeName(name || '');
  if (cleaned.length < 2) throw httpError('Nom de service/département requis (min. 2 caractères)', 400);
  if (cleaned.length > 80) throw httpError('Nom trop long (max. 80 caractères)', 400);

  const result = await getDatabase()
    .from('departments')
    .update({ name: cleaned })
    .eq('admin_id', adminId)
    .eq('id', departmentId)
    .select('id,admin_id,name,created_at')
    .maybeSingle();
  throwOnDuplicate(result.error, 'Un service avec ce nom existe déjà');
  const row = unwrapDatabaseResult('modification du département', result) as DepartmentRow | null;
  if (!row) throw httpError('Service introuvable', 404);
  return mapDepartment(row);
}

export async function deleteDepartment(adminId: string, departmentId: string): Promise<void> {
  const employees = await getDatabase()
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', adminId)
    .eq('department_id', departmentId);
  unwrapDatabaseResult('vérification des collaborateurs liés', employees);
  if ((employees.count ?? 0) > 0) {
    throw httpError('Impossible de supprimer : des collaborateurs sont encore rattachés à ce service', 409);
  }

  const result = await getDatabase()
    .from('departments')
    .delete()
    .eq('admin_id', adminId)
    .eq('id', departmentId)
    .select('id')
    .maybeSingle();
  if (result.error?.code === '23503') {
    throw httpError('Impossible de supprimer : des collaborateurs sont encore rattachés à ce service', 409);
  }
  const row = unwrapDatabaseResult('suppression du département', result);
  if (!row) throw httpError('Service introuvable', 404);
}

export async function listEmployees(
  adminId: string,
  departmentId?: string
): Promise<OrgEmployee[]> {
  let query = getDatabase()
    .from('employees')
    .select('id,admin_id,department_id,first_name,last_name,email,role,risk_score,created_at,updated_at')
    .eq('admin_id', adminId);
  if (departmentId) query = query.eq('department_id', departmentId);
  const result = await query;
  const rows = unwrapDatabaseResult('liste des collaborateurs', result) as EmployeeRow[];
  return rows.map(mapEmployee).sort((a, b) => {
    const lastName = a.lastName.localeCompare(b.lastName, 'fr');
    return lastName !== 0 ? lastName : a.firstName.localeCompare(b.firstName, 'fr');
  });
}

export async function getEmployee(adminId: string, employeeId: string): Promise<OrgEmployee | null> {
  const result = await getDatabase()
    .from('employees')
    .select('id,admin_id,department_id,first_name,last_name,email,role,risk_score,created_at,updated_at')
    .eq('admin_id', adminId)
    .eq('id', employeeId)
    .maybeSingle();
  const row = unwrapDatabaseResult('lecture du collaborateur', result) as EmployeeRow | null;
  return row ? mapEmployee(row) : null;
}

export async function countEmployees(adminId: string): Promise<number> {
  const result = await getDatabase()
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('admin_id', adminId);
  unwrapDatabaseResult('comptage des collaborateurs', result);
  return result.count ?? 0;
}

export async function createEmployee(
  adminId: string,
  companySize: CompanySize,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
    role?: string;
  }
): Promise<OrgEmployee> {
  const firstName = normalizeName(typeof input.firstName === 'string' ? input.firstName : '');
  const lastName = normalizeName(typeof input.lastName === 'string' ? input.lastName : '');
  const email = normalizeEmail(typeof input.email === 'string' ? input.email : '');
  const role = normalizeName(typeof input.role === 'string' ? input.role : 'Employé') || 'Employé';
  const departmentId = typeof input.departmentId === 'string' ? input.departmentId.trim() : '';
  if (!firstName || !lastName) throw httpError('Prénom et nom requis', 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError('Email invalide', 400);
  if (!departmentId) throw httpError('departmentId requis', 400);

  if (!(await getDepartment(adminId, departmentId))) {
    throw httpError('Service/département introuvable pour ce compte', 404);
  }
  const max = maxEmployeesForSize(companySize);
  if ((await countEmployees(adminId)) >= max) {
    throw httpError(`Limite atteinte : ${max} collaborateurs max pour la taille d'entreprise « ${companySize} »`, 403);
  }

  const result = await getDatabase()
    .from('employees')
    .insert({
      id: randomUUID(),
      admin_id: adminId,
      department_id: departmentId,
      first_name: firstName,
      last_name: lastName,
      email,
      role,
      risk_score: 50,
    })
    .select('id,admin_id,department_id,first_name,last_name,email,role,risk_score,created_at,updated_at')
    .single();
  throwOnDuplicate(result.error, 'Un collaborateur avec cet email existe déjà');
  return mapEmployee(unwrapDatabaseResult('création du collaborateur', result) as EmployeeRow);
}

export async function updateEmployee(
  adminId: string,
  employeeId: string,
  patch: {
    firstName?: string;
    lastName?: string;
    email?: string;
    departmentId?: string;
    role?: string;
    riskScore?: number;
  }
): Promise<OrgEmployee> {
  const current = await getEmployee(adminId, employeeId);
  if (!current) throw httpError('Collaborateur introuvable', 404);
  const update: Record<string, string | number> = { updated_at: new Date().toISOString() };

  if (patch.firstName !== undefined) {
    if (typeof patch.firstName !== 'string') throw httpError('Prénom invalide', 400);
    const value = normalizeName(patch.firstName);
    if (!value) throw httpError('Prénom invalide', 400);
    update.first_name = value;
  }
  if (patch.lastName !== undefined) {
    if (typeof patch.lastName !== 'string') throw httpError('Nom invalide', 400);
    const value = normalizeName(patch.lastName);
    if (!value) throw httpError('Nom invalide', 400);
    update.last_name = value;
  }
  if (patch.role !== undefined) {
    if (typeof patch.role !== 'string') throw httpError('Fonction invalide', 400);
    update.role = normalizeName(patch.role) || 'Employé';
  }
  if (patch.email !== undefined) {
    if (typeof patch.email !== 'string') throw httpError('Email invalide', 400);
    const email = normalizeEmail(patch.email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError('Email invalide', 400);
    update.email = email;
  }
  if (patch.departmentId !== undefined) {
    if (typeof patch.departmentId !== 'string') throw httpError('Département invalide', 400);
    if (!(await getDepartment(adminId, patch.departmentId))) {
      throw httpError('Service/département introuvable pour ce compte', 404);
    }
    update.department_id = patch.departmentId;
  }
  if (patch.riskScore !== undefined) {
    const score = Number(patch.riskScore);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw httpError('riskScore doit être entre 0 et 100', 400);
    }
    update.risk_score = Math.round(score);
  }

  const result = await getDatabase()
    .from('employees')
    .update(update)
    .eq('admin_id', adminId)
    .eq('id', employeeId)
    .select('id,admin_id,department_id,first_name,last_name,email,role,risk_score,created_at,updated_at')
    .single();
  throwOnDuplicate(result.error, 'Un collaborateur avec cet email existe déjà');
  return mapEmployee(unwrapDatabaseResult('modification du collaborateur', result) as EmployeeRow);
}

export async function deleteEmployee(adminId: string, employeeId: string): Promise<void> {
  const result = await getDatabase()
    .from('employees')
    .delete()
    .eq('admin_id', adminId)
    .eq('id', employeeId)
    .select('id')
    .maybeSingle();
  const row = unwrapDatabaseResult('suppression du collaborateur', result);
  if (!row) throw httpError('Collaborateur introuvable', 404);
}

export async function getOrgSummary(adminId: string, companySize: CompanySize) {
  const [departments, employeeCount] = await Promise.all([
    listDepartments(adminId),
    countEmployees(adminId),
  ]);
  const employees = await listEmployees(adminId);
  const maxEmployees = maxEmployeesForSize(companySize);

  return {
    companySize,
    maxEmployees,
    employeeCount,
    remainingSlots: Math.max(0, maxEmployees - employeeCount),
    departmentCount: departments.length,
    byDepartment: departments.map((department) => ({
      departmentId: department.id,
      name: department.name,
      employeeCount: employees.filter((employee) => employee.departmentId === department.id).length,
    })),
  };
}
