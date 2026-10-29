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
  Play,
} from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
  onOpenCreateModal: () => void;
  onSimulateCampaign: (campaign: Campaign) => void;
  onLaunchCampaign?: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
  onSimulateCampaign,
  onLaunchCampaign,
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

  const statusLabel = (status: Campaign['status']) => ({
    brouillon: 'Brouillon — non envoyé',
    planifiée: 'Planifiée',
    en_cours: 'En cours',
    terminée: 'Terminée',
  })[status];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#fb923c]" />
            <span>Campagnes de simulation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Pilotez vos simulations d&apos;ingénierie sociale, mesurez la vulnérabilité humaine et renforcez la cyber-résilience de vos collaborateurs.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="vigilo-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une campagne</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une campagne, scénario, groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f2620a]"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'brouillon', label: 'Brouillons' },
            { id: 'en_cours', label: 'En cours' },
            { id: 'terminée', label: 'Terminées' },
            { id: 'retest', label: 'Re-tests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.length === 0 && (
          <div className="md:col-span-2 rounded-xl border border-dashed border-white/15 p-8 text-center">
            <p className="text-sm font-semibold text-slate-200">
              {campaigns.length ? 'Aucune campagne ne correspond à ces filtres.' : 'Aucun brouillon enregistré.'}
            </p>
            <p className="mt-2 text-xs text-slate-400">
              La création d&apos;une campagne n&apos;envoie pas de message et ne crée aucun résultat simulé.
            </p>
          </div>
        )}
        {filteredCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="vigilo-card p-6 flex flex-col justify-between space-y-4 group hover:border-[#f2620a]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {camp.category}
                </span>

                <div className="flex items-center gap-2">
                  {camp.isReTest && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <RotateCcw className="w-3 h-3" /> Re-Test
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                      camp.status === 'en_cours'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-semibold'
                        : camp.status === 'brouillon'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {camp.status === 'en_cours' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    )}
                    {statusLabel(camp.status)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-[#fb923c] transition-colors">
                  {camp.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Groupe cible : <span className="text-slate-200">{camp.targetGroup}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Ciblés</div>
                  <div className="font-bold text-white font-mono mt-0.5">{camp.targeted}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Clics mesurés</div>
                  <div className="font-bold text-rose-400 font-mono mt-0.5">
                    {camp.clicked} ({camp.clickRate}%)
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Signalements mesurés</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {camp.reported} ({camp.reportRate}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSimulateCampaign(camp)}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono text-[11px]"
                >
                  <Eye className="w-3.5 h-3.5 text-[#fb923c]" />
                  <span>Aperçu piège</span>
                </button>

                {onLaunchCampaign && camp.status === 'brouillon' && (
                  <button
                    onClick={() => onLaunchCampaign(camp)}
                    className="px-2.5 py-1 rounded-lg bg-[#f2620a] hover:bg-[#e05606] text-white text-[11px] font-bold flex items-center gap-1 shadow-md transition-all cursor-pointer"
                    title="Lancer cette campagne immédiatement"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Lancer</span>
                  </button>
                )}
              </div>

              <button
                onClick={() => onSelectCampaign(camp.id)}
                className="text-xs font-bold text-[#fb923c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Détails & Rapport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
