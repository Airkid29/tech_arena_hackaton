import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { OverviewTab } from './components/overview/OverviewTab';
import { CampaignList } from './components/campaigns/CampaignList';
import { CampaignDetail } from './components/campaigns/CampaignDetail';
import { CreateCampaignModal } from './components/campaigns/CreateCampaignModal';
import { ScenarioCatalog } from './components/scenarios/ScenarioCatalog';
import { GenerateScenarioModal } from './components/scenarios/GenerateScenarioModal';
import { AiCoachView } from './components/ai-coach/AiCoachView';
import { TrainingView } from './components/training/TrainingView';
import { InteractiveTrainingPlayer } from './components/training/InteractiveTrainingPlayer';
import { ReTestView } from './components/retest/ReTestView';
import { SettingsView } from './components/settings/SettingsView';
import { FlashNewsView } from './components/flash-news/FlashNewsView';
import { EmployeeSimulatorModal } from './components/employee-simulator/EmployeeSimulatorModal';
import { LandingPage } from './components/landing/LandingPage';
import { AdminLogin } from './components/auth/AdminLogin';
import {
  INITIAL_CAMPAIGNS,
  INITIAL_SCENARIOS,
  INITIAL_TRAININGS,
  INITIAL_RETEST_RECORD,
  INITIAL_SETTINGS,
  INITIAL_FLASH_ARTICLES,
} from './data/mockData';
import {
  Campaign,
  Scenario,
  TrainingModule,
  ReTestRecord,
  SimulationProviderSettings,
  AIAnalysis,
  AppViewMode,
  FlashArticle,
} from './types';
import { Language } from './i18n/translations';

