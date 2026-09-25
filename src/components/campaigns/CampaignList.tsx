import React, { useState } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  Users,
  MousePointerClick,
  ShieldCheck,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
  onOpenCreateModal: () => void;
  onSimulateCampaign: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
  onSimulateCampaign,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'retest'
        ? c.isReTest
        : c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-400" />
            <span>Campagnes de simulation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos exercices de cyberattaques contrôlées et suivez les comportements en direct.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-md shadow-blue-900/30 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une campagne</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-[#0d131f]">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une campagne, scénario, groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-900/80 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'en_cours', label: 'En cours' },
            { id: 'terminée', label: 'Terminées' },
            { id: 'retest', label: 'Re-tests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        {filteredCampaigns.map((camp) => {
          const isFinished = camp.status === 'terminée';
          const isOngoing = camp.status === 'en_cours';

          return (
            <div
              key={camp.id}
              className="p-5 rounded-xl border border-slate-800/80 hover:border-slate-700 bg-[#0d131f] transition-all space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                        isOngoing
                          ? 'bg-blue-950/80 text-blue-400 border-blue-800/60'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      {camp.status === 'en_cours' ? '● En cours' : '✓ Terminée'}
                    </span>
                    {camp.isReTest && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 flex items-center gap-1">
                        <RotateCcw className="w-2.5 h-2.5" />
                        Re-test
                      </span>
                    )}
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-mono text-slate-400">{camp.category}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">Difficulté : {camp.difficulty}</span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-400">Cible : {camp.targetGroup}</span>
                  </div>

                  <h3 className="text-base font-bold text-white hover:text-blue-400 transition-colors cursor-pointer"
                      onClick={() => onSelectCampaign(camp.id)}>
                    {camp.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{camp.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => onSimulateCampaign(camp)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 cursor-pointer"
                    title="Tester l'expérience de l'employé"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Simuler</span>
                  </button>

                  <button
                    onClick={() => onSelectCampaign(camp.id)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-xs font-medium border border-blue-500/40 cursor-pointer"
                  >
                    <span>Résultats</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Numerical Indicators per specs (Ciblés, Délivrés, Ouverts, Clics, Signalements, Click Rate, Report Rate) */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-slate-400">Ciblés</div>
                  <div className="text-sm font-mono font-bold text-white">{camp.targeted}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-slate-400">Délivrés</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{camp.delivered}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-slate-400">Ouverts</div>
                  <div className="text-sm font-mono font-bold text-slate-200">{camp.opened}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-red-400">Clics</div>
                  <div className="text-sm font-mono font-bold text-red-400">{camp.clicked}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/60">
                  <div className="text-[11px] text-emerald-400">Signalés</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{camp.reported}</div>
                </div>
                <div className="p-2 rounded bg-red-950/20 border border-red-900/40">
                  <div className="text-[11px] text-red-400">Click Rate</div>
                  <div className="text-sm font-mono font-bold text-red-400">{camp.clickRate}%</div>
                </div>
                <div className="p-2 rounded bg-emerald-950/20 border border-emerald-900/40">
                  <div className="text-[11px] text-emerald-400">Report Rate</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{camp.reportRate}%</div>
                </div>
              </div>

              {camp.aiAnalysis && (
                <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-300 line-clamp-1">
                    RodiumAI : {camp.aiAnalysis.trainingAdvice}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
