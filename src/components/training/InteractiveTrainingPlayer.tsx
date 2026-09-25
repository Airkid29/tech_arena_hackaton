import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
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
  // Steps: 0: Situation, 1: Signes d'alerte, 2: Bonne réaction, 3: Mini-question, 4: Terminé
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const stepsMeta = [
    { title: '1. Situation', subtitle: 'Mise en contexte réelle' },
    { title: "2. Signes d'alerte", subtitle: 'Red flags repérables' },
    { title: '3. Bonne réaction', subtitle: 'Procédure recommandée' },
    { title: '4. Mini-quiz', subtitle: 'Validation pratique' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3 && isAnswerSubmitted) {
      onComplete(module.id);
      setCurrentStep(4); // Finished step
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                  Micro-formation {module.durationMinutes} min
                </span>
                <span className="text-xs text-slate-400">· {module.category}</span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">{module.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress indicator */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs">
          {stepsMeta.map((s, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            return (
              <div
                key={idx}
                className={`p-3 border-r last:border-r-0 border-slate-800/80 transition-all ${
                  isActive
                    ? 'bg-blue-600/10 border-b-2 border-b-blue-500'
                    : isCompleted
                    ? 'bg-slate-900/40 text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                <div className={`font-semibold ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : ''}`}>
                  {s.title}
                </div>
                <div className="text-[10px] text-slate-500 hidden sm:block truncate">{s.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {/* STEP 1: SITUATION */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="text-slate-400 font-medium">Mise en situation vécue au quotidien :</div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {module.situation.context}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-slate-400 font-medium">Exemple de message typique reçu :</div>
                <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-200 font-mono text-xs leading-relaxed italic">
                  {module.situation.sampleSnippet}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20 text-slate-300 leading-relaxed space-y-1">
                <div className="font-semibold text-blue-300">Pourquoi cela fonctionne-t-il si souvent ?</div>
                <p>
                  Les attaquants ne cherchent pas à pirater vos serveurs : ils exploitent la surcharge cognitive, le sentiment d'urgence professionnelle ou la confiance naturelle envers vos outils quotidiens.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SIGNES D'ALERTE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-slate-300 font-medium">
                Voici les 3 signes d'alerte clés à toujours inspecter avant d'agir :
              </div>

              <div className="space-y-3">
                {module.warningSigns.map((ws, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800/80 flex items-center justify-center text-[11px] font-mono text-amber-400">
                        0{i + 1}
                      </span>
                      <span>{ws.sign}</span>
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">{ws.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Astuce pratique :</strong> Un nom affiché ("Microsoft", "Direction") ne prouve rien. Seule l'adresse après le symbole @ et le domaine du lien font foi.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: BONNE RÉACTION */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1">
                <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                  Règle d'or de vigilance
                </div>
                <div className="text-sm font-bold text-white leading-relaxed">
                  {module.correctReaction.rule}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-slate-400 font-medium">La procédure réflexe en 3 étapes :</div>
                {module.correctReaction.steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="text-slate-200 leading-relaxed font-medium">{st}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-900/50 text-blue-200 text-xs">
                <strong>Le bouton de signalement :</strong> En signalant un email suspect plutôt qu'en le supprimant silencieusement, vous protégez instantanément vos collègues moins avertis.
              </div>
            </div>
          )}

          {/* STEP 4: MINI-QUESTION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[10px] text-blue-400 uppercase">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mise en pratique</span>
                </div>
                <div className="text-sm font-bold text-white leading-relaxed">
                  {module.miniQuiz.question}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {module.miniQuiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === module.miniQuiz.correctIndex;

                  let style = 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      style = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-red-500 bg-red-950/40 text-red-200';
                    }
                  } else if (isSelected) {
                    style = 'border-blue-500 bg-blue-950/40 text-white font-medium';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !isAnswerSubmitted && setSelectedQuizAnswer(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${style}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 leading-relaxed">{opt}</div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback when submitted */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl border space-y-1.5 animate-in fade-in duration-200 ${
                    isQuizCorrect
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                      : 'border-red-500/60 bg-red-950/30 text-red-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {isQuizCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bonne réponse ! Réflexe validé.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>Ce n'était pas la bonne réaction :</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {module.miniQuiz.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: COMPLÉTION */}
          {currentStep === 4 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Micro-formation complétée !</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Les réflexes d'alerte et de vérification sont assimilés. Vos collaborateurs sont désormais prêts pour la phase de <strong>Re-test</strong> afin de mesurer concrètement la baisse du taux de clic.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onNavigateToReTest}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Passer au Re-test</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Retour au catalogue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep <= 3 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            {currentStep === 3 && !isAnswerSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={selectedQuizAnswer === null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer"
              >
                <span>Valider ma réponse</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentStep === 3 && !isAnswerSubmitted}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer"
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
