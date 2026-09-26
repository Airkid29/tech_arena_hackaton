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

  const [testEmail, setTestEmail] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleSendTestEmail = async () => {
    if (!testEmail || !activeScenario) return;
    setIsSendingTest(true);
    setTestSuccess(null);
    try {
      const origin = window.location.origin;
      const res = await fetch('/api/send-live-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testEmail, scenario: activeScenario, origin })
      });
      const data = await res.json();
      if (data.success) {
        setTestSuccess("✅ Email envoyé avec succès ! Consultez votre boîte de réception pour tester le workflow.");
        setTestEmail('');
      } else {
        alert("Erreur lors de l'envoi : " + data.error);
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur réseau ou le serveur n'est pas à jour. Avez-vous redémarré 'npm run dev' ?");
    } finally {
      setIsSendingTest(false);
    }
  };

  const filteredScenarios = scenarios.filter((s) =>
    selectedCategory === 'all' ? true : s.category === selectedCategory
  );

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || filteredScenarios[0] || scenarios[0];

  // Effacer le message de succès si on change de scénario
  React.useEffect(() => {
    setTestSuccess(null);
  }, [activeScenario]);

  const categories = [
    { id: 'all', label: 'Tous les scénarios' },
    { id: 'WhatsApp Phishing', label: ' WhatsApp (Whishing)' },
    { id: 'Phishing', label: ' Phishing Email' },
    { id: 'Fake Invoice', label: ' Fake Invoice' },
    { id: 'Smishing', label: ' Smishing (SMS)' },
    { id: 'MFA Fatigue', label: ' MFA Fatigue' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-[#fb923c]" />
            <span>Catalogue des scénarios d'attaque contrôlée</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modèles de simulation testés conformes au cadre légal de sensibilisation des collaborateurs (Email & WhatsApp).
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="vigilo-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Générer avec RodiumAI (Coach IA)</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 p-2 rounded-xl border border-white/10 bg-slate-900/80 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Two columns: Scenario list & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-4 space-y-3">
          {filteredScenarios.map((scen) => {
            const isSelected = activeScenario?.id === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`vigilo-card p-4 border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-[#f2620a] bg-[#f2620a]/10 shadow-[0_0_15px_rgba(242,98,10,0.2)]'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {scen.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      scen.difficulty === 'Élevé' || scen.difficulty === 'Difficile'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : scen.difficulty === 'Moyen'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Niveau : {scen.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{scen.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{scen.previewText}</p>
              </div>
            );
          })}
        </div>

        {/* Right Active Scenario Preview */}
        {activeScenario && (
          <div className="lg:col-span-8 vigilo-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-[#fb923c]">Détail du scénario sélectionné</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeScenario.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSimulateScenario(activeScenario)}
                  className="vigilo-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Aperçu live
                </button>
                <button
                  onClick={() => onOpenCreateCampaignWithScenario(activeScenario.id)}
                  className="vigilo-btn-orange px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Lancer la campagne
                </button>
              </div>
            </div>

            {/* Test Email Form */}
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-900/40 space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-200">Envoyer un vrai test (Live Demo)</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="Votre adresse email (pour recevoir le leurre)"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/10 text-slate-200 text-xs rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={isSendingTest || !testEmail}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer shrink-0"
                >
                  {isSendingTest ? 'Envoi en cours...' : 'Envoyer'}
                </button>
              </div>
              {testSuccess && (
                <div className="text-xs font-mono text-emerald-400">
                  {testSuccess}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-slate-400">Expéditeur simulé :</span>
                  <div className="font-bold text-white mt-1">{activeScenario.senderName} ({activeScenario.senderEmail})</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-slate-400">Objet du message :</span>
                  <div className="font-bold text-white mt-1">{activeScenario.subject}</div>
                </div>
              </div>

              {/* Psychological Triggers */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Leviers psychologiques ciblés :
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeScenario.psychologicalTriggers.map((trig, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {trig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message Body Preview Card */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Aperçu du contenu du message :</span>
                <div
                  className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 font-mono leading-relaxed overflow-x-auto min-h-[400px] max-h-[600px] shadow-inner"
                  dangerouslySetInnerHTML={{ __html: activeScenario.body }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
