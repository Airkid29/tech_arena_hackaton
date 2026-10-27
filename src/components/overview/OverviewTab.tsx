import React from 'react';
import {
  Users,
  MousePointerClick,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Play,
  Zap,
} from 'lucide-react';
import { Campaign } from '../../types';

interface OverviewTabProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenEmployeeSimulator: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  campaigns,
  onSelectCampaign,
  onNavigate,
  onOpenCreateCampaign,
  onOpenEmployeeSimulator,
}) => {
  // Aggregate statistics across campaigns
  const measuredCampaigns = campaigns.filter((campaign) => campaign.status === 'terminée');
  const totalTargeted = measuredCampaigns.reduce((acc, c) => acc + c.targeted, 0);
  const totalClicked = measuredCampaigns.reduce((acc, c) => acc + c.clicked, 0);
  const totalReported = measuredCampaigns.reduce((acc, c) => acc + c.reported, 0);

  const avgClickRate = totalTargeted > 0 ? `${((totalClicked / totalTargeted) * 100).toFixed(1)}%` : '—';
  const avgReportRate = totalTargeted > 0 ? `${((totalReported / totalTargeted) * 100).toFixed(1)}%` : '—';

  const activeCampaign = campaigns.find((c) => c.status === 'en_cours');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Principle Banner — Premium Minimal Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8 shadow-sm">
        <div className="absolute top-0 right-0 w-96 h-96 vigilo-orange-glow rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
              <span>Principe VIGILO</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Cyber-résilience PME</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
              « Mesurez et renforcez la vigilance de votre équipe. »
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Préparez des exercices pédagogiques et testez-les dans le simulateur intégré. Les campagnes ne sont pas envoyées par email ou WhatsApp.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateCampaign}
              className="vigilo-btn-orange flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Créer une campagne</span>
            </button>
            <button
              onClick={onOpenEmployeeSimulator}
              className="vigilo-btn-secondary flex items-center gap-2 px-4 py-3 rounded-xl text-slate-200 font-semibold text-sm cursor-pointer"
            >
              <span>Ouvrir le simulateur</span>
            </button>
          </div>
        </div>

        {/* 5-step loop visualization */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Simuler', desc: 'Attaque contrôlée (Email / WhatsApp)' },
            { step: '02', title: 'Mesurer', desc: 'Comportements réels (Clics & Signalements)' },
            { step: '03', title: 'Analyser', desc: 'Diagnostic par le coach IA' },
            { step: '04', title: 'Former', desc: 'Micro-module de 2 minutes' },
            { step: '05', title: 'Re-tester', desc: 'Mesure de l évolution concrète' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#fb923c] font-bold">{item.step}</span>
                {idx < 4 && <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />}
              </div>
              <div className="font-bold text-white text-sm">{item.title}</div>
              <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="vigilo-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Collaborateurs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white font-mono">{totalTargeted}</div>
            <p className="text-xs text-slate-400 mt-1">Ciblés sur les campagnes terminées</p>
          </div>
        </div>

        <div className="vigilo-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Taux de Clic Moyen</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-400 font-mono">{avgClickRate}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Calculé à partir des campagnes terminées</span>
            </div>
          </div>
        </div>

        <div className="vigilo-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Taux de Signalement</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{avgReportRate}</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calculé à partir des campagnes terminées</span>
            </div>
          </div>
        </div>

        <div className="vigilo-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Score de Vigilance</span>
            <div className="w-8 h-8 rounded-xl bg-[#f2620a]/15 text-[#fb923c] flex items-center justify-center border border-[#f2620a]/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#fb923c] font-mono">— / 100</div>
            <p className="text-xs text-slate-400 mt-1">Aucun score sans données mesurées</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section: Active Campaign + AI Coach Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Campaign */}
        <div className="lg:col-span-2 vigilo-card p-6 space-y-6">
          {activeCampaign ? (
            <>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-xs font-mono text-[#fb923c]">Campagne en cours</span>
                  <h2 className="text-lg font-bold text-white">{activeCampaign.name}</h2>
                </div>
                <span className="text-xs font-mono text-emerald-400">En cours</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center py-2">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-xs text-slate-400 font-mono">Ciblés</div>
                  <div className="text-2xl font-bold text-white mt-1 font-mono">{activeCampaign.targeted}</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-xs text-slate-400 font-mono">Clics mesurés</div>
                  <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{activeCampaign.clicked} ({activeCampaign.clickRate}%)</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-xs text-slate-400 font-mono">Signalements mesurés</div>
                  <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{activeCampaign.reported} ({activeCampaign.reportRate}%)</div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => onSelectCampaign(activeCampaign.id)}
                  className="text-xs font-bold text-[#fb923c] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Voir le rapport détaillé</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onOpenEmployeeSimulator}
                  className="vigilo-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Tester l&apos;aperçu pédagogique
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-white">Aucune campagne en cours</h2>
              <p className="text-sm text-slate-400">
                Les nouveaux exercices restent des brouillons. Aucun email n&apos;est envoyé depuis cette plateforme.
              </p>
              <button
                onClick={onOpenCreateCampaign}
                className="vigilo-btn-orange px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                Créer un brouillon
              </button>
            </div>
          )}
        </div>

        {/* Right Col: AI Coach Snapshot */}
        <div className="vigilo-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Vigilo Coach </span>
            </div>
            <h3 className="text-base font-bold text-white">Recommandation Stratégique</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/10 p-4 rounded-xl">
              Aucune recommandation n&apos;est disponible sans résultats mesurés. Le coach IA ne doit pas inférer de vulnérabilités à partir de données fictives.
            </p>
          </div>

          <button
            onClick={() => onNavigate('ai-coach')}
            className="w-full vigilo-btn-orange py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Consulter le Coach IA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
