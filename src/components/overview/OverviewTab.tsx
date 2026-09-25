import React from 'react';
import {
  Users,
  MousePointerClick,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { Campaign, ReTestRecord } from '../../types';

interface OverviewTabProps {
  campaigns: Campaign[];
  retestRecord: ReTestRecord;
  onSelectCampaign: (campaignId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenEmployeeSimulator: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  campaigns,
  retestRecord,
  onSelectCampaign,
  onNavigate,
  onOpenCreateCampaign,
  onOpenEmployeeSimulator,
}) => {
  // Aggregate statistics across campaigns
  const totalTargeted = campaigns.reduce((acc, c) => acc + c.targeted, 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + c.clicked, 0);
  const totalReported = campaigns.reduce((acc, c) => acc + c.reported, 0);

  const avgClickRate = totalTargeted > 0 ? ((totalClicked / totalTargeted) * 100).toFixed(1) : '0';
  const avgReportRate = totalTargeted > 0 ? ((totalReported / totalTargeted) * 100).toFixed(1) : '0';

  const activeCampaign = campaigns.find((c) => c.status === 'en_cours') || campaigns[0];
  const lastFinishedCampaign = campaigns.find((c) => c.status === 'terminée' && c.aiAnalysis);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Principle Banner: Simuler → Mesurer → Analyser → Former → Re-tester */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-gradient-to-r from-[#0d1527] via-[#090e1a] to-[#0d1722] p-6 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase tracking-wider">
              <span>Principe VIGILO</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Cyber-résilience PME</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              « Mesurez et renforcez la vigilance de votre équipe. »
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Testez concrètement vos collaborateurs face aux cybermenaces réelles plutôt que de vous limiter à des formations théoriques.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateCampaign}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-md shadow-blue-900/40 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Créer une campagne</span>
            </button>
            <button
              onClick={onOpenEmployeeSimulator}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
            >
              <span>Tester en direct</span>
            </button>
          </div>
        </div>

        {/* 5-step loop visualization */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Simuler', desc: 'Attaque contrôlée (Email / WhatsApp)' },
            { step: '02', title: 'Mesurer', desc: 'Comportements réels (Clics & Signalements)' },
            { step: '03', title: 'Analyser', desc: 'Diagnostic par Vigilo Coach' },
            { step: '04', title: 'Former', desc: 'Micro-formation ciblée de 4 minutes' },
            { step: '05', title: 'Re-tester', desc: 'Mesure de l évolution concrète' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-500">{item.step}</span>
                {idx < 4 && <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />}
              </div>
              <div className="font-medium text-slate-200 text-sm">{item.title}</div>
              <div className="text-[11px] text-slate-400 leading-tight">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Cards — Minimalist & High Contrast */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Ciblés */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Collaborateurs ciblés</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-white">{totalTargeted}</span>
            <span className="text-xs text-slate-400">sur 3 campagnes</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% de délivrabilité active</span>
          </div>
        </div>

        {/* Metric 2: Click Rate (Piégés) */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de clic moyen</span>
            <MousePointerClick className="w-4 h-4 text-red-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-red-400">{avgClickRate}%</span>
            <span className="text-xs text-slate-400">({totalClicked} clics)</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">-75%</span>
            <span>après formation re-test</span>
          </div>
        </div>

        {/* Metric 3: Report Rate (Signalements vertueux) */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Taux de signalement</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-emerald-400">{avgReportRate}%</span>
            <span className="text-xs text-slate-400">({totalReported} signalés)</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">+37.7%</span>
            <span>réflexe de signalement</span>
          </div>
        </div>

        {/* Metric 4: Cyber-Vigilance Score */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Score de résilience</span>
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-blue-400">89</span>
            <span className="text-xs text-slate-400">/ 100 (Bon niveau)</span>
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-800/60">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
            <span>Risque humain maîtrisé</span>
          </div>
        </div>
      </div>

      {/* Two columns: Active Campaign & AI Coach Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Active / Priority Campaign */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Campagne active en cours
              </span>
              <span className="text-xs font-mono text-slate-400">
                {activeCampaign.category} · {activeCampaign.difficulty}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">{activeCampaign.name}</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {activeCampaign.description}
              </p>
            </div>

            {/* Campaign numbers per specification */}
            <div className="grid grid-cols-5 gap-2 pt-2 text-center">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Ciblés</div>
                <div className="text-lg font-mono font-bold text-white">{activeCampaign.targeted}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Délivrés</div>
                <div className="text-lg font-mono font-bold text-slate-200">{activeCampaign.delivered}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-slate-400">Ouverts</div>
                <div className="text-lg font-mono font-bold text-slate-200">{activeCampaign.opened}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-red-400">Clics</div>
                <div className="text-lg font-mono font-bold text-red-400">{activeCampaign.clicked}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <div className="text-xs text-emerald-400">Signalés</div>
                <div className="text-lg font-mono font-bold text-emerald-400">{activeCampaign.reported}</div>
              </div>
            </div>

            {/* Ratios */}
            <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-slate-900/50 border border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <span>Taux de clic :</span>
                <strong className="text-red-400 font-mono text-sm">{activeCampaign.clickRate}%</strong>
              </div>
              <span className="text-slate-600">·</span>
              <div className="flex items-center gap-2">
                <span>Taux de signalement :</span>
                <strong className="text-emerald-400 font-mono text-sm">{activeCampaign.reportRate}%</strong>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onSelectCampaign(activeCampaign.id)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Consulter les résultats détaillés</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenEmployeeSimulator}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
            >
              Simuler l email
            </button>
          </div>
        </div>

        {/* Right: AI Cyber Coach RodiumAI Insight */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                AI Cyber Coach — RodiumAI
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Analyse comportementale
              </span>
            </div>

            {lastFinishedCampaign?.aiAnalysis ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="text-xs font-medium text-slate-300">Facteur de vulnérabilité identifié :</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {lastFinishedCampaign.aiAnalysis.vulnerabilityFactor}
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-900/50">
                  <div className="text-xs font-medium text-blue-300">Recommandation & Formation adaptée :</div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {lastFinishedCampaign.aiAnalysis.trainingAdvice}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Lancez une analyse IA sur vos résultats de campagne pour identifier les biais cognitifs et générer la formation sur-mesure.
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigate('ai-coach')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <span>Accéder à l espace RodiumAI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('training')}
              className="text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded bg-slate-800 border border-slate-700 cursor-pointer"
            >
              Voir la micro-formation (4 min)
            </button>
          </div>
        </div>
      </div>

      {/* Progression & Re-test showcase */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
              Évolution concrète Avant / Après Formation
            </span>
            <h3 className="text-lg font-bold text-white mt-1">
              Impact mesuré sur la cohorte {retestRecord.targetCohort}
            </h3>
          </div>
          <button
            onClick={() => onNavigate('retest')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Détail complet du Re-test</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Avant formation (Test initial)</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-red-400">
                {retestRecord.baselineCampaign.clickRate}%
              </span>
              <span className="text-xs text-slate-400">de clics ({retestRecord.baselineCampaign.clicked}/32)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Signalements : {retestRecord.baselineCampaign.reportRate}%
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Après micro-formation VIGILO (Re-test)</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {retestRecord.retestCampaign.clickRate}%
              </span>
              <span className="text-xs text-slate-400">de clics ({retestRecord.retestCampaign.clicked}/32)</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Signalements : {retestRecord.retestCampaign.reportRate}%
            </div>
          </div>

          <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="text-xs text-slate-400">Réduction du risque humain</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {retestRecord.evolution.clickRateDropPercent}%
              </span>
              <span className="text-xs text-slate-400">de vulnérabilité</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+{retestRecord.evolution.reportRateGainPercent}% de réflexe de signalement</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 italic pt-1">
          * VIGILO présente cette évolution comme un indicateur de progression du MVP, et non comme une preuve scientifique d'efficacité.
        </p>
      </div>
    </div>
  );
};
