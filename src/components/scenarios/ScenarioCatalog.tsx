import React, { useState } from 'react';
import {
  FileCode2,
  Sparkles,
  Plus,
  Play,
  Mail,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Scenario, ScenarioCategory } from '../../types';

interface ScenarioCatalogProps {
  scenarios: Scenario[];
  onOpenCreateCampaignWithScenario: (scenarioId: string) => void;
  onOpenAiGenerator: () => void;
  onSimulateScenario: (scenario: Scenario) => void;
}

export const ScenarioCatalog: React.FC<ScenarioCatalogProps> = ({
  scenarios,
  onOpenCreateCampaignWithScenario,
  onOpenAiGenerator,
  onSimulateScenario,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');

  const filteredScenarios = scenarios.filter((s) =>
    selectedCategory === 'all' ? true : s.category === selectedCategory
  );

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || filteredScenarios[0] || scenarios[0];

  const categories = [
    { id: 'all', label: 'Tous les scénarios' },
    { id: 'WhatsApp Phishing', label: '💬 WhatsApp (Whishing)' },
    { id: 'Phishing', label: '✉️ Phishing Email' },
    { id: 'Fake Invoice', label: '📄 Fake Invoice' },
    { id: 'Smishing', label: '📱 Smishing (SMS)' },
    { id: 'MFA Fatigue', label: '🔔 MFA Fatigue' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-blue-400" />
            <span>Catalogue des scénarios d'attaque contrôlée</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modèles de simulation testés conformes au cadre légal de sensibilisation des collaborateurs.
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <span>Créer avec Vigilo Coach</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-xl border border-slate-800 bg-[#0d131f] overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Two columns: Scenario list & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredScenarios.map((scen) => {
            const isSelected = activeScenario?.id === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-blue-500 bg-[#0f172a] shadow-lg shadow-blue-950/20'
                    : 'border-slate-800/80 bg-[#0d131f] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400">
                      {scen.category}
                    </span>
                    {scen.isAiGenerated && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                        IA
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 font-mono">{scen.difficulty}</span>
                </div>

                <h3 className="text-sm font-bold text-white line-clamp-1">{scen.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {scen.previewText}
                </p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Expéditeur : {scen.senderName}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Preview */}
        {activeScenario && (
          <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-blue-400">{activeScenario.category}</span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs text-slate-400">Difficulté : {activeScenario.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{activeScenario.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSimulateScenario(activeScenario)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                >
                  Tester en live
                </button>
                <button
                  onClick={() => onOpenCreateCampaignWithScenario(activeScenario.id)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium shadow-md shadow-blue-900/30 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Lancer une campagne</span>
                </button>
              </div>
            </div>

            {/* Email Meta Card */}
            <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Expéditeur affiché : </span>
                  <strong className="text-slate-200">{activeScenario.senderName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Adresse d'envoi : </span>
                  <code className="text-blue-400 font-mono text-[11px]">{activeScenario.senderEmail}</code>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500">Objet du message : </span>
                  <span className="text-slate-200 font-medium">{activeScenario.subject}</span>
                </div>
              </div>
            </div>

            {/* Message Body preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-300">Aperçu du leurre reçu par l'employé :</span>
                <span className="text-[11px] font-mono text-amber-400/80">Environnement de test isolé</span>
              </div>
              <div
                className="p-4 rounded-lg bg-white text-slate-900 border border-slate-700 overflow-x-auto text-xs max-h-72 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: activeScenario.body }}
              />
            </div>

            {/* Red flags and Psychological Triggers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Leviers psychologiques exploités</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {activeScenario.psychologicalTriggers.map((trig, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{trig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="font-semibold text-red-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>Signes d'alerte (Red Flags)</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {activeScenario.redFlags.map((flag, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Immediate Landing Page preview */}
            <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-xs space-y-1">
              <span className="font-semibold text-blue-300">
                Message affiché si le collaborateur clique sur le lien simulé :
              </span>
              <p className="text-slate-400 italic">« {activeScenario.landingPageContent} »</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
