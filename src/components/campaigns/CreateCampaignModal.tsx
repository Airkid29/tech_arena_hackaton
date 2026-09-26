import React, { useState } from 'react';
import { X, Play, ShieldAlert, Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Campaign, Scenario, ScenarioCategory, DifficultyLevel, Employee } from '../../types';

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
  if (!isOpen) return null;

  const defaultScenario = preselectedScenarioId
    ? scenarios.find((s) => s.id === preselectedScenarioId) || scenarios[0]
    : scenarios[0];

  const [name, setName] = useState(
    isReTestMode && baselineCampaign
      ? `Re-test : ${baselineCampaign.name} (Post-Formation)`
      : `Campagne ${defaultScenario.category} — ${new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`
  );
  const [description, setDescription] = useState(
    isReTestMode && baselineCampaign
      ? `Campagne de re-test pour mesurer la réduction du risque cyber après la micro-formation.`
      : `Simulation contrôlée de type ${defaultScenario.category} pour évaluer le réflexe de vérification des équipes.`
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenario.id);
  const [targetGroup, setTargetGroup] = useState(
    baselineCampaign ? baselineCampaign.targetGroup : 'Tous les collaborateurs'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultScenario.difficulty);
  const [adminValidated, setAdminValidated] = useState(false);
  const [sendRealEmails, setSendRealEmails] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminValidated) return;

    // Target sizes per cohort
    const cohortSizes: Record<string, number> = {
      'Tous les collaborateurs': 32,
      'Direction & Finance': 12,
      'Équipe Commerciale': 10,
      'Ressources Humaines': 6,
      'Technique & R&D': 14,
    };
    const targetedCount = cohortSizes[targetGroup] || 25;

    // Build departments
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

    if (sendRealEmails && employees && employees.length > 0) {
      setIsSending(true);
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      
      const targetedEmployees = targetGroup.startsWith('Tous') 
        ? employees 
        : employees.filter(emp => targetGroup.includes(emp.department));

      try {
        await Promise.all(targetedEmployees.map(emp => 
          fetch('/api/send-live-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emp.email, scenario: selectedScenario, origin }),
          })
        ));
      } catch (err) {
        console.error("Erreur lors de l'envoi des emails réels:", err);
      }
      setIsSending(false);
    }

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d131f] border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Play className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isReTestMode ? 'Créer une campagne de Re-test' : 'Nouvelle campagne de simulation'}
              </h2>
              <p className="text-xs text-slate-400">
                {isReTestMode
                  ? 'Évaluez les progrès des collaborateurs après la micro-formation'
                  : 'Configurez et lancez une cyberattaque contrôlée'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Nom de la campagne</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Objectif opérationnel</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Select Scenario */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200">Scénario d'attaque contrôlée</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {scenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioId(scen.id);
                    setDifficulty(scen.difficulty);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScenarioId === scen.id
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{scen.category}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{scen.difficulty}</span>
                  </div>
                  <div className="text-slate-300 font-medium text-[11px] mt-1 line-clamp-1">
                    {scen.name}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">
                    Expéditeur : {scen.senderName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Population & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Population cible</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Tous les collaborateurs">Tous les collaborateurs (32)</option>
                <option value="Direction & Finance">Direction & Finance (12)</option>
                <option value="Équipe Commerciale">Équipe Commerciale (10)</option>
                <option value="Ressources Humaines">Ressources Humaines (6)</option>
                <option value="Technique & R&D">Technique & R&D (14)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Niveau de difficulté</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300 font-semibold'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory Administrator Validation Checkbox (Section 6) */}
          <div className="p-3.5 rounded-lg border border-amber-900/60 bg-amber-950/20 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="admin-validate"
                checked={adminValidated}
                onChange={(e) => setAdminValidated(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-amber-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="admin-validate" className="text-slate-300 leading-relaxed cursor-pointer">
                <strong className="text-amber-300">Validation administrateur obligatoire :</strong> J'atteste que cette campagne est déployée dans un cadre de sensibilisation autorisé et contrôlé au sein de l'entreprise, conformément aux recommandations de l'ANCy.
              </label>
            </div>
            
            <div className="flex items-start gap-2.5 mt-3 pt-3 border-t border-amber-900/30">
              <input
                type="checkbox"
                id="send-real-emails"
                checked={sendRealEmails}
                onChange={(e) => setSendRealEmails(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-[#fb923c] focus:ring-0 cursor-pointer"
              />
              <label htmlFor="send-real-emails" className="text-slate-300 leading-relaxed cursor-pointer">
                <strong className="text-[#fb923c]">Envoyer réellement les emails :</strong> Actionner l'envoi réel aux collaborateurs ciblés dans l'Annuaire.
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!adminValidated || isSending}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isSending ? 'Envoi en cours...' : (isReTestMode ? 'Démarrer le Re-test' : 'Lancer la simulation')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
