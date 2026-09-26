import React, { useState } from "react";
import { Users, Plus, Mail, ShieldAlert, CheckCircle2, Search, Trash2 } from "lucide-react";
import { Employee } from "../../types";

interface DirectoryViewProps {
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, "id" | "riskScore">) => void;
  onRemoveEmployee: (id: string) => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({ employees, onAddEmployee, onRemoveEmployee }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  
  const [newEmp, setNewEmp] = useState({
    firstName: "",
    lastName: "",
    email: "",
    department: "Finance",
    role: "Employé",
  });

  const filtered = employees.filter(e => 
    e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.firstName || !newEmp.email) return;
    onAddEmployee(newEmp);
    setIsAdding(false);
    setNewEmp({ firstName: "", lastName: "", email: "", department: "Finance", role: "Employé" });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#fb923c]" />
            <span>Annuaire des collaborateurs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez la liste des collaborateurs ciblés par les campagnes de sensibilisation.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="vigilo-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter un collaborateur</span>
        </button>
      </div>

      {isAdding && (
        <div className="vigilo-card p-5 border border-[#fb923c]/30 bg-[#fb923c]/5">
          <h3 className="text-sm font-bold text-white mb-4">Nouveau collaborateur</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Prénom</label>
              <input type="text" required value={newEmp.firstName} onChange={e => setNewEmp({...newEmp, firstName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Nom</label>
              <input type="text" required value={newEmp.lastName} onChange={e => setNewEmp({...newEmp, lastName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Email (Test)</label>
              <input type="email" required value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">Département</label>
              <select value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white">
                <option>Finance</option>
                <option>RH</option>
                <option>IT</option>
                <option>Direction</option>
                <option>Marketing</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 vigilo-btn-orange py-2 rounded-lg text-xs font-bold cursor-pointer">Ajouter</button>
              <button type="button" onClick={() => setIsAdding(false)} className="flex-1 vigilo-btn-secondary py-2 rounded-lg text-xs cursor-pointer">Annuler</button>
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
          <div className="text-xs text-slate-400">
            {filtered.length} collaborateur(s)
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
              <tr>
                <th className="px-4 py-3 font-medium">Collaborateur</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Département</th>
                <th className="px-4 py-3 font-medium text-center">Score de Risque</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{emp.firstName} {emp.lastName}</div>
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
                      <span className={`font-bold font-mono ${emp.riskScore > 70 ? "text-red-400" : emp.riskScore > 30 ? "text-amber-400" : "text-emerald-400"}`}>
                        {emp.riskScore}/100
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => onRemoveEmployee(emp.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors cursor-pointer" title="Supprimer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
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

