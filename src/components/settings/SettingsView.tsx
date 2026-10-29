import React, { useEffect, useState } from 'react';
import {
  Settings,
  Server,
  Building2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { GophishCampaignSummary, SimulationProviderSettings } from '../../types';
import { vigiloGophishService } from '../../services/api';

interface SettingsViewProps {
  settings: SimulationProviderSettings;
  isProfileLoading: boolean;
  onUpdateSettings: (newSettings: SimulationProviderSettings) => Promise<void> | void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  isProfileLoading,
  onUpdateSettings,
}) => {
  const [form, setForm] = useState(settings);
  const [savedNotification, setSavedNotification] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckingGophish, setIsCheckingGophish] = useState(false);
  const [gophishResult, setGophishResult] = useState<{
    configured: boolean;
    campaigns: GophishCampaignSummary[];
  } | null>(null);

  useEffect(() => setForm(settings), [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      await onUpdateSettings(form);
      setSavedNotification(true);
      window.setTimeout(() => setSavedNotification(false), 3000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Enregistrement impossible.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCheckGophish = async () => {
    setIsCheckingGophish(true);
    setErrorMessage('');
    try {
      setGophishResult(await vigiloGophishService.getCampaigns());
    } catch (error) {
      setGophishResult(null);
      setErrorMessage(error instanceof Error ? error.message : 'Connexion Gophish impossible.');
    } finally {
      setIsCheckingGophish(false);
    }
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

      {isProfileLoading && (
        <p role="status" className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 text-xs text-[var(--muted-foreground)]">
          Chargement du profil entreprise avant autorisation des modifications…
        </p>
      )}

      <form onSubmit={handleSave} className="space-y-5 sm:space-y-6 text-sm">
        <div className={cardClass}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-sm font-bold text-[var(--foreground)] flex items-center gap-2">
              <Server className="w-4 h-4 text-[var(--primary)]" />
              Moteur de simulation
            </h3>
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800 w-fit">
              {form.provider === 'mock' ? 'Démo locale' : 'Gophish · lecture seule'}
            </span>
          </div>

          <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
            <strong className="text-[var(--foreground)]">Mock</strong> : démo locale sans envoi externe.{' '}
            Les simulations locales restent pédagogiques. Gophish permet uniquement de consulter les campagnes et leurs indicateurs agrégés.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, provider: 'mock' }))}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer ${
                form.provider === 'mock'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                  : 'border-[var(--card-border)] bg-[var(--surface-inset)] hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--foreground)]">Mock Provider</span>
                {form.provider === 'mock' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />}
              </div>
              <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
                Aperçu interactif et événements simulés, sans envoi externe.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setForm((current) => ({ ...current, provider: 'gophish' }))}
              className={`p-4 rounded-xl border text-left transition-all space-y-2 cursor-pointer ${
                form.provider === 'gophish'
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/30'
                  : 'border-[var(--card-border)] bg-[var(--surface-inset)] hover:border-[var(--primary)]/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[var(--foreground)]">Gophish · lecture seule</span>
                {form.provider === 'gophish' && <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />}
              </div>
              <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
                Consulte les campagnes et des statistiques globales. La création, le lancement et l’envoi restent désactivés.
              </p>
            </button>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button type="button" onClick={handleCheckGophish} disabled={isCheckingGophish}
              className="vigilo-btn-secondary px-4 py-2 rounded-lg text-xs font-semibold disabled:opacity-50">
              {isCheckingGophish ? 'Vérification…' : 'Vérifier la connexion Gophish'}
            </button>
            <span className="text-xs text-[var(--muted-foreground)]">
              URL, clé API et compte autorisé configurés uniquement côté serveur.
            </span>
          </div>
          {gophishResult && (
            <div className="rounded-lg border border-[var(--card-border)] p-3 space-y-2">
              <p className="text-xs font-semibold text-[var(--foreground)]">
                {gophishResult.configured
                  ? `${gophishResult.campaigns.length} campagne(s) disponibles en lecture seule`
                  : 'Gophish n’est pas configuré côté serveur.'}
              </p>
              {gophishResult.campaigns.slice(0, 5).map((campaign) => (
                <div key={campaign.id} className="flex flex-wrap justify-between gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
                  <span className="font-medium text-[var(--foreground)]">{campaign.name} · {campaign.status}</span>
                  <span>Cibles {campaign.targeted} · Ouvertures {campaign.opened} · Clics {campaign.clicked} · Signalements {campaign.reported}</span>
                </div>
              ))}
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
                value={form.companyName}
                onChange={(e) => setForm((current) => ({ ...current, companyName: e.target.value }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
                maxLength={120}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Domaine email officiel</label>
              <input
                type="text"
                value={form.companyDomain}
                onChange={(e) => setForm((current) => ({ ...current, companyDomain: e.target.value }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder="entreprise.tg"
                maxLength={253}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Secteur d’activité</label>
              <input type="text" value={form.industry}
                onChange={(e) => setForm((current) => ({ ...current, industry: e.target.value }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm" maxLength={100}
                placeholder="Commerce, finance, santé…" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Pays</label>
              <input type="text" value={form.country}
                onChange={(e) => setForm((current) => ({ ...current, country: e.target.value }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm" maxLength={100} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Langue des scénarios et formations</label>
              <select value={form.preferredLanguage}
                onChange={(e) => setForm((current) => ({ ...current, preferredLanguage: e.target.value as 'fr' | 'en' }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm">
                <option value="fr">Français</option><option value="en">English</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Ton pédagogique</label>
              <select value={form.trainingTone}
                onChange={(e) => setForm((current) => ({ ...current, trainingTone: e.target.value as SimulationProviderSettings['trainingTone'] }))}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm">
                <option value="professionnel">Professionnel</option>
                <option value="accessible">Accessible</option>
                <option value="direct">Direct</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Couleur de marque</label>
              <div className="flex items-center gap-2">
                <input type="color" value={form.brandColor}
                  onChange={(e) => setForm((current) => ({ ...current, brandColor: e.target.value }))}
                  className="h-10 w-14 rounded border border-[var(--card-border)] bg-transparent" />
                <span className="font-mono text-xs text-[var(--muted-foreground)]">{form.brandColor}</span>
              </div>
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
          {errorMessage ? (
            <span role="alert" className="text-sm text-red-700 dark:text-red-300">{errorMessage}</span>
          ) : savedNotification ? (
            <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Paramètres enregistrés.
            </span>
          ) : (
            <span className="hidden sm:block" />
          )}
          <button
            type="submit"
            disabled={isSaving || isProfileLoading}
            className="vigilo-btn-orange w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-sm text-white cursor-pointer"
          >
            {isSaving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </div>
  );
};
