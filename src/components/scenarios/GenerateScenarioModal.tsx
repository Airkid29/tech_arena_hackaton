import React, { useEffect, useState } from 'react';
import { X, Sparkles, Wand2, Check } from 'lucide-react';
import { Scenario, ScenarioCategory, DifficultyLevel, SimulationProviderSettings } from '../../types';
import { rodiumAiService } from '../../services/api';

interface GenerateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioGenerated: (newScenario: Scenario) => void;
  companyProfile: SimulationProviderSettings;
}

export const GenerateScenarioModal: React.FC<GenerateScenarioModalProps> = ({
  isOpen,
  onClose,
  onScenarioGenerated,
  companyProfile,
}) => {
  const [scenarioType, setScenarioType] = useState<ScenarioCategory>('Phishing');
  const [targetAudience, setTargetAudience] = useState('Direction & Finance');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moyen');
  const [companyContext, setCompanyContext] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<Record<string, unknown> | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setGeneratedResult(null);
      setErrorMessage('');
      return;
    }
    const profileContext = [
      companyProfile.industry && `secteur : ${companyProfile.industry}`,
      `pays : ${companyProfile.country}`,
      companyProfile.companyDomain && `domaine officiel : ${companyProfile.companyDomain}`,
    ].filter(Boolean).join(', ');
    setCompanyContext(profileContext || 'Entreprise de taille PME');
  }, [companyProfile, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setErrorMessage('');
    try {
      const data = await rodiumAiService.generateScenario({
        scenarioType,
        targetAudience,
        difficulty,
        companyContext: companyContext.trim(),
        trainingTone: companyProfile.trainingTone,
      });
      setGeneratedResult(data);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'La génération du scénario a échoué.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!generatedResult) return;
    const readText = (key: string, fallback: string) =>
      typeof generatedResult[key] === 'string' ? generatedResult[key] as string : fallback;
    const readList = (key: string, fallback: string[]) =>
      Array.isArray(generatedResult[key])
        ? generatedResult[key].filter((value): value is string => typeof value === 'string')
        : fallback;
    const newScenario: Scenario = {
      id: `scen-ai-${Date.now()}`,
      name: readText('name', `Atelier pédagogique ${scenarioType}`),
      category: scenarioType,
      difficulty,
      senderName: companyProfile.preferredLanguage === 'en'
        ? 'VIGILO learning example'
        : 'Exemple pédagogique VIGILO',
      senderEmail: 'exemple@simulation.invalid',
      subject: `[${companyProfile.preferredLanguage === 'en' ? 'VIGILO EXERCISE' : 'EXERCICE VIGILO'}] ${scenarioType} · ${targetAudience}`,
      previewText: readText('previewText', `Atelier pédagogique pour ${targetAudience}`),
      body: readText('body', '<p>Atelier pédagogique non envoyable.</p>'),
      psychologicalTriggers: readList('psychologicalTriggers', []),
      redFlags: readList('redFlags', []),
      landingPageContent: readText('landingPageContent', 'Vérifiez toute demande par un canal indépendant connu.'),
      isAiGenerated: true,
    };
    onScenarioGenerated(newScenario);
    onClose();
  };

  const triggers = Array.isArray(generatedResult?.psychologicalTriggers)
    ? generatedResult.psychologicalTriggers.filter((value): value is string => typeof value === 'string')
    : [];
  const redFlags = Array.isArray(generatedResult?.redFlags)
    ? generatedResult.redFlags.filter((value): value is string => typeof value === 'string')
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      data-vigilo-modal
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
        <div className="shrink-0 p-4 sm:p-5 border-b border-[var(--card-border)] bg-[var(--muted)] flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-[var(--foreground)]">Atelier IA personnalisé</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Contenu pédagogique contextualisé, non réutilisable comme message réel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--accent)] cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm min-h-0">
          {!generatedResult ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">Type de scénario</label>
                  <select
                    value={scenarioType}
                    onChange={(e) => setScenarioType(e.target.value as ScenarioCategory)}
                    className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer"
                  >
                    <option value="WhatsApp Phishing">WhatsApp (Whishing)</option>
                    <option value="Phishing">Phishing Email</option>
                    <option value="Fake Invoice">Fake Invoice (RIB)</option>
                    <option value="Smishing">Smishing (SMS)</option>
                    <option value="MFA Fatigue">MFA Fatigue</option>
                    <option value="Social Engineering">Social Engineering</option>
                    <option value="Ransomware">Ransomware</option>
                    <option value="QR Code (Quishing)">QR Code (Quishing)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--foreground)]">Public cible</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm cursor-pointer"
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
                <label className="text-xs font-semibold text-[var(--foreground)]">Difficulté</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2.5 rounded-lg font-medium text-xs border cursor-pointer ${
                        difficulty === lvl
                          ? 'border-emerald-600 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold'
                          : 'border-[var(--card-border)] bg-[var(--surface-inset)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)]">Contexte PME</label>
                <textarea
                  value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value.slice(0, 300))}
                  rows={3}
                  className="vigilo-input w-full px-3 py-2.5 rounded-lg text-sm resize-none"
                  placeholder="Fournisseurs, logiciels, période fiscale…"
                />
              </div>

              {errorMessage && (
                <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {errorMessage}
                </p>
              )}

              <div className="pt-2 flex justify-stretch sm:justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="vigilo-btn-orange w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 cursor-pointer"
                >
                  <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  {isGenerating ? 'Génération…' : 'Générer avec le Coach IA'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="w-4 h-4 shrink-0" />
                  Atelier pédagogique généré · {String(generatedResult._engine || 'vigilo-builtin')}
                </div>
                {typeof generatedResult._warning === 'string' && generatedResult._warning && (
                  <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                    {generatedResult._warning}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs underline text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer text-left sm:text-right"
                >
                  Modifier les paramètres
                </button>
              </div>

              <div className="p-4 rounded-xl border border-[var(--card-border)] bg-[var(--surface-inset)] space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-[var(--primary)] uppercase">
                    {String(generatedResult.category || scenarioType)} · {difficulty}
                  </span>
                  <h3 className="text-base font-bold text-[var(--foreground)] mt-1">{String(generatedResult.name)}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm bg-[var(--card)] p-3 rounded-lg border border-[var(--card-border)]">
                  <div className="text-[var(--muted-foreground)]">
                    Expéditeur :{' '}
                    <strong className="text-[var(--foreground)]">{String(generatedResult.senderName)}</strong>
                  </div>
                  <div className="text-[var(--muted-foreground)] break-all">
                    Adresse :{' '}
                    <code className="text-[var(--primary)] font-mono text-xs">{String(generatedResult.senderEmail)}</code>
                  </div>
                  <div className="sm:col-span-2 text-[var(--muted-foreground)]">
                    Objet : <span className="text-[var(--foreground)] font-medium">{String(generatedResult.subject)}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-[var(--foreground)]">Aperçu du message</span>
                  <div
                    className="p-4 rounded-lg bg-white text-slate-900 border border-[var(--card-border)] overflow-x-auto text-xs max-h-48 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: String(generatedResult.body) }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)]">
                    <span className="font-semibold text-[var(--foreground)] text-xs">Axes de vigilance</span>
                    <ul className="mt-2 space-y-1 text-[var(--muted-foreground)] text-xs">
                      {triggers.map((tr, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                          {tr}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--card)] border border-[var(--card-border)]">
                    <span className="font-semibold text-[var(--foreground)] text-xs">Red flags</span>
                    <ul className="mt-2 space-y-1 text-[var(--muted-foreground)] text-xs">
                      {redFlags.map((rf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                          {rf}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="vigilo-btn-secondary w-full sm:w-auto px-4 py-2.5 rounded-lg text-sm cursor-pointer">
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="vigilo-btn-orange w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer"
                >
                  Ajouter au catalogue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
