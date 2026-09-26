import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  ExternalLink,
  Info,
  CheckCircle2,
  Inbox,
  ArrowRight,
  PhoneCall,
  Sparkles,
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
}) => {
  if (!isOpen) return null;

  const currentCategory = campaign ? campaign.category : scenario?.category || 'Phishing';
  const isWhatsAppInitial = currentCategory === 'WhatsApp Phishing';

  // Active Channel: 'email' | 'whatsapp'
  const [channel, setChannel] = useState<'email' | 'whatsapp'>(isWhatsAppInitial ? 'whatsapp' : 'email');

  // View state: 'inbox' | 'landing_page_clicked' | 'reported_success'
  const [viewState, setViewState] = useState<'inbox' | 'landing_page_clicked' | 'reported_success'>('inbox');

  // Sync channel if scenario changes
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
    'Numéro de mobile non enregistré dans l\'annuaire interne d\'entreprise',
    'Usurpation d\'un dirigeant (Fraude au Président) ou d\'un support informatique',
    'Prétexte de réunion confidentielle ou NDA pour interdire tout appel vocal',
    'Demande inhabituelle d\'action financière ou de clic sur un lien non sécurisé',
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl border border-white/15 bg-[#080b11] text-slate-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f2620a]/20 border border-[#f2620a]/40 text-[#fb923c] flex items-center justify-center font-bold text-xs">
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Aperçu Collaborateur — {currentScenarioName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Mode Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Test de la réaction réelle du collaborateur sous pression
              </p>
            </div>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <button
                onClick={() => {
                  setChannel('email');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'email' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (M365)</span>
              </button>
              <button
                onClick={() => {
                  setChannel('whatsapp');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'whatsapp' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className={`${viewState === 'inbox' && channel === 'whatsapp' ? 'p-0 overflow-hidden' : 'p-6 overflow-y-auto space-y-6'} flex-1 bg-[#05070c] flex flex-col`}>
          {viewState === 'inbox' && (
            <div className={`flex-1 flex flex-col ${channel === 'whatsapp' ? '' : 'space-y-6'}`}>
              {channel === 'email' ? (
                /* Email View */
                <div className="p-6 rounded-2xl border border-white/10 bg-slate-900 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono text-slate-400">
                    <div>
                      <div><strong className="text-white">De :</strong> {currentSenderName} &lt;{currentSenderEmail}&gt;</div>
                      <div className="mt-1"><strong className="text-white">Objet :</strong> {currentSubject}</div>
                    </div>

                    {/* Report button */}
                    <button
                      onClick={handleSimulateReport}
                      className="vigilo-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Signaler l'attaque</span>
                    </button>
                  </div>

                  {/* Body preview */}
                  <div
                    className="text-xs text-slate-200 leading-relaxed font-sans cursor-pointer p-4 bg-slate-950 rounded-xl border border-white/5"
                    onClick={() => handleSimulateClickTrap()}
                    dangerouslySetInnerHTML={{ __html: currentBody }}
                  />
                </div>
              ) : (
                /* WhatsApp View */
                <WhatsAppSimulator
                  onClickedTrap={handleSimulateClickTrap}
                  onReportedPhish={handleSimulateReport}
                />
              )}
            </div>
          )}

          {viewState === 'landing_page_clicked' && (
            /* Trap Clicked Awareness View */
            <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-extrabold text-white">Ceci était une simulation VIGILO</h3>
                <p className="text-sm text-slate-300">
                  Vous avez cliqué sur un lien ou accepté une demande suspecte. Pas de panique, il s'agissait d'un exercice de prévention non punitif !
                </p>
              </div>

              {/* Red Flags List */}
              <div className="p-5 rounded-xl bg-slate-900 border border-white/10 text-left max-w-xl mx-auto space-y-2">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Indices qu'il s'agissait d'un piège :
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeRedFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleLaunchTargetTraining}
                className="vigilo-btn-orange px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Suivre le micro-module de 2 minutes</span>
              </button>
            </div>
          )}

          {viewState === 'reported_success' && (
            /* Reported Success View */
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-extrabold text-white">Excellent réflexe de sécurité !</h3>
                <p className="text-sm text-slate-300">
                  Vous avez identifié et signalé l'attaque avec succès. Votre geste protège l'ensemble de l'entreprise.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-emerald-400 max-w-md mx-auto">
                +15 Points de Vigilance Humaine attribués à votre cohorte !
              </div>

              <button
                onClick={onClose}
                className="vigilo-btn-secondary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
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
