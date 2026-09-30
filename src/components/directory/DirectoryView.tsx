import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Users,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Search,
  Trash2,
  Building2,
  Loader2,
} from "lucide-react";
import { Employee, CompanyDepartment, OrgSummary, OrgEmployee } from "../../types";
import { vigiloOrgService } from "../../services/api";

interface DirectoryViewProps {
  employees: Employee[];
  /** Sync App-level employees (campaigns / formations) after org reload or mutation */
  onEmployeesChange: (employees: Employee[]) => void;
}

function mapOrgEmployees(
  orgEmps: OrgEmployee[],
  departments: CompanyDepartment[],
  previous: Employee[]
): Employee[] {
  const prevById = new Map(previous.map((e) => [e.id, e]));
  return orgEmps.map((emp) => {
    const dept = departments.find((d) => d.id === emp.departmentId);
    const prev = prevById.get(emp.id);
    return {
      id: emp.id,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      department: dept?.name || "—",
      departmentId: emp.departmentId,
      role: emp.role,
      riskScore: emp.riskScore,
      trainingAssignments: prev?.trainingAssignments,
    };
  });
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  employees,
  onEmployeesChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [departments, setDepartments] = useState<CompanyDepartment[]>([]);
  const [summary, setSummary] = useState<OrgSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [newDeptName, setNewDeptName] = useState("");
  const [addingDept, setAddingDept] = useState(false);
  const employeesRef = useRef(employees);
  employeesRef.current = employees;

  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    email: "",
    departmentId: "",
    role: "Employé",
  });

  const reload = useCallback(async () => {
    setError("");
    const [depts, orgEmps, sum] = await Promise.all([
      vigiloOrgService.listDepartments(),
      vigiloOrgService.listEmployees(),
      vigiloOrgService.getSummary(),
    ]);
    setDepartments(depts);
    setSummary(sum);
    onEmployeesChange(mapOrgEmployees(orgEmps, depts, employeesRef.current));
    setNewEmp((prev) => ({
      ...prev,
      departmentId: prev.departmentId || depts[0]?.id || "",
    }));
  }, [onEmployeesChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [depts, orgEmps, sum] = await Promise.all([
          vigiloOrgService.listDepartments(),
          vigiloOrgService.listEmployees(),
          vigiloOrgService.getSummary(),
        ]);
        if (cancelled) return;
        setDepartments(depts);
        setSummary(sum);
        onEmployeesChange(mapOrgEmployees(orgEmps, depts, employeesRef.current));
        setNewEmp((prev) => ({
          ...prev,
          departmentId: depts[0]?.id || "",
        }));
      } catch (err: any) {
        if (!cancelled) setError(err.message || "Erreur de chargement de l'annuaire");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Load once when entering Directory
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = employees.filter(
    (e) =>
      e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const dept = await vigiloOrgService.createDepartment(newDeptName.trim());
      setNewDeptName("");
      setAddingDept(false);
      await reload();
      setNewEmp((prev) => ({ ...prev, departmentId: dept.id }));
    } catch (err: any) {
      setError(err.message || "Création du service échouée");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!window.confirm("Supprimer ce service ? (aucun collaborateur ne doit y être rattaché)")) return;
    setSaving(true);
    setError("");
    try {
      await vigiloOrgService.deleteDepartment(id);
      await reload();
    } catch (err: any) {
      setError(err.message || "Suppression du service échouée");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.email || !newEmp.departmentId) return;
    if (summary && summary.remainingSlots <= 0) {
      setError(`Limite atteinte : ${summary.maxEmployees} collaborateurs max`);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await vigiloOrgService.createEmployee({
        firstName: newEmp.firstName,
        lastName: newEmp.lastName,
        email: newEmp.email,
        departmentId: newEmp.departmentId,
        role: newEmp.role || "Employé",
      });
      setIsAdding(false);
      setNewEmp({
        firstName: "",
        lastName: "",
        email: "",
        departmentId: departments[0]?.id || "",
        role: "Employé",
      });
      await reload();
    } catch (err: any) {
      setError(err.message || "Ajout collaborateur échoué");
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Supprimer ce collaborateur ?")) return;
    setSaving(true);
    setError("");
    try {
      await vigiloOrgService.deleteEmployee(id);
      await reload();
    } catch (err: any) {
      setError(err.message || "Suppression échouée");
    } finally {
      setSaving(false);
    }
  };

  const quotaFull = summary ? summary.remainingSlots <= 0 : false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#fb923c]" />
            <span>Annuaire des collaborateurs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez les services de l&apos;entreprise et les collaborateurs ciblés par les campagnes.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          disabled={loading || quotaFull || departments.length === 0}
          className="vigilo-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title={
            departments.length === 0
              ? "Créez d'abord un service"
              : quotaFull
                ? "Quota collaborateurs atteint"
                : undefined
          }
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un collaborateur</span>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="vigilo-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Collaborateurs</span>
            <span className="text-sm font-bold font-mono text-white">
              {summary.employeeCount}
              <span className="text-slate-500"> / {summary.maxEmployees}</span>
            </span>
          </div>
          <div className="vigilo-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Places restantes</span>
            <span
              className={`text-sm font-bold font-mono ${
                summary.remainingSlots === 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {summary.remainingSlots}
            </span>
          </div>
          <div className="vigilo-card px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">Services</span>
            <span className="text-sm font-bold font-mono text-white">{summary.departmentCount}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs font-medium text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      {/* Company departments (org units) */}
      <div className="vigilo-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#fb923c]" />
            Services de l&apos;entreprise
          </h3>
          <button
            type="button"
            onClick={() => setAddingDept((v) => !v)}
            className="text-xs text-[#fb923c] hover:underline cursor-pointer"
          >
            {addingDept ? "Annuler" : "+ Nouveau service"}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Unités organisationnelles (RH, Comptabilité…). Distinct des modules de simulation choisis à l&apos;inscription.
        </p>
        {addingDept && (
          <form onSubmit={handleCreateDepartment} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              required
              minLength={2}
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              placeholder="Ex. Achats, DAO, IT…"
              className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              disabled={saving}
              className="vigilo-btn-orange px-4 py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
            >
              Créer
            </button>
          </form>
        )}
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <span
              key={d.id}
              className="vigilo-pill inline-flex items-center gap-1.5 group"
            >
              {d.name}
              <button
                type="button"
                onClick={() => handleDeleteDepartment(d.id)}
                className="opacity-40 group-hover:opacity-100 text-red-400 hover:text-red-300 cursor-pointer"
                title="Supprimer le service"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
          {!loading && departments.length === 0 && (
            <span className="text-xs text-slate-500">Aucun service — créez-en un pour ajouter des collaborateurs.</span>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="vigilo-card p-5 border border-[#fb923c]/30 bg-[#fb923c]/5">
          <h3 className="text-sm font-bold text-white mb-4">Nouveau collaborateur</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Prénom</label>
              <input
                type="text"
                required
                value={newEmp.firstName}
                onChange={(e) => setNewEmp({ ...newEmp, firstName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Nom</label>
              <input
                type="text"
                required
                value={newEmp.lastName}
                onChange={(e) => setNewEmp({ ...newEmp, lastName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Email</label>
              <input
                type="email"
                required
                value={newEmp.email}
                onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Service</label>
              <select
                required
                value={newEmp.departmentId}
                onChange={(e) => setNewEmp({ ...newEmp, departmentId: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                {departments.length === 0 && <option value="">— Aucun service —</option>}
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Rôle</label>
              <input
                type="text"
                value={newEmp.role}
                onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving || !newEmp.departmentId}
                className="flex-1 vigilo-btn-orange py-2 rounded-lg text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                {saving ? "…" : "Ajouter"}
              </button>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 vigilo-btn-secondary py-2 rounded-lg text-xs cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vigilo-card overflow-hidden">
        <div className="p-4 border-b border-white/10 flex gap-4 items-center bg-slate-900/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un collaborateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:border-[#fb923c] transition-colors"
            />
          </div>
          <div className="text-xs text-slate-400 flex items-center gap-2">
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#fb923c]" />}
            {filtered.length} collaborateur(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Collaborateur</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium text-center">Score de Risque</th>
                <th className="px-4 py-3 font-medium text-center">Formations</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && employees.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin inline-block mr-2 text-[#fb923c]" />
                    Chargement de l&apos;annuaire…
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                          {emp.firstName[0]}
                          {emp.lastName[0]}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {emp.firstName} {emp.lastName}
                          </div>
                          <div className="text-[10px] text-slate-500">{emp.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{emp.email}</td>
                    <td className="px-4 py-3">
                      <span className="vigilo-pill">{emp.department}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {emp.riskScore > 70 ? (
                          <ShieldAlert className="w-4 h-4 text-red-400" />
                        ) : emp.riskScore > 30 ? (
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        )}
                        <span
                          className={`font-bold font-mono ${
                            emp.riskScore > 70
                              ? "text-red-400"
                              : emp.riskScore > 30
                                ? "text-amber-400"
                                : "text-emerald-400"
                          }`}
                        >
                          {emp.riskScore}/100
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {(() => {
                        const list = emp.trainingAssignments || [];
                        const pending = list.filter((a) => a.status === "envoyé").length;
                        const done = list.filter((a) => a.status === "complété").length;
                        if (list.length === 0) {
                          return <span className="text-[11px] text-slate-500">—</span>;
                        }
                        return (
                          <div className="text-[11px] font-mono space-y-0.5">
                            {pending > 0 && <div className="text-amber-500">{pending} en cours</div>}
                            {done > 0 && <div className="text-emerald-500">{done} complété(s)</div>}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleRemove(emp.id)}
                        disabled={saving}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer disabled:opacity-40"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Aucun collaborateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
