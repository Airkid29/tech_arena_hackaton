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
  Zap,
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
  const [analysisError, setAnalysisError] = useState('');

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleRunAnalysis = async () => {
    if (!selectedCampaign) return;
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const result = await rodiumAiService.analyzeCampaign(selectedCampaign);
      onUpdateCampaignAnalysis(selectedCampaign.id, result);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analyse IA indisponible.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner — Clean Premium Hero */}
      <div className="vigilo-card p-8 space-y-6 relative overflow-hidden">

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
              <span>Conseiller de résilience humaine</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold">Gemini / RodiumAI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              
              <span>Vigilo Cyber Coach</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Le coach pédagogique contextualise les ateliers, analyse des résultats agrégés et recommande des formations adaptées.
            </p>
          </div>

          <button
            onClick={onOpenScenarioGenerator}
            className="vigilo-btn-orange flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shadow-lg cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Générer un scénario sur-mesure</span>
          </button>
        </div>

        {/* 3 AI Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-[#fb923c]">1. Génération de leurres</div>
            <p className="text-slate-400">
              Créer ou adapter des scénarios de simulation ultra-réalistes aux canaux de votre PME (Email, WhatsApp).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-amber-400">2. Diagnostic comportemental</div>
            <p className="text-slate-400">
              Identifier les leviers d'ingénierie sociale déclenchés (Urgence, Autorité, Panique) et départements vulnérables.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-emerald-400">3. Remédiation & Re-test</div>
            <p className="text-slate-400">
              Recommander les micro-modules de 2 minutes et programmer le re-test automatique à 14 jours.
            </p>
          </div>
        </div>
      </div>

      {/* Main Campaign Selection & Analysis Section */}
      <div className="vigilo-card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-slate-400">Sélectionner une campagne à analyser</span>
            <h2 className="text-lg font-bold text-white mt-1">Diagnostic comportemental approfondi</h2>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-[#f2620a]"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.clickRate}% clic)
                </option>
              ))}
            </select>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="vigilo-btn-orange px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyse IA en cours...' : 'Relancer l\'analyse IA'}</span>
            </button>
          </div>
        </div>

        {analysisError && (
          <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs text-red-200">
            {analysisError}
          </p>
        )}

        {selectedCampaign && selectedCampaign.aiAnalysis ? (
          <div className="space-y-6">
            {/* Summary Banner */}
            <div className="p-5 rounded-xl bg-[#f2620a]/10 border border-[#f2620a]/30 text-xs text-slate-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#fb923c]">
                <Zap className="w-4 h-4" />
                <span>Diagnostic & Synthèse · {selectedCampaign.aiAnalysis.engine || 'IA intégrée'} :</span>
              </div>
              <p>{selectedCampaign.aiAnalysis.executiveSummary}</p>
              {selectedCampaign.aiAnalysis.warning && (
                <p className="text-amber-300">{selectedCampaign.aiAnalysis.warning}</p>
              )}
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vulnerabilities */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Leviers Psychologiques Déclenchés</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {[selectedCampaign.aiAnalysis.vulnerabilityFactor].map((v, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vulnerable Cohorts */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>Cohortes à Risque Élevé</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedCampaign.aiAnalysis.departmentVulnerabilities.map(({ department }, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {department}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Training */}
            {selectedCampaign.aiAnalysis.trainingAdvice && (
              <div className="p-6 rounded-xl bg-[var(--card)] border border-[var(--card-border)] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider">
                    <GraduationCap className="w-4 h-4" />
                    <span>Micro-Formation de Remédiation Recommandée</span>
                  </div>
                  <span className="text-xs font-mono text-slate-400">Durée : 2 minutes</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-white/10">
                  <div>
                    <h4 className="font-bold text-white text-sm">Micro-formation recommandée</h4>
                    <p className="text-xs text-slate-400 mt-1">{selectedCampaign.aiAnalysis.trainingAdvice}</p>
                  </div>

                  <button
                    onClick={onNavigateToTraining}
                    className="vigilo-btn-orange px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Suivre le module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Aucune analyse disponible pour cette campagne. Relancez l’analyse IA pour obtenir une synthèse agrégée.
          </div>
        )}
      </div>
    </div>
  );
};
