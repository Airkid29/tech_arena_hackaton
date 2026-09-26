import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import { TrainingModule } from '../../types';

interface InteractiveTrainingPlayerProps {
  module: TrainingModule;
  onClose: () => void;
  onComplete: (moduleId: string) => void;
  onNavigateToReTest: () => void;
}

export const InteractiveTrainingPlayer: React.FC<InteractiveTrainingPlayerProps> = ({
  module,
  onClose,
  onComplete,
  onNavigateToReTest,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const stepsMeta = [
    { title: '1. Situation', subtitle: 'Contexte' },
    { title: "2. Alertes", subtitle: 'Red flags' },
    { title: '3. Réaction', subtitle: 'Procédure' },
    { title: '4. Quiz', subtitle: 'Validation' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3 && isAnswerSubmitted) {
      onComplete(module.id);
      setCurrentStep(4);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0 && currentStep <= 3) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedQuizAnswer !== null) {
      setIsAnswerSubmitted(true);
    }
  };

  const isQuizCorrect =
    selectedQuizAnswer !== null && selectedQuizAnswer === module.miniQuiz.correctIndex;

  const panelClass = 'p-4 rounded-xl border border-[var(--card-border)] bg-[var(--surface-inset)]';
  const labelMuted = 'text-xs font-semibold text-[var(--muted-foreground)]';
  const bodyText = 'text-sm text-[var(--foreground)] leading-relaxed';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm p-0 sm:p-4"
      data-vigilo-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="training-player-title"
    >
      <div className="w-full sm:max-w-3xl max-h-[96dvh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
        <div className="shrink-0 p-4 sm:p-5 border-b border-[var(--card-border)] bg-[var(--muted)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded border border-[var(--primary)]/25">
                  Micro-formation {module.durationMinutes} min
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">· {module.category}</span>
              </div>
              <h2 id="training-player-title" className="text-sm sm:text-base font-bold text-[var(--foreground)] mt-1 line-clamp-2">
                {module.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--foreground)] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="shrink-0 flex overflow-x-auto border-b border-[var(--card-border)] bg-[var(--background)] text-xs scrollbar-thin">
          {stepsMeta.map((s, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            return (
              <div
                key={idx}
                className={`min-w-[25%] flex-1 p-2.5 sm:p-3 border-r last:border-r-0 border-[var(--card-border)] transition-all ${
                  isActive
                    ? 'bg-[var(--primary)]/10 border-b-2 border-b-[var(--primary)]'
                    : isCompleted
                      ? 'bg-emerald-500/10'
                      : ''
                }`}
              >
                <div
                  className={`font-semibold truncate ${
                    isActive
                      ? 'text-[var(--primary)]'
                      : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-400'
                        : 'text-[var(--muted-foreground)]'
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[10px] text-[var(--muted-foreground)] hidden sm:block truncate">{s.subtitle}</div>
              </div>
            );
          })}
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0 space-y-5 text-sm">
          {currentStep === 0 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className={`${panelClass} space-y-2`}>
                <div className={labelMuted}>Mise en situation :</div>
                <p className={bodyText}>{module.situation.context}</p>
              </div>
              <div className="space-y-2">
                <div className={labelMuted}>Exemple de message :</div>
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 font-mono text-xs leading-relaxed italic">
                  {module.situation.sampleSnippet}
                </div>
              </div>
              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/30 space-y-1">
                <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm">Pourquoi ça marche ?</div>
                <p className="text-sm text-[var(--foreground)] leading-relaxed opacity-90">
                  Les attaquants exploitent l&apos;urgence, l&apos;autorité et la confiance dans les outils du quotidien — pas seulement une faille technique.
                </p>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <p className={`${bodyText} font-medium`}>Signes d&apos;alerte à inspecter avant d&apos;agir :</p>
              <div className="space-y-3">
                {module.warningSigns.map((ws, i) => (
                  <div key={i} className={`${panelClass} space-y-1.5 hover:border-[var(--primary)]/30 transition-colors`}>
                    <div className="flex items-start gap-2 font-semibold text-amber-800 dark:text-amber-300">
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-[11px] font-mono shrink-0">
                        {i + 1}
                      </span>
                      <span>{ws.sign}</span>
                    </div>
                    <p className="text-sm text-[var(--muted-foreground)] pl-8 leading-relaxed">{ws.description}</p>
                  </div>
                ))}
              </div>
              <div className="p-3.5 rounded-lg vigilo-inset flex items-start gap-2 text-sm text-[var(--muted-foreground)]">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[var(--foreground)]">Astuce :</strong> le nom affiché ne suffit pas — vérifiez le domaine et le lien.
                </span>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 space-y-1">
                <div className="font-mono text-[10px] text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Règle d&apos;or
                </div>
                <div className="text-sm font-bold text-[var(--foreground)] leading-relaxed">{module.correctReaction.rule}</div>
              </div>
              <div className="space-y-2">
                <div className={labelMuted}>Procédure en étapes :</div>
                {module.correctReaction.steps.map((st, i) => (
                  <div key={i} className={`${panelClass} flex items-start gap-3`}>
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-xs font-mono font-bold text-emerald-800 dark:text-emerald-400 shrink-0">
                      {i + 1}
                    </div>
                    <div className="text-sm text-[var(--foreground)] leading-relaxed font-medium">{st}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className={`${panelClass} space-y-2`}>
                <div className="flex items-center gap-2 font-mono text-[10px] text-[var(--primary)] uppercase">
                  <HelpCircle className="w-3.5 h-3.5" />
                  Mise en pratique
                </div>
                <div className="text-sm font-bold text-[var(--foreground)] leading-relaxed">{module.miniQuiz.question}</div>
              </div>

              <div className="space-y-2">
                {module.miniQuiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === module.miniQuiz.correctIndex;
                  let style =
                    'border-[var(--card-border)] bg-[var(--surface-inset)] text-[var(--foreground)] hover:border-[var(--primary)]/40';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      style =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-red-500 bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-100';
                    }
                  } else if (isSelected) {
                    style = 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-medium ring-1 ring-[var(--primary)]/30';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => !isAnswerSubmitted && setSelectedQuizAnswer(idx)}
                      disabled={isAnswerSubmitted}
                      className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${style}`}
                    >
                      <div className="w-6 h-6 rounded-full border border-[var(--card-border)] flex items-center justify-center shrink-0 text-xs font-mono bg-[var(--card)]">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="flex-1 leading-relaxed text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl border space-y-1.5 ${
                    isQuizCorrect
                      ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100'
                      : 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-100'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2 text-sm">
                    {isQuizCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Bonne réponse !
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        Ce n&apos;était pas la bonne réaction :
                      </>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed opacity-90">{module.miniQuiz.explanation}</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center py-6 sm:py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)]">Micro-formation complétée !</h3>
              <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed px-2">
                Réflexes assimilés. Passez au <strong className="text-[var(--foreground)]">Re-test</strong> pour mesurer la baisse du taux de clic.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 px-2">
                <button
                  type="button"
                  onClick={onNavigateToReTest}
                  className="vigilo-btn-orange flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Passer au Re-test
                </button>
                <button type="button" onClick={onClose} className="vigilo-btn-secondary px-4 py-2.5 rounded-lg text-sm cursor-pointer">
                  Retour au catalogue
                </button>
              </div>
            </div>
          )}
        </div>

        {currentStep <= 3 && (
          <div className="shrink-0 p-3 sm:p-4 border-t border-[var(--card-border)] bg-[var(--muted)] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="vigilo-btn-secondary flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Précédent</span>
            </button>

            {currentStep === 3 && !isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={selectedQuizAnswer === null}
                className="vigilo-btn-orange px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
              >
                Valider
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                disabled={currentStep === 3 && !isAnswerSubmitted}
                className="vigilo-btn-orange flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white disabled:opacity-40 cursor-pointer"
              >
                <span>{currentStep === 3 ? 'Terminer' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
