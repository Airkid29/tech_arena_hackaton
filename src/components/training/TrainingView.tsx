import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  Filter,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { TrainingModule, ScenarioCategory } from '../../types';

interface TrainingViewProps {
  trainings: TrainingModule[];
  onOpenPlayer: (module: TrainingModule) => void;
  onNavigateToReTest: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  trainings,
  onOpenPlayer,
  onNavigateToReTest,
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
    { id: 'WhatsApp Phishing', label: '💬 WhatsApp (Whishing)' },
    { id: 'Phishing', label: '✉️ Phishing M365' },
    { id: 'Fake Invoice', label: '📄 Fake Invoice (RIB)' },
    { id: 'QR Code (Quishing)', label: '📱 Quishing (QR Code)' },
    { id: 'MFA Fatigue', label: '🔔 MFA Fatigue' },
    { id: 'Ransomware', label: '🔒 Ransomware & Macros' },
    { id: 'Social Engineering', label: '👤 Social Engineering' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#fb923c]" />
            <span>Catalogue des Micro-formations ciblées (2 min)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formations interactives courtes pour ancrer les réflexes réflexes : Situation → Signes d'alerte → Bonne réaction → Mini-quiz.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 border border-white/10 rounded-xl px-3.5 py-2 bg-white/5">
          <BookOpen className="w-3.5 h-3.5 text-[#fb923c]" />
          <span>{trainings.length} modules interactifs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une formation (titre, mot-clé, vecteur d'attaque)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f2620a]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((mod) => (
          <div
            key={mod.id}
            className="vigilo-card p-6 flex flex-col justify-between space-y-4 group hover:border-[#f2620a]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {mod.category}
                </span>
                <span className="text-[10px] font-mono text-[#fb923c] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mod.durationMinutes} min
                </span>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-[#fb923c] transition-colors">
                {mod.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {mod.situation.context}
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--card-border)] flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                {mod.miniQuiz ? 1 : 0} question interactive
              </span>

              <button
                onClick={() => onOpenPlayer(mod)}
                className="vigilo-btn-orange px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Lancer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
