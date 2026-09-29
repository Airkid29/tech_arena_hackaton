import React, { useState } from 'react';
import { ShieldCheck, Lock, ArrowRight, User, Building2, Briefcase } from 'lucide-react';
import { vigiloAuthService } from '../../services/api';
import type { AdminPublic, CompanySize, VigiloService } from '../../types';

interface AdminLoginProps {
  onLogin: (admin: AdminPublic) => void;
  onBack: () => void;
}

const SERVICE_OPTIONS: VigiloService[] = [
  'Phishing',
  'Fake Invoice',
  'WhatsApp Phishing',
  'Smishing',
  'MFA Fatigue',
  'Social Engineering',
  'QR Code (Quishing)',
];

const SIZE_OPTIONS: CompanySize[] = ['1-10', '11-50', '51-100', '101-150', '150+'];

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onBack }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companySize, setCompanySize] = useState<CompanySize>('11-50');
  const [services, setServices] = useState<VigiloService[]>(['Phishing', 'WhatsApp Phishing']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleService = (s: VigiloService) => {
    setServices((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Indiquez un email valide');
      return;
    }
    if (!password || password.length < 8) {
      setError('Mot de passe : minimum 8 caractères');
      return;
    }
    if (mode === 'register') {
      if (!companyName.trim()) {
        setError("Nom d'entreprise requis");
        return;
      }
      if (services.length === 0) {
        setError('Sélectionnez au moins un module de simulation');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const admin = await vigiloAuthService.login(trimmedEmail, password);
        onLogin(admin);
      } else {
        const admin = await vigiloAuthService.register({
          email: trimmedEmail,
          password,
          companyName: companyName.trim(),
          companySize,
          services,
        });
        onLogin(admin);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4 relative overflow-hidden">
      <div className="absolute inset-0 vigilo-grid-pattern opacity-40 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] vigilo-orange-glow pointer-events-none" />

      <div className="relative w-full max-w-[480px] vigilo-card p-10 z-10">
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-8 flex items-center gap-2 cursor-pointer"
        >
          ← Retour au site public
        </button>

        <div className="flex flex-col mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#f2620a]/10 border border-[#f2620a]/20 flex items-center justify-center mb-5">
            <ShieldCheck className="w-6 h-6 text-[#f2620a]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight vigilo-glow-text mb-2">
            {mode === 'login' ? 'Espace Administration' : 'Créer un compte admin'}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            {mode === 'login'
              ? 'Connectez-vous pour lancer des tests ciblés et piloter Vigilo Coach.'
              : 'Inscrivez votre PME : taille, services, puis lancez des campagnes ciblées.'}
          </p>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 text-xs py-2 rounded-lg border cursor-pointer ${
              mode === 'login' ? 'border-[#f2620a] bg-[#f2620a]/10' : 'border-[var(--card-border)]'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 text-xs py-2 rounded-lg border cursor-pointer ${
              mode === 'register' ? 'border-[#f2620a] bg-[#f2620a]/10' : 'border-[var(--card-border)]'
            }`}
          >
            Inscription admin
          </button>
        </div>

        <form noValidate onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" /> Entreprise
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#f2620a]"
                  placeholder="Ex. Acme Conseil Lomé"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold">Taille de l&apos;entreprise</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value as CompanySize)}
                  className="w-full bg-[var(--background)] border border-[var(--card-border)] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#f2620a]"
                >
                  {SIZE_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s} salariés</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5" /> Services / tests ciblés
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleService(s)}
                      className={`text-[10px] px-2 py-1 rounded-md border cursor-pointer ${
                        services.includes(s)
                          ? 'border-[#f2620a] bg-[#f2620a]/15'
                          : 'border-[var(--card-border)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Email admin
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#f2620a]"
              placeholder="admin@votre-pme.tg"
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              className="w-full bg-[var(--background)] border border-[var(--card-border)] text-sm rounded-lg px-4 py-3 focus:outline-none focus:border-[#f2620a]"
              placeholder="Min. 8 caractères"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && (
            <div className="text-xs font-medium text-red-700 dark:text-red-400 text-center bg-red-100 dark:bg-red-950/20 py-2.5 rounded-lg border border-red-300 dark:border-red-900/30">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full vigilo-btn-orange py-3 px-4 flex items-center justify-center gap-2 mt-2 cursor-pointer shadow-lg disabled:opacity-60"
          >
            {loading ? 'Patientez…' : mode === 'login' ? 'Se connecter' : 'Créer mon espace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
