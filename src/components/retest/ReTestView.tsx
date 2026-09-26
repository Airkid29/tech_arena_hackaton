import React from 'react';
import {
  RotateCcw,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Play,
  ArrowRight,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ReTestRecord, Campaign } from '../../types';

interface ReTestViewProps {
  retestRecord: ReTestRecord;
  campaigns: Campaign[];
  onLaunchNewReTest: (campaign: Campaign) => void;
  onNavigateToCampaign: (campaignId: string) => void;
}

export const ReTestView: React.FC<ReTestViewProps> = ({
  retestRecord,
  campaigns,
  onLaunchNewReTest,
  onNavigateToCampaign,
}) => {
  const eligibleCampaigns = campaigns.filter((c) => !c.isReTest);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#fb923c]" />
            <span>Re-test & Mesure de la rétention</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparez le comportement de vos équipes Avant et Après la micro-formation à 14 jours d'intervalle.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 border border-emerald-500/30 rounded-xl px-3.5 py-2 bg-emerald-500/10">
          <ShieldCheck className="w-4 h-4" />
          <span>Vigilance humaine en hausse</span>
        </div>
      </div>

      {/* Main Comparative Benchmark Card */}
      <div className="vigilo-card p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c]">
              <span>{retestRecord.scenarioCategory}</span>
              <span>·</span>
              <span>{retestRecord.targetCohort}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">{retestRecord.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Score de cyber-résilience :</span>
            <span className="text-3xl font-extrabold font-mono text-[#fb923c]">
              {retestRecord.evolution.humanVigilanceScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        {/* 3-Column Comparison: Avant / Après / Évolution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Avant Formation */}
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                1. Avant formation (Test initial)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.baselineCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Collaborateurs piégés) :</div>
              <div className="text-3xl font-extrabold font-mono text-rose-400">
                {retestRecord.baselineCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.baselineCampaign.clicked} clics sur {retestRecord.baselineCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-rose-500/20 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-slate-300">
                {retestRecord.baselineCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-500">
                {retestRecord.baselineCampaign.reported} signalements spontanés
              </div>
            </div>
          </div>

          {/* Column 2: Après Formation */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                2. Après formation (Re-test à 14j)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.retestCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Nouveau test) :</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {retestRecord.retestCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.retestCampaign.clicked} clics sur {retestRecord.retestCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-500/20 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {retestRecord.retestCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.retestCampaign.reported} signalements spontanés
              </div>
            </div>
          </div>

          {/* Column 3: Évolution Globale */}
          <div className="p-5 rounded-xl border border-[#f2620a]/30 bg-[#f2620a]/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fb923c]">
                3. Bilan de résilience
              </span>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Réduction du taux de clic :</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    {retestRecord.evolution.clickRateDropPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Hausse des signalements :</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    +{retestRecord.evolution.reportRateGainPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
              "L'ancrage des réflexes s'est confirmé à 14 jours avec une baisse drastique du risque d'usurpation."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
