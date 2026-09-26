import React from 'react';
import { Shield, Building2, Eye, LayoutTemplate, Sun, Moon, Sparkles, Terminal } from 'lucide-react';
import { SimulationProviderSettings } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface NavbarProps {
  activeTab: string;
  onOpenEmployeeSimulator: () => void;
  onGoToLanding: () => void;
  settings: SimulationProviderSettings;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenEmployeeSimulator,
  onGoToLanding,
  settings,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[var(--card-border)] backdrop-blur-xl bg-[var(--background)]/90 px-6 flex items-center justify-between transition-all">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-3 cursor-pointer group"
          title="Retour à la présentation VIGILO"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--primary)] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight font-mono">
                VIGILO
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium vigilo-pill-orange">
                Console PME
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
              Vigilance & Cyber Risk SaaS
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono">
          <button
            onClick={() => onToggleLanguage('fr')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'fr' ? 'bg-[var(--primary)] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'en' ? 'bg-[var(--primary)] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t.nav.switchTheme}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
        </button>

        {/* Landing Page button */}
        <button
          onClick={onGoToLanding}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer"
          title="Afficher la page de présentation"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-[#fb923c]" />
          <span>{t.nav.landing}</span>
        </button>

        {/* Simulation Provider indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Moteur:</span>
          <strong className="text-white">
            {settings.provider === 'mock' ? 'Mock Engine' : 'Gophish API'}
          </strong>
        </div>

        {/* Employee Simulation Trigger */}
        <button
          onClick={onOpenEmployeeSimulator}
          className="vigilo-btn-orange flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
          title="Tester le rendu de l'email / WhatsApp"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.nav.liveTest}</span>
          <span className="sm:hidden">Test live</span>
        </button>

        {/* User Role */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono">
          <div className="w-7 h-7 rounded-full bg-[#f2620a]/20 border border-[#f2620a]/40 flex items-center justify-center font-bold text-xs text-[#fb923c]">
            IT
          </div>
          <span className="hidden lg:inline font-medium text-slate-300">
            {t.nav.adminRole}
          </span>
        </div>
      </div>
    </header>
  );
};
