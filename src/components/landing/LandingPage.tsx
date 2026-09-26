import React, { useState } from 'react';
import {
  Shield,
  ArrowRight,
  CheckCircle2,
  Lock,
  Zap,
  Globe,
  FileCode2,
  RotateCcw,
  GraduationCap,
  Users,
  Eye,
  Server,
  Play,
  ExternalLink,
  Code2,
  Database,
  BarChart3,
  MessageSquare,
  Bell,
  Sun,
  Moon,
  PhoneCall,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  X,
  AlertTriangle,
  Smartphone,
  Mail,
  TrendingUp,
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
  onExploreTrainings,
  onOpenFlashNews,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'node'>('curl');
  const [copiedCode, setCopiedCode] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(true);

  const t = translations[language];
  const isDark = theme === 'dark';

  const codeSnippets = {
    curl: `curl -X POST https://api.vigilo.network/v1/campaigns \\
  -H "Authorization: Bearer vig_sec_9938e21a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_cohort": "direction_financiere",
    "vector": "whatsapp_whishing",
    "scenario_id": "ceo_urgent_wire_transfer",
    "ai_coaching": true,
    "retest_delay_days": 14
  }'`,
    python: `import vigilo

client = vigilo.Client(api_key="vig_sec_9938e21a")

# Déploiement d'une simulation contrôlée Email & WhatsApp
campaign = client.campaigns.create(
    cohort="direction_financiere",
    vector="whatsapp_whishing",
    scenario="ceo_urgent_wire_transfer",
    ai_coaching=True,
    auto_retest=True
)

print(f"Simulation live: {campaign.id} | Cible taux de clic < 8%")`,
    node: `import { VigiloClient } from '@vigilo/sdk';

const vigilo = new VigiloClient({ apiKey: process.env.VIGILO_API_KEY });

const campaign = await vigilo.campaigns.dispatch({
  targetCohort: 'direction_financiere',
  vector: 'whatsapp_whishing',
  scenarioId: 'ceo_urgent_wire_transfer',
  aiCoaching: true,
  autoRetest: true,
});

console.log(\`Flux de vigilance actif: \${campaign.telemetryUrl}\`);`,
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeCodeTab]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 font-sans selection:bg-[#f2620a] selection:text-white relative overflow-hidden">
      {/* 0. STICKY ANNOUNCEMENT BAR — Rodium AI Style */}
      {showAnnouncement && (
        <div className="relative z-50 bg-gradient-to-r from-[#f2620a] via-[#ea580c] to-[#d97706] text-white py-2 px-4 text-xs font-medium border-b border-white/10 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex-1 flex items-center justify-center gap-2 text-center">
              <span className="bg-white/20 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Nouveau v2.4
              </span>
              <span className="hidden sm:inline">
                {language === 'fr' 
                  ? 'VIGILO intègre le piège WhatsApp Business & le Coach IA Gemini 2.5'
                  : 'VIGILO releases WhatsApp Business Traps & Gemini 2.5 AI Coach'}
              </span>
              <span className="sm:hidden">
                VIGILO v2.4 : Coaching IA & Pièges WhatsApp
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onOpenLiveSimulator}
                className="bg-white text-[#8a3a0a] hover:bg-slate-100 font-bold px-3 py-1 rounded-md text-[11px] transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <span>{language === 'fr' ? 'Essayer le Simulator' : 'Try Simulator'}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
              <button
                onClick={() => setShowAnnouncement(false)}
                className="text-white/80 hover:text-white p-0.5 transition-colors cursor-pointer"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 1. TOP NAVBAR — Glassmorphic Dark Navbar */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#080b11]/85 border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={onEnterDashboard}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f2620a] to-[#d97706] flex items-center justify-center text-white shadow-[0_0_15px_rgba(242,98,10,0.4)] group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight font-mono text-white">
                  VIGILO
                </span>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f2620a]/15 text-[#fb923c] border border-[#f2620a]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f2620a] animate-pulse" />
                  SaaS B2B
                </span>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium text-slate-400">
            <a href="#piliers" className="hover:text-white transition-colors">
              {language === 'fr' ? 'Piliers' : 'Pillars'}
            </a>
            <a href="#vectors" className="hover:text-white transition-colors">
              {language === 'fr' ? 'Pièges WhatsApp & Mail' : 'WhatsApp & Mail Traps'}
            </a>
            <a href="#coaching" className="hover:text-white transition-colors">
              {language === 'fr' ? 'Coach IA Gemini' : 'AI Coach'}
            </a>
            <a href="#api" className="hover:text-white transition-colors">
              API & Integration
            </a>
            <a href="#retest" className="hover:text-white transition-colors">
              {language === 'fr' ? 'Re-Test & ROI' : 'Re-Test & ROI'}
            </a>
          </div>

          {/* Action controls */}
          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono">
              <button
                onClick={() => onToggleLanguage('fr')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'fr' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'en' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            {/* Live Simulator CTA */}
            <button
              onClick={onOpenLiveSimulator}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/12 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#fb923c]" />
              <span>{t.nav.liveTest}</span>
            </button>

            {/* Main Console CTA */}
            <button
              onClick={onEnterDashboard}
              className="vigilo-btn-orange flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            >
              <span>{t.nav.enterConsole}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION — Rodium AI Radiant Glow Aesthetic */}
      <section className="relative pt-20 pb-20 px-6 max-w-6xl mx-auto">
        {/* Glow backdrop effects */}
        <div className="absolute inset-0 vigilo-grid-pattern pointer-events-none z-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] vigilo-orange-glow rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f2620a]/30 bg-[#f2620a]/10 text-slate-300 text-xs font-medium mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
            <span className="text-[#fb923c] font-semibold">{t.landing.kicker}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">ANSSI & RGPD Compliant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            {language === 'fr' ? (
              <>
                Transformez vos équipes en <br />
                <span className="vigilo-orange-text-gradient">votre premier pare-feu humain</span>
              </>
            ) : (
              <>
                Transform your employees into <br />
                <span className="vigilo-orange-text-gradient">your primary human firewall</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.landing.heroSubtitle}
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={onEnterDashboard}
              className="vigilo-btn-orange flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(242,98,10,0.4)] cursor-pointer"
            >
              <span>{t.landing.startCycle}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenLiveSimulator}
              className="vigilo-btn-secondary flex items-center gap-2.5 px-7 py-4 rounded-xl text-sm font-semibold cursor-pointer"
            >
              <Play className="w-4 h-4 text-[#fb923c] fill-[#fb923c]" />
              <span>{t.landing.simulateTrap}</span>
            </button>
          </div>

          {/* Linear Loop Flow Pill */}
          <div className="mt-12 inline-flex items-center flex-wrap justify-center gap-3 px-6 py-3 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md text-xs font-mono text-slate-400 shadow-xl">
            <span className="text-[#fb923c] font-bold">1. {t.landing.stepSimulate}</span>
            <span className="text-slate-600">→</span>
            <span className="text-slate-300">2. {t.landing.stepMeasure}</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 font-semibold">3. {t.landing.stepAnalyze}</span>
            <span className="text-slate-600">→</span>
            <span className="text-amber-400 font-semibold">4. {t.landing.stepTrain}</span>
            <span className="text-slate-600">→</span>
            <span className="text-cyan-400 font-semibold">5. {t.landing.stepRetest}</span>
          </div>
        </div>

        {/* 3. CODE TERMINAL SHOWCASE CARD — Rodium AI Signature Component */}
        <div className="mt-16 max-w-4xl mx-auto relative z-10">
          <div className="rounded-2xl border border-white/15 bg-[#0b0f19] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Terminal Header Bar */}
            <div className="px-5 py-3.5 bg-[#0f1422] border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-3 text-xs font-mono text-slate-400">api.vigilo.network — v1/campaigns</span>
              </div>

              {/* Code Language Switcher */}
              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 text-xs font-mono">
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeCodeTab === 'curl' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeCodeTab === 'python' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab('node')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeCodeTab === 'node' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-6 font-mono text-xs sm:text-sm text-slate-300 overflow-x-auto relative bg-[#070a12] leading-relaxed">
              <button
                onClick={handleCopyCode}
                className="absolute top-4 right-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-mono"
                title="Copier le snippet"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copié !' : 'Copier'}</span>
              </button>
              <pre className="text-slate-300">
                <code>{codeSnippets[activeCodeTab]}</code>
              </pre>
            </div>

            {/* Terminal Footer Status */}
            <div className="px-5 py-2.5 bg-[#0f1422] border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Engine: Gophish Native & WhatsApp Business Gateway</span>
              </div>
              <span className="text-[#fb923c]">HTTP 201 Created</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUST & CERTIFICATIONS MARQUEE */}
      <section className="py-10 border-y border-white/10 bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-6 mb-4 text-center">
          <p className="text-[11px] font-mono uppercase tracking-widest text-slate-500">
            {language === 'fr' ? 'Conformité & Exigence Cybersécurité' : 'Cybersecurity Standards & Compliance'}
          </p>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-8 sm:gap-12 px-6 text-slate-400 text-xs font-mono">
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>ANSSI Guidelines Compliant</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>RGPD Article 32 (No PII leaks)</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Server className="w-4 h-4 text-[#fb923c]" />
            <span>Gophish Open Source Engine</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Gemini 2.5 Flash AI Coach</span>
          </div>
        </div>
      </section>

      {/* 5. TROIS PILIERS VIGILO — Rodium AI Grid Cards */}
      <section id="piliers" className="py-24 px-6 max-w-6xl mx-auto relative">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-mono text-slate-400 mb-4">
            Architecture SaaS 360°
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Une boucle fermée de vigilance continue
          </h2>
          <p className="mt-4 text-slate-400 text-sm sm:text-base">
            Contrairement aux formations théoriques annuelles inefficaces, VIGILO teste, coache et valide la réaction réelle sur les outils du quotidien.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="vigilo-card p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#f2620a]/15 border border-[#f2620a]/30 flex items-center justify-center text-[#fb923c] mb-6 group-hover:scale-110 transition-transform">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. Pièges WhatsApp & Mail</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Déployez des simulations ultra-réalistes de phishing (Microsoft 365, Factures) et de whishing WhatsApp (Urgence Direction).
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-[#fb923c]">
              <span>Pièges Multi-Vecteurs</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="vigilo-card p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. Coach IA & Micro-Trainings</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyse immédiate des leviers psychologiques déclenchés (Urgence, Autorité) et proposition de micro-modules de 2 minutes.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-amber-400">
              <span>Coaching Gemini 2.5</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="vigilo-card p-8 flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Re-Test & Preuve ROI</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Re-test automatique à 14 jours pour valider la mémorisation et mesurer le taux d'adoption du reflexe de signalement.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span>Validation Automatisée</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 6. LIVE EMPLOYEE SIMULATOR SHOWCASE — Interactive Teaser */}
      <section id="vectors" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="vigilo-card p-8 sm:p-12 border border-white/15 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 vigilo-orange-glow rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f2620a]/15 text-[#fb923c] border border-[#f2620a]/30 text-xs font-mono mb-4">
                <Eye className="w-3.5 h-3.5" />
                Démonstration Interactive Temps Réel
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Voyez exactement ce que ressent le collaborateur piège
              </h2>

              <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
                Notre module d'immersion simule l'interface exacte reçue par vos employés (Inbox Outlook/Gmail ou Message WhatsApp) et évalue leurs réflexes sous pression.
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Bouton "Signaler l'attaque" accessible en 1 clic</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Feedback constructif immédiat sans stigmatisation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Lancement direct du micro-module de rattrapage</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onOpenLiveSimulator}
                  className="vigilo-btn-orange flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Lancer le simulateur de piège</span>
                </button>
              </div>
            </div>

            {/* Mockup Preview Card */}
            <div className="bg-[#0f1422] border border-white/15 rounded-2xl p-5 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    WA
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Directeur Général (Simulation)</h4>
                    <p className="text-[10px] text-slate-400">WhatsApp Business Security Test</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Trap Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-800/80 p-3.5 rounded-xl border border-white/5 text-slate-200 leading-relaxed">
                  "Bonjour Marc, je suis en réunion client confidentielle. J'ai besoin d'un virement d'acompte urgent de 4 800€ à valider immédiatement par ce lien :"
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <strong className="block font-bold">Reflex Check:</strong>
                    <span>Ne cliquez jamais sur un lien de virement reçu par messagerie instantanée sans vérification vocale préalable.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ROI METRICS BANNER — Rodium AI Quantitative Stats */}
      <section id="retest" className="py-20 px-6 max-w-6xl mx-auto border-t border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="vigilo-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-[#fb923c] font-mono tracking-tight">
              -74%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Taux de clic post-retest</p>
          </div>

          <div className="vigilo-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">
              +88%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Taux de signalement spontané</p>
          </div>

          <div className="vigilo-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">
              2 min
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Durée d'un micro-training</p>
          </div>

          <div className="vigilo-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-cyan-400 font-mono tracking-tight">
              100%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Conforme Directives ANSSI</p>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION FINAL SECTION — Rodium AI Dark CTA Box */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0f1523] to-[#070a12] p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 vigilo-orange-glow pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#f2620a] to-[#d97706] flex items-center justify-center text-white mx-auto mb-6 shadow-[0_0_30px_rgba(242,98,10,0.5)]">
              <Shield className="w-7 h-7" />
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Prêt à sécuriser votre entreprise contre l'erreur humaine ?
            </h2>

            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Lancez votre première simulation en moins de 2 minutes via la Console VIGILO ou intégrez notre API.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onEnterDashboard}
                className="vigilo-btn-orange flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold cursor-pointer"
              >
                <span>Accéder à la Console Console</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="py-12 border-t border-white/10 bg-[#05070c] text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-[#f2620a]" />
            <span className="font-mono text-slate-300 font-bold">VIGILO SaaS B2B</span>
            <span>© 2026 VIGILO Network. Tous droits réservés.</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>ANSSI Compliant</span>
            <span>RGPD Compliant</span>
            <span>Gophish Native API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