export default function App() {
  const [viewMode, setViewMode] = useState<AppViewMode>('landing');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Internationalization & Theme state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('vigilo_lang') as Language) || 'fr';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('vigilo_theme') as 'dark' | 'light') || 'dark';
  });

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('vigilo_lang', lang);
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('vigilo_theme', next);
  };

  // Sync dark class on root document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Core Data
  const [campaigns, setCampaigns] = useState<Campaign[]>(INITIAL_CAMPAIGNS);
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [trainings, setTrainings] = useState<TrainingModule[]>(INITIAL_TRAININGS);
  const [retestRecord, setRetestRecord] = useState<ReTestRecord>(INITIAL_RETEST_RECORD);
  const [settings, setSettings] = useState<SimulationProviderSettings>(INITIAL_SETTINGS);
  const [flashArticles, setFlashArticles] = useState<FlashArticle[]>(INITIAL_FLASH_ARTICLES);

  // Modals & Sub-flows
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [createCampaignScenarioId, setCreateCampaignScenarioId] = useState<string | undefined>(undefined);
  const [isReTestCreateMode, setIsReTestCreateMode] = useState(false);
  const [reTestBaselineCampaign, setReTestBaselineCampaign] = useState<Campaign | undefined>(undefined);

  const [isGenerateScenarioOpen, setIsGenerateScenarioOpen] = useState(false);
  const [isEmployeeSimulatorOpen, setIsEmployeeSimulatorOpen] = useState(false);
  const [simulatorInitialViewState, setSimulatorInitialViewState] = useState<'inbox' | 'landing_page_clicked' | 'reported_success'>('inbox');
  const [simulatedCampaign, setSimulatedCampaign] = useState<Campaign | null>(null);
  const [simulatedScenario, setSimulatedScenario] = useState<Scenario | null>(null);

  const [activeInteractiveTraining, setActiveInteractiveTraining] = useState<TrainingModule | null>(null);

  // Magic Link Trap Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('trap') === 'true') {
      const scenId = params.get('scenarioId');
      const scen = INITIAL_SCENARIOS.find(s => s.id === scenId || s.category === scenId) || INITIAL_SCENARIOS[0];
      setSimulatedScenario(scen);
      setSimulatorInitialViewState('landing_page_clicked');
      setIsEmployeeSimulatorOpen(true);
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Selected campaign for detail view
  const currentDetailCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Handlers for Campaign Management
  const handleCreateCampaign = (newCampaignData: Partial<Campaign>) => {
    const created: Campaign = {
      ...newCampaignData,
    } as Campaign;

    setCampaigns((prev) => [created, ...prev]);

    // If it was a re-test, update the retestRecord
    if (newCampaignData.isReTest && newCampaignData.baselineCampaignId) {
      const base = campaigns.find((c) => c.id === newCampaignData.baselineCampaignId);
      if (base) {
        setRetestRecord({
          id: `retest-${Date.now()}`,
          title: `Évolution : ${base.name} (Post-Formation)`,
          scenarioCategory: created.category,
          targetCohort: created.targetGroup,
          baselineCampaign: {
            id: base.id,
            name: base.name,
            date: 'Précédente',
            targeted: base.targeted,
            clickRate: base.clickRate,
            reportRate: base.reportRate,
            clicked: base.clicked,
            reported: base.reported,
          },
          retestCampaign: {
            id: created.id,
            name: created.name,
            date: 'Aujourd hui',
            targeted: created.targeted,
            clickRate: created.clickRate,
            reportRate: created.reportRate,
            clicked: created.clicked,
            reported: created.reported,
          },
          evolution: {
            clickRateDropPercent: -Math.round(((base.clickRate - created.clickRate) / (base.clickRate || 1)) * 100),
            reportRateGainPercent: Math.round(((created.reportRate - base.reportRate) / (base.reportRate || 1)) * 100),
            humanVigilanceScore: 88,
          },
        });
      }
    }

    setSelectedCampaignId(created.id);
    setActiveTab('campaigns');
    setViewMode('app');
  };

  const handleUpdateCampaignAnalysis = (campaignId: string, analysis: AIAnalysis) => {
    setCampaigns((prev) =>
      prev.map((c) => (c.id === campaignId ? { ...c, aiAnalysis: analysis } : c))
    );
  };

  const handleOpenCreateCampaignModal = (scenarioId?: string) => {
    setCreateCampaignScenarioId(scenarioId);
    setIsReTestCreateMode(false);
    setReTestBaselineCampaign(undefined);
    setIsCreateCampaignOpen(true);
  };

  const handleLaunchReTest = (baseline: Campaign) => {
    setReTestBaselineCampaign(baseline);
    setIsReTestCreateMode(true);
    setCreateCampaignScenarioId(baseline.scenarioId);
    setIsCreateCampaignOpen(true);
  };

  const handleGenerateTrainingForCampaign = (campaign: Campaign) => {
    const existing = trainings.find((t) => t.category === campaign.category);
    if (existing) {
      setActiveInteractiveTraining(existing);
    } else {
      setActiveInteractiveTraining(trainings[0]);
    }
  };

  // Handlers for Live Employee Simulator (Mock Provider)
  const handleOpenSimulator = (targetCampaign?: Campaign, targetScenario?: Scenario) => {
    // If WhatsApp scenario requested, pick the WhatsApp scenario/campaign
    let camp = targetCampaign;
    let scen = targetScenario;

    if (!camp && !scen) {
      // Pick WhatsApp campaign or M365 campaign
      camp = campaigns.find((c) => c.category === 'WhatsApp Phishing') || campaigns.find((c) => c.status === 'en_cours') || campaigns[0];
      scen = scenarios.find((s) => s.id === camp?.scenarioId) || scenarios[0];
    } else if (camp && !scen) {
      scen = scenarios.find((s) => s.id === camp?.scenarioId) || scenarios[0];
    } else if (!camp && scen) {
      camp = campaigns.find((c) => c.scenarioId === scen?.id) || campaigns[0];
    }

    setSimulatedCampaign(camp || null);
    setSimulatedScenario(scen || null);
    setSimulatorInitialViewState('inbox');
    setIsEmployeeSimulatorOpen(true);
  };

  const handleEmployeeClickedTrap = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((camp) => {
        if (camp.id === campaignId) {
          const newClicked = camp.clicked + 1;
          const newClickRate = Number(((newClicked / camp.targeted) * 100).toFixed(1));
          return {
            ...camp,
            clicked: newClicked,
            clickRate: newClickRate,
          };
        }
        return camp;
      })
    );
  };

  const handleEmployeeReportedPhish = (campaignId: string) => {
    setCampaigns((prev) =>
      prev.map((camp) => {
        if (camp.id === campaignId) {
          const newReported = camp.reported + 1;
          const newReportRate = Number(((newReported / camp.targeted) * 100).toFixed(1));
          return {
            ...camp,
            reported: newReported,
            reportRate: newReportRate,
          };
        }
        return camp;
      })
    );
  };

  // Precise routing from simulation trap click to targeted training module
  const handleStartTrainingFromTrap = (preferredTarget?: string) => {
    let targetModule: TrainingModule | undefined;

    if (preferredTarget === 'WhatsApp Phishing' || preferredTarget === 'train-whatsapp-whishing') {
      targetModule = trainings.find((t) => t.category === 'WhatsApp Phishing' || t.id === 'train-whatsapp-whishing');
    } else if (preferredTarget) {
      targetModule = trainings.find((t) => t.id === preferredTarget || t.category === preferredTarget);
    }

    if (!targetModule && simulatedScenario) {
      targetModule = trainings.find((t) => t.category === simulatedScenario.category);
    }
    if (!targetModule && simulatedCampaign) {
      targetModule = trainings.find((t) => t.id === simulatedCampaign.associatedTrainingId || t.category === simulatedCampaign.category);
    }
    if (!targetModule) {
      targetModule = trainings.find((t) => t.category === 'WhatsApp Phishing') || trainings[0];
    }

    setViewMode('app');
    setActiveInteractiveTraining(targetModule);
  };

  const handleTrainingCompleted = (moduleId: string) => {
    setTrainings((prev) =>
      prev.map((t) =>
        t.id === moduleId && t.completedCount < t.totalAssigned
          ? { ...t, completedCount: t.completedCount + 1 }
          : t
      )
    );
  };

  // Flash News Handlers
  const handleBroadcastFlashArticle = (articleId: string) => {
    setFlashArticles((prev) =>
      prev.map((art) =>
        art.id === articleId
          ? {
              ...art,
              readCount: Math.min(art.totalRecipients, art.readCount + 2),
              readRate: Number((((art.readCount + 2) / art.totalRecipients) * 100).toFixed(1)),
            }
          : art
      )
    );
  };

  const handleCreateFlashArticle = (
    newArt: Omit<FlashArticle, 'id' | 'publishedAt' | 'readCount' | 'readRate'>
  ) => {
    const created: FlashArticle = {
      ...newArt,
      id: `flash-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0],
      readCount: 1,
      readRate: 3.1,
    };
    setFlashArticles((prev) => [created, ...prev]);
  };

  const activeCampaignCount = campaigns.filter((c) => c.status === 'en_cours').length;
  const isDark = theme === 'dark';

  // 1. IF VIEW MODE IS LANDING: Display clean, non-AI-slop landing page with working i18n & theme
  if (viewMode === 'landing') {
    return (
      <div className={isDark ? 'dark' : ''}>
        <LandingPage
          onEnterDashboard={() => setViewMode('login')}
          onOpenLiveSimulator={() => handleOpenSimulator()}
          onExploreTrainings={() => {
            setViewMode('login');
            setActiveTab('training');
          }}
          onOpenFlashNews={() => {
            setViewMode('login');
            setActiveTab('flash-news');
          }}
          language={language}
          onToggleLanguage={handleToggleLanguage}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />

        {/* Global Employee Simulator Modal accessible directly from Landing */}
        <EmployeeSimulatorModal
          isOpen={isEmployeeSimulatorOpen}
          onClose={() => setIsEmployeeSimulatorOpen(false)}
          campaign={simulatedCampaign}
          scenario={simulatedScenario}
          onEmployeeClickedTrap={handleEmployeeClickedTrap}
          onEmployeeReportedPhish={handleEmployeeReportedPhish}
          onStartTrainingFromTrap={handleStartTrainingFromTrap}
          initialViewState={simulatorInitialViewState}
          isDark={isDark}
        />

        {/* Global Micro-training Player Modal */}
        {activeInteractiveTraining && (
          <InteractiveTrainingPlayer
            module={activeInteractiveTraining}
            onClose={() => setActiveInteractiveTraining(null)}
            onComplete={handleTrainingCompleted}
            onNavigateToReTest={() => {
              setActiveInteractiveTraining(null);
              setViewMode('app');
              setActiveTab('retest');
            }}
          />
        )}
      </div>
    );
  }

  if (viewMode === 'login') {
    return (
      <div className={isDark ? 'dark' : ''}>
        <AdminLogin
          onLogin={() => setViewMode('app')}
          onBack={() => setViewMode('landing')}
        />
      </div>
    );
  }

  // 2. APP VIEW MODE (Full-featured Console & Resilience Engine)
  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors ${
      isDark ? 'dark bg-[var(--background)] text-[var(--foreground)]' : 'bg-[var(--background)] text-[var(--foreground)]'
    }`}>
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        onOpenEmployeeSimulator={() => handleOpenSimulator()}
        onGoToLanding={() => setViewMode('landing')}
        settings={settings}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'campaigns') {
              setSelectedCampaignId(null);
            }
          }}
          onGoToLanding={() => setViewMode('landing')}
          activeCampaignCount={activeCampaignCount}
          language={language}
          theme={theme}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'overview' && (
            <OverviewTab
              campaigns={campaigns}
              retestRecord={retestRecord}
              onSelectCampaign={(id) => {
                setSelectedCampaignId(id);
                setActiveTab('campaigns');
              }}
              onNavigate={(tab) => {
                setActiveTab(tab);
                if (tab === 'campaigns') setSelectedCampaignId(null);
              }}
              onOpenCreateCampaign={() => handleOpenCreateCampaignModal()}
              onOpenEmployeeSimulator={() => handleOpenSimulator()}
            />
          )}

          {activeTab === 'campaigns' && (
            <>
              {currentDetailCampaign ? (
                <CampaignDetail
                  campaign={currentDetailCampaign}
                  onBack={() => setSelectedCampaignId(null)}
                  onUpdateCampaignAnalysis={handleUpdateCampaignAnalysis}
                  onLaunchReTest={handleLaunchReTest}
                  onGenerateTraining={handleGenerateTrainingForCampaign}
                  onSimulate={(camp) => handleOpenSimulator(camp)}
                />
              ) : (
                <CampaignList
                  campaigns={campaigns}
                  onSelectCampaign={(id) => setSelectedCampaignId(id)}
                  onOpenCreateModal={() => handleOpenCreateCampaignModal()}
                  onSimulateCampaign={(camp) => handleOpenSimulator(camp)}
                />
              )}
            </>
          )}

          {activeTab === 'scenarios' && (
            <ScenarioCatalog
              scenarios={scenarios}
              onOpenCreateCampaignWithScenario={(scenId) => handleOpenCreateCampaignModal(scenId)}
              onOpenAiGenerator={() => setIsGenerateScenarioOpen(true)}
              onSimulateScenario={(scen) => handleOpenSimulator(undefined, scen)}
            />
          )}

          {activeTab === 'ai-coach' && (
            <AiCoachView
              campaigns={campaigns}
              onOpenScenarioGenerator={() => setIsGenerateScenarioOpen(true)}
              onNavigateToTraining={() => setActiveTab('training')}
              onNavigateToCampaign={(id) => {
                setSelectedCampaignId(id);
                setActiveTab('campaigns');
              }}
              onUpdateCampaignAnalysis={handleUpdateCampaignAnalysis}
            />
          )}

          {activeTab === 'training' && (
            <TrainingView
              trainings={trainings}
              onOpenPlayer={(mod) => setActiveInteractiveTraining(mod)}
              onNavigateToReTest={() => setActiveTab('retest')}
            />
          )}

          {activeTab === 'flash-news' && (
            <FlashNewsView
              articles={flashArticles}
              onBroadcastArticle={handleBroadcastFlashArticle}
              onCreateArticle={handleCreateFlashArticle}
              isDark={isDark}
            />
          )}

          {activeTab === 'retest' && (
            <ReTestView
              retestRecord={retestRecord}
              campaigns={campaigns}
              onLaunchNewReTest={handleLaunchReTest}
              onNavigateToCampaign={(id) => {
                setSelectedCampaignId(id);
                setActiveTab('campaigns');
              }}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={(newSettings) => setSettings(newSettings)}
            />
          )}
        </main>
      </div>

      {/* MODALS */}
      {/* 1. Create Campaign / Re-test Modal */}
      <CreateCampaignModal
        isOpen={isCreateCampaignOpen}
        onClose={() => setIsCreateCampaignOpen(false)}
        scenarios={scenarios}
        onCreate={handleCreateCampaign}
        preselectedScenarioId={createCampaignScenarioId}
        isReTestMode={isReTestCreateMode}
        baselineCampaign={reTestBaselineCampaign}
      />

      {/* 2. Generate Scenario Modal with Vigilo Coach */}
      <GenerateScenarioModal
        isOpen={isGenerateScenarioOpen}
        onClose={() => setIsGenerateScenarioOpen(false)}
        onScenarioGenerated={(newScen) => {
          setScenarios((prev) => [newScen, ...prev]);
        }}
      />

      {/* 3. Interactive Employee Inbox & WhatsApp Simulator */}
      <EmployeeSimulatorModal
        isOpen={isEmployeeSimulatorOpen}
        onClose={() => setIsEmployeeSimulatorOpen(false)}
        campaign={simulatedCampaign}
        scenario={simulatedScenario}
        onEmployeeClickedTrap={handleEmployeeClickedTrap}
        onEmployeeReportedPhish={handleEmployeeReportedPhish}
        onStartTrainingFromTrap={handleStartTrainingFromTrap}
        initialViewState={simulatorInitialViewState}
        isDark={isDark}
      />

      {/* 4. Interactive Micro-training Player Modal */}
      {activeInteractiveTraining && (
        <InteractiveTrainingPlayer
          module={activeInteractiveTraining}
          onClose={() => setActiveInteractiveTraining(null)}
          onComplete={handleTrainingCompleted}
          onNavigateToReTest={() => {
            setActiveInteractiveTraining(null);
            setActiveTab('retest');
          }}
        />
      )}
    </div>
  );
}
