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
  const t = translations[language];

  const codeSnippets = {
    curl: `curl -X POST https://api.vigilo.network/v1/campaigns \\
  -H "Authorization: Bearer vig_sec_9938e21a" \\
  -H "Content-Type: application/json" \\
  -d '{
    "target_cohort": "finance_team",
    "vector": "whatsapp_whishing",
    "scenario_id": "ceo_urgent_wire",
    "retest_delay_days": 14
  }'`,
    python: `import vigilo

client = vigilo.Client(api_key="vig_sec_9938e21a")

# Deploy controlled WhatsApp & Email simulation
campaign = client.campaigns.create(
    cohort="finance_team",
    vector="whatsapp_whishing",
    scenario="ceo_urgent_wire",
    auto_retest=True
)

print(f"Simulation live: {campaign.id} | Click rate target < 8%")`,
    node: `import { VigiloClient } from '@vigilo/sdk';

const vigilo = new VigiloClient({ apiKey: process.env.VIGILO_API_KEY });

const campaign = await vigilo.campaigns.dispatch({
  targetCohort: 'finance_team',
  vector: 'whatsapp_whishing',
  scenarioId: 'ceo_urgent_wire',
  autoRetest: true,
});

console.log(\`Vigilance stream active: \${campaign.telemetryUrl}\`);`,
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen font-sans transition-colors duration-200 ${isDark ? 'bg-[#090d16] text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
      {/* 1. TOP NAVBAR */}
      <nav className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isDark ? 'border-slate-800 bg-[#090d16]/90' : 'border-slate-200 bg-white/90'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-base tracking-tight font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  VIGILO
                </span>
                <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  isDark ? 'bg-blue-950/60 border-blue-800 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
                }`}>
                  SaaS B2B
                </span>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-medium">
            <a href="#cycle" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {t.nav.overview}
            </a>
            <a href="#capabilities" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {t.landing.featureWhatsappTitle}
            </a>
            <a href="#trainings" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {t.nav.trainings}
            </a>
            <a href="#api" className={`transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              API
            </a>
          </div>

          {/* Controls: Theme, Language, Actions */}
          <div className="flex items-center gap-2.5">
            {/* Language toggle FR / EN */}
            <div className={`flex items-center p-0.5 rounded-lg border text-xs font-mono ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
            }`}>
              <button
                onClick={() => onToggleLanguage('fr')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'fr'
                    ? isDark ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-700 font-bold shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => onToggleLanguage('en')}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  language === 'en'
                    ? isDark ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-700 font-bold shadow-sm'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:text-white' : 'border-slate-200 bg-slate-100 text-slate-700 hover:text-slate-900'
              }`}
              title={t.nav.switchTheme}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Quick Live Preview */}
            <button
              onClick={onOpenLiveSimulator}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                isDark ? 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              <span>{t.nav.liveTest}</span>
            </button>

            {/* Console Access CTA */}
            <button
              onClick={onEnterDashboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-all shadow-sm cursor-pointer"
            >
              <span>{t.nav.enterConsole}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION — CLEAN, SHARP, EDITORIAL */}
      <section className="pt-20 pb-16 px-6 max-w-5xl mx-auto text-center">
        {/* Unboxed clean kicker */}
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-blue-600 dark:text-blue-400 mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{t.landing.kicker}</span>
          <span aria-hidden="true">·</span>
          <span>ANSSI Compliant</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
          {t.landing.heroTitle}
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          {t.landing.heroSubtitle}
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onEnterDashboard}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <span>{t.landing.startCycle}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenLiveSimulator}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              isDark ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 shadow-sm'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
            <span>{t.landing.simulateTrap}</span>
          </button>
        </div>

        {/* Core loop linear formula (unboxed) */}
        <div className="mt-10 inline-flex items-center flex-wrap justify-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.landing.stepSimulate}</span>
          <span>→</span>
          <span className="text-slate-800 dark:text-slate-200">{t.landing.stepMeasure}</span>
          <span>→</span>
          <span className="text-emerald-600 dark:text-emerald-400">{t.landing.stepAnalyze}</span>
          <span>→</span>
          <span className="text-amber-600 dark:text-amber-400">{t.landing.stepTrain}</span>
          <span>→</span>
          <span className="text-indigo-600 dark:text-indigo-400">{t.landing.stepRetest}</span>
        </div>
      </section>

      {/* 3. DUAL-VECTOR HIGHLIGHT: WHATSAPP WHISHING & EMAIL */}
      <section id="capabilities" className={`py-16 px-6 border-t ${isDark ? 'border-slate-800 bg-[#0c121d]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold">
              Innovation Vecteur Mobile
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t.landing.featureWhatsappTitle}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.landing.featureWhatsappDesc}
            </p>
          </div>

          {/* Interactive preview box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left explanatory points */}
            <div className="lg:col-span-5 space-y-4 text-xs">
              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                <strong className="block font-semibold text-slate-900 dark:text-white mb-1">
                  1. Usurpation de l'autorité (CEO Fraud)
                </strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  L'attaquant contacte l'employé sur son WhatsApp sous le nom du PDG, prétextant une réunion secrète pour interdire tout appel vocal et exiger un virement d'urgence.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                <strong className="block font-semibold text-slate-900 dark:text-white mb-1">
                  2. La règle d'or du contre-appel
                </strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  VIGILO enseigne le réflexe infaillible : composer le numéro fixe interne officiel du dirigeant. Une seconde de vérification stoppe 100% de ces fraudes.
                </p>
              </div>

              <div className={`p-4 rounded-xl border ${isDark ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-white'}`}>
                <strong className="block font-semibold text-slate-900 dark:text-white mb-1">
                  3. Quishing & détournement de session
                </strong>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Simulez également les faux QR codes de synchronisation WhatsApp Web pour former vos équipes au risque du QRLJacking.
                </p>
              </div>

              <button
                onClick={onOpenLiveSimulator}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Tester le simulateur WhatsApp en direct</span>
              </button>
            </div>

            {/* Right realistic UI preview card */}
            <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#222d34] shadow-2xl bg-[#0b141a] text-white">
              {/* WhatsApp top bar */}
              <div className="bg-[#202c33] px-4 py-3 flex items-center justify-between border-b border-[#2a3942]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs text-white">
                    MV
                  </div>
                  <div>
                    <div className="font-semibold text-xs flex items-center gap-1.5">
                      <span>Marc V. (PDG - Direction)</span>
                      <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-400">Inconnu</span>
                    </div>
                    <span className="text-[10px] text-emerald-400">en ligne</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300">
                    Simulation Active
                  </span>
                </div>
              </div>

              {/* Chat snippet */}
              <div className="p-4 space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#202c33] max-w-[85%] space-y-1">
                  <p>Bonjour, c'est Marc. Je suis en réunion fermée sous clause de confidentialité (NDA). J'ai un besoin critique avant 12h :</p>
                  <div className="p-2 rounded bg-[#111b21] border border-[#2a3942] text-[11px] text-emerald-400 flex items-center justify-between">
                    <span>validation-tresorerie-groupe.net/auth</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                  <span className="text-[10px] text-[#8696a0] block text-right">10:43</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#005c4b] max-w-[85%] ml-auto text-right text-[11px]">
                  <span>Je vous appelle sur le numéro fixe officiel avant d'exécuter l'ordre.</span>
                  <span className="text-[10px] text-[#8696a0] block mt-1">10:44 ✓✓</span>
                </div>
              </div>

              {/* Simulator footer */}
              <div className="p-2.5 bg-[#182229] border-t border-[#222d34] flex items-center justify-between text-[11px] text-[#8696a0]">
                <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Réflexe parfait : Fraude stoppée</span>
                </span>
                <span className="font-mono text-[10px]">VIGILO DEFENSE ENGINE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE 5-STEP CONTINUOUS ARCHITECTURE */}
      <section id="cycle" className="py-16 px-6 max-w-6xl mx-auto">
        <div className="max-w-2xl space-y-2 mb-10">
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
            {t.landing.cycleSectionTitle}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {t.landing.cycleSectionDesc}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: t.landing.stepSimulate,
              desc: t.landing.stepSimulateDesc,
              tag: 'Email & WhatsApp',
            },
            {
              step: '02',
              title: t.landing.stepMeasure,
              desc: t.landing.stepMeasureDesc,
              tag: 'Taux clics & signalements',
            },
            {
              step: '03',
              title: t.landing.stepAnalyze,
              desc: t.landing.stepAnalyzeDesc,
              tag: 'Vigilo Coach',
            },
            {
              step: '04',
              title: t.landing.stepTrain,
              desc: t.landing.stepTrainDesc,
              tag: '4 min interactives',
            },
            {
              step: '05',
              title: t.landing.stepRetest,
              desc: t.landing.stepRetestDesc,
              tag: 'Évolution à J+14',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border flex flex-col justify-between space-y-3 transition-colors ${
                isDark ? 'border-slate-800 bg-slate-900/50 hover:border-slate-700' : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{item.step}</span>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-500">
                {item.tag}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FLASH NEWS & AWARENESS SHOWCASE */}
      <section className={`py-16 px-6 border-t ${isDark ? 'border-slate-800 bg-[#0c121d]' : 'border-slate-200 bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider font-semibold">
              {t.landing.flashTitle}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Mettez au parfum vos collaborateurs entre deux simulations
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {t.landing.flashDesc}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => {
                  onEnterDashboard();
                  if (onOpenFlashNews) onOpenFlashNews();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span>{t.landing.exploreFlash}</span>
              </button>
            </div>
          </div>

          {/* Sample bulletin pill card */}
          <div className={`w-full md:w-96 p-5 rounded-xl border space-y-3 ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-red-500 font-semibold">ALERTE URGENTE</span>
              <span className="text-slate-500">Aujourd'hui</span>
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
              Vague de faux messages WhatsApp usurpant la Direction
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Plusieurs entreprises partenaires signalent des ordres de paiement frauduleux reçus par WhatsApp. La consigne : contre-appel systématique.
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
              <span>90% de lecture</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Diffusé</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CODE & DEVELOPER API SECTION */}
      <section id="api" className="py-16 px-6 max-w-6xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider font-semibold">
                Automatisation & CI/CD
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-1">
                API REST & Webhooks VIGILO
              </h2>
            </div>

            {/* Code language tabs */}
            <div className={`flex items-center p-1 rounded-lg border text-xs font-mono ${
              isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
            }`}>
              {(['curl', 'python', 'node'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveCodeTab(tab)}
                  className={`px-3 py-1 rounded transition-colors cursor-pointer uppercase ${
                    activeCodeTab === tab
                      ? isDark ? 'bg-blue-600 text-white font-bold' : 'bg-white text-blue-700 font-bold shadow-sm'
                      : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-800 bg-[#070b12] text-slate-200 font-mono text-xs overflow-x-auto shadow-inner">
            <pre className="leading-relaxed">
              <code>{codeSnippets[activeCodeTab]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 7. FINAL CTA & SIMPLE ENTERPRISE FOOTER */}
      <footer className={`py-12 px-6 border-t ${isDark ? 'border-slate-800 bg-[#070b13]' : 'border-slate-200 bg-white'}`}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-[11px] font-bold">
              V
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">VIGILO</span>
            <span>·</span>
            <span>{t.landing.rightsReserved}</span>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onEnterDashboard} className="hover:text-blue-500 transition-colors cursor-pointer">
              {t.nav.enterConsole}
            </button>
            <button onClick={onOpenLiveSimulator} className="hover:text-blue-500 transition-colors cursor-pointer">
              {t.nav.liveTest}
            </button>
            <button onClick={onExploreTrainings} className="hover:text-blue-500 transition-colors cursor-pointer">
              {t.nav.trainings}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
