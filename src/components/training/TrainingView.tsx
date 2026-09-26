import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  BookOpen,
  Search,
  Pencil,
  Send,
  Users,
} from 'lucide-react';
import { TrainingModule } from '../../types';

interface TrainingViewProps {
  trainings: TrainingModule[];
  onOpenPlayer: (module: TrainingModule) => void;
  onEditModule: (module: TrainingModule) => void;
  onAssignModule: (module: TrainingModule) => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  trainings,
  onOpenPlayer,
  onEditModule,
  onAssignModule,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTrainings = trainings.filter((t) => {
    const matchesCategory = selectedCategory === 'all' ? true : t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.situation.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Toutes les formations' },
    { id: 'WhatsApp Phishing', label: 'WhatsApp (Whishing)' },
    { id: 'Phishing', label: 'Phishing M365' },
    { id: 'Fake Invoice', label: 'Fake Invoice (RIB)' },
    { id: 'QR Code (Quishing)', label: 'Quishing (QR Code)' },
    { id: 'MFA Fatigue', label: 'MFA Fatigue' },
    { id: 'Ransomware', label: 'Ransomware & Macros' },
    { id: 'Social Engineering', label: 'Social Engineering' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight vigilo-page-title flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[var(--primary)]" />
            <span>Catalogue des Micro-formations ciblées (2 min)</span>
          </h2>
          <p className="text-xs vigilo-text-muted mt-1">
            Modifiez le contenu pédagogique et assignez un module directement aux collaborateurs de l&apos;annuaire (email ou WhatsApp).
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono vigilo-text-muted vigilo-toolbar rounded-xl px-3.5 py-2">
          <BookOpen className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{trainings.length} modules interactifs</span>
        </div>
      </div>

      <div className="p-3.5 rounded-xl vigilo-toolbar flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[var(--muted-foreground)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une formation (titre, mot-clé, vecteur d'attaque)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="vigilo-input w-full pl-9 pr-4 py-2 rounded-xl text-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 border ${selectedCategory === c.id
                  ? 'bg-[var(--primary)]/15 text-[var(--primary)] border-[var(--primary)]/40 font-semibold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-transparent hover:bg-[var(--muted)]'
                }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((mod) => (
          <div
            key={mod.id}
            className="vigilo-card p-6 flex flex-col justify-between space-y-4 group hover:border-[var(--primary)]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full vigilo-inset text-[var(--muted-foreground)]">
                  {mod.category}
                </span>
                <span className="text-[10px] font-mono text-[var(--primary)] flex items-center gap-1 shrink-0">
                  <Clock className="w-3 h-3" />
                  {mod.durationMinutes} min
                </span>
              </div>

              <h3 className="font-bold vigilo-page-title text-base group-hover:text-[var(--primary)] transition-colors">
                {mod.title}
              </h3>

              <p className="text-xs vigilo-text-muted line-clamp-3 leading-relaxed">{mod.situation.context}</p>

              <div className="flex items-center gap-1.5 text-[11px] font-mono vigilo-text-muted">
                <Users className="w-3.5 h-3.5" />
                <span>
                  {mod.completedCount}/{mod.totalAssigned} complétés
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--card-border)] space-y-2">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPlayer(mod)}
                  className="vigilo-btn-orange px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer text-white flex-1 justify-center min-w-[100px]"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  Lancer
                </button>
                <button
                  type="button"
                  onClick={() => onEditModule(mod)}
                  className="vigilo-btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  title="Modifier la formation"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={() => onAssignModule(mod)}
                  className="vigilo-btn-secondary px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer border-[var(--primary)]/30 text-[var(--primary)]"
                  title="Envoyer à l'annuaire"
                >
                  <Send className="w-3.5 h-3.5" />
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
