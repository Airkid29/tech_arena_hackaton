/**
 * Organisation tenant-scoped store (company departments + employees).
 *
 * IMPORTANT naming:
 * - AdminPublic.services (VigiloService[]) = preferred phishing / simulation MODULES
 *   chosen at registration (Phishing, Fake Invoice, …). NOT company departments.
 * - CompanyDepartment below = real org units (RH, Comptabilité, Achats, DAO…).
 *
 * Persistence: data/org.json (gitignored via data/*).
 * All reads/writes MUST be filtered by adminId from the authenticated session.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import type { CompanySize } from './authStore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'org.json');

/** Maps registration companySize → hard max employees for this tenant. */
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

interface OrgStoreFile {
  departments: CompanyDepartment[];
  employees: OrgEmployee[];
}

function ensureStore(): OrgStoreFile {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const empty: OrgStoreFile = { departments: [], employees: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2), 'utf8');
    return empty;
  }
  const raw = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as Partial<OrgStoreFile>;
  return {
    departments: Array.isArray(raw.departments) ? raw.departments : [],
    employees: Array.isArray(raw.employees) ? raw.employees : [],
  };
}

function saveStore(store: OrgStoreFile): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
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

// ─── Departments (company org units) ─────────────────────────────────────────

export function listDepartments(adminId: string): CompanyDepartment[] {
  const store = ensureStore();
  return store.departments
    .filter((d) => d.adminId === adminId)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}

export function getDepartment(adminId: string, departmentId: string): CompanyDepartment | null {
  const store = ensureStore();
  return store.departments.find((d) => d.id === departmentId && d.adminId === adminId) || null;
}

export function createDepartment(adminId: string, name: string): CompanyDepartment {
  const cleaned = normalizeName(name);
  if (!cleaned || cleaned.length < 2) {
    throw httpError('Nom de service/département requis (min. 2 caractères)', 400);
  }
  if (cleaned.length > 80) {
    throw httpError('Nom trop long (max. 80 caractères)', 400);
  }

  const store = ensureStore();
  const dup = store.departments.find(
    (d) => d.adminId === adminId && d.name.toLowerCase() === cleaned.toLowerCase()
  );
  if (dup) throw httpError('Un service avec ce nom existe déjà', 409);

  const dept: CompanyDepartment = {
    id: randomUUID(),
    adminId,
    name: cleaned,
    createdAt: new Date().toISOString(),
  };
  store.departments.push(dept);
  saveStore(store);
  return dept;
}

export function updateDepartment(
  adminId: string,
  departmentId: string,
  name: string
): CompanyDepartment {
  const cleaned = normalizeName(name);
  if (!cleaned || cleaned.length < 2) {
    throw httpError('Nom de service/département requis (min. 2 caractères)', 400);
  }
  if (cleaned.length > 80) {
    throw httpError('Nom trop long (max. 80 caractères)', 400);
  }

  const store = ensureStore();
  const idx = store.departments.findIndex((d) => d.id === departmentId && d.adminId === adminId);
  if (idx < 0) throw httpError('Service introuvable', 404);

  const dup = store.departments.find(
    (d) =>
      d.adminId === adminId &&
      d.id !== departmentId &&
      d.name.toLowerCase() === cleaned.toLowerCase()
  );
  if (dup) throw httpError('Un service avec ce nom existe déjà', 409);

  store.departments[idx] = { ...store.departments[idx], name: cleaned };
  saveStore(store);
  return store.departments[idx];
}

/** Deletes department only if no employees remain attached (tenant-scoped). */
export function deleteDepartment(adminId: string, departmentId: string): void {
  const store = ensureStore();
  const idx = store.departments.findIndex((d) => d.id === departmentId && d.adminId === adminId);
  if (idx < 0) throw httpError('Service introuvable', 404);

  const attached = store.employees.some(
    (e) => e.adminId === adminId && e.departmentId === departmentId
  );
  if (attached) {
    throw httpError(
      'Impossible de supprimer : des collaborateurs sont encore rattachés à ce service',
      409
    );
  }

  store.departments.splice(idx, 1);
  saveStore(store);
}

// ─── Employees ───────────────────────────────────────────────────────────────

export function listEmployees(
  adminId: string,
  departmentId?: string
): OrgEmployee[] {
  const store = ensureStore();
  return store.employees
    .filter((e) => {
      if (e.adminId !== adminId) return false;
      if (departmentId && e.departmentId !== departmentId) return false;
      return true;
    })
    .sort((a, b) => {
      const ln = a.lastName.localeCompare(b.lastName, 'fr');
      return ln !== 0 ? ln : a.firstName.localeCompare(b.firstName, 'fr');
    });
}

