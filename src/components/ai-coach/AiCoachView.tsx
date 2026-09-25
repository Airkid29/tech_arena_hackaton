import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Wand2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  CheckCircle2,
  RefreshCw,
  Sliders,
} from 'lucide-react';
import { Campaign, AIAnalysis } from '../../types';
import { rodiumAiService } from '../../services/api';

interface AiCoachViewProps {
  campaigns: Campaign[];
  onOpenScenarioGenerator: () => void;
  onNavigateToTraining: () => void;
  onNavigateToCampaign: (campaignId: string) => void;
  onUpdateCampaignAnalysis: (campaignId: string, analysis: AIAnalysis) => void;
}

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  campaigns,
  onOpenScenarioGenerator,
  onNavigateToTraining,
  onNavigateToCampaign,
  onUpdateCampaignAnalysis,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleRunAnalysis = async () => {
    if (!selectedCampaign) return;
    setIsAnalyzing(true);
    try {
      const result = await rodiumAiService.analyzeCampaign(selectedCampaign);
      onUpdateCampaignAnalysis(selectedCampaign.id, result);
    } catch (err) {
      console.error('Erreur analyse RodiumAI', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Conseiller de résilience humaine
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
              <span>Vigilo Cyber Coach</span>
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Le moteur d'analyse comportementale de VIGILO. Il intervient à 3 niveaux :
              Génération des leurres contextuels, Diagnostic des facteurs humains et Remédiation par micro-formation ciblée.
            </p>
          </div>

          <button
            onClick={onOpenScenarioGenerator}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start md:self-auto"
          >
            <Wand2 className="w-4 h-4" />
            <span>Générer un scénario sur-mesure</span>
          </button>
        </div>

        {/* 3 AI Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-blue-600 dark:text-blue-400">1. Génération de leurres</div>
            <p className="text-slate-600 dark:text-slate-400">
              Créer ou adapter des scénarios de simulation réalistes aux outils de votre PME.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-emerald-600 dark:text-emerald-400">2. Diagnostic comportemental</div>
            <p className="text-slate-600 dark:text-slate-400">
              Identifier les facteurs psychologiques de risque et les départements vulnérables.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-600 dark:text-indigo-400">3. Remédiation & Re-test</div>
            <p className="text-slate-600 dark:text-slate-400">
              Recommander les micro-formations appropriées et mesurer la progression à J+14.
            </p>
          </div>
        </div>
      </div>

      {/* Select Campaign for Vigilo Coach Deep Dive */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Sliders className="w-4 h-4 text-slate-400" />
          <span className="font-semibold">Campagne sélectionnée pour analyse :</span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedCampaignId}
            onChange={(e) => setSelectedCampaignId(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.clickRate}% clics · {c.reportRate}% signalés)
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-medium cursor-pointer disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyse...' : 'Actualiser l analyse'}</span>
          </button>
        </div>
      </div>

      {/* AI Analysis Showcase */}
      {selectedCampaign && selectedCampaign.aiAnalysis ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Synthese & Vulnerability */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Diagnostic Vigilo Coach — {selectedCampaign.name}</span>
                  </h3>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      selectedCampaign.aiAnalysis.riskLevel === 'Critique' ||
                      selectedCampaign.aiAnalysis.riskLevel === 'Élevé'
                        ? 'bg-red-950/80 text-red-300 border-red-800/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    Niveau de risque : {selectedCampaign.aiAnalysis.riskLevel}
                  </span>
                </div>

                <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800">
                  <div className="font-semibold text-slate-200 mb-1">Synthèse exécutive :</div>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedCampaign.aiAnalysis.executiveSummary}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-900/50 space-y-1">
                  <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Facteur psychologique identifié :</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {selectedCampaign.aiAnalysis.vulnerabilityFactor}
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="font-semibold text-slate-200">Recommandations managériales :</div>
                  <div className="space-y-2">
                    {selectedCampaign.aiAnalysis.recommendations.map((rec, i) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span className="text-slate-300">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 5 cols: Department vulnerability & Training action */}
            <div className="lg:col-span-5 space-y-4">
              {/* Department breakdown from AI */}
              <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-400" />
                    <span>Vulnérabilités par département</span>
                  </h3>
                  <span className="text-slate-500 font-mono">Score /10</span>
                </div>

                <div className="space-y-2.5">
                  {selectedCampaign.aiAnalysis.departmentVulnerabilities?.map((dv, i) => (
                    <div key={i} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-200">{dv.department}</span>
                        <span className="font-mono text-amber-400 font-bold">{dv.riskScore}</span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-tight">{dv.comment}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation Action Card */}
              <div className="p-6 rounded-xl border border-blue-900/70 bg-gradient-to-br from-blue-950/40 to-slate-950 space-y-4 text-xs">
                <div className="flex items-center gap-2 text-blue-300 font-semibold">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Micro-formation recommandée</span>
                </div>

                <p className="text-slate-300 leading-relaxed">
                  {selectedCampaign.aiAnalysis.trainingAdvice}
                </p>

                <div className="pt-2">
                  <button
                    onClick={onNavigateToTraining}
                    className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-950 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Accéder à la micro-formation (4 min)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-xl border border-dashed border-slate-800 bg-[#0d131f] space-y-3">
          <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Prêt pour l'analyse comportementale</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cliquez sur « Actualiser l'analyse » pour déclencher le moteur RodiumAI sur cette campagne et recevoir les préconisations.
          </p>
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="mt-3 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs cursor-pointer"
          >
            {isAnalyzing ? 'Analyse en cours...' : 'Lancer l analyse RodiumAI'}
          </button>
        </div>
      )}
    </div>
  );
};
