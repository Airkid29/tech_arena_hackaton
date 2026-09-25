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
    // Guarantee that if user was on WhatsApp or Whishing, we route strictly to the WhatsApp Whishing module
    if (channel === 'whatsapp' || currentCategory === 'WhatsApp Phishing') {
      onStartTrainingFromTrap('train-whatsapp-whishing');
    } else {
      const targetCategory = scenario?.category || campaign?.category || 'Phishing';
      onStartTrainingFromTrap(targetCategory);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full max-w-4xl border rounded-2xl shadow-2xl overflow-hidden my-4 flex flex-col max-h-[92vh] transition-colors ${
          isDark
            ? 'bg-[#0b0f17] border-slate-700 text-white'
            : 'bg-white border-slate-300 text-slate-900'
        }`}
      >
        {/* TOP CONTROL BAR: Channel Switcher & Mode indicators */}
        <div
          className={`px-4 sm:px-5 py-3 border-b flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 ${
            isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-100 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <strong className={isDark ? 'text-white' : 'text-slate-900'}>
              Simulateur Collaborateur VIGILO
            </strong>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <span className={`truncate max-w-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {currentScenarioName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Multi-channel selector: Email vs WhatsApp */}
            <div
              className={`flex items-center p-0.5 rounded-lg border text-xs ${
                isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <button
                onClick={() => {
                  setChannel('email');
                  setViewState('inbox');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'email'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Pro</span>
              </button>
              <button
                onClick={() => {
                  setChannel('whatsapp');
                  setViewState('inbox');
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
                  channel === 'whatsapp'
                    ? 'bg-[#25D366] text-[#111B21] shadow-xs'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp Pro</span>
              </button>
            </div>

            {viewState !== 'inbox' && (
              <button
                onClick={() => setViewState('inbox')}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Revoir le message
              </button>
            )}

            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
              }`}
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* VIEW 1: INBOX / SIMULATOR VIEW */}
        {viewState === 'inbox' && (
          <>
            {channel === 'whatsapp' ? (
              <WhatsAppSimulator
                scenario={scenario}
                onClickedTrap={handleSimulateClickTrap}
                onReportedPhish={handleSimulateReport}
                isDark={isDark}
              />
            ) : (
              <div className="flex-1 flex flex-col overflow-y-auto">
                {/* Outlook Web Webmail Header */}
                <div
                  className={`px-6 py-4 border-b flex items-center justify-between ${
                    isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      MS
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {currentSenderName}
                        </span>
                        <span className="text-[11px] px-1.5 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          Externe
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>De : {currentSenderEmail}</span>
                        <span>·</span>
                        <span>À : vous &lt;employe@votre-entreprise.fr&gt;</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSimulateReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
                      title="Signaler à VIGILO"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Signaler à VIGILO</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div
                  className={`px-6 py-3 border-b text-sm font-semibold ${
                    isDark ? 'bg-[#1e293b]/50 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                >
                  Objet : {currentSubject}
                </div>

                {/* Email Body with trap click handler */}
                <div className="p-6 flex-1 bg-white text-slate-900 overflow-y-auto">
                  <div
                    className="prose prose-sm max-w-none text-slate-800"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (target.tagName === 'A' || target.closest('a')) {
                        handleSimulateClickTrap(e);
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: currentBody }}
                  />

                  {/* Interactive prompt to help tester */}
                  <div className="mt-8 p-3 rounded-lg bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900">
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-blue-600 shrink-0" />
                      <span>
                        <strong>Test de simulation :</strong> Cliquez sur le lien pour simuler un collaborateur piégé, ou sur <em>Signaler à VIGILO</em> pour tester le réflexe de défense.
                      </span>
                    </div>
                    <button
                      onClick={handleSimulateClickTrap}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded text-[11px] font-medium hover:bg-blue-700 shrink-0 cursor-pointer self-start sm:self-auto"
                    >
                      Simuler le clic
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* VIEW 2: EDUCATIONAL LANDING PAGE (When employee clicked the trap) */}
        {viewState === 'landing_page_clicked' && (
          <div
            className={`flex-1 overflow-y-auto p-6 md:p-8 space-y-6 ${
              isDark ? 'bg-[#090d16] text-white' : 'bg-slate-50 text-slate-900'
            }`}
          >
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <span className="text-xs font-mono uppercase text-amber-500 tracking-wider font-semibold">
                    Exercice de sensibilisation VIGILO · {channel === 'whatsapp' ? 'Vecteur WhatsApp (Whishing & Fraude au Président)' : 'Vecteur Email Pro'}
                  </span>
                  <h2 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Oups ! Ceci était une simulation de cyberattaque contrôlée.
                  </h2>
                </div>
              </div>

              <div
                className={`p-5 rounded-xl border space-y-3 text-xs leading-relaxed ${
                  isDark ? 'bg-[#0f172a] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                <p>
                  <strong>Rassurez-vous :</strong> Vos mots de passe, compte WhatsApp et données professionnelles ne sont absolument pas compromis. Cet exercice a été programmé par votre entreprise pour vous aider à déceler les pièges réels du quotidien.
                </p>
                <p>
                  {channel === 'whatsapp' ? (
                    <span>
                      Dans une cyberattaque réelle par <strong>WhatsApp Phishing (Whishing & Fraude au Président)</strong>, l'attaquant contourne les passerelles de messagerie de l'entreprise pour vous inciter par urgence psychologique et intimidation à valider un faux virement, installer un malware ou livrer des identifiants confidentiels.
                    </span>
                  ) : (
                    <span>
                      Dans une attaque réelle par courriel, le lien sur lequel vous venez de cliquer aurait pu voler vos identifiants de session d'entreprise ou télécharger un rançongiciel sur le réseau.
                    </span>
                  )}
                </p>
              </div>

              {/* Red flags in this specific lure */}
              <div className="space-y-3 text-xs">
                <h4 className={`font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {channel === 'whatsapp'
                    ? 'Les 4 signaux d\'alerte caractéristiques de cette tentative WhatsApp :'
                    : 'Les 3 indices qui auraient dû vous alerter dans ce courriel :'}
                </h4>
                <div className="space-y-2">
                  {activeRedFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex items-center gap-3 ${
                        isDark ? 'border-red-900/40 bg-red-950/20 text-slate-200' : 'border-red-200 bg-red-50 text-slate-800'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-mono text-[10px] shrink-0 font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium">{flag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Golden rule for WhatsApp */}
              {channel === 'whatsapp' && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
                    isDark ? 'border-emerald-900/50 bg-emerald-950/20 text-slate-300' : 'border-emerald-200 bg-emerald-50 text-slate-800'
                  }`}
                >
                  <PhoneCall className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-600 dark:text-emerald-300">La règle d'or du contre-appel :</strong>
                    <p className="mt-1 leading-relaxed">
                      Dès qu'une demande inhabituelle (virement, bon de commande, mot de passe, validation express) arrive sur WhatsApp ou SMS, appelez toujours votre interlocuteur sur son <strong>numéro fixe officiel interne</strong> avant toute action.
                    </p>
                  </div>
                </div>
              )}

              {/* Immediate CTA to micro-training */}
              <div
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'border-blue-900/50 bg-blue-950/30' : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="text-blue-600 dark:text-blue-300 font-bold text-sm flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      {channel === 'whatsapp'
                        ? 'Micro-formation : WhatsApp Whishing & Fraude au Président (4 min)'
                        : 'Micro-formation ciblée VIGILO (4 minutes)'}
                    </span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Découvrez immédiatement les réflexes simples pour ne plus jamais tomber dans le piège.
                  </p>
                </div>

                <button
                  onClick={handleLaunchTargetTraining}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto shrink-0"
                >
                  Suivre la formation maintenant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: REPORTED SUCCESS (When employee reported the phish) */}
        {viewState === 'reported_success' && (
          <div
            className={`flex-1 overflow-y-auto p-8 flex items-center justify-center ${
              isDark ? 'bg-[#090d16] text-white' : 'bg-slate-50 text-slate-900'
            }`}
          >
            <div className="max-w-lg mx-auto text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-xl">
                <ShieldCheck className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-mono uppercase text-emerald-600 dark:text-emerald-400 tracking-wider font-semibold">
                  Excellent réflexe de sécurité !
                </span>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Bravo ! Vous avez déjoué la tentative {channel === 'whatsapp' ? 'WhatsApp' : 'de phishing'}.
                </h2>
              </div>

              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Ce message était un test contrôlé envoyé dans le cadre du programme de cyber-résilience de l'entreprise. En cliquant sur le bouton de signalement VIGILO, vous venez de protéger l'ensemble de votre organisation !
              </p>

              <div
                className={`p-4 rounded-xl border text-xs text-left space-y-1 ${
                  isDark ? 'bg-[#0f172a] border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
                }`}
              >
                <div className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Statistiques de vigilance mises à jour</span>
                </div>
                <p className="text-slate-500">
                  Votre signalement a été instantanément comptabilisé dans le tableau de bord cyber de l'entreprise.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => setViewState('inbox')}
                  className={`px-4 py-2 rounded-lg border text-xs cursor-pointer ${
                    isDark ? 'border-slate-800 text-slate-300 hover:text-white' : 'border-slate-300 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Revoir le message
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md cursor-pointer"
                >
                  Terminer la simulation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
