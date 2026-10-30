import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Send,
  FileCode2,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Settings,
  ShieldCheck,
  LogOut,
  Bell,
  Users,
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Ferme la session et revient à la page de présentation. */
  onGoToLanding: () => void;
  activeCampaignCount: number;
  /** Nombre réel de modules de formation (sinon aucun badge). */
  trainingCount?: number;
  language: Language;
  theme: 'dark' | 'light';
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

type NavBadge = { text: string; accent?: boolean } | null;

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onGoToLanding,
  activeCampaignCount,
  trainingCount,
  language,
  mobileOpen = false,
  onMobileClose,
}) => {
  const t = translations[language];
  const isFr = language === 'fr';

  const handleTab = (tab: string) => {
    onTabChange(tab);
    onMobileClose?.();
  };

  // Escape ferme le menu mobile
  useEffect(() => {
    if (!mobileOpen || !onMobileClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onMobileClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen, onMobileClose]);

  const navItems: { id: string; label: string; icon: React.ElementType; badge: NavBadge }[] = [
    { id: 'overview', label: t.nav.overview, icon: LayoutDashboard, badge: null },
    {
      id: 'campaigns',
      label: t.nav.campaigns,
      icon: Send,
      badge: activeCampaignCount > 0 ? { text: `${activeCampaignCount} ${isFr ? 'actives' : 'active'}`, accent: true } : null,
    },
    { id: 'scenarios', label: t.nav.scenarios, icon: FileCode2, badge: null },
    { id: 'ai-coach', label: t.nav.coach, icon: Sparkles, badge: { text: 'IA' } },
    { id: 'directory', label: isFr ? 'Annuaire' : 'Directory', icon: Users, badge: null },
    {
      id: 'training',
      label: t.nav.trainings,
      icon: GraduationCap,
      badge: trainingCount ? { text: `${trainingCount} modules` } : null,
    },
    { id: 'flash-news', label: t.nav.flashNews, icon: Bell, badge: { text: isFr ? 'Nouveau' : 'New' } },
    { id: 'retest', label: t.nav.retest, icon: RotateCcw, badge: null },
    { id: 'settings', label: t.nav.settings, icon: Settings, badge: null },
  ];

  const logoutLabel = isFr ? 'Se déconnecter' : 'Log out';

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label={isFr ? 'Fermer le menu' : 'Close menu'}
          className="fixed inset-0 z-40 bg-kori-bg/70 md:hidden cursor-pointer"
          onClick={onMobileClose}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 md:z-auto w-[min(100vw,17rem)] md:w-64 border-r border-kori-line bg-kori-sidebar text-kori-text flex flex-col justify-between shrink-0 select-none overflow-y-auto transition-transform duration-200 ease-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } top-16 md:top-0 h-[calc(100dvh-4rem)] md:h-auto`}
        aria-label={isFr ? 'Navigation principale' : 'Main navigation'}
      >
        <div className="p-4 space-y-6">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-kori-chip text-kori-text font-semibold'
                      : 'text-kori-nav hover:text-kori-text hover:bg-kori-hover font-medium'
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                        item.badge.accent ? 'vigilo-pill-orange' : 'bg-kori-chip text-kori-muted'
                      }`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-3.5 space-y-1.5 text-xs">
            <div className="flex items-center gap-2 font-semibold text-kori-text">
              <ShieldCheck className="w-4 h-4 text-kori-muted" />
              <span>{isFr ? 'Cycle continu VIGILO' : 'Continuous VIGILO cycle'}</span>
            </div>
            <p className="leading-relaxed text-kori-muted">{t.sloganShort}</p>
          </div>
        </div>

        <div className="p-4 border-t border-kori-line">
          <button
            type="button"
            onClick={() => {
              onGoToLanding();
              onMobileClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 vigilo-btn-secondary text-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{logoutLabel}</span>
          </button>
        </div>
      </aside>
    </>
  );
};