export function getEmployee(adminId: string, employeeId: string): OrgEmployee | null {
  const store = ensureStore();
  return store.employees.find((e) => e.id === employeeId && e.adminId === adminId) || null;
}

export function countEmployees(adminId: string): number {
  const store = ensureStore();
  return store.employees.filter((e) => e.adminId === adminId).length;
}

export function createEmployee(
  adminId: string,
  companySize: CompanySize,
  input: {
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
    role?: string;
  }
): OrgEmployee {
  const firstName = normalizeName(input.firstName || '');
  const lastName = normalizeName(input.lastName || '');
  const email = normalizeEmail(input.email || '');
  const role = normalizeName(input.role || 'Employé') || 'Employé';
  const departmentId = (input.departmentId || '').trim();

  if (!firstName || !lastName) throw httpError('Prénom et nom requis', 400);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError('Email invalide', 400);
  }
  if (!departmentId) throw httpError('departmentId requis', 400);

  const store = ensureStore();

  const dept = store.departments.find((d) => d.id === departmentId && d.adminId === adminId);
  if (!dept) throw httpError('Service/département introuvable pour ce compte', 404);

  const max = maxEmployeesForSize(companySize);
  const current = store.employees.filter((e) => e.adminId === adminId).length;
  if (current >= max) {
    throw httpError(
      `Limite atteinte : ${max} collaborateurs max pour la taille d'entreprise « ${companySize} »`,
      403
    );
  }

  const emailTaken = store.employees.some(
    (e) => e.adminId === adminId && e.email === email
  );
  if (emailTaken) throw httpError('Un collaborateur avec cet email existe déjà', 409);

  const now = new Date().toISOString();
  const emp: OrgEmployee = {
    id: randomUUID(),
    adminId,
    departmentId,
    firstName,
    lastName,
    email,
    role,
    riskScore: 50,
    createdAt: now,
    updatedAt: now,
  };
  store.employees.push(emp);
  saveStore(store);
  return emp;
}

export function updateEmployee(
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
): OrgEmployee {
  const store = ensureStore();
  const idx = store.employees.findIndex((e) => e.id === employeeId && e.adminId === adminId);
  if (idx < 0) throw httpError('Collaborateur introuvable', 404);

  const current = store.employees[idx];
  const next = { ...current };

  if (patch.firstName !== undefined) {
    const v = normalizeName(patch.firstName);
    if (!v) throw httpError('Prénom invalide', 400);
    next.firstName = v;
  }
  if (patch.lastName !== undefined) {
    const v = normalizeName(patch.lastName);
    if (!v) throw httpError('Nom invalide', 400);
    next.lastName = v;
  }
  if (patch.role !== undefined) {
    next.role = normalizeName(patch.role) || 'Employé';
  }
  if (patch.email !== undefined) {
    const email = normalizeEmail(patch.email);
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw httpError('Email invalide', 400);
    }
    const taken = store.employees.some(
      (e) => e.adminId === adminId && e.id !== employeeId && e.email === email
    );
    if (taken) throw httpError('Un collaborateur avec cet email existe déjà', 409);
    next.email = email;
  }
  if (patch.departmentId !== undefined) {
    const dept = store.departments.find(
      (d) => d.id === patch.departmentId && d.adminId === adminId
    );
    if (!dept) throw httpError('Service/département introuvable pour ce compte', 404);
    next.departmentId = patch.departmentId;
  }
  if (patch.riskScore !== undefined) {
    const score = Number(patch.riskScore);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      throw httpError('riskScore doit être entre 0 et 100', 400);
    }
    next.riskScore = Math.round(score);
  }

  next.updatedAt = new Date().toISOString();
  store.employees[idx] = next;
  saveStore(store);
  return next;
}

export function deleteEmployee(adminId: string, employeeId: string): void {
  const store = ensureStore();
  const idx = store.employees.findIndex((e) => e.id === employeeId && e.adminId === adminId);
  if (idx < 0) throw httpError('Collaborateur introuvable', 404);
  store.employees.splice(idx, 1);
  saveStore(store);
}

export function getOrgSummary(adminId: string, companySize: CompanySize) {
  const store = ensureStore();
  const departments = store.departments.filter((d) => d.adminId === adminId);
  const employees = store.employees.filter((e) => e.adminId === adminId);
  const maxEmployees = maxEmployeesForSize(companySize);

  const byDepartment = departments.map((d) => ({
    departmentId: d.id,
    name: d.name,
    employeeCount: employees.filter((e) => e.departmentId === d.id).length,
  }));

  return {
    companySize,
    maxEmployees,
    employeeCount: employees.length,
    remainingSlots: Math.max(0, maxEmployees - employees.length),
    departmentCount: departments.length,
    byDepartment,
  };
}
