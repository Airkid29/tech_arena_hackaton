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
  theme,
}) => {
  const isDark = theme === 'dark';
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
    <aside className={`w-64 border-r transition-colors flex flex-col justify-between shrink-0 select-none ${
      isDark ? 'border-slate-800 bg-[#080c15] text-slate-200' : 'border-slate-200 bg-white text-slate-800'
    }`}>
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                      : 'bg-blue-50 text-blue-700 border border-blue-200 font-semibold'
                    : isDark
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? isDark ? 'text-blue-400' : 'text-blue-600'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      item.badge === 'Nouveau' || item.badge === 'New'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : isDark
                          ? 'bg-blue-950 text-blue-300 border border-blue-800/50'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Continuous resilience formula */}
        <div className={`p-3 rounded-lg border text-xs space-y-1.5 ${
          isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
            <span>Cycle VIGILO</span>
          </div>
          <p className="text-[11px] leading-relaxed">
            {t.sloganShort}
          </p>
        </div>
      </div>

      {/* Footer link to landing */}
      <div className={`p-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
        <button
          onClick={onGoToLanding}
          className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
            isDark ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
          }`}
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
          <span>{t.nav.landing}</span>
        </button>
      </div>
    </aside>
  );
};
