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
      badge: 'Gemini 2.5',
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
    <aside className="w-64 border-r border-white/10 bg-[#080b11] text-slate-200 flex flex-col justify-between shrink-0 select-none transition-all">
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
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f2620a]/15 text-white border border-[#f2620a]/40 shadow-[0_0_15px_rgba(242,98,10,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#fb923c]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      item.badge === 'Nouveau' || item.badge === 'New' || item.badge === 'Gemini 2.5'
                        ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/30'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Continuous resilience formula box */}
        <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-[#fb923c]" />
            <span>Cycle Continu VIGILO</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 font-mono">
            {t.sloganShort}
          </p>
        </div>
      </div>

      {/* Footer link to landing */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onGoToLanding}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer"
        >
          <LayoutTemplate className="w-4 h-4 text-[#fb923c]" />
          <span>{t.nav.landing}</span>
        </button>
      </div>
    </aside>
  );
};
