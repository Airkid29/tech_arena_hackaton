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
  onPrepareTrainingInvite: (campaign: Campaign) => void;
  onSimulate: (campaign: Campaign) => void;
  onLaunchCampaign?: (campaign: Campaign, options?: { sendRealEmails?: boolean; scenarioBody?: string }) => Promise<void>;
  onSimulateEvent?: (campaignId: string, eventType: 'open' | 'click' | 'report' | 'auto_cohort') => Promise<void>;
  onCompleteCampaign?: (campaignId: string) => Promise<void>;
  isGeneratingTraining?: boolean;
  trainingGenerationError?: string;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onUpdateCampaignAnalysis,
  onLaunchReTest,
  onPrepareTrainingInvite,
  onSimulate,
  onLaunchCampaign,
  onSimulateEvent,
  onCompleteCampaign,
  isGeneratingTraining = false,
  trainingGenerationError = '',
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [launchWithRealEmails, setLaunchWithRealEmails] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleConfirmLaunch = async () => {
    if (!onLaunchCampaign) return;
    setIsLaunching(true);
    setLaunchError('');
    try {
      await onLaunchCampaign(campaign, { sendRealEmails: launchWithRealEmails });
      setShowLaunchModal(false);
      setActionFeedback('🚀 Campagne lancée avec succès !');
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Erreur lors du lancement');
    } finally {
      setIsLaunching(false);
    }
  };

  const handleSimulateEvent = async (eventType: 'open' | 'click' | 'report' | 'auto_cohort') => {
    if (!onSimulateEvent) return;
    setIsSimulating(true);
    try {
      await onSimulateEvent(campaign.id, eventType);
      const msg = {
        open: '👁️ Simulation : 1 collaborateur a ouvert le courriel.',
        click: '⚠️ Simulation : 1 collaborateur a cliqué sur le piège !',
        report: '🛡️ Simulation : 1 collaborateur a signalé l’email suspect !',
        auto_cohort: '📊 Simulation complète de cohorte générée avec succès !',
      }[eventType];
      setActionFeedback(msg);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur de simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleComplete = async () => {
    if (!onCompleteCampaign) return;
    if (!window.confirm('Voulez-vous clôturer cette campagne ? Elle sera marquée comme terminée et disponible pour l’analyse IA et le re-test.')) return;
    setIsCompleting(true);
    try {
      await onCompleteCampaign(campaign.id);
      setActionFeedback('✅ Campagne clôturée avec succès.');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erreur lors de la clôture');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleRequestAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError('');
    try {
      const analysis = await rodiumAiService.analyzeCampaign(campaign);
      onUpdateCampaignAnalysis(campaign.id, analysis);
    } catch (err) {
      setAnalysisError(err instanceof Error ? err.message : 'Analyse IA indisponible.');
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
          {campaign.status === 'brouillon' && onLaunchCampaign && (
            <button
              onClick={() => setShowLaunchModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#f2620a] hover:bg-[#e05606] text-white text-xs font-bold shadow-lg shadow-[#f2620a]/30 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Lancer la campagne</span>
            </button>
          )}

          <button
            onClick={() => onSimulate(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
            title="Aperçu interactif du scénario"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Aperçu piège</span>
          </button>

          <button
            onClick={() => onPrepareTrainingInvite(campaign)}
            disabled={isGeneratingTraining}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 text-xs font-medium border border-orange-500/40 disabled:opacity-50 cursor-pointer"
            title="Générer une formation à relire, puis confirmer l’envoi d’une invitation pédagogique aux collaborateurs ciblés."
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isGeneratingTraining ? 'Génération…' : 'Inviter à une formation'}</span>
          </button>

          {campaign.status === 'terminée' && (
            <button
              onClick={() => onLaunchReTest(campaign)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Créer un re-test</span>
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div role="status" className="p-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 text-xs font-semibold text-emerald-300 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {trainingGenerationError && (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
          {trainingGenerationError}
        </p>
      )}

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
                {{
                  brouillon: 'Brouillon — non envoyé',
                  planifiée: 'Planifiée',
                  en_cours: '● En cours',
                  terminée: '✓ Terminée',
                }[campaign.status]}
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
            {campaign.status === 'brouillon' && (
              <p className="text-xs text-amber-300 font-medium">
                Campagne en statut Brouillon : prête à être lancée auprès des {campaign.targeted} collaborateur(s) ciblés.
              </p>
            )}
            {campaign.status === 'en_cours' && (
              <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Campagne en cours d&apos;exécution · Suivi live des réactions</span>
              </p>
            )}
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-xs text-slate-400">Temps médian de réaction mesuré</div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {campaign.medianReactionTimeMinutes ? `${campaign.medianReactionTimeMinutes} min` : '—'}
            </div>
          </div>
        </div>

        {/* Live Simulation Cockpit (for Hackathon / ANCy Jury Demo) */}
        {campaign.status === 'en_cours' && onSimulateEvent && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 backdrop-blur-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <h3 className="text-sm font-bold text-emerald-300">
                  Cockpit de Simulation en Direct (Démo Jury ANCy)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400/80">
                {campaign.delivered} leurres distribués · Taux de clic actuel : {campaign.clickRate}%
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Déclenchez les interactions des collaborateurs en direct pour simuler les comportements face au piège et observer les indicateurs réagir en temps réel :
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => handleSimulateEvent('click')}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>+1 Clic piégé</span>
              </button>
              <button
                onClick={() => handleSimulateEvent('report')}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>+1 Signalement défensif</span>
              </button>
              <button
                onClick={() => handleSimulateEvent('auto_cohort')}
                disabled={isSimulating}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simuler résultats complets</span>
              </button>
              {onCompleteCampaign && (
                <button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/20 text-xs font-semibold flex items-center gap-1.5 sm:ml-auto transition-all cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clôturer la campagne</span>
                </button>
              )}
            </div>
          </div>
        )}

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

      {/* Two columns: Department breakdown & AI Coach */}
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

        {/* Right column (7 cols): AI Cyber Coach */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/70 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vigilo Cyber Coach</h3>
                <p className="text-[11px] text-slate-400">Analyse agrégée & Remédiation pédagogique</p>
              </div>
            </div>

            <button
              onClick={handleRequestAiAnalysis}
              disabled={isAnalyzing || campaign.status === 'brouillon' || campaign.delivered === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{campaign.aiAnalysis ? 'Réanalyser avec l IA' : 'Demander analyse IA'}</span>
            </button>
          </div>

          {analysisError && (
            <p role="alert" className="rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-200">
              {analysisError}
            </p>
          )}

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
                {campaign.aiAnalysis.warning && (
                  <p role="status" className="text-amber-300">{campaign.aiAnalysis.warning}</p>
                )}
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
                  <span>Remédiation recommandée par {campaign.aiAnalysis.engine || 'le coach IA'} :</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {campaign.aiAnalysis.trainingAdvice}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-lg bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">Aucune analyse IA effectuée</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {campaign.delivered > 0
                  ? 'Demandez une analyse agrégée pour obtenir des recommandations pédagogiques.'
                  : 'Une analyse ne sera possible qu’après la collecte de données réelles et autorisées.'}
              </p>
              <button
                onClick={handleRequestAiAnalysis}
                disabled={isAnalyzing || campaign.status === 'brouillon' || campaign.delivered === 0}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isAnalyzing
                  ? 'Analyse en cours...'
                  : campaign.delivered > 0
                    ? 'Lancer l’analyse IA'
                    : 'En attente de données mesurées'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Launch Campaign Modal */}
      {showLaunchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f2620a]/20 border border-[#f2620a]/40 flex items-center justify-center text-[#fb923c]">
                <Play className="w-5 h-5 fill-[#f2620a]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Lancer la campagne</h3>
                <p className="text-xs text-slate-400 truncate max-w-xs">{campaign.name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              La campagne va être déployée auprès de <strong>{campaign.targeted} collaborateur(s)</strong> ciblés.
            </p>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <input
                type="checkbox"
                checked={launchWithRealEmails}
                onChange={(e) => setLaunchWithRealEmails(e.target.checked)}
                className="mt-0.5 rounded accent-[#f2620a]"
              />
              <div className="text-xs text-slate-200">
                <span className="font-semibold text-white">Envoyer par email réel aux collaborateurs (SMTP)</span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Si activé, chaque destinataire recevra le courriel d&apos;ingénierie sociale avec lien piège VIGILO dans sa boîte.
                </p>
              </div>
            </label>

            {launchError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/30">
                {launchError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLaunchModal(false)}
                className="vigilo-btn-secondary px-4 py-2 rounded-lg text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmLaunch}
                disabled={isLaunching}
                className="vigilo-btn-orange px-4 py-2 rounded-lg text-xs font-bold text-white flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isLaunching ? 'Lancement en cours…' : 'Confirmer et Lancer'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
