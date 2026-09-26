import React from 'react';
import {
  LayoutDashboard,
  Send,
  FileCode2,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Settings,
  ShieldCheck,
  LayoutTemplate,
  Bell,
  Users,
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onGoToLanding: () => void;
  activeCampaignCount: number;
  language: Language;
  theme: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onGoToLanding,
  activeCampaignCount,
  language,
}) => {
  const t = translations[language];

  const navItems = [
    {
      id: 'overview',
      label: t.nav.overview,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'campaigns',
      label: t.nav.campaigns,
      icon: Send,
      badge: activeCampaignCount > 0 ? `${activeCampaignCount} ${language === 'fr' ? 'actives' : 'active'}` : null,
    },
    {
      id: 'scenarios',
      label: t.nav.scenarios,
      icon: FileCode2,
      badge: null,
    },
    {
      id: 'ai-coach',
      label: t.nav.coach,
      icon: Sparkles,
      badge: 'RodiumAI',
    },
    {
      id: 'directory',
      label: 'Annuaire',
      icon: Users,
      badge: null,
    },
    {
      id: 'training',
      label: t.nav.trainings,
      icon: GraduationCap,
      badge: '7 modules',
    },
    {
      id: 'flash-news',
      label: t.nav.flashNews,
      icon: Bell,
      badge: language === 'fr' ? 'Nouveau' : 'New',
    },
    {
      id: 'retest',
      label: t.nav.retest,
      icon: RotateCcw,
      badge: null,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside
      className="w-64 border-r border-[var(--card-border)] flex flex-col justify-between shrink-0 select-none transition-all"
      style={{ backgroundColor: 'var(--sidebar-bg)', color: 'var(--sidebar-fg)' }}
    >
      <div className="p-4 space-y-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--primary)]/12 text-[var(--foreground)] border-[var(--primary)]/35 font-semibold shadow-sm'
                    : 'text-[var(--sidebar-muted)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--sidebar-muted)]'}`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      item.badge === 'Nouveau' || item.badge === 'New' || item.badge === 'RodiumAI'
                        ? 'vigilo-pill-orange'
                        : 'vigilo-pill'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-3.5 rounded-xl border border-[var(--card-border)] bg-[var(--surface-inset)] text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
            <span>Cycle Continu VIGILO</span>
          </div>
          <p className="text-[11px] leading-relaxed text-[var(--muted-foreground)] font-mono">
            {t.sloganShort}
          </p>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--card-border)]">
        <button
          onClick={onGoToLanding}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--muted)] hover:bg-[var(--accent)] text-[var(--foreground)] text-xs font-medium transition-all cursor-pointer"
        >
          <LayoutTemplate className="w-4 h-4 text-[var(--primary)]" />
          <span>{t.nav.landing}</span>
        </button>
      </div>
    </aside>
  );
};
