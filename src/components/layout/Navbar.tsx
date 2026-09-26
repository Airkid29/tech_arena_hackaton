import React from 'react';
import { Shield, Eye, LayoutTemplate, Sun, Moon } from 'lucide-react';
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
              <span className="font-extrabold text-base tracking-tight font-mono text-[var(--foreground)]">
                VIGILO
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium vigilo-pill-orange">
                Console PME
              </span>
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] hidden sm:block font-mono">
              Vigilance & Cyber Risk SaaS
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center p-0.5 rounded-lg vigilo-chrome-btn text-xs font-mono">
          <button
            onClick={() => onToggleLanguage('fr')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'fr' ? 'bg-[var(--primary)] text-white font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'en' ? 'bg-[var(--primary)] text-white font-bold' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            EN
          </button>
        </div>

        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg vigilo-chrome-btn cursor-pointer"
          title={t.nav.switchTheme}
        >
          {isDark ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          )}
        </button>

        <button
          onClick={onGoToLanding}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg vigilo-chrome-btn text-[var(--foreground)] text-xs font-medium cursor-pointer"
          title="Afficher la page de présentation"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{t.nav.landing}</span>
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs vigilo-chrome-btn rounded-lg px-3 py-1.5 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[var(--muted-foreground)]">Moteur:</span>
          <strong className="text-[var(--foreground)]">
            {settings.provider === 'mock' ? 'Mock Engine' : 'Gophish API'}
          </strong>
        </div>

        <button
          onClick={onOpenEmployeeSimulator}
          className="vigilo-btn-orange flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
          title="Tester le rendu de l'email / WhatsApp"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.nav.liveTest}</span>
          <span className="sm:hidden">Test live</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-[var(--card-border)] text-xs font-mono">
          <div className="w-7 h-7 rounded-full bg-[var(--primary)]/15 border border-[var(--primary)]/35 flex items-center justify-center font-bold text-xs text-[var(--primary)]">
            IT
          </div>
          <span className="hidden lg:inline font-medium text-[var(--muted-foreground)]">
            {t.nav.adminRole}
          </span>
        </div>
      </div>
    </header>
  );
};
