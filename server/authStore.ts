import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDatabase, unwrapDatabaseResult } from './database';
import { seedDemoDirectory } from './orgStore';

export type CompanySize = '1-10' | '11-50' | '51-100' | '101-150' | '150+';
export type VigiloService =
  | 'Phishing'
  | 'Fake Invoice'
  | 'WhatsApp Phishing'
  | 'Smishing'
  | 'MFA Fatigue'
  | 'Social Engineering'
  | 'QR Code (Quishing)';

export interface AdminPublic {
  id: string;
  email: string;
  companyName: string;
  companySize: CompanySize;
  services: VigiloService[];
  createdAt: string;
}

interface AdminRecord extends AdminPublic {
  passwordHash: string;
}

interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  company_name: string;
  company_size: CompanySize;
  services: VigiloService[];
  created_at: string;
}

const ADMIN_FIELDS = 'id,email,password_hash,company_name,company_size,services,created_at';
const ALLOWED_SIZES: CompanySize[] = ['1-10', '11-50', '51-100', '101-150', '150+'];
const ALLOWED_SERVICES: VigiloService[] = [
  'Phishing',
  'Fake Invoice',
  'WhatsApp Phishing',
  'Smishing',
  'MFA Fatigue',
  'Social Engineering',
  'QR Code (Quishing)',
];

function toRecord(row: AdminRow): AdminRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    companyName: row.company_name,
    companySize: row.company_size,
    services: row.services,
    createdAt: row.created_at,
  };
}

export function toPublic(admin: AdminRecord): AdminPublic {
  const { passwordHash: _passwordHash, ...publicAdmin } = admin;
  return publicAdmin;
}

function httpError(message: string, status: number): Error {
  return Object.assign(new Error(message), { status });
}

const memoryAdmins = new Map<string, AdminRecord>();

export async function registerAdmin(input: {
  email: string;
  password: string;
  companyName: string;
  companySize: CompanySize;
  services: VigiloService[];
}): Promise<AdminPublic> {
  if (typeof input.email !== 'string' || typeof input.password !== 'string') {
    throw httpError('Email et mot de passe invalides', 400);
  }
  if (typeof input.companyName !== 'string') {
    throw httpError("Nom d'entreprise invalide", 400);
  }
  if (!Array.isArray(input.services)) {
    throw httpError('Liste de modules invalide', 400);
  }
  const email = input.email.trim().toLowerCase();
  const companyName = input.companyName.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || input.password.length < 8) {
    throw httpError('Email valide et mot de passe de 8 caractères minimum requis', 400);
  }
  if (!companyName) throw httpError("Nom d'entreprise requis", 400);
  if (!ALLOWED_SIZES.includes(input.companySize)) {
    throw httpError("Taille d'entreprise invalide", 400);
  }
  if (!input.services.length || input.services.some((service) => !ALLOWED_SERVICES.includes(service))) {
    throw httpError('Sélectionnez au moins un module valide', 400);
  }

  const passwordHash = await bcrypt.hash(input.password, 12);

  try {
    const result = await getDatabase()
      .from('admins')
      .insert({
        id: randomUUID(),
        email,
        password_hash: passwordHash,
        company_name: companyName,
        company_size: input.companySize,
        services: input.services,
      })
      .select(ADMIN_FIELDS)
      .single();

    if (result.error?.code === '23505') {
      throw httpError('Un compte existe déjà avec cet email', 409);
    }
    const row = unwrapDatabaseResult('création du compte', result) as AdminRow;
    const record = toRecord(row);
    memoryAdmins.set(record.id, record);
    memoryAdmins.set(`email:${record.email}`, record);
    await seedDemoDirectory(row.id).catch((err) => console.error('[Auth] Erreur seed demo:', err));
    return toPublic(record);
  } catch (error) {
    if (error && typeof error === 'object' && 'status' in error && (error as { status: number }).status === 409) {
      throw error;
    }
    console.warn('[Auth] Supabase indisponible pour registerAdmin, bascule sur mémoire sécurisée:', error);
    if (memoryAdmins.has(`email:${email}`)) {
      throw httpError('Un compte existe déjà avec cet email', 409);
    }
    const id = randomUUID();
    const record: AdminRecord = {
      id,
      email,
      passwordHash,
      companyName,
      companySize: input.companySize,
      services: input.services,
      createdAt: new Date().toISOString(),
    };
    memoryAdmins.set(id, record);
    memoryAdmins.set(`email:${email}`, record);
    await seedDemoDirectory(id).catch(() => {});
    return toPublic(record);
  }
}

export async function verifyLogin(emailInput: string, password: string): Promise<AdminPublic | null> {
  if (typeof emailInput !== 'string' || typeof password !== 'string') {
    throw httpError('Email et mot de passe invalides', 400);
  }
  const email = emailInput.trim().toLowerCase();

  try {
    const result = await getDatabase()
      .from('admins')
      .select(ADMIN_FIELDS)
      .eq('email', email)
      .maybeSingle();
    const row = unwrapDatabaseResult('recherche du compte', result) as AdminRow | null;
    if (row) {
      const admin = toRecord(row);
      memoryAdmins.set(admin.id, admin);
      memoryAdmins.set(`email:${admin.email}`, admin);
      const valid = await bcrypt.compare(password, admin.passwordHash);
      return valid ? toPublic(admin) : null;
    }
  } catch (error) {
    console.warn('[Auth] Supabase inaccessible pour verifyLogin, consultation du cache mémoire:', error);
  }

  const mem = memoryAdmins.get(`email:${email}`);
  if (mem) {
    const valid = await bcrypt.compare(password, mem.passwordHash);
    return valid ? toPublic(mem) : null;
  }
  return null;
}

export async function findAdminById(id: string): Promise<AdminPublic | null> {
  try {
    const result = await getDatabase()
      .from('admins')
      .select(ADMIN_FIELDS)
      .eq('id', id)
      .maybeSingle();
    const row = unwrapDatabaseResult('lecture du compte', result) as AdminRow | null;
    if (row) {
      const admin = toRecord(row);
      memoryAdmins.set(admin.id, admin);
      return toPublic(admin);
    }
  } catch (error) {
    console.warn('[Auth] Supabase inaccessible pour findAdminById, consultation mémoire:', error);
  }

  const mem = memoryAdmins.get(id);
  return mem ? toPublic(mem) : null;
}
