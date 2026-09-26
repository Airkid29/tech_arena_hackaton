import React, { useMemo, useState } from 'react';
import {
  X,
  Send,
  Mail,
  MessageSquare,
  Users,
  Search,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Employee, TrainingModule } from '../../types';

interface AssignTrainingModalProps {
  isOpen: boolean;
  module: TrainingModule | null;
  employees: Employee[];
  onClose: () => void;
  onAssign: (
    moduleId: string,
    employeeIds: string[],
    channel: 'Email' | 'WhatsApp'
  ) => Promise<{ success: boolean; sentCount: number }>;
}

export const AssignTrainingModal: React.FC<AssignTrainingModalProps> = ({
  isOpen,
  module,
  employees,
  onClose,
  onAssign,
}) => {
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [channel, setChannel] = useState<'Email' | 'WhatsApp'>('Email');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<{ count: number } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        e.lastName.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
    );
  }, [employees, search]);

  if (!isOpen || !module) return null;

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllFiltered = () => {
    setSelectedIds(new Set(filtered.map((e) => e.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSend = async () => {
    if (selectedIds.size === 0) return;
    setSending(true);
    try {
      const result = await onAssign(module.id, Array.from(selectedIds), channel);
      if (result.success) {
        setDone({ count: result.sentCount });
      }
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setDone(null);
    setSelectedIds(new Set());
    setSearch('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm" data-vigilo-modal>
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-[var(--card-border)] bg-[var(--card)] shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] bg-[var(--muted)] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
              <Send className="w-5 h-5 text-[var(--primary)]" />
              Envoyer la formation
            </h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5 line-clamp-1">{module.title}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {done ? (
          <div className="p-10 text-center space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-[var(--foreground)]">Formation dispatchée</h3>
            <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
              Lien micro-formation ({module.durationMinutes} min) envoyé à{' '}
              <strong className="text-[var(--foreground)]">{done.count}</strong> collaborateur(s) via{' '}
              {channel === 'Email' ? 'email' : 'WhatsApp'}.
            </p>
            <button type="button" onClick={handleClose} className="vigilo-btn-orange px-6 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="p-4 border-b border-[var(--card-border)] space-y-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">Canal :</span>
                <button
                  type="button"
                  onClick={() => setChannel('Email')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    channel === 'Email'
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'vigilo-btn-secondary'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannel('WhatsApp')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border cursor-pointer ${
                    channel === 'WhatsApp'
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'vigilo-btn-secondary'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface-inset)] border border-[var(--card-border)] text-xs text-[var(--muted-foreground)] leading-relaxed">
                <strong className="text-[var(--foreground)]">Aperçu :</strong> « Bonjour {'{prénom}'}, votre responsable IT vous assigne la micro-formation VIGILO «{' '}
                {module.title} » ({module.durationMinutes} min). {channel === 'Email' ? 'Ouvrez le lien dans votre boîte mail.' : 'Consultez le message WhatsApp professionnel.'}{' '}
                »
              </div>
            </div>

            <div className="p-4 flex flex-wrap items-center gap-2 border-b border-[var(--card-border)] shrink-0">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
                <input
                  type="text"
                  placeholder="Filtrer l'annuaire…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="vigilo-input w-full pl-9 pr-3 py-2 rounded-lg text-sm"
                />
              </div>
              <button type="button" onClick={selectAllFiltered} className="vigilo-btn-secondary px-3 py-2 rounded-lg text-xs cursor-pointer">
                Tout sélectionner ({filtered.length})
              </button>
              <button type="button" onClick={clearSelection} className="vigilo-btn-secondary px-3 py-2 rounded-lg text-xs cursor-pointer">
                Effacer
              </button>
              <span className="text-xs font-mono text-[var(--muted-foreground)] flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {selectedIds.size} sélectionné(s)
              </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[200px] max-h-[40vh]">
              {filtered.length === 0 ? (
                <p className="p-8 text-center text-sm text-[var(--muted-foreground)]">Aucun collaborateur dans l&apos;annuaire.</p>
              ) : (
                <ul className="divide-y divide-[var(--card-border)]">
                  {filtered.map((emp) => {
                    const checked = selectedIds.has(emp.id);
                    const pending = (emp.trainingAssignments || []).filter((a) => a.moduleId === module.id && a.status === 'envoyé').length;
                    return (
                      <li key={emp.id}>
                        <label className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[var(--muted)] transition-colors">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(emp.id)}
                            className="w-4 h-4 accent-[var(--primary)]"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-[var(--foreground)]">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)] font-mono truncate">{emp.email}</div>
                          </div>
                          <span className="vigilo-pill shrink-0">{emp.department}</span>
                          {pending > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 shrink-0">Déjà envoyé</span>
                          )}
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-4 border-t border-[var(--card-border)] flex justify-end gap-3 shrink-0">
              <button type="button" onClick={handleClose} className="vigilo-btn-secondary px-4 py-2 rounded-lg text-xs cursor-pointer">
                Annuler
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0 || sending}
                onClick={handleSend}
                className="vigilo-btn-orange px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 cursor-pointer text-white"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Envoyer à {selectedIds.size || '…'} personne(s)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
