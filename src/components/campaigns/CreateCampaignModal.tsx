import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { Campaign, Scenario, DifficultyLevel, Employee } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
  employees: Employee[];
  onCreate: (campaignData: Partial<Campaign>) => void;
  preselectedScenarioId?: string;
  isReTestMode?: boolean;
  baselineCampaign?: Campaign;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  employees,
  onCreate,
  preselectedScenarioId,
  isReTestMode,
  baselineCampaign,
}) => {
  const defaultScenario = preselectedScenarioId
    ? scenarios.find((s) => s.id === preselectedScenarioId) || scenarios[0]
    : scenarios[0];

  const [name, setName] = useState(
    isReTestMode && baselineCampaign
      ? `Re-test : ${baselineCampaign.name} (Post-Formation)`
      : `Campagne ${defaultScenario?.category || 'Phishing'} — ${new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`
  );
  const [description, setDescription] = useState(
    isReTestMode && baselineCampaign
      ? `Campagne de re-test pour mesurer la réduction du risque cyber après la micro-formation.`
      : `Simulation contrôlée pour évaluer le réflexe de vérification des équipes.`
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenario?.id || scenarios[0]?.id);
  const [targetGroup, setTargetGroup] = useState(
    baselineCampaign ? baselineCampaign.targetGroup : 'Tous les collaborateurs'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultScenario?.difficulty || 'Moyen');
  const [adminValidated, setAdminValidated] = useState(false);
  const [sendRealEmails, setSendRealEmails] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || scenarios.length === 0) return null;

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminValidated) return;

    const cohortSizes: Record<string, number> = {
      'Tous les collaborateurs': 32,
      'Direction & Finance': 12,
      'Équipe Commerciale': 10,
      'Ressources Humaines': 6,
      'Technique & R&D': 14,
    };
    const targetedCount = cohortSizes[targetGroup] || 25;

    const departments =
      targetGroup === 'Direction & Finance'
        ? [
            { name: 'Direction Générale', targeted: 4, opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Comptabilité & Trésorerie', targeted: 8, opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
          ]
        : [
            { name: 'Direction & Finance', targeted: Math.round(targetedCount * 0.2), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Équipe Commerciale', targeted: Math.round(targetedCount * 0.3), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Ressources Humaines', targeted: Math.round(targetedCount * 0.15), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Technique & Dev', targeted: Math.round(targetedCount * 0.35), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
          ];

    const newCampaign: Partial<Campaign> = {
      id: `camp-${Date.now()}`,
      name,
      description,
      scenarioId: selectedScenario.id,
      scenarioName: selectedScenario.name,
      category: selectedScenario.category,
      difficulty,
      targetGroup,
      status: 'en_cours',
      createdAt: new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      targeted: targetedCount,
      delivered: targetedCount,
      opened: Math.round(targetedCount * 0.4),
      clicked: Math.round(targetedCount * (isReTestMode ? 0.08 : 0.25)),
      reported: Math.round(targetedCount * (isReTestMode ? 0.75 : 0.45)),
      clickRate: isReTestMode ? 8.0 : 25.0,
      reportRate: isReTestMode ? 75.0 : 45.0,
      medianReactionTimeMinutes: isReTestMode ? 7 : 18,
      departments,
      isReTest: isReTestMode,
      baselineCampaignId: baselineCampaign?.id,
    };

    if (sendRealEmails && employees.length > 0) {
      setIsSending(true);
      const origin = typeof window !== 'undefined' ? window.location.origin : '';
      const targetedEmployees = targetGroup.startsWith('Tous')
        ? employees
        : employees.filter((emp) => targetGroup.includes(emp.department));

      try {
        await Promise.all(
          targetedEmployees.map((emp) =>
            fetch('/api/send-live-test', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: emp.email, scenario: selectedScenario, origin }),
            })
          )
        );
      } catch (err) {
        console.error("Erreur lors de l'envoi des emails réels:", err);
      }
      setIsSending(false);
    }

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      data-vigilo-modal
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-2xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
        <div className="shrink-0 p-4 sm:p-5 border-b border-[var(--card-border)] bg-[var(--muted)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[var(--primary)]/15 border border-[var(--primary)]/30 flex items-center justify-center shrink-0">
              <Play className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--foreground)] leading-snug">
                {isReTestMode ? 'Campagne de Re-test' : 'Nouvelle campagne'}
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {isReTestMode ? 'Mesurer les progrès post-formation' : 'Cyberattaque contrôlée'}
              </p>
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

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Nom de la campagne</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--foreground)]">Objectif</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-[var(--foreground)]">Scénario</label>
              <div className="grid grid-cols-1 gap-2 max-h-44 sm:max-h-52 overflow-y-auto pr-1">
                {scenarios.map((scen) => (
                  <button
                    key={scen.id}
                    type="button"
                    onClick={() => {
                      setSelectedScenarioId(scen.id);
                      setDifficulty(scen.difficulty);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                      selectedScenarioId === scen.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 ring-1 ring-[var(--primary)]/25'
                        : 'border-[var(--card-border)] bg-[var(--surface-inset)] hover:border-[var(--primary)]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[var(--foreground)] text-xs">{scen.category}</span>
                      <span className="text-[10px] text-[var(--muted-foreground)] font-mono">{scen.difficulty}</span>
                    </div>
                    <div className="text-[var(--foreground)] font-medium text-xs mt-1 line-clamp-2">{scen.name}</div>
                    <div className="text-[var(--muted-foreground)] text-[10px] mt-0.5 line-clamp-1">
                      Expéditeur : {scen.senderName}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Population cible</label>
                <select
                  value={targetGroup}
                  onChange={(e) => setTargetGroup(e.target.value)}
                  className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer"
                >
                  <option value="Tous les collaborateurs">Tous les collaborateurs (32)</option>
                  <option value="Direction & Finance">Direction & Finance (12)</option>
                  <option value="Équipe Commerciale">Équipe Commerciale (10)</option>
                  <option value="Ressources Humaines">Ressources Humaines (6)</option>
                  <option value="Technique & R&D">Technique & R&D (14)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Difficulté</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                        difficulty === lvl
                          ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)] font-semibold'
                          : 'border-[var(--card-border)] bg-[var(--surface-inset)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminValidated}
                  onChange={(e) => setAdminValidated(e.target.checked)}
                  className="mt-1 rounded accent-[var(--primary)]"
                />
                <span className="text-[var(--foreground)] text-xs leading-relaxed">
                  <strong className="text-amber-800 dark:text-amber-300">Validation admin :</strong> j&apos;atteste que cette campagne est autorisée et non punitive au sein de l&apos;entreprise.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer pt-2 border-t border-amber-200 dark:border-amber-900/50">
                <input
                  type="checkbox"
                  checked={sendRealEmails}
                  onChange={(e) => setSendRealEmails(e.target.checked)}
                  className="mt-1 rounded accent-[var(--primary)]"
                />
                <span className="text-[var(--foreground)] text-xs leading-relaxed">
                  <strong className="text-[var(--primary)]">Emails réels :</strong> envoyer aux collaborateurs de l&apos;annuaire (SMTP requis).
                </span>
              </label>
            </div>
          </div>

          <div className="shrink-0 p-4 sm:p-5 border-t border-[var(--card-border)] bg-[var(--muted)] flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="vigilo-btn-secondary w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!adminValidated || isSending}
              className="vigilo-btn-orange w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              {isSending ? 'Envoi…' : isReTestMode ? 'Démarrer le Re-test' : 'Lancer la simulation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
