import React, { useState } from 'react';
import {
  Settings,
  Server,
  Building2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { SimulationProviderSettings } from '../../types';

interface SettingsViewProps {
  settings: SimulationProviderSettings;
  onUpdateSettings: (newSettings: SimulationProviderSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [provider, setProvider] = useState<'mock' | 'gophish'>(settings.provider);
  const [gophishUrl, setGophishUrl] = useState(settings.gophishUrl);
  const [gophishApiKey, setGophishApiKey] = useState(settings.gophishApiKey);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyDomain, setCompanyDomain] = useState(settings.companyDomain);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      provider,
      gophishUrl,
      gophishApiKey,
      companyName,
      companyDomain,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const cardClass = 'p-4 sm:p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card)] space-y-4 shadow-sm';

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto pb-8">
      <div>
        <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[var(--primary)] shrink-0" />
          <span>Paramètres de la plateforme VIGILO</span>
        </h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-2 leading-relaxed">
          Configurez le moteur de simulation, l&apos;identité de votre PME et les options d&apos;exercice cyber.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6 text-sm">
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--primary)]" />
              Moteur de simulation
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 w-fit">
              Opérationnel
            </span>
          </div>

          <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
            <strong className="text-[var(--foreground)]">Mock</strong> : démo et parcours collaborateur sans serveur externe.{' '}
            <strong className="text-[var(--foreground)]">Gophish</strong> : envoi réel via votre instance autorisée.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProvider('mock')}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer ${
                provider === 'mock'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                  : 'border-[var(--card-border)] bg-[var(--surface-inset)] hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--foreground)]">Mock Provider</span>
                {provider === 'mock' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />}
              </div>
              <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
                Recommandé hackathon / pilote. Simule inbox, clics et signalements.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setProvider('gophish')}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer ${
                provider === 'gophish'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                  : 'border-[var(--card-border)] bg-[var(--surface-inset)] hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--foreground)]">Gophish API</span>
                {provider === 'gophish' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />}
              </div>
              <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
                Connexion à un serveur Gophish d&apos;entreprise (contexte autorisé).
              </p>
            </button>
          </div>

          {provider === 'gophish' && (
            <div className="p-4 rounded-lg vigilo-inset space-y-3 animate-in fade-in">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">URL du serveur Gophish</label>
                <input
                  type="url"
                  value={gophishUrl}
                  onChange={(e) => setGophishUrl(e.target.value)}
                  className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
                  placeholder="https://gophish.votre-entreprise.tg"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Clé API (Admin Token)</label>
                <input
                  type="password"
                  value={gophishApiKey}
                  onChange={(e) => setGophishApiKey(e.target.value)}
                  className="vigilo-input w-full px-3 py-2 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          )}
        </div>

        <div className={cardClass}>
          <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[var(--primary)]" />
            Organisation PME
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Nom de l&apos;entreprise</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Domaine email officiel</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder="entreprise.tg"
              />
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="flex items-center gap-2 text-[var(--foreground)] font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Sécurité RodiumAI / Gemini
          </div>
          <p className="text-[var(--muted-foreground)] leading-relaxed text-sm">
            Les clés API sont stockées côté serveur (<code className="text-xs bg-[var(--muted)] px-1 py-0.5 rounded">GEMINI_API_KEY</code>,{' '}
            <code className="text-xs bg-[var(--muted)] px-1 py-0.5 rounded">RODIUM_API_KEY</code>). Aucun secret n&apos;est exposé au navigateur.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Proxy backend actif</span>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          {savedNotification ? (
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Paramètres enregistrés.
            </span>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="submit"
            className="vigilo-btn-orange w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm text-white cursor-pointer"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};
