/**
 * Admin auth store (data/admins.json).
 *
 * Naming clarification (FR product language):
 * - `services: VigiloService[]` = modules de simulation / scénarios phishing
 *   choisis à l'inscription (Phishing, Fake Invoice, WhatsApp…).
 *   Ce NE sont PAS les services/départements de l'entreprise (RH, Comptabilité…).
 * - Les départements entreprise + collaborateurs vivent dans orgStore (data/org.json).
 *
 * Migration: existing admins.json entries with services=[...] remain valid —
 * no schema change; company departments start empty and are created via /api/org/*.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '..', 'data');
const STORE_PATH = path.join(DATA_DIR, 'admins.json');

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

export interface AdminRecord extends AdminPublic {
  passwordHash: string;
}

interface StoreFile {
  admins: AdminRecord[];
}

function ensureStore(): StoreFile {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) {
    const empty: StoreFile = { admins: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2), 'utf8');
    return empty;
  }
  return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8')) as StoreFile;
}

function saveStore(store: StoreFile): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
}

export function toPublic(admin: AdminRecord): AdminPublic {
  const { passwordHash: _, ...pub } = admin;
  return pub;
}

export async function registerAdmin(input: {
  email: string;
  password: string;
  companyName: string;
  companySize: CompanySize;
  services: VigiloService[];
}): Promise<AdminPublic> {
  const email = input.email.trim().toLowerCase();
  if (!email || !input.password || input.password.length < 8) {
    throw Object.assign(new Error('Email et mot de passe (min. 8) requis'), { status: 400 });
  }
  if (!input.companyName?.trim()) {
    throw Object.assign(new Error("Nom d'entreprise requis"), { status: 400 });
  }
  if (!input.services?.length) {
    throw Object.assign(new Error('Sélectionnez au moins un module de simulation (phishing)'), { status: 400 });
  }
  const allowedSizes: CompanySize[] = ['1-10', '11-50', '51-100', '101-150', '150+'];
  if (!allowedSizes.includes(input.companySize)) {
    throw Object.assign(new Error('Taille d\'entreprise invalide'), { status: 400 });
  }

  const store = ensureStore();
  if (store.admins.some((a) => a.email === email)) {
    throw Object.assign(new Error('Un compte existe déjà avec cet email'), { status: 409 });
  }

  const passwordHash = await bcrypt.hash(input.password, 12);
  const record: AdminRecord = {
    id: randomUUID(),
    email,
    passwordHash,
    companyName: input.companyName.trim(),
    companySize: input.companySize,
    services: input.services,
    createdAt: new Date().toISOString(),
  };
  store.admins.push(record);
  saveStore(store);
  return toPublic(record);
}

export async function verifyLogin(email: string, password: string): Promise<AdminPublic | null> {
  const store = ensureStore();
  const admin = store.admins.find((a) => a.email === email.trim().toLowerCase());
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  return ok ? toPublic(admin) : null;
}

export function findAdminById(id: string): AdminPublic | null {
  const store = ensureStore();
  const admin = store.admins.find((a) => a.id === id);
  return admin ? toPublic(admin) : null;
}
