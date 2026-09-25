import React, { useState } from 'react';
import {
  Settings,
  Server,
  Building2,
  Shield,
  CheckCircle2,
  Key,
  Globe,
  Sliders,
  AlertCircle,
  Eye,
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

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Paramètres de la plateforme VIGILO</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configurez le moteur de simulation, l'environnement de l'entreprise et les politiques d'exercice.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Simulation Provider selection (Mock vs Gophish per specs) */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Moteur de simulation (Simulation Engine)</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Opérationnel
            </span>
          </div>

          <p className="text-slate-400 text-xs">
            Choisissez entre le <strong>Mock Simulation Provider</strong> (idéal pour la démonstration immédiate et le test du parcours collaborateur) et le <strong>Gophish Provider</strong> (intégration autorisée d'un serveur d'envoi réel).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setProvider('mock')}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                provider === 'mock'
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Mock Simulation Provider</span>
                {provider === 'mock' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Recommandé pour la démonstration sans dépendance externe. Simule la boîte de messagerie, les clics et le plugin de signalement.
              </p>
            </div>

            <div
              onClick={() => setProvider('gophish')}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                provider === 'gophish'
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Gophish API Provider</span>
                {provider === 'gophish' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Connecteur API officiel pour serveur Gophish d'entreprise (contexte autorisé uniquement).
              </p>
            </div>
          </div>

          {/* Gophish settings if active */}
          {provider === 'gophish' && (
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3 pt-3 animate-in fade-in">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL du serveur Gophish</label>
                <input
                  type="text"
                  value={gophishUrl}
                  onChange={(e) => setGophishUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Clé API Gophish (Admin Token)</label>
                <input
                  type="password"
                  value={gophishApiKey}
                  onChange={(e) => setGophishApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Company Settings */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Organisation PME cible</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nom de l'entreprise</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Domaine de messagerie officiel</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI & Security Policy Notice */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Architecture sécurisée RodiumAI</span>
          </div>

          <p className="text-slate-400 leading-relaxed text-xs">
            Conformément aux spécifications de sécurité VIGILO, les clés d'API (RodiumAI / Gemini) sont gérées exclusivement côté serveur via les variables d'environnement (<code>process.env.GEMINI_API_KEY</code>). Aucune clé secrète n'est exposée au navigateur.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Serveur proxy backend actif · User-Agent aistudio-build vérifié</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedNotification ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paramètres enregistrés avec succès.</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-900/40 cursor-pointer transition-all"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};
