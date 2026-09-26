import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';
import { Campaign, Scenario } from '../../types';
import { WhatsAppSimulator } from './WhatsAppSimulator';

interface EmployeeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  scenario?: Scenario | null;
  onEmployeeClickedTrap: (campaignId: string) => void;
  onEmployeeReportedPhish: (campaignId: string) => void;
  onStartTrainingFromTrap: (targetCategoryOrId?: string) => void;
  isDark?: boolean;
  initialViewState?: 'inbox' | 'landing_page_clicked' | 'reported_success';
}

export const EmployeeSimulatorModal: React.FC<EmployeeSimulatorModalProps> = ({
  isOpen,
  onClose,
  campaign,
  scenario,
  onEmployeeClickedTrap,
  onEmployeeReportedPhish,
  onStartTrainingFromTrap,
  isDark = true,
  initialViewState = 'inbox',
}) => {
  if (!isOpen) return null;

  const currentCategory = campaign ? campaign.category : scenario?.category || 'Phishing';
  const isWhatsAppInitial = currentCategory === 'WhatsApp Phishing';

  const [channel, setChannel] = useState<'email' | 'whatsapp'>(isWhatsAppInitial ? 'whatsapp' : 'email');
  const [viewState, setViewState] = useState<'inbox' | 'landing_page_clicked' | 'reported_success'>(initialViewState);

  useEffect(() => {
    if (currentCategory === 'WhatsApp Phishing') {
      setChannel('whatsapp');
    }
  }, [currentCategory]);

  const currentScenarioName =
    channel === 'whatsapp'
      ? 'WhatsApp Phishing : Fraude au Président & Whishing'
      : (campaign ? campaign.scenarioName : scenario?.name || 'Simulation Phishing');

  const currentSenderName = scenario?.senderName || 'Microsoft 365 Identity Support';
  const currentSenderEmail = scenario?.senderEmail || 'notifications@m365-security-alert.cloud';
  const currentSubject = scenario?.subject || 'Action requise : Votre mot de passe expire dans 4 heures';
  const currentBody = scenario?.body || '<p>Contenu de simulation</p>';

  const emailRedFlags = scenario?.redFlags || [
    'Nom de domaine non officiel (m365-security-alert.cloud)',
    'Menace de coupure de service sous 4h (fausse urgence)',
    'Lien demandant la saisie immédiate des identifiants',
  ];

  const whatsAppRedFlags = [
    "Numéro de mobile non enregistré dans l'annuaire interne d'entreprise",
    "Usurpation d'un dirigeant (Fraude au Président) ou d'un support informatique",
    'Prétexte de réunion confidentielle ou NDA pour interdire tout appel vocal',
    "Demande inhabituelle d'action financière ou de clic sur un lien non sécurisé",
  ];

  const activeRedFlags = channel === 'whatsapp' ? whatsAppRedFlags : emailRedFlags;

  const handleSimulateClickTrap = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (campaign) {
      onEmployeeClickedTrap(campaign.id);
    }
    setViewState('landing_page_clicked');
  };

  const handleSimulateReport = () => {
    if (campaign) {
      onEmployeeReportedPhish(campaign.id);
    }
    setViewState('reported_success');
  };

  const handleLaunchTargetTraining = () => {
    onClose();
    onStartTrainingFromTrap(currentCategory);
  };

  const shell = isDark
    ? 'border-white/15 bg-[#0f1419] text-slate-100'
    : 'border-[var(--card-border)] bg-[var(--card)] text-[var(--foreground)] shadow-xl';

  const header = isDark
    ? 'border-white/10 bg-slate-900/95'
    : 'border-[var(--card-border)] bg-[var(--muted)]';

  const bodyBg = isDark ? 'bg-[#0a0e14]' : 'bg-[var(--background)]';

  const channelToggleWrap = isDark
    ? 'bg-white/5 border-white/10'
    : 'bg-[var(--surface-inset)] border-[var(--card-border)]';

  const channelIdle = isDark ? 'text-slate-400 hover:text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]';

  const titleCls = isDark ? 'text-white' : 'text-[var(--foreground)]';
  const subtitleCls = isDark ? 'text-slate-400' : 'text-[var(--muted-foreground)]';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in ${
        isDark ? 'bg-black/80' : 'bg-slate-900/40'
      }`}
      data-vigilo-simulator-chrome
    >
      <div className={`relative w-full max-w-4xl max-h-[92vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${shell}`}>
        <div className={`px-6 py-4 border-b flex items-center justify-between shrink-0 ${header}`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[var(--primary)]/15 border border-[var(--primary)]/35 text-[var(--primary)] flex items-center justify-center font-bold text-xs shrink-0">
              LIVE
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`font-bold text-sm truncate ${titleCls}`}>
                  Aperçu Collaborateur — {currentScenarioName}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${
                    isDark
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  Mode Simulation
                </span>
              </div>
              <p className={`text-xs font-mono ${subtitleCls}`}>
                Test de la réaction réelle du collaborateur sous pression
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className={`flex items-center p-1 rounded-xl border text-xs font-mono ${channelToggleWrap}`}>
              <button
                type="button"
                onClick={() => {
                  setChannel('email');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'email' ? 'bg-[var(--primary)] text-white font-bold' : channelIdle
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Email (M365)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setChannel('whatsapp');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'whatsapp' ? 'bg-[var(--primary)] text-white font-bold' : channelIdle
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/10' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className={`${
            viewState === 'inbox' && channel === 'whatsapp' ? 'p-0 overflow-hidden' : 'p-6 overflow-y-auto space-y-6'
          } flex-1 flex flex-col ${bodyBg}`}
        >
          {viewState === 'inbox' && (
            <div className={`flex-1 flex flex-col ${channel === 'whatsapp' ? '' : 'space-y-6'}`}>
              {channel === 'email' ? (
                <div
                  className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                    isDark ? 'border-white/10 bg-slate-900' : 'border-[var(--card-border)] bg-[var(--card)]'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between border-b pb-4 text-xs font-mono ${subtitleCls} ${
                      isDark ? 'border-white/10' : 'border-[var(--card-border)]'
                    }`}
                  >
                    <div>
                      <div>
                        <strong className={titleCls}>De :</strong> {currentSenderName} &lt;{currentSenderEmail}&gt;
                      </div>
                      <div className="mt-1">
                        <strong className={titleCls}>Objet :</strong> {currentSubject}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateReport}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border ${
                        isDark
                          ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/50'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-400 hover:bg-emerald-100'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Signaler l&apos;attaque</span>
                    </button>
                  </div>

                  <div
                    className={`text-xs leading-relaxed font-sans cursor-pointer p-4 rounded-xl border ${
                      isDark
                        ? 'text-slate-200 bg-slate-950 border-white/5'
                        : 'text-[var(--foreground)] bg-[var(--surface-inset)] border-[var(--card-border)]'
                    }`}
                    onClick={() => handleSimulateClickTrap()}
                    dangerouslySetInnerHTML={{ __html: currentBody }}
                  />
                </div>
              ) : (
                <WhatsAppSimulator
                  onClickedTrap={handleSimulateClickTrap}
                  onReportedPhish={handleSimulateReport}
                  isDark={isDark}
                />
              )}
            </div>
          )}

          {viewState === 'landing_page_clicked' && (
            <div
              className={`p-8 md:p-10 rounded-2xl border-2 space-y-6 text-center mx-auto w-full max-w-2xl ${
                isDark
                  ? 'border-rose-500/40 bg-slate-900 shadow-inner'
                  : 'border-rose-300 bg-rose-50/90 shadow-sm'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                  isDark ? 'bg-rose-500/25 border border-rose-400/50 text-rose-300' : 'bg-rose-100 border border-rose-300 text-rose-600'
                }`}
              >
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                <h3 className={`text-2xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-rose-950'}`}>
                  Ceci était une simulation VIGILO
                </h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  Vous avez cliqué sur un lien ou accepté une demande suspecte. Pas de panique, il s&apos;agissait d&apos;un
                  exercice de prévention non punitif !
                </p>
              </div>

              <div
                className={`p-5 rounded-xl border text-left max-w-xl mx-auto space-y-2 ${
                  isDark ? 'bg-[#05070c] border-white/10' : 'bg-white border-[var(--card-border)]'
                }`}
              >
                <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  Indices qu&apos;il s&apos;agissait d&apos;un piège :
                </h4>
                <ul className={`space-y-1.5 text-xs ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                  {activeRedFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className={`font-bold shrink-0 ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={handleLaunchTargetTraining}
                className="vigilo-btn-orange px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer text-white"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Suivre le micro-module de 2 minutes</span>
              </button>
            </div>
          )}

          {viewState === 'reported_success' && (
            <div
              className={`p-8 md:p-10 rounded-2xl border-2 space-y-6 text-center mx-auto w-full max-w-2xl ${
                isDark
                  ? 'border-emerald-400/50 bg-gradient-to-b from-emerald-950/80 to-slate-900 shadow-lg'
                  : 'border-emerald-400 bg-gradient-to-b from-emerald-50 to-white shadow-md'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
                  isDark
                    ? 'bg-emerald-500/30 border-2 border-emerald-400/60 text-emerald-200'
                    : 'bg-emerald-100 border-2 border-emerald-500 text-emerald-700'
                }`}
              >
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-3 max-w-xl mx-auto">
                <h3
                  className={`text-2xl md:text-3xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-emerald-950'
                  }`}
                >
                  Excellent réflexe de sécurité !
                </h3>
                <p className={`text-base leading-relaxed ${isDark ? 'text-emerald-50/95' : 'text-slate-800'}`}>
                  Vous avez identifié et signalé l&apos;attaque avec succès. Votre geste protège l&apos;ensemble de
                  l&apos;entreprise.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border text-sm font-semibold max-w-md mx-auto ${
                  isDark
                    ? 'bg-emerald-900/60 border-emerald-500/40 text-emerald-100'
                    : 'bg-white border-emerald-300 text-emerald-900 shadow-sm'
                }`}
              >
                <span className="font-mono text-[var(--primary)]">+15</span> Points de Vigilance Humaine attribués à
                votre cohorte !
              </div>

              <button
                type="button"
                onClick={onClose}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold cursor-pointer border transition-colors ${
                  isDark
                    ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                    : 'bg-[var(--foreground)] text-[var(--background)] border-transparent hover:opacity-90'
                }`}
              >
                Fermer le simulateur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
