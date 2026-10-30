import React from 'react';
import { Shield, Eye, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { SimulationProviderSettings } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface NavbarProps {
  activeTab: string;
  onOpenEmployeeSimulator: () => void;
  /** Ferme la session et revient à la page de présentation. */
  onGoToLanding: () => void;
  settings: SimulationProviderSettings;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenMobileNav?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenEmployeeSimulator,
  onGoToLanding,
  settings,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
  onOpenMobileNav,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];
  const logoutLabel = language === 'fr' ? 'Se déconnecter' : 'Log out';
  const menuLabel = language === 'fr' ? 'Ouvrir le menu' : 'Open menu';

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-kori-line bg-kori-header px-3 sm:px-6 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
        {onOpenMobileNav && (
          <button
            type="button"
            onClick={onOpenMobileNav}
            className="md:hidden p-2 rounded-lg vigilo-chrome-btn cursor-pointer shrink-0"
            aria-label={menuLabel}
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-kori-accent text-kori-ink flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-display text-base tracking-tight text-kori-text">VIGILO</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-kori-chip text-kori-muted">
                Console PME
              </span>
            </div>
            <p className="text-[11px] text-kori-muted hidden lg:block truncate">
              {t.brandTagline}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div
          className="flex items-center p-0.5 rounded-full border border-kori-line bg-kori-chip text-xs"
          role="group"
          aria-label={language === 'fr' ? 'Langue' : 'Language'}
        >
          {(['fr', 'en'] as Language[]).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onToggleLanguage(lang)}
              aria-pressed={language === lang}
              className={`px-2.5 py-0.5 rounded-full transition-colors cursor-pointer font-semibold ${
                language === lang
                  ? 'bg-kori-accent text-kori-ink'
                  : 'text-kori-muted hover:text-kori-text'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-lg vigilo-chrome-btn cursor-pointer"
          title={t.nav.switchTheme}
          aria-label={t.nav.switchTheme}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="hidden md:flex items-center gap-2 text-xs rounded-full border border-kori-line bg-kori-chip px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-kori-positive" aria-hidden="true" />
          <span className="text-kori-muted">{language === 'fr' ? 'Moteur' : 'Engine'}</span>
          <strong className="font-semibold text-kori-text">
            {settings.provider === 'mock'
              ? 'Mock Engine'
              : language === 'fr'
                ? 'Gophish · lecture seule'
                : 'Gophish · read-only'}
          </strong>
        </div>

        <button
          type="button"
          onClick={onOpenEmployeeSimulator}
          className="vigilo-btn-orange flex items-center gap-1.5 px-3.5 py-1.5 text-xs cursor-pointer"
          title={language === 'fr' ? "Tester le rendu de l'email / WhatsApp" : 'Preview the email / WhatsApp rendering'}
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.nav.liveTest}</span>
          <span className="sm:hidden">{language === 'fr' ? 'Test live' : 'Live test'}</span>
        </button>

        <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-kori-line text-xs">
          <div
            className="w-8 h-8 rounded-full bg-kori-chip border border-kori-line flex items-center justify-center font-semibold text-kori-text"
            aria-hidden="true"
          >
            IT
          </div>
          <span className="hidden lg:inline font-medium text-kori-muted">{t.nav.adminRole}</span>
          <button
            type="button"
            onClick={onGoToLanding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full vigilo-chrome-btn text-xs font-medium cursor-pointer"
            title={logoutLabel}
            aria-label={logoutLabel}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">{logoutLabel}</span>
          </button>
        </div>
      </div>
    </header>
  );
};