import React, { useState, useEffect } from 'react';
import { X, Save, GraduationCap } from 'lucide-react';
import { TrainingModule, ScenarioCategory, DifficultyLevel } from '../../types';

interface EditTrainingModalProps {
  isOpen: boolean;
  module: TrainingModule | null;
  onClose: () => void;
  onSave: (updated: TrainingModule) => void;
}

const CATEGORIES: ScenarioCategory[] = [
  'Phishing',
  'Fake Invoice',
  'WhatsApp Phishing',
  'Smishing',
  'MFA Fatigue',
  'Social Engineering',
  'Ransomware',
  'QR Code (Quishing)',
];

const DIFFICULTIES: DifficultyLevel[] = ['Facile', 'Moyen', 'Difficile'];

export const EditTrainingModal: React.FC<EditTrainingModalProps> = ({
  isOpen,
  module,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<TrainingModule | null>(null);
  const [quizOptionsText, setQuizOptionsText] = useState('');

  useEffect(() => {
    if (module) {
      setDraft({ ...module });
      setQuizOptionsText(module.miniQuiz.options.join('\n'));
    }
  }, [module, isOpen]);

  if (!isOpen || !draft) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = quizOptionsText
      .split('\n')
      .map((o) => o.trim())
      .filter(Boolean);
    if (options.length < 2) return;

    const correctIndex = Math.min(
      Math.max(0, draft.miniQuiz.correctIndex),
      options.length - 1
    );

    onSave({
      ...draft,
      miniQuiz: {
        ...draft.miniQuiz,
        options,
        correctIndex,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] bg-[var(--muted)]">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
            <h2 className="text-base font-bold text-[var(--foreground)]">Modifier la formation</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Titre</label>
              <input
                required
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Catégorie</label>
              <select
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as ScenarioCategory })}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Difficulté</label>
              <select
                value={draft.difficulty || 'Moyen'}
                onChange={(e) => setDraft({ ...draft, difficulty: e.target.value as DifficultyLevel })}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm cursor-pointer"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Durée (minutes)</label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={draft.durationMinutes}
                onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Public cible</label>
              <input
                value={draft.targetAudience || ''}
                onChange={(e) => setDraft({ ...draft, targetAudience: e.target.value })}
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
                placeholder="Ex. Finance, Direction…"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Contexte / situation</label>
            <textarea
              required
              rows={4}
              value={draft.situation.context}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  situation: { ...draft.situation, context: e.target.value },
                })
              }
              className="vigilo-input w-full px-3 py-2 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Règle de bonne réaction</label>
            <textarea
              required
              rows={2}
              value={draft.correctReaction.rule}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  correctReaction: { ...draft.correctReaction, rule: e.target.value },
                })
              }
              className="vigilo-input w-full px-3 py-2 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Question du mini-quiz</label>
            <textarea
              required
              rows={2}
              value={draft.miniQuiz.question}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  miniQuiz: { ...draft.miniQuiz, question: e.target.value },
                })
              }
              className="vigilo-input w-full px-3 py-2 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">
              Options de réponse (une par ligne)
            </label>
            <textarea
              required
              rows={4}
              value={quizOptionsText}
              onChange={(e) => setQuizOptionsText(e.target.value)}
              className="vigilo-input w-full px-3 py-2 rounded-lg text-sm font-mono text-xs resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Index bonne réponse (0 = 1ère ligne)</label>
              <input
                type="number"
                min={0}
                value={draft.miniQuiz.correctIndex}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    miniQuiz: { ...draft.miniQuiz, correctIndex: Number(e.target.value) },
                  })
                }
                className="vigilo-input w-full px-3 py-2 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)]">Explication après quiz</label>
            <textarea
              required
              rows={2}
              value={draft.miniQuiz.explanation}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  miniQuiz: { ...draft.miniQuiz, explanation: e.target.value },
                })
              }
              className="vigilo-input w-full px-3 py-2 rounded-lg text-sm resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-[var(--card-border)]">
            <button type="button" onClick={onClose} className="vigilo-btn-secondary px-4 py-2 rounded-lg text-xs cursor-pointer">
              Annuler
            </button>
            <button type="submit" className="vigilo-btn-orange px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer text-white">
              <Save className="w-4 h-4" />
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
