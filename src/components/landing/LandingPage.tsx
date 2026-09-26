import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Play,
  Eye,
  Server,
  Smartphone,
  ChevronRight,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { translations, Language } from '../../i18n/translations';

interface LandingPageProps {
  onEnterDashboard: () => void;
  onOpenLiveSimulator: () => void;
  onExploreTrainings: () => void;
  onOpenFlashNews?: () => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDashboard,
  onOpenLiveSimulator,
  language,
  onToggleLanguage,
}) => {
  const t = translations[language];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* 1. MINIMALIST NAVBAR */}
      <nav className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--card-border)]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEnterDashboard}>
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-extrabold text-lg tracking-tight font-mono text-[var(--foreground)]">
              VIGILO
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[var(--primary)]/10 text-[var(--primary)]">
              Console PME
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--muted-foreground)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">
              Fonctionnalités
            </a>
            <a href="#simulation" className="hover:text-[var(--foreground)] transition-colors">
              Simulateur
            </a>
            <a href="#roi" className="hover:text-[var(--foreground)] transition-colors">
              ROI
            </a>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-[var(--card)] rounded-md border border-[var(--card-border)] text-xs font-mono p-0.5">
              <button
                onClick={() => onToggleLanguage('fr')}
                className={`px-2 py-1 rounded-sm transition-colors ${
                  language === 'fr' ? 'bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 rounded-sm transition-colors ${
                  language === 'en' ? 'bg-[var(--primary)] text-white font-medium' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                EN
              </button>
            </div>
            
            <button
              onClick={onEnterDashboard}
              className="vigilo-btn-primary px-4 py-2 text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <span>{t.nav.enterConsole}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION - CLEAN AND DIRECT */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--card)] border border-[var(--card-border)] text-[var(--muted-foreground)] text-xs font-medium mb-8">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Conforme aux recommandations de l'ANCy pour les PME
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-[var(--foreground)] max-w-4xl mx-auto">
          {language === 'fr' ? (
            <>Augmenter la vigilance de votre équipe face aux <span className="text-[var(--primary)]">cybermenaces.</span></>
          ) : (
            <>Improve your team's vigilance against <span className="text-[var(--primary)]">cyber threats.</span></>
          )}
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onEnterDashboard}
            className="vigilo-btn-primary px-8 py-4 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <span>Accéder au Tableau de Bord</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLiveSimulator}
            className="vigilo-btn-secondary px-8 py-4 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>{t.landing.simulateTrap}</span>
          </button>
        </div>
      </section>

      {/* 3. LOGOS / TRUST */}
      <section className="py-12 border-y border-[var(--card-border)] bg-[var(--card)]">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-12 sm:gap-24 text-[var(--muted-foreground)] text-sm font-mono opacity-80">
          <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> RGPD Compliant</div>
          <div className="flex items-center gap-2"><Server className="w-4 h-4" /> Open-Source Engine</div>
          <div className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Powered by RodiumAI</div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Une approche centrée sur l'action
          </h2>
          <p className="mt-4 text-[var(--muted-foreground)]">
            Fini les modules e-learning d'une heure. Nous ancrons les réflexes de sécurité directement dans le flux de travail de vos collaborateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-6">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Simulations Réalistes</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Testez vos équipes avec des attaques hyper-réalistes par Email ou WhatsApp (ex: fraude au président, fausse facture).
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Micro-coaching immédiat</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Lorsqu'un employé se fait piéger, l'IA lui propose immédiatement un module de rattrapage de 2 minutes ciblé sur son erreur.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[var(--card)] border border-[var(--card-border)] flex flex-col items-start text-left">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
              <RotateCcw className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Re-test automatisé</h3>
            <p className="text-[var(--muted-foreground)] text-sm leading-relaxed">
              Le système re-teste automatiquement l'employé 14 jours plus tard pour valider l'acquisition du réflexe sécuritaire.
            </p>
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE SECTION */}
      <section id="simulation" className="py-24 px-6 max-w-6xl mx-auto border-t border-[var(--card-border)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Mettez-vous à la place de vos employés
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-8">
              Découvrez exactement ce que vivent vos collaborateurs lorsqu'ils sont confrontés à une simulation VIGILO. L'expérience est bienveillante, pédagogique, et directement intégrée dans leurs outils quotidiens.
            </p>
            <button
              onClick={onOpenLiveSimulator}
              className="vigilo-btn-secondary px-6 py-3 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              Lancer la démonstration interactive
            </button>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm">
            <div className="border-b border-[var(--card-border)] pb-4 mb-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-bold">JD</div>
              <div>
                <p className="font-semibold text-sm">Jean Dupont (Directeur)</p>
                <p className="text-xs text-[var(--muted-foreground)]">WhatsApp</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              "Salut, je suis en réunion avec un client. J'ai besoin d'un virement urgent de 500.000 F CFA à valider immédiatement par ce lien pour débloquer le contrat."
            </p>
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs flex items-start gap-2">
              <span className="font-bold shrink-0">VIGILO :</span>
              Ceci est un test d'Ingénierie Sociale. L'urgence et l'autorité sont utilisées pour vous piéger.
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROI SECTION */}
      <section id="roi" className="py-24 px-6 max-w-5xl mx-auto text-center border-t border-[var(--card-border)]">
        <h2 className="text-3xl font-bold tracking-tight mb-16">
          Des résultats concrets pour la sécurité de votre PME
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-extrabold text-[var(--foreground)] mb-2">-74%</div>
            <div className="text-sm text-[var(--muted-foreground)]">De clics malveillants</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[var(--foreground)] mb-2">+88%</div>
            <div className="text-sm text-[var(--muted-foreground)]">De signalements spontanés</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[var(--foreground)] mb-2">2 min</div>
            <div className="text-sm text-[var(--muted-foreground)]">Temps de formation moyen</div>
          </div>
          <div>
            <div className="text-4xl font-extrabold text-[var(--foreground)] mb-2">0</div>
            <div className="text-sm text-[var(--muted-foreground)]">Complexité d'intégration</div>
          </div>
        </div>
      </section>

      {/* 7. CTA & FOOTER */}
      <footer className="bg-[var(--card)] border-t border-[var(--card-border)] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-[var(--primary)]" />
            <span className="font-bold tracking-tight">VIGILO SaaS</span>
          </div>
          <div className="text-sm text-[var(--muted-foreground)]">
            © 2026 VIGILO Network. Conçu pour la résilience des PME.
          </div>
        </div>
      </footer>
    </div>
  );
};
