import React from 'react';
import { Shield, Building2, Eye, LayoutTemplate, Sun, Moon } from 'lucide-react';
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
    <header className={`sticky top-0 z-30 h-16 border-b transition-colors px-6 flex items-center justify-between ${
      isDark ? 'border-slate-800 bg-[#090d16]/95 text-slate-100' : 'border-slate-200 bg-white/95 text-slate-900 shadow-xs'
    }`}>
      <div className="flex items-center gap-4">
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-3 cursor-pointer group"
          title="Retour à la présentation VIGILO"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`font-bold text-base tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                VIGILO
              </span>
              <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                isDark ? 'bg-blue-950/60 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                Console PME
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {t.brandTagline}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className={`flex items-center p-0.5 rounded-lg border text-xs font-mono ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
        }`}>
          <button
            onClick={() => onToggleLanguage('fr')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'fr'
                ? isDark ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'en'
                ? isDark ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-700 font-bold shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900'
          }`}
          title={t.nav.switchTheme}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
        </button>

        {/* Landing Page button */}
        <button
          onClick={onGoToLanding}
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
            isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
          title="Afficher la page de présentation"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-blue-500" />
          <span>{t.nav.landing}</span>
        </button>

        {/* Simulation Provider indicator */}
        <div className={`hidden md:flex items-center gap-2 text-xs border rounded-md px-2.5 py-1.5 ${
          isDark ? 'border-slate-800 bg-slate-900 text-slate-400' : 'border-slate-200 bg-slate-50 text-slate-600'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Moteur :</span>
          <strong className={isDark ? 'text-slate-200' : 'text-slate-800'}>
            {settings.provider === 'mock' ? 'Mock Engine' : 'Gophish API'}
          </strong>
        </div>

        {/* Employee Simulation Trigger */}
        <button
          onClick={onOpenEmployeeSimulator}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
          title="Tester le rendu de l'email / WhatsApp et les réflexes collaborateurs"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.nav.liveTest}</span>
          <span className="sm:hidden">Test live</span>
        </button>

        {/* User Role */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 text-xs">
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-slate-300">
            IT
          </div>
          <span className="hidden lg:inline font-medium text-slate-700 dark:text-slate-300">
            {t.nav.adminRole}
          </span>
        </div>
      </div>
    </header>
  );
};
