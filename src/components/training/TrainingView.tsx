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
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <span>Catalogue des Micro-formations ciblées (3 à 5 min)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formations interactives courtes pour ancrer les réflexes réflexes : Situation → Signes d'alerte → Bonne réaction → Mini-quiz.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-1.5 bg-slate-900/40">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>{trainings.length} modules interactifs disponibles</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d131f] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une formation (titre, mot-clé, vecteur d'attaque)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((mod) => {
          const completionPct = Math.round((mod.completedCount / mod.totalAssigned) * 100);

          return (
            <div
              key={mod.id}
              className="p-5 rounded-xl border border-slate-800 bg-[#0d131f] hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
                    {mod.category}
                  </span>
                  <div className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mod.durationMinutes} min</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors leading-snug">
                    {mod.title}
                  </h3>
                  {mod.targetAudience && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      Cible : {mod.targetAudience}
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {mod.situation.context}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Taux de complétion équipe :</span>
                    <strong className="text-emerald-400 font-mono">
                      {mod.completedCount} / {mod.totalAssigned} ({completionPct}%)
                    </strong>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>

                {/* 4 Steps preview badges */}
                <div className="pt-1 grid grid-cols-4 gap-1 text-center text-[9px] font-mono text-slate-500">
                  <span className="p-1 rounded bg-slate-900 border border-slate-800/80">01. Situation</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800/80">02. Signes</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800/80">03. Réaction</span>
                  <span className="p-1 rounded bg-slate-900 border border-slate-800/80">04. Quiz</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {mod.warningSigns.length} alertes clés
                </span>

                <button
                  onClick={() => onOpenPlayer(mod)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-900/40 transition-all cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Démarrer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bridge to Re-test */}
      <div className="p-6 rounded-xl border border-indigo-900/60 bg-gradient-to-r from-indigo-950/30 to-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            Étape suivante : Re-tester
          </div>
          <h4 className="text-sm font-bold text-white">
            Vos collaborateurs ont terminé leur micro-formation ?
          </h4>
          <p className="text-xs text-slate-300">
            Lancez le re-test pour mesurer concrètement l'évolution du taux de clic et la hausse des signalements.
          </p>
        </div>

        <button
          onClick={onNavigateToReTest}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-950 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <span>Accéder au comparateur de Re-test</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
