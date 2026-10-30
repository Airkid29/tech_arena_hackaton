import React from 'react';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { Campaign } from '../../types';

interface OverviewTabProps {
  campaigns: Campaign[];
  onSelectCampaign: (campaignId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenEmployeeSimulator: () => void;
}

const LOOP_STEPS = [
  { step: '01', title: 'Simuler', desc: 'Attaque contrôlée (Email / WhatsApp)' },
  { step: '02', title: 'Mesurer', desc: 'Comportements réels (clics & signalements)' },
  { step: '03', title: 'Analyser', desc: 'Diagnostic par le coach IA' },
  { step: '04', title: 'Former', desc: 'Micro-module de 2 minutes' },
  { step: '05', title: 'Re-tester', desc: "Mesure de l'évolution concrète" },
];

export const OverviewTab: React.FC<OverviewTabProps> = ({
  campaigns,
  onSelectCampaign,
  onNavigate,
  onOpenCreateCampaign,
  onOpenEmployeeSimulator,
}) => {
  // Aggregate statistics across campaigns
  const measuredCampaigns = campaigns.filter((campaign) => campaign.status === 'terminée');
  const totalTargeted = measuredCampaigns.reduce((acc, c) => acc + c.targeted, 0);
  const totalClicked = measuredCampaigns.reduce((acc, c) => acc + c.clicked, 0);
  const totalReported = measuredCampaigns.reduce((acc, c) => acc + c.reported, 0);

  const hasData = totalTargeted > 0;
  const avgClickRate = hasData ? `${((totalClicked / totalTargeted) * 100).toFixed(1)}%` : '—';
  const avgReportRate = hasData ? `${((totalReported / totalTargeted) * 100).toFixed(1)}%` : '—';

  const activeCampaign = campaigns.find((c) => c.status === 'en_cours');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* En-tête : principe + actions */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-wider text-kori-muted">
            Principe VIGILO · Cyber-résilience PME
          </p>
          <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-kori-text">
            « Mesurez et renforcez la vigilance de votre équipe. »
          </h1>
          <p className="text-sm text-kori-muted leading-relaxed">
            Préparez des exercices pédagogiques et testez-les dans le simulateur intégré. Les campagnes ne sont pas envoyées par email ou WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenCreateCampaign}
            className="vigilo-btn-orange flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Créer une campagne</span>
          </button>
          <button
            type="button"
            onClick={onOpenEmployeeSimulator}
            className="vigilo-btn-secondary px-5 py-2.5 text-sm cursor-pointer"
          >
            Ouvrir le simulateur
          </button>
        </div>
      </section>

      {/* Métrique principale + indicateurs de support (une seule surface) */}
      <section className="vigilo-card grid grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="p-6 sm:p-8 flex flex-col justify-between gap-6">
          <p className="text-sm font-medium text-kori-muted">Taux de signalement</p>
          <div>
            <div
              className={`font-display text-6xl sm:text-7xl tracking-tight ${
                hasData ? 'text-kori-positive' : 'text-kori-muted'
              }`}
            >
              {avgReportRate}
            </div>
            <p className="mt-2 text-xs text-kori-muted">Calculé à partir des campagnes terminées</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 border-t lg:border-t-0 lg:border-l border-kori-line divide-y sm:divide-y-0 sm:divide-x divide-kori-line">
          <div className="p-6 space-y-2">
            <p className="text-xs font-medium text-kori-muted">Collaborateurs ciblés</p>
            <div className="font-display text-3xl text-kori-text">{totalTargeted}</div>
            <p className="text-xs text-kori-muted">Sur les campagnes terminées</p>
          </div>
          <div className="p-6 space-y-2">
            <p className="text-xs font-medium text-kori-muted">Taux de clic moyen</p>
            <div className={`font-display text-3xl ${hasData ? 'text-kori-negative' : 'text-kori-muted'}`}>
              {avgClickRate}
            </div>
            <p className="text-xs text-kori-muted">Moins, c&apos;est mieux</p>
          </div>
          <div className="p-6 space-y-2">
            <p className="text-xs font-medium text-kori-muted">Score de vigilance</p>
            <div className="font-display text-3xl text-kori-muted">— / 100</div>
            <p className="text-xs text-kori-muted">Aucun score sans données mesurées</p>
          </div>
        </div>
      </section>

      {/* Boucle en 5 étapes */}
      <ol className="grid grid-cols-2 sm:grid-cols-5 gap-x-6 gap-y-4">
        {LOOP_STEPS.map((item) => (
          <li key={item.step} className="border-t border-kori-line pt-3 space-y-1">
            <span className="text-xs font-semibold text-kori-muted">{item.step}</span>
            <div className="text-sm font-semibold text-kori-text">{item.title}</div>
            <p className="text-xs text-kori-muted leading-snug">{item.desc}</p>
          </li>
        ))}
      </ol>

      {/* Campagne en cours + Coach IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 vigilo-card p-6 space-y-6">
          {activeCampaign ? (
            <>
              <div className="flex items-start justify-between gap-4 border-b border-kori-line pb-4">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-kori-muted">Campagne en cours</p>
                  <h2 className="text-lg font-semibold text-kori-text truncate">{activeCampaign.name}</h2>
                </div>
                <span className="vigilo-pill vigilo-pill-orange shrink-0">En cours</span>
              </div>

              <div className="grid grid-cols-3 divide-x divide-kori-line text-center">
                <div className="px-2 space-y-1">
                  <div className="text-xs text-kori-muted">Ciblés</div>
                  <div className="font-display text-2xl sm:text-3xl text-kori-text">{activeCampaign.targeted}</div>
                </div>
                <div className="px-2 space-y-1">
                  <div className="text-xs text-kori-muted">Clics mesurés</div>
                  <div className="font-display text-2xl sm:text-3xl text-kori-negative">
                    {activeCampaign.clicked}
                    <span className="text-xs font-sans text-kori-muted"> ({activeCampaign.clickRate}%)</span>
                  </div>
                </div>
                <div className="px-2 space-y-1">
                  <div className="text-xs text-kori-muted">Signalements mesurés</div>
                  <div className="font-display text-2xl sm:text-3xl text-kori-positive">
                    {activeCampaign.reported}
                    <span className="text-xs font-sans text-kori-muted"> ({activeCampaign.reportRate}%)</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => onSelectCampaign(activeCampaign.id)}
                  className="text-sm font-semibold text-kori-text hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Voir le rapport détaillé</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onOpenEmployeeSimulator}
                  className="vigilo-btn-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Tester l&apos;aperçu pédagogique
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-kori-text">Aucune campagne en cours</h2>
              <p className="text-sm text-kori-muted">
                Les nouveaux exercices restent des brouillons. Aucun email n&apos;est envoyé depuis cette plateforme.
              </p>
              <button
                type="button"
                onClick={onOpenCreateCampaign}
                className="vigilo-btn-orange px-4 py-2 text-xs cursor-pointer"
              >
                Créer un brouillon
              </button>
            </div>
          )}
        </div>

        <div className="vigilo-card p-6 flex flex-col justify-between gap-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-kori-muted">
              <Sparkles className="w-4 h-4" />
              <span>Vigilo Coach</span>
            </div>
            <h3 className="text-base font-semibold text-kori-text">Recommandation stratégique</h3>
            <p className="text-sm text-kori-muted leading-relaxed">
              Aucune recommandation n&apos;est disponible sans résultats mesurés. Le coach IA ne doit pas inférer de vulnérabilités à partir de données fictives.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('ai-coach')}
            className="w-full vigilo-btn-secondary py-2.5 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Consulter le Coach IA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};