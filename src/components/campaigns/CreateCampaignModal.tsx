import React, { useEffect, useMemo, useState } from 'react';
import { X, Play, Users } from 'lucide-react';
import { Campaign, Scenario, DifficultyLevel, Employee, CompanyDepartment } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
  employees: Employee[];
  departments?: CompanyDepartment[];
  onCreate: (campaignData: Pick<
    Campaign,
    'name' | 'description' | 'scenarioId' | 'scenarioName' | 'category' |
    'difficulty' | 'targetEmployeeIds' | 'isReTest' | 'baselineCampaignId'
  > & {
    launchImmediately?: boolean;
    sendRealEmails?: boolean;
    scenarioBody?: string;
  }) => Promise<Campaign>;
  preselectedScenarioId?: string;
  isReTestMode?: boolean;
  baselineCampaign?: Campaign;
  onSeedDemoDirectory?: () => Promise<void>;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  employees,
  departments = [],
  onCreate,
  preselectedScenarioId,
  isReTestMode,
  baselineCampaign,
  onSeedDemoDirectory,
}) => {
  const [isSeeding, setIsSeeding] = useState(false);
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
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(() => {
    if (baselineCampaign?.targetEmployeeIds?.length) {
      return new Set(baselineCampaign.targetEmployeeIds);
    }
    return new Set();
  });
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<Set<string>>(() => {
    if (baselineCampaign?.targetDepartmentIds?.length) {
      return new Set(baselineCampaign.targetDepartmentIds);
    }
    return new Set();
  });
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultScenario?.difficulty || 'Moyen');
  const [adminValidated, setAdminValidated] = useState(false);
  const [sendRealEmails, setSendRealEmails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const orgDepartments = useMemo(() => {
    if (departments.length > 0) return departments;
    // Fallback: unique departments derived from employees
    const map = new Map<string, CompanyDepartment>();
    for (const emp of employees) {
      const id = emp.departmentId || emp.department;
      if (!id || map.has(id)) continue;
      map.set(id, {
        id,
        adminId: '',
        name: emp.department || id,
        createdAt: '',
      });
    }
    return Array.from(map.values());
  }, [departments, employees]);

  const employeesByDept = useMemo(() => {
    const map = new Map<string, Employee[]>();
    for (const emp of employees) {
      const key = emp.departmentId || emp.department || '—';
      const list = map.get(key) || [];
      list.push(emp);
      map.set(key, list);
    }
    return map;
  }, [employees]);

  useEffect(() => {
    if (!isOpen) return;
    if (baselineCampaign?.targetEmployeeIds?.length) {
      setSelectedEmployeeIds(new Set(baselineCampaign.targetEmployeeIds));
      setSelectedDepartmentIds(new Set(baselineCampaign.targetDepartmentIds || []));
    } else {
      setSelectedEmployeeIds(new Set());
      setSelectedDepartmentIds(new Set());
    }
    setAdminValidated(false);
  }, [isOpen, baselineCampaign?.id]);

  if (!isOpen || scenarios.length === 0) return null;

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const selectedCount = selectedEmployeeIds.size;

  const deptSelectionState = (deptId: string): 'all' | 'some' | 'none' => {
    const members = employeesByDept.get(deptId) || [];
    if (members.length === 0) return selectedDepartmentIds.has(deptId) ? 'all' : 'none';
    const selected = members.filter((e) => selectedEmployeeIds.has(e.id)).length;
    if (selected === 0) return 'none';
    if (selected === members.length) return 'all';
    return 'some';
  };

  const toggleDepartment = (deptId: string) => {
    const members = employeesByDept.get(deptId) || [];
    const state = deptSelectionState(deptId);
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (state === 'all') {
        members.forEach((e) => next.delete(e.id));
      } else {
        members.forEach((e) => next.add(e.id));
      }
      return next;
    });
    setSelectedDepartmentIds((prev) => {
      const next = new Set(prev);
      if (state === 'all') next.delete(deptId);
      else next.add(deptId);
      return next;
    });
  };

  const toggleEmployee = (emp: Employee) => {
    const deptKey = emp.departmentId || emp.department || '—';
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(emp.id)) next.delete(emp.id);
      else next.add(emp.id);
      return next;
    });
    setSelectedDepartmentIds((prev) => {
      const next = new Set(prev);
      const members = employeesByDept.get(deptKey) || [];
      // Keep dept marked if at least one member remains / will remain selected after toggle
      const willBeSelected = !selectedEmployeeIds.has(emp.id);
      const othersSelected = members.some((m) => m.id !== emp.id && selectedEmployeeIds.has(m.id));
      if (willBeSelected || othersSelected) next.add(deptKey);
      else next.delete(deptKey);
      return next;
    });
  };

  const selectAllEmployees = () => {
    setSelectedEmployeeIds(new Set(employees.map((e) => e.id)));
    setSelectedDepartmentIds(new Set(orgDepartments.map((d) => d.id)));
  };

  const clearSelection = () => {
    setSelectedEmployeeIds(new Set());
    setSelectedDepartmentIds(new Set());
  };

  const handleSaveCampaign = async (launchNow: boolean) => {
    if (!adminValidated || selectedCount === 0 || saving) return;

    const selectedEmployees = employees.filter((emp) => selectedEmployeeIds.has(emp.id));
    setSaving(true);
    setSubmitError('');
    try {
      await onCreate({
        name: name.trim(),
        description: description.trim(),
        scenarioId: selectedScenario.id,
        scenarioName: selectedScenario.name,
        category: selectedScenario.category,
        difficulty,
        targetEmployeeIds: selectedEmployees.map((employee) => employee.id),
        isReTest: isReTestMode,
        baselineCampaignId: baselineCampaign?.id,
        launchImmediately: launchNow,
        sendRealEmails: launchNow && sendRealEmails,
        scenarioBody: selectedScenario?.body,
      });
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Impossible de créer la campagne.');
    } finally {
      setSaving(false);
    }
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
                {isReTestMode ? 'Parcours de re-test simulé' : 'Parcours pédagogique simulé'}
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

        <form onSubmit={(e) => { e.preventDefault(); handleSaveCampaign(true); }} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm">
            {submitError && (
              <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {submitError}
              </p>
            )}
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

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-semibold text-[var(--foreground)]">Population cible</label>
                <span className="text-xs font-mono text-[var(--muted-foreground)] flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {selectedCount} sélectionné(s)
                </span>
              </div>

              {employees.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-[#f2620a]/40 bg-[#f2620a]/5 text-center space-y-2.5">
                  <p className="text-xs text-slate-300">
                    Votre annuaire d&apos;entreprise ne contient aucun collaborateur pour le moment.
                  </p>
                  {onSeedDemoDirectory && (
                    <button
                      type="button"
                      onClick={async () => {
                        setIsSeeding(true);
                        try {
                          await onSeedDemoDirectory();
                        } finally {
                          setIsSeeding(false);
                        }
                      }}
                      disabled={isSeeding}
                      className="vigilo-btn-orange inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>{isSeeding ? 'Chargement de la cohorte…' : '⚡ Charger l’annuaire démo ANCy (6 collaborateurs)'}</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="rounded-lg border border-[var(--card-border)] bg-[var(--surface-inset)] overflow-hidden">
                  <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-[var(--card-border)] bg-[var(--muted)]">
                    <button
                      type="button"
                      onClick={selectAllEmployees}
                      className="vigilo-btn-secondary px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                    >
                      Tout sélectionner ({employees.length})
                    </button>
                    <button
                      type="button"
                      onClick={clearSelection}
                      className="vigilo-btn-secondary px-2.5 py-1 rounded-md text-[11px] cursor-pointer"
                    >
                      Effacer
                    </button>
                  </div>

                  {orgDepartments.length > 0 && (
                    <div className="px-3 py-2 border-b border-[var(--card-border)] space-y-1.5">
                      <div className="text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                        Services
                      </div>
                      <div className="flex flex-col gap-1">
                        {orgDepartments.map((dept) => {
                          const members = employeesByDept.get(dept.id) || [];
                          const state = deptSelectionState(dept.id);
                          return (
                            <label
                              key={dept.id}
                              className="flex items-center gap-2.5 py-1 cursor-pointer hover:bg-[var(--muted)]/60 rounded px-1"
                            >
                              <input
                                type="checkbox"
                                checked={state === 'all'}
                                ref={(el) => {
                                  if (el) el.indeterminate = state === 'some';
                                }}
                                onChange={() => toggleDepartment(dept.id)}
                                className="rounded accent-[var(--primary)]"
                              />
                              <span className="text-xs font-medium text-[var(--foreground)] flex-1">
                                {dept.name}
                              </span>
                              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                                {members.filter((m) => selectedEmployeeIds.has(m.id)).length}/{members.length}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="max-h-48 overflow-y-auto">
                    <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)] sticky top-0 bg-[var(--surface-inset)] border-b border-[var(--card-border)]">
                      Collaborateurs
                    </div>
                    <ul className="divide-y divide-[var(--card-border)]">
                      {employees.map((emp) => {
                        const checked = selectedEmployeeIds.has(emp.id);
                        return (
                          <li key={emp.id}>
                            <label className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-[var(--muted)] transition-colors">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() => toggleEmployee(emp)}
                                className="rounded accent-[var(--primary)]"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-[var(--foreground)]">
                                  {emp.firstName} {emp.lastName}
                                </div>
                                <div className="text-[10px] text-[var(--muted-foreground)] font-mono truncate">
                                  {emp.email}
                                </div>
                              </div>
                              <span className="text-[10px] text-[var(--muted-foreground)] shrink-0">
                                {emp.department}
                              </span>
                            </label>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
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

            <div className="p-3.5 rounded-xl border border-[#f2620a]/30 bg-[#f2620a]/5 space-y-3">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adminValidated}
                  onChange={(e) => setAdminValidated(e.target.checked)}
                  className="mt-1 rounded accent-[#f2620a]"
                />
                <span className="text-[var(--foreground)] text-xs leading-relaxed">
                  <strong className="text-[#fb923c]">Validation ANCy & Cadre Éthique :</strong> j&apos;atteste que cette simulation pédagogique et non punitive est autorisée par la direction au sein de l&apos;organisation.
                </span>
              </label>

              <div className="pt-2 border-t border-white/10 space-y-1.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendRealEmails}
                    onChange={(e) => setSendRealEmails(e.target.checked)}
                    className="rounded accent-[#f2620a]"
                  />
                  <span className="text-xs text-slate-200 font-semibold">
                    Envoyer les leurres par email réel aux collaborateurs ciblés (SMTP Live)
                  </span>
                </label>
                <p className="text-[11px] text-slate-400 pl-6">
                  {sendRealEmails
                    ? '⚡ Envoi direct : chaque cible recevra l’email avec le piège pédagogique et lien de redirection VIGILO.'
                    : '🎯 Mode Simulation interactif : la campagne démarre immédiatement avec tableau de bord en direct.'}
                </p>
              </div>
            </div>
          </div>

          <div className="shrink-0 p-4 sm:p-5 border-t border-[var(--card-border)] bg-[var(--muted)] flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="vigilo-btn-secondary w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={!adminValidated || selectedCount === 0 || saving}
              onClick={() => handleSaveCampaign(false)}
              className="vigilo-btn-secondary w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-semibold cursor-pointer disabled:opacity-40"
            >
              Enregistrer en brouillon
            </button>
            <button
              type="button"
              disabled={!adminValidated || selectedCount === 0 || saving}
              onClick={() => handleSaveCampaign(true)}
              className="vigilo-btn-orange w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white disabled:opacity-40 shadow-lg cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{saving ? 'Lancement…' : (isReTestMode ? `Démarrer le Re-test (${selectedCount})` : `Lancer la campagne (${selectedCount})`)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
