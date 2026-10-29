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

export interface CompanyProfile {
  provider: 'mock' | 'gophish';
  companyName: string;
  companyDomain: string;
  industry: string;
  country: string;
  preferredLanguage: 'fr' | 'en';
  trainingTone: 'professionnel' | 'accessible' | 'direct';
  brandColor: string;
}

interface CompanyProfileRow {
  simulation_provider: 'mock' | 'gophish' | null;
  company_name: string;
  company_domain: string | null;
  industry: string | null;
  country: string | null;
  preferred_language: 'fr' | 'en' | null;
  training_tone: 'professionnel' | 'accessible' | 'direct' | null;
  brand_color: string | null;
}

function mapCompanyProfile(row: CompanyProfileRow): CompanyProfile {
  return {
    provider: row.simulation_provider || 'mock',
    companyName: row.company_name,
    companyDomain: row.company_domain || '',
    industry: row.industry || '',
    country: row.country || 'Togo',
    preferredLanguage: row.preferred_language || 'fr',
    trainingTone: row.training_tone || 'professionnel',
    brandColor: row.brand_color || '#f97316',
  };
}

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

export async function getCompanyProfile(adminId: string): Promise<CompanyProfile> {
  const result = await getDatabase()
    .from('admins')
    .select('simulation_provider,company_name,company_domain,industry,country,preferred_language,training_tone,brand_color')
    .eq('id', adminId)
    .maybeSingle();
  const row = unwrapDatabaseResult('lecture du profil entreprise', result) as CompanyProfileRow | null;
  if (!row) throw httpError('Compte introuvable', 404);
  return mapCompanyProfile(row);
}

export async function updateCompanyProfile(
  adminId: string,
  input: Partial<CompanyProfile>
): Promise<CompanyProfile> {
  const companyName = typeof input.companyName === 'string' ? normalizeName(input.companyName) : '';
  const provider = input.provider;
  const companyDomain = typeof input.companyDomain === 'string'
    ? input.companyDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/+$/, '')
    : '';
  const industry = typeof input.industry === 'string' ? normalizeName(input.industry) : '';
  const country = typeof input.country === 'string' ? normalizeName(input.country) : '';
  const preferredLanguage = input.preferredLanguage;
  const trainingTone = input.trainingTone;
  const brandColor = input.brandColor;

  if (companyName.length < 2 || companyName.length > 120) {
    throw httpError('Le nom de l’entreprise doit contenir entre 2 et 120 caractères', 400);
  }
  if (provider !== 'mock' && provider !== 'gophish') {
    throw httpError('Moteur de simulation invalide', 400);
  }
  if (companyDomain && (
    companyDomain.length > 253 ||
    !/^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i.test(companyDomain)
  )) {
    throw httpError('Le domaine de l’entreprise est invalide', 400);
  }
  if (industry.length > 100 || country.length < 2 || country.length > 100) {
    throw httpError('Secteur ou pays invalide', 400);
  }
  if (preferredLanguage !== 'fr' && preferredLanguage !== 'en') {
    throw httpError('Langue de formation invalide', 400);
  }
  if (!['professionnel', 'accessible', 'direct'].includes(String(trainingTone))) {
    throw httpError('Ton de formation invalide', 400);
  }
  if (typeof brandColor !== 'string' || !/^#[0-9a-f]{6}$/i.test(brandColor)) {
    throw httpError('La couleur de marque doit être un code hexadécimal valide', 400);
  }

  const result = await getDatabase()
    .from('admins')
    .update({
      simulation_provider: provider,
      company_name: companyName,
      company_domain: companyDomain || null,
      industry: industry || null,
      country,
      preferred_language: preferredLanguage,
      training_tone: trainingTone,
      brand_color: brandColor.toLowerCase(),
    })
    .eq('id', adminId)
    .select('simulation_provider,company_name,company_domain,industry,country,preferred_language,training_tone,brand_color')
    .maybeSingle();
  const row = unwrapDatabaseResult('mise à jour du profil entreprise', result) as CompanyProfileRow | null;
  if (!row) throw httpError('Compte introuvable', 404);
  return mapCompanyProfile(row);
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

export async function seedDemoDirectory(adminId: string): Promise<{ departmentsCount: number; employeesCount: number }> {
  const database = getDatabase();
  const existingCount = await countEmployees(adminId);
  if (existingCount > 0) {
    return { departmentsCount: 0, employeesCount: existingCount };
  }

  const depts = [
    'Direction & Finance',
    'Ressources Humaines',
    'Technique & DevOps',
    'Commercial & Ventes',
  ];
  const createdDepts = new Map<string, string>();

  for (const name of depts) {
    const id = randomUUID();
    await database.from('departments').insert({
      id,
      admin_id: adminId,
      name,
    });
    createdDepts.set(name, id);
  }

  const demoEmployees = [
    { firstName: 'Koffi', lastName: 'Mensah', email: 'koffi.mensah@demo-ancytogo.tg', role: 'Directeur Général', dept: 'Direction & Finance', risk: 45 },
    { firstName: 'Afiwa', lastName: 'Lawson', email: 'afiwa.lawson@demo-ancytogo.tg', role: 'Responsable RH', dept: 'Ressources Humaines', risk: 65 },
    { firstName: 'Kodjo', lastName: 'Agbeko', email: 'kodjo.agbeko@demo-ancytogo.tg', role: 'Développeur Cloud', dept: 'Technique & DevOps', risk: 20 },
    { firstName: 'Akossiwa', lastName: 'Amegan', email: 'akossiwa.amegan@demo-ancytogo.tg', role: 'Chargée de Clientèle', dept: 'Commercial & Ventes', risk: 75 },
    { firstName: 'Komi', lastName: 'Dosseh', email: 'komi.dosseh@demo-ancytogo.tg', role: 'Comptable', dept: 'Direction & Finance', risk: 55 },
    { firstName: 'Edem', lastName: 'Tossou', email: 'edem.tossou@demo-ancytogo.tg', role: 'Administrateur Systèmes', dept: 'Technique & DevOps', risk: 25 },
  ];

  for (const emp of demoEmployees) {
    await database.from('employees').insert({
      id: randomUUID(),
      admin_id: adminId,
      department_id: createdDepts.get(emp.dept) || Array.from(createdDepts.values())[0],
      first_name: emp.firstName,
      last_name: emp.lastName,
      email: emp.email,
      role: emp.role,
      risk_score: emp.risk,
    });
  }

  return { departmentsCount: depts.length, employeesCount: demoEmployees.length };
}

