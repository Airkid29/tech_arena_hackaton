import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Send,
  ShieldCheck,
  Sparkles,
  Play,
  RotateCcw,
  GraduationCap,
  Eye,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  X,
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

const STATUS_LABEL: Record<Campaign['status'], string> = {
  brouillon: 'Brouillon — non envoyé',
  planifiée: 'Planifiée',
  en_cours: 'En cours',
  terminée: 'Terminée',
};

const clampPct = (value: number) => Math.max(0, Math.min(100, Number(value) || 0));

/** Coque commune des fenêtres de confirmation (Échap et clic sur le fond ferment, sauf pendant une action). */
const ModalShell: React.FC<{
  title: string;
  subtitle?: string;
  onClose: () => void;
  busy?: boolean;
  children: React.ReactNode;
}> = ({ title, subtitle, onClose, busy = false, children }) => (
  <div
    data-vigilo-modal
    className="fixed inset-0 z-50 flex items-center justify-center bg-kori-bg/80 p-4"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget && !busy) onClose();
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="w-full max-w-md rounded-2xl border border-kori-line bg-kori-surface p-6 space-y-4 shadow-[0_24px_64px_rgb(0_0_0/0.35)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg text-kori-text">{title}</h3>
          {subtitle && <p className="text-xs text-kori-muted truncate mt-0.5">{subtitle}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Fermer"
          className="p-1.5 rounded-lg vigilo-chrome-btn cursor-pointer disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
    </div>
  </div>
);

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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [launchWithRealEmails, setLaunchWithRealEmails] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Échap ferme la fenêtre ouverte, sauf pendant une action en cours
  useEffect(() => {
    if (!showLaunchModal && !showCompleteModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showLaunchModal && !isLaunching) setShowLaunchModal(false);
      if (showCompleteModal && !isCompleting) setShowCompleteModal(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [showLaunchModal, showCompleteModal, isLaunching, isCompleting]);

  const handleConfirmLaunch = async () => {
    if (!onLaunchCampaign) return;
    setIsLaunching(true);
    setLaunchError('');
    try {
      await onLaunchCampaign(campaign, { sendRealEmails: launchWithRealEmails });
      setShowLaunchModal(false);
      setActionFeedback('Campagne lancée avec succès.');
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
    setActionError(null);
    try {
      await onSimulateEvent(campaign.id, eventType);
      const msg = {
        open: 'Simulation : 1 collaborateur a ouvert le courriel.',
        click: 'Simulation : 1 collaborateur a cliqué sur le piège.',
        report: 'Simulation : 1 collaborateur a signalé l’email suspect.',
        auto_cohort: 'Simulation complète de cohorte générée avec succès.',
      }[eventType];
      setActionFeedback(msg);
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Erreur de simulation');
    } finally {
      setIsSimulating(false);
    }
  };

  const handleConfirmComplete = async () => {
    if (!onCompleteCampaign) return;
    setIsCompleting(true);
    setActionError(null);
    try {
      await onCompleteCampaign(campaign.id);
      setShowCompleteModal(false);
      setActionFeedback('Campagne clôturée avec succès.');
      setTimeout(() => setActionFeedback(null), 3500);
    } catch (err) {
      setShowCompleteModal(false);
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la clôture');
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

  const analysisBlocked = isAnalyzing || campaign.status === 'brouillon' || campaign.delivered === 0;
  const hasResults = campaign.delivered > 0;
  const statusClass =
    campaign.status === 'en_cours'
      ? 'vigilo-pill-orange'
      : campaign.status === 'brouillon'
        ? 'border-dashed border-kori-line bg-transparent text-kori-muted'
        : 'border-kori-line bg-kori-chip text-kori-muted';

  const supportingStats = [
    { label: 'Taux de clic', value: `${campaign.clickRate}%`, tone: 'text-kori-negative' },
    { label: 'Ciblés', value: campaign.targeted, tone: 'text-kori-text' },
    { label: 'Délivrés', value: campaign.delivered, tone: 'text-kori-text' },
    { label: 'Ouverts', value: campaign.opened, tone: 'text-kori-text' },
    { label: 'Clics (piégés)', value: campaign.clicked, tone: 'text-kori-negative' },
    { label: 'Signalements', value: campaign.reported, tone: 'text-kori-positive' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Navigation et actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-kori-muted hover:text-kori-text transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {campaign.status === 'brouillon' && onLaunchCampaign && (
            <button
              type="button"
              onClick={() => {
                setLaunchError('');
                setShowLaunchModal(true);
              }}
              className="vigilo-btn-orange flex items-center gap-1.5 px-4 py-2 text-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Lancer la campagne</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onSimulate(campaign)}
            className="vigilo-btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer"
            title="Aperçu interactif du scénario"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Aperçu piège</span>
          </button>

          <button
            type="button"
            onClick={() => onPrepareTrainingInvite(campaign)}
            disabled={isGeneratingTraining}
            className="vigilo-btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Générer une formation à relire, puis confirmer l’envoi d’une invitation pédagogique aux collaborateurs ciblés."
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isGeneratingTraining ? 'Génération…' : 'Inviter à une formation'}</span>
          </button>

          {campaign.status === 'terminée' && (
            <button
              type="button"
              onClick={() => onLaunchReTest(campaign)}
              className="vigilo-btn-secondary flex items-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Créer un re-test</span>
            </button>
          )}
        </div>
      </div>

      {actionFeedback && (
        <div
          role="status"
          className="p-3 rounded-xl border border-kori-line bg-kori-surface text-sm font-medium text-kori-positive flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {(actionError || trainingGenerationError) && (
        <div
          role="alert"
          className="rounded-xl border border-kori-negative/40 bg-kori-negative/10 px-3.5 py-2.5 text-sm text-kori-negative flex items-start justify-between gap-3"
        >
          <span>{actionError || trainingGenerationError}</span>
          {actionError && (
            <button
              type="button"
              onClick={() => setActionError(null)}
              aria-label="Masquer l’erreur"
              className="shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* En-tête de la campagne */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-kori-muted">
              <span className={`vigilo-pill text-[11px] ${statusClass}`}>{STATUS_LABEL[campaign.status]}</span>
              <span>{campaign.category}</span>
              <span aria-hidden="true">·</span>
              <span>Difficulté : {campaign.difficulty}</span>
              <span aria-hidden="true">·</span>
              <span>Cible : {campaign.targetGroup}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl tracking-tight text-kori-text">{campaign.name}</h1>
            <p className="text-sm text-kori-muted max-w-3xl leading-relaxed">{campaign.description}</p>
            {campaign.status === 'brouillon' && (
              <p className="text-sm text-kori-text">
                Campagne en statut Brouillon : prête à être lancée auprès des {campaign.targeted} collaborateur(s) ciblés.
              </p>
            )}
            {campaign.status === 'en_cours' && (
              <p className="text-sm text-kori-positive font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-kori-positive" aria-hidden="true" />
                <span>Campagne en cours d&apos;exécution · Suivi des réactions</span>
              </p>
            )}
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-xs text-kori-muted">Temps médian de réaction mesuré</div>
            <div className="font-display text-2xl text-kori-text">
              {campaign.medianReactionTimeMinutes ? `${campaign.medianReactionTimeMinutes} min` : '—'}
            </div>
          </div>
        </div>

        {/* Cockpit de simulation (actions existantes, simplement restylées) */}
        {campaign.status === 'en_cours' && onSimulateEvent && (
          <div className="rounded-2xl border border-dashed border-kori-line bg-kori-input p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-kori-text">
                Cockpit de simulation en direct (démo jury ANCy)
              </h3>
              <span className="text-xs text-kori-muted">
                {campaign.delivered} leurres distribués · Taux de clic actuel : {campaign.clickRate}%
              </span>
            </div>
            <p className="text-xs text-kori-muted">
              Déclenchez les interactions des collaborateurs en direct pour simuler les comportements face au piège et observer les indicateurs réagir :
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleSimulateEvent('click')}
                disabled={isSimulating}
                className="vigilo-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-kori-negative" />
                <span>+1 clic piégé</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateEvent('report')}
                disabled={isSimulating}
                className="vigilo-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-kori-positive" />
                <span>+1 signalement défensif</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateEvent('auto_cohort')}
                disabled={isSimulating}
                className="vigilo-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Simuler résultats complets</span>
              </button>
              {onCompleteCampaign && (
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(true)}
                  disabled={isCompleting}
                  className="vigilo-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 sm:ml-auto cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Clôturer la campagne</span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Indicateurs : métrique principale + indicateurs de support */}
      <section className="vigilo-card grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] overflow-hidden">
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <p className="text-sm font-medium text-kori-muted">Taux de signalement</p>
          <div>
            <div
              className={`font-display text-6xl sm:text-7xl tracking-tight ${
                hasResults ? 'text-kori-positive' : 'text-kori-muted'
              }`}
            >
              {campaign.reportRate}%
            </div>
            <p className="mt-2 text-xs text-kori-muted">
              {campaign.reported} signalement(s) sur {campaign.targeted} ciblé(s)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-kori-line border-t lg:border-t-0 lg:border-l border-kori-line">
          {supportingStats.map((stat) => (
            <div key={stat.label} className="bg-kori-surface p-5 space-y-1.5">
              <div className="text-xs text-kori-muted">{stat.label}</div>
              <div className={`font-display text-2xl ${stat.tone}`}>{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Départements + Coach IA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-5 vigilo-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-kori-text">Ventilation par département</h3>
            <span className="text-xs text-kori-muted">{campaign.departments.length} équipes</span>
          </div>

          {campaign.departments.length === 0 ? (
            <p className="text-sm text-kori-muted">Aucune donnée par département pour cette campagne.</p>
          ) : (
            <ul className="divide-y divide-kori-line">
              {campaign.departments.map((dept) => (
                <li key={dept.name} className="py-3.5 first:pt-0 last:pb-0 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-kori-text">{dept.name}</span>
                    <span className="text-kori-muted">{dept.targeted} ciblés</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-kori-muted">Taux de clic</span>
                      <strong className="font-semibold text-kori-negative">{dept.clickRate}%</strong>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-kori-muted">Signalements</span>
                      <strong className="font-semibold text-kori-positive">{dept.reportRate}%</strong>
                    </div>
                  </div>

                  <div
                    className="w-full h-1.5 rounded-full bg-kori-chip overflow-hidden flex"
                    role="img"
                    aria-label={`Clics ${dept.clickRate}%, signalements ${dept.reportRate}%`}
                  >
                    <div className="bg-kori-negative h-full" style={{ width: `${clampPct(dept.clickRate)}%` }} />
                    <div className="bg-kori-positive h-full" style={{ width: `${clampPct(dept.reportRate)}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-7 vigilo-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-kori-muted shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-kori-text">Vigilo Cyber Coach</h3>
                <p className="text-xs text-kori-muted">Analyse agrégée &amp; remédiation pédagogique</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestAiAnalysis}
              disabled={analysisBlocked}
              className="vigilo-btn-secondary flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{campaign.aiAnalysis ? 'Réanalyser avec l’IA' : 'Demander analyse IA'}</span>
            </button>
          </div>

          {analysisError && (
            <p
              role="alert"
              className="rounded-xl border border-kori-negative/40 bg-kori-negative/10 px-3.5 py-2.5 text-sm text-kori-negative"
            >
              {analysisError}
            </p>
          )}

          {campaign.aiAnalysis ? (
            <div className="divide-y divide-kori-line text-sm">
              <div className="pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-kori-text">Synthèse d’analyse comportementale</span>
                  <span
                    className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                      campaign.aiAnalysis.riskLevel === 'Critique' || campaign.aiAnalysis.riskLevel === 'Élevé'
                        ? 'bg-kori-negative/15 text-kori-negative'
                        : 'bg-kori-chip text-kori-muted'
                    }`}
                  >
                    Risque : {campaign.aiAnalysis.riskLevel}
                  </span>
                </div>
                <p className="text-kori-muted leading-relaxed">{campaign.aiAnalysis.executiveSummary}</p>
                {campaign.aiAnalysis.warning && (
                  <p role="status" className="text-kori-text flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-kori-negative" />
                    <span>{campaign.aiAnalysis.warning}</span>
                  </p>
                )}
              </div>

              <div className="py-4 space-y-2">
                <div className="font-semibold text-kori-text flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-kori-muted" />
                  <span>Facteur de vulnérabilité identifié</span>
                </div>
                <p className="text-kori-muted leading-relaxed">{campaign.aiAnalysis.vulnerabilityFactor}</p>
              </div>

              <div className="py-4 space-y-2">
                <div className="font-semibold text-kori-text">Recommandations managériales</div>
                <ul className="space-y-1.5 text-kori-muted">
                  {campaign.aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-kori-muted mt-2 shrink-0" aria-hidden="true" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 space-y-2">
                <div className="font-semibold text-kori-text flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-kori-muted" />
                  <span>Remédiation recommandée par {campaign.aiAnalysis.engine || 'le coach IA'}</span>
                </div>
                <p className="text-kori-muted leading-relaxed">{campaign.aiAnalysis.trainingAdvice}</p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl border border-dashed border-kori-line space-y-3">
              <Sparkles className="w-7 h-7 text-kori-muted mx-auto" />
              <div className="text-sm font-semibold text-kori-text">Aucune analyse IA effectuée</div>
              <p className="text-xs text-kori-muted max-w-sm mx-auto">
                {hasResults
                  ? 'Demandez une analyse agrégée pour obtenir des recommandations pédagogiques.'
                  : 'Une analyse ne sera possible qu’après la collecte de données réelles et autorisées.'}
              </p>
              <button
                type="button"
                onClick={handleRequestAiAnalysis}
                disabled={analysisBlocked}
                className="vigilo-btn-orange mt-1 px-4 py-2 text-xs cursor-pointer"
              >
                {isAnalyzing
                  ? 'Analyse en cours...'
                  : hasResults
                    ? 'Lancer l’analyse IA'
                    : 'En attente de données mesurées'}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Fenêtre : lancer la campagne */}
      {showLaunchModal && (
        <ModalShell
          title="Lancer la campagne"
          subtitle={campaign.name}
          onClose={() => setShowLaunchModal(false)}
          busy={isLaunching}
        >
          <p className="text-sm text-kori-muted leading-relaxed">
            La campagne va être déployée auprès de{' '}
            <strong className="text-kori-text">{campaign.targeted} collaborateur(s)</strong> ciblés.
          </p>

          <label className="flex items-start gap-3 p-3.5 rounded-xl border border-kori-line bg-kori-input cursor-pointer">
            <input
              type="checkbox"
              checked={launchWithRealEmails}
              onChange={(e) => setLaunchWithRealEmails(e.target.checked)}
              className="mt-0.5 accent-kori-accent"
            />
            <div className="text-sm">
              <span className="font-semibold text-kori-text">Envoyer par email réel aux collaborateurs (SMTP)</span>
              <p className="text-xs text-kori-muted mt-1">
                Si activé, chaque destinataire recevra le courriel d&apos;ingénierie sociale avec lien piège VIGILO dans sa boîte.
              </p>
            </div>
          </label>

          {launchError && (
            <p
              role="alert"
              className="text-sm text-kori-negative bg-kori-negative/10 p-3 rounded-xl border border-kori-negative/40"
            >
              {launchError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowLaunchModal(false)}
              disabled={isLaunching}
              className="vigilo-btn-secondary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmLaunch}
              disabled={isLaunching}
              className="vigilo-btn-orange px-4 py-2 text-xs flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isLaunching ? 'Lancement en cours…' : 'Confirmer et lancer'}</span>
            </button>
          </div>
        </ModalShell>
      )}

      {/* Fenêtre : clôturer la campagne (remplace window.confirm) */}
      {showCompleteModal && (
        <ModalShell
          title="Clôturer la campagne ?"
          subtitle={campaign.name}
          onClose={() => setShowCompleteModal(false)}
          busy={isCompleting}
        >
          <p className="text-sm text-kori-muted leading-relaxed">
            Elle sera marquée comme terminée et disponible pour l’analyse IA et le re-test.
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowCompleteModal(false)}
              disabled={isCompleting}
              className="vigilo-btn-secondary px-4 py-2 text-xs cursor-pointer disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={handleConfirmComplete}
              disabled={isCompleting}
              className="vigilo-btn-orange px-4 py-2 text-xs cursor-pointer"
            >
              {isCompleting ? 'Clôture en cours…' : 'Clôturer la campagne'}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};