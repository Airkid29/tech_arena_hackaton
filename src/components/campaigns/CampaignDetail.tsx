import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Send,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Play,
  RotateCcw,
  GraduationCap,
  Eye,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Campaign, AIAnalysis } from '../../types';
import { rodiumAiService } from '../../services/api';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onUpdateCampaignAnalysis: (campaignId: string, analysis: AIAnalysis) => void;
  onLaunchReTest: (campaign: Campaign) => void;
  onGenerateTraining: (campaign: Campaign) => void;
  onSimulate: (campaign: Campaign) => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onUpdateCampaignAnalysis,
  onLaunchReTest,
  onGenerateTraining,
  onSimulate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRequestAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await rodiumAiService.analyzeCampaign(campaign);
      onUpdateCampaignAnalysis(campaign.id, analysis);
    } catch (err) {
      console.error('Erreur analyse IA', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSimulate(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Tester l'email (Simulateur)</span>
          </button>

          <button
            onClick={() => onGenerateTraining(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/40 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Générer formation ciblée</span>
          </button>

          <button
            onClick={() => onLaunchReTest(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lancer un re-test</span>
          </button>
        </div>
      </div>

      {/* Campaign Header Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  campaign.status === 'en_cours'
                    ? 'bg-blue-950/80 text-blue-400 border-blue-800/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {campaign.status === 'en_cours' ? '● En cours' : '✓ Terminée'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-400">{campaign.category}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Difficulté : {campaign.difficulty}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Cible : {campaign.targetGroup}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-xs text-slate-400">Temps médian de réaction</div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {campaign.medianReactionTimeMinutes} min
            </div>
          </div>
        </div>

        {/* 7 Core Indicators per Section 5 */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Ciblés</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{campaign.targeted}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Délivrés</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">{campaign.delivered}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Ouverts</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">{campaign.opened}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-red-400">Clics (Piégés)</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">{campaign.clicked}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-emerald-400">Signalements</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{campaign.reported}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40">
            <div className="text-xs text-red-300 font-medium">Click Rate</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">{campaign.clickRate}%</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
            <div className="text-xs text-emerald-300 font-medium">Report Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{campaign.reportRate}%</div>
          </div>
        </div>
      </div>

      {/* Two columns: Department breakdown & AI RodiumAI Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (5 cols): Department Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Ventilation par département</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {campaign.departments.length} équipes
            </span>
          </div>

          <div className="space-y-3">
            {campaign.departments.map((dept) => (
              <div
                key={dept.name}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">{dept.name}</span>
                  <span className="text-slate-400 font-mono">{dept.targeted} ciblés</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Taux de clic :</span>
                    <strong className="text-red-400 font-mono">{dept.clickRate}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Signalements :</span>
                    <strong className="text-emerald-400 font-mono">{dept.reportRate}%</strong>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${dept.clickRate}%` }}
                    title={`Clics: ${dept.clickRate}%`}
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${dept.reportRate}%` }}
                    title={`Signalés: ${dept.reportRate}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column (7 cols): AI Cyber Coach — RodiumAI */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/70 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vigilo Cyber Coach</h3>
                <p className="text-[11px] text-slate-400">Analyse comportementale & Remédiation</p>
              </div>
            </div>

            <button
              onClick={handleRequestAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{campaign.aiAnalysis ? 'Réanalyser avec l IA' : 'Demander analyse IA'}</span>
            </button>
          </div>

          {campaign.aiAnalysis ? (
            <div className="space-y-4 text-xs">
              {/* Executive Summary */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Synthèse d analyse comportementale</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      campaign.aiAnalysis.riskLevel === 'Critique' || campaign.aiAnalysis.riskLevel === 'Élevé'
                        ? 'bg-red-950/80 text-red-300 border-red-800/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    Risque : {campaign.aiAnalysis.riskLevel}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {campaign.aiAnalysis.executiveSummary}
                </p>
              </div>

              {/* Vulnerability Factor */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Facteur de vulnérabilité identifié</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {campaign.aiAnalysis.vulnerabilityFactor}
                </p>
              </div>

              {/* Operational Recommendations */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200">Recommandations managériales :</div>
                <ul className="space-y-1.5 text-slate-300">
                  {campaign.aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation Advice & CTA */}
              <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-900/60 space-y-3">
                <div className="text-blue-300 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Remédiation recommandée par RodiumAI :</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {campaign.aiAnalysis.trainingAdvice}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onGenerateTraining(campaign)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Lancer la micro-formation (4 min)
                  </button>
                  <button
                    onClick={() => onLaunchReTest(campaign)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    Planifier le re-test
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-lg bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">Aucune analyse IA effectuée</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cliquez sur « Demander analyse IA » pour que RodiumAI évalue les comportements et propose la remédiation adaptée.
              </p>
              <button
                onClick={handleRequestAiAnalysis}
                disabled={isAnalyzing}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l analyse RodiumAI'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
