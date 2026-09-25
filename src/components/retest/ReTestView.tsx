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
            <RotateCcw className="w-5 h-5 text-indigo-400" />
            <span>Re-test & Mesure de l'évolution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparez le comportement de vos équipes Avant et Après la micro-formation pour objectiver la progression.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-emerald-400 border border-emerald-900/60 rounded-lg px-3 py-1.5 bg-emerald-950/30">
          <ShieldCheck className="w-4 h-4" />
          <span>Vigilance humaine en hausse</span>
        </div>
      </div>

      {/* Main Comparative Benchmark Card */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d131f] space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-indigo-400">
              <span>{retestRecord.scenarioCategory}</span>
              <span>·</span>
              <span>{retestRecord.targetCohort}</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">{retestRecord.title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Score de cyber-résilience :</span>
            <span className="text-2xl font-bold font-mono text-blue-400">
              {retestRecord.evolution.humanVigilanceScore}
            </span>
            <span className="text-xs text-slate-500">/ 100</span>
          </div>
        </div>

        {/* 3-Column Comparison: Avant / Après / Évolution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Avant Formation */}
          <div className="p-5 rounded-xl border border-red-900/40 bg-red-950/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-300">
                1. Avant formation (Test initial)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.baselineCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Collaborateurs piégés) :</div>
              <div className="text-3xl font-bold font-mono text-red-400">
                {retestRecord.baselineCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.baselineCampaign.clicked} clics sur {retestRecord.baselineCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-red-950/60 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-slate-300">
                {retestRecord.baselineCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-500">
                {retestRecord.baselineCampaign.reported} signalements spontanés
              </div>
            </div>
          </div>

          {/* Column 2: Après Micro-formation */}
          <div className="p-5 rounded-xl border border-emerald-900/50 bg-emerald-950/15 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                2. Après formation (Re-test)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.retestCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Vulnérabilité restante) :</div>
              <div className="text-3xl font-bold font-mono text-emerald-400">
                {retestRecord.retestCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                Seulement {retestRecord.retestCampaign.clicked} clics sur {retestRecord.retestCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-950/60 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {retestRecord.retestCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.retestCampaign.reported} collaborateurs ont donné l'alerte
              </div>
            </div>
          </div>

          {/* Column 3: Impact & Progression */}
          <div className="p-5 rounded-xl border border-indigo-900/50 bg-indigo-950/15 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-indigo-300">
                3. Évolution de la vigilance
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                  <TrendingDown className="w-4 h-4" />
                  <span>Baisse du taux de clic</span>
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {retestRecord.evolution.clickRateDropPercent}%
                </div>
                <div className="text-[11px] text-slate-400">
                  De 25% à 6.25% de compromission
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-xs">
                  <TrendingUp className="w-4 h-4" />
                  <span>Hausse des signalements</span>
                </div>
                <div className="text-2xl font-bold font-mono text-blue-400">
                  +{retestRecord.evolution.reportRateGainPercent}%
                </div>
                <div className="text-[11px] text-slate-400">
                  De 59% à 81.25% de signalements
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => onNavigateToCampaign(retestRecord.retestCampaign.id)}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Voir les détails de la campagne</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mandatory Note per specs */}
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-slate-200">Précision méthodologique VIGILO :</strong> Le système présente cette évolution comme un <em>indicateur de progression du MVP</em>, et non comme une preuve scientifique d'efficacité. La vigilance humaine fluctue selon le contexte de travail et doit être entretenue régulièrement.
          </p>
        </div>
      </div>

      {/* Launch another re-test from existing campaigns */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0d131f] space-y-4">
        <h3 className="text-base font-bold text-white">
          Lancer un nouveau Re-test sur une campagne existante
        </h3>
        <p className="text-xs text-slate-400">
          Sélectionnez une campagne initiale pour déployer automatiquement un re-test auprès de la même cohorte.
        </p>

        <div className="space-y-2.5 pt-2">
          {eligibleCampaigns.map((camp) => (
            <div
              key={camp.id}
              className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-semibold text-slate-200">{camp.name}</span>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  {camp.category} · Cible : {camp.targetGroup} ({camp.targeted} pers.) · Taux de clic initial : {camp.clickRate}%
                </div>
              </div>

              <button
                onClick={() => onLaunchNewReTest(camp)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-sm shadow-indigo-950 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Programmer le Re-test</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
