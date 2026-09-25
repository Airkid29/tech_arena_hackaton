import React, { useState } from 'react';
import { X, Sparkles, Wand2, Eye, ShieldAlert, Check } from 'lucide-react';
import { Scenario, ScenarioCategory, DifficultyLevel } from '../../types';
import { rodiumAiService } from '../../services/api';

interface GenerateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioGenerated: (newScenario: Scenario) => void;
}

export const GenerateScenarioModal: React.FC<GenerateScenarioModalProps> = ({
  isOpen,
  onClose,
  onScenarioGenerated,
}) => {
  if (!isOpen) return null;

  const [scenarioType, setScenarioType] = useState<ScenarioCategory>('Phishing');
  const [targetAudience, setTargetAudience] = useState('Direction & Finance');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moyen');
  const [companyContext, setCompanyContext] = useState(
    'PME de 35 collaborateurs, utilisation quotidienne de Microsoft 365, Teams et logiciel de facturation cloud.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const data = await rodiumAiService.generateScenario({
        scenarioType,
        targetAudience,
        difficulty,
        companyContext,
      });
      setGeneratedResult(data);
    } catch (err) {
      console.error('Erreur génération scénario', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!generatedResult) return;
    const newScenario: Scenario = {
      id: `scen-ai-${Date.now()}`,
      name: generatedResult.name || `${scenarioType} sur-mesure Vigilo Coach`,
      category: scenarioType,
      difficulty,
      senderName: generatedResult.senderName || 'Notification Sécurité',
      senderEmail: generatedResult.senderEmail || 'alerte@support-securite-cloud.fr',
      subject: generatedResult.subject || 'Action requise sur votre compte',
      previewText: generatedResult.previewText || 'Scénario généré par Vigilo Coach',
      body: generatedResult.body || '<p>Ceci est un test de simulation VIGILO.</p>',
      psychologicalTriggers: generatedResult.psychologicalTriggers || ['Urgence', 'Autorité'],
      redFlags: generatedResult.redFlags || ['Nom de domaine non officiel', 'Pression temporelle'],
      landingPageContent:
        generatedResult.landingPageContent ||
        'Ceci était un exercice VIGILO. Aucun identifiant n a été compromis.',
      isAiGenerated: true,
    };
    onScenarioGenerated(newScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0d131f] border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Générateur de scénario — Vigilo Coach
              </h2>
              <p className="text-xs text-slate-400">
                Créez un leurre sur-mesure adapté aux outils et habitudes de votre PME
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

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {!generatedResult ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Type de scénario</label>
                  <select
                    value={scenarioType}
                    onChange={(e) => setScenarioType(e.target.value as ScenarioCategory)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="WhatsApp Phishing">💬 WhatsApp Phishing (Whishing & Fraude au Président)</option>
                    <option value="Phishing">✉️ Phishing (Email usurpé)</option>
                    <option value="Fake Invoice">📄 Fake Invoice (Fraude au faux RIB)</option>
                    <option value="Smishing">📱 Smishing (SMS frauduleux)</option>
                    <option value="MFA Fatigue">🔔 MFA Fatigue (Push spamming)</option>
                    <option value="Social Engineering">👤 Social Engineering (Support IT)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Public cible</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Direction & Finance">Direction & Finance</option>
                    <option value="Équipe Commerciale">Équipe Commerciale</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Technique & R&D">Technique & R&D</option>
                    <option value="Tous les collaborateurs">Tous les collaborateurs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Niveau de difficulté souhaité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                        difficulty === lvl
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">
                  Contexte spécifique de la PME (fournisseurs, logiciels, période)
                </label>
                <textarea
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  rows={3}
                  placeholder="Ex : Fin d'année fiscale, changement d'outil RH récent, sous-traitant transport habituel..."
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-950 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Génération RodiumAI en cours...' : 'Générer avec RodiumAI'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Scénario généré par RodiumAI avec succès</span>
                </div>
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Modifier les paramètres
                </button>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    {generatedResult.category} · {generatedResult.difficulty}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{generatedResult.name}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500">Expéditeur simulé : </span>
                    <strong className="text-slate-200">{generatedResult.senderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Adresse : </span>
                    <code className="text-blue-400 font-mono text-[11px]">{generatedResult.senderEmail}</code>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Objet : </span>
                    <span className="text-slate-200 font-medium">{generatedResult.subject}</span>
                  </div>
                </div>

                {/* Email Body preview */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Contenu du message de test :</span>
                  <div
                    className="p-4 rounded-lg bg-white text-slate-900 border border-slate-700 overflow-x-auto text-xs"
                    dangerouslySetInnerHTML={{ __html: generatedResult.body }}
                  />
                </div>

                {/* Red Flags & Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-slate-200">Leviers psychologiques :</span>
                    <ul className="mt-1 space-y-1 text-slate-400">
                      {generatedResult.psychologicalTriggers?.map((tr: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{tr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-slate-200">Signes d'alerte (Red flags) :</span>
                    <ul className="mt-1 space-y-1 text-slate-400">
                      {generatedResult.redFlags?.map((rf: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition-colors"
                >
                  Ajouter au catalogue et utiliser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
