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
import { EditTrainingModal } from './components/training/EditTrainingModal';
import { AssignTrainingModal } from './components/training/AssignTrainingModal';
import {
  vigiloTrainingService,
  vigiloAuthService,
  vigiloOrgService,
  vigiloCampaignService,
  vigiloAiService,
} from './services/api';
import { ReTestView } from './components/retest/ReTestView';
import { SettingsView } from './components/settings/SettingsView';
import { FlashNewsView } from './components/flash-news/FlashNewsView';
import { EmployeeSimulatorModal } from './components/employee-simulator/EmployeeSimulatorModal';
import { LandingPage } from './components/landing/LandingPage';
import { AdminLogin } from './components/auth/AdminLogin';
import { DirectoryView } from './components/directory/DirectoryView';
import {
  INITIAL_SCENARIOS,
  INITIAL_TRAININGS,
  INITIAL_SETTINGS,
  INITIAL_FLASH_ARTICLES,
} from './data/mockData';
import {
  Campaign,
  Scenario,
  TrainingModule,
  SimulationProviderSettings,
  AIAnalysis,
  AppViewMode,
  FlashArticle,
  Employee,
  AdminPublic,
  CompanyDepartment,
} from './types';
import { Language } from './i18n/translations';

type PublicTrainingState =
  | { status: 'loading' }
  | { status: 'ready'; token: string; module: TrainingModule; completed: boolean }
  | { status: 'error'; message: string };

export default function App() {
  const hasTrainingInvitation =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('trainingInvite');
  const [viewMode, setViewMode] = useState<AppViewMode>(
    hasTrainingInvitation ? 'training-invite' : 'landing'
  );
  const [publicTraining, setPublicTraining] = useState<PublicTrainingState | null>(
    hasTrainingInvitation ? { status: 'loading' } : null
  );
  const [admin, setAdmin] = useState<AdminPublic | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [orgDepartments, setOrgDepartments] = useState<CompanyDepartment[]>([]);
  const [companyProfileLoaded, setCompanyProfileLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  // Internationalization & Theme state
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('vigilo_lang') as Language) || 'fr';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const stored = localStorage.getItem('kori.theme') ?? localStorage.getItem('vigilo_theme');
    return stored === 'light' ? 'light' : 'dark';
  });

  const handleToggleLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('vigilo_lang', lang);
  };

  const handleToggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('kori.theme', next);
  };

  // Sync data-theme (KORI) + classe .dark (compatibilité des variantes `dark:`) sur <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    const hasInvitation = new URLSearchParams(window.location.search).has('trainingInvite');
    (async () => {
      try {
        const me = await vigiloAuthService.me();
        if (!cancelled) {
          setAdmin(me);
          if (me && !hasInvitation) setViewMode('app');
        }
      } catch {
        // réseau / JSON : rester déconnecté
      } finally {
        if (!cancelled) setAuthChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('trainingInvite');
    if (!token) return;

    let cancelled = false;
    setViewMode('training-invite');
    setPublicTraining({ status: 'loading' });
    window.history.replaceState({}, document.title, window.location.pathname);
    void vigiloTrainingService.getTrainingInvitation(token).then(
      ({ module, completed }) => {
        if (!cancelled) setPublicTraining({ status: 'ready', token, module, completed });
      },
      (error: unknown) => {
        if (!cancelled) {
          setPublicTraining({
            status: 'error',
            message: error instanceof Error ? error.message : 'Impossible de charger cette formation.',
          });
        }
      }
    );
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (viewMode === 'app' && !admin && !authChecking) {
      setViewMode('login');
    }
  }, [viewMode, admin, authChecking]);

  const fetchOrgDirectory = async () => {
    try {
      const [depts, orgEmps] = await Promise.all([
        vigiloOrgService.listDepartments(),
        vigiloOrgService.listEmployees(),
      ]);
      setOrgDepartments(depts);
      setEmployees((prev) => {
        const prevById = new Map(prev.map((e) => [e.id, e]));
        return orgEmps.map((emp) => {
          const dept = depts.find((d) => d.id === emp.departmentId);
          const p = prevById.get(emp.id);
          return {
            id: emp.id,
            firstName: emp.firstName,
            lastName: emp.lastName,
            email: emp.email,
            department: dept?.name || '—',
            departmentId: emp.departmentId,
            role: emp.role,
            riskScore: emp.riskScore,
            trainingAssignments: p?.trainingAssignments,
          };
        });
      });
    } catch {
      // Directory shows error when opened
    }
  };

  // Prefetch org employees after login (Directory refreshes again on enter)
  useEffect(() => {
    if (!admin) return;
    let cancelled = false;
    void fetchOrgDirectory();
    void vigiloOrgService.getProfile().then(
      (profile) => {
        if (!cancelled) setSettings((current) => ({ ...current, ...profile }));
      },
      (error: unknown) => {
        console.error('Impossible de charger le profil entreprise:', error);
      }
    ).finally(() => {
      if (!cancelled) setCompanyProfileLoaded(true);
    });
    return () => { cancelled = true; };
  }, [admin?.id]);

  const handleLogout = async () => {
    try {
      await vigiloAuthService.logout();
    } catch {
      // ignore network errors on logout
    }
    setAdmin(null);
    setEmployees([]);
    setOrgDepartments([]);
    setCampaigns([]);
    setTrainingToEdit(null);
    setTrainingToAssign(null);
    setCampaignTrainingTargetIds([]);
    setPendingCampaignTrainingTargetIds(null);
    setScenarios(INITIAL_SCENARIOS);
    setTrainings(INITIAL_TRAININGS.map((training) => ({
      ...training,
      completedCount: 0,
      totalAssigned: 0,
    })));
    setFlashArticles(INITIAL_FLASH_ARTICLES.map((article) => ({
      ...article,
      readCount: 0,
      totalRecipients: 0,
      readRate: 0,
    })));
    setSettings(INITIAL_SETTINGS);
    setCompanyProfileLoaded(false);
    setViewMode('landing');
  };

  // Core Data
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignLoadError, setCampaignLoadError] = useState('');
  const [scenarios, setScenarios] = useState<Scenario[]>(INITIAL_SCENARIOS);
  const [trainings, setTrainings] = useState<TrainingModule[]>(
    INITIAL_TRAININGS.map((training) => ({ ...training, completedCount: 0, totalAssigned: 0 }))
  );
  const [settings, setSettings] = useState<SimulationProviderSettings>(INITIAL_SETTINGS);
  const [flashArticles, setFlashArticles] = useState<FlashArticle[]>(
    INITIAL_FLASH_ARTICLES.map((article) => ({
      ...article,
      readCount: 0,
      totalRecipients: 0,
      readRate: 0,
    }))
  );

  useEffect(() => {
    if (!admin) {
      setCampaigns([]);
      setCampaignLoadError('');
      return;
    }
    let cancelled = false;
    setCampaignLoadError('');
    void vigiloCampaignService.listCampaigns().then(
      (loadedCampaigns) => {
        if (!cancelled) setCampaigns(loadedCampaigns);
      },
      (error: unknown) => {
        if (!cancelled) {
          console.error('Impossible de charger les campagnes:', error);
          setCampaigns([]);
          setCampaignLoadError('Impossible de charger les campagnes depuis le serveur. Réessayez après avoir vérifié la connexion.');
        }
      }
    );
    return () => { cancelled = true; };
  }, [admin?.id]);

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', settings.brandColor);
  }, [settings.brandColor]);

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
  const [trainingToEdit, setTrainingToEdit] = useState<TrainingModule | null>(null);
  const [trainingToAssign, setTrainingToAssign] = useState<TrainingModule | null>(null);
  const [campaignTrainingTargetIds, setCampaignTrainingTargetIds] = useState<string[]>([]);
  const [pendingCampaignTrainingTargetIds, setPendingCampaignTrainingTargetIds] = useState<string[] | null>(null);
  const [trainingGenerationError, setTrainingGenerationError] = useState('');
  const [trainingGenerationWarning, setTrainingGenerationWarning] = useState('');
  const [isGeneratingTraining, setIsGeneratingTraining] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Magic Link Trap Check
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const trainingId = params.get('trainingId');
    if (trainingId) {
      const mod = INITIAL_TRAININGS.find((t) => t.id === trainingId);
      if (mod) {
        setViewMode('app');
        setActiveTab('training');
        setActiveInteractiveTraining(mod);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    if (params.get('trap') === 'true') {
      const scenId = params.get('scenarioId');
      const campId = params.get('campaignId');
      const scen = INITIAL_SCENARIOS.find(s => s.id === scenId || s.category === scenId) || INITIAL_SCENARIOS[0];
      setSimulatedScenario(scen);
      setSimulatorInitialViewState('landing_page_clicked');
      setIsEmployeeSimulatorOpen(true);
      if (campId) {
        void vigiloCampaignService.simulateCampaignEvent(campId, 'click').then((updated) => {
          setCampaigns((prev) => prev.map((c) => (c.id === campId ? updated : c)));
        }).catch(() => {});
      }
      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Selected campaign for detail view
  const currentDetailCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  // Handlers for Campaign Management
  const handleCreateCampaign = async (newCampaignData: Pick<
    Campaign,
    'name' | 'description' | 'scenarioId' | 'scenarioName' | 'category' |
    'difficulty' | 'targetEmployeeIds' | 'isReTest' | 'baselineCampaignId'
  > & {
    launchImmediately?: boolean;
    sendRealEmails?: boolean;
    scenarioBody?: string;
  }) => {
    const created = await vigiloCampaignService.createCampaign(newCampaignData);
    setCampaignLoadError('');
    setCampaigns((prev) => [created, ...prev.filter((campaign) => campaign.id !== created.id)]);
    setSelectedCampaignId(created.id);
    setActiveTab('campaigns');
    setViewMode('app');
    return created;
  };

  const handleLaunchCampaign = async (
    campaign: Campaign,
    options?: { sendRealEmails?: boolean; scenarioBody?: string }
  ) => {
    const res = await vigiloCampaignService.launchCampaign(campaign.id, options);
    setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? res.campaign : c)));
  };

  const handleSimulateCampaignEvent = async (
    campaignId: string,
    eventType: 'open' | 'click' | 'report' | 'auto_cohort'
  ) => {
    const updated = await vigiloCampaignService.simulateCampaignEvent(campaignId, eventType);
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updated : c)));
  };

  const handleCompleteCampaign = async (campaignId: string) => {
    const updated = await vigiloCampaignService.completeCampaign(campaignId);
    setCampaigns((prev) => prev.map((c) => (c.id === campaignId ? updated : c)));
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

  const handleGenerateTrainingForCampaign = async (campaign: Campaign) => {
    setIsGeneratingTraining(true);
    setTrainingGenerationError('');
    setTrainingGenerationWarning('');
    try {
      const generated = await vigiloAiService.generateTraining(campaign.category, campaign.description);
      const { _engine, _warning, ...trainingContent } = generated;
      const base = INITIAL_TRAININGS.find((training) => training.category === campaign.category) || INITIAL_TRAININGS[0];
      const module: TrainingModule = {
        ...base,
        ...trainingContent,
        id: `generated-${Date.now()}`,
        title: typeof trainingContent.title === 'string' ? trainingContent.title : base.title,
        category: campaign.category,
        difficulty: campaign.difficulty,
        targetAudience: campaign.targetGroup,
        durationMinutes: Number(trainingContent.durationMinutes) || base.durationMinutes,
        completedCount: 0,
        totalAssigned: 0,
        campaignId: campaign.id,
        situation: trainingContent.situation || base.situation,
        warningSigns: trainingContent.warningSigns || base.warningSigns,
        correctReaction: trainingContent.correctReaction || base.correctReaction,
        miniQuiz: trainingContent.miniQuiz || base.miniQuiz,
      };
      setTrainings((previous) => [module, ...previous]);
      setTrainingToEdit(module);
      setTrainingGenerationWarning(
        `${_warning ? `${_warning} ` : ''}Source : ${_engine}. Relisez le module avant toute attribution.`
      );
    } catch (error) {
      setPendingCampaignTrainingTargetIds(null);
      setTrainingGenerationError(
        error instanceof Error ? error.message : 'La génération de formation IA a échoué.'
      );
    } finally {
      setIsGeneratingTraining(false);
    }
  };

  const handlePrepareCampaignTrainingInvite = async (campaign: Campaign) => {
    const targetIds = campaign.targetEmployeeIds || [];
    if (targetIds.length === 0) {
      setPendingCampaignTrainingTargetIds(null);
      setTrainingGenerationError('Cette campagne ne contient aucun collaborateur sélectionné dans l’annuaire.');
      return;
    }
    setPendingCampaignTrainingTargetIds(targetIds);
    await handleGenerateTrainingForCampaign(campaign);
  };

  const handleSaveTraining = (updated: TrainingModule) => {
    handleUpdateTraining(updated);
    if (pendingCampaignTrainingTargetIds) {
      setCampaignTrainingTargetIds(pendingCampaignTrainingTargetIds);
      setPendingCampaignTrainingTargetIds(null);
      setTrainingToAssign(updated);
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
    setEmployees((prev) =>
      prev.map((emp) => {
        const assignments = emp.trainingAssignments;
        if (!assignments?.some((a) => a.moduleId === moduleId && a.status === 'envoyé')) {
          return emp;
        }
        return {
          ...emp,
          trainingAssignments: assignments.map((a) =>
            a.moduleId === moduleId && a.status === 'envoyé' ? { ...a, status: 'complété' as const } : a
          ),
        };
      })
    );
  };

  const handleUpdateTraining = (updated: TrainingModule) => {
    setTrainings((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAssignTraining = async (
    moduleId: string,
    employeeIds: string[],
    channel: 'Email' | 'WhatsApp'
  ): Promise<{ success: boolean; sentCount: number; error?: string }> => {
    const mod = trainings.find((t) => t.id === moduleId);
    if (!mod || employeeIds.length === 0) {
      return { success: false, sentCount: 0 };
    }

    const targets = employees.filter((e) => employeeIds.includes(e.id));
    if (channel !== 'Email') {
      return {
        success: false,
        sentCount: 0,
        error: 'Le canal WhatsApp n’est pas connecté. Aucune invitation n’a été envoyée.',
      };
    }
    const origin = window.location.origin;
    const assignedAt = new Date().toISOString();
    const sentEmployees: Employee[] = [];
    let sendError = '';

    for (const emp of targets) {
      try {
        const sent = await vigiloTrainingService.sendTrainingInvite({
          email: emp.email,
          firstName: emp.firstName,
          module: mod,
          origin,
        });
        if (!sent) throw new Error('Le serveur n’a pas confirmé l’envoi.');
        sentEmployees.push(emp);
      } catch (error) {
        sendError = error instanceof Error ? error.message : 'Échec de l’envoi email.';
        break;
      }
    }

    if (sentEmployees.length > 0) {
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === moduleId ? { ...t, totalAssigned: t.totalAssigned + sentEmployees.length } : t
        )
      );

      const sentIds = new Set(sentEmployees.map((employee) => employee.id));
      setEmployees((prev) =>
        prev.map((emp) => {
          if (!sentIds.has(emp.id)) return emp;
          const entry = {
            moduleId: mod.id,
            moduleTitle: mod.title,
            assignedAt,
            channel,
            status: 'envoyé' as const,
          };
          return {
            ...emp,
            trainingAssignments: [...(emp.trainingAssignments || []), entry],
          };
        })
      );
    }

    if (sendError) {
      return {
        success: false,
        sentCount: sentEmployees.length,
        error: sentEmployees.length
          ? `${sentEmployees.length} invitation(s) envoyée(s), puis arrêt après un échec : ${sendError}`
          : sendError,
      };
    }
    return { success: sentEmployees.length > 0, sentCount: sentEmployees.length };
  };

  // Flash News Handlers
  const handleCreateFlashArticle = (
    newArt: Omit<FlashArticle, 'id' | 'publishedAt' | 'readCount' | 'readRate' | 'totalRecipients'>
  ) => {
    const created: FlashArticle = {
      ...newArt,
      id: `flash-${Date.now()}`,
      publishedAt: new Date().toISOString().split('T')[0],
      readCount: 0,
      readRate: 0,
      totalRecipients: 0,
    };
    setFlashArticles((prev) => [created, ...prev]);
  };

  const activeCampaignCount = campaigns.filter((c) => c.status === 'en_cours').length;
  const isDark = theme === 'dark';

  if (authChecking && viewMode !== 'training-invite') {
    return (
      <div className={isDark ? 'dark' : ''} data-vigilo-theme={theme}>
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--muted-foreground)] text-sm">
          Vérification de session…
        </div>
      </div>
    );
  }

  if (viewMode === 'training-invite') {
    const leaveTraining = () => {
      setPublicTraining(null);
      setViewMode('landing');
    };

    return (
      <div className={isDark ? 'dark' : ''} data-vigilo-theme={theme}>
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] p-4">
          {publicTraining?.status === 'loading' && (
            <p className="text-sm text-[var(--muted-foreground)]">Chargement de la micro-formation…</p>
          )}
          {publicTraining?.status === 'error' && (
            <div className="max-w-md space-y-4 text-center">
              <p role="alert" className="text-sm text-red-600 dark:text-red-400">{publicTraining.message}</p>
              <button type="button" onClick={leaveTraining} className="vigilo-btn-secondary px-4 py-2 rounded-lg text-sm">
                Retour à VIGILO
              </button>
            </div>
          )}
          {publicTraining?.status === 'ready' && publicTraining.completed && (
            <div className="max-w-md space-y-4 text-center">
              <h1 className="text-lg font-bold">Formation déjà complétée</h1>
              <p className="text-sm text-[var(--muted-foreground)]">{publicTraining.module.title}</p>
              <button type="button" onClick={leaveTraining} className="vigilo-btn-secondary px-4 py-2 rounded-lg text-sm">
                Retour à VIGILO
              </button>
            </div>
          )}
          {publicTraining?.status === 'ready' && !publicTraining.completed && (
            <InteractiveTrainingPlayer
              module={publicTraining.module}
              onClose={leaveTraining}
              onComplete={() => vigiloTrainingService.completeTrainingInvitation(publicTraining.token)}
              onNavigateToReTest={() => {
                setPublicTraining(null);
                setViewMode('login');
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // 1. IF VIEW MODE IS LANDING: Display clean, non-AI-slop landing page with working i18n & theme
  if (viewMode === 'landing') {
    return (
      <div className={isDark ? 'dark' : ''} data-vigilo-theme={theme}>
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
          onEmployeeClickedTrap={() => undefined}
          onEmployeeReportedPhish={() => undefined}
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
      <div className={isDark ? 'dark' : ''} data-vigilo-theme={theme}>
        <AdminLogin
          onLogin={(a) => {
            setCampaigns([]);
            setCampaignLoadError('');
            setScenarios(INITIAL_SCENARIOS);
            setTrainings(INITIAL_TRAININGS.map((training) => ({
              ...training,
              completedCount: 0,
              totalAssigned: 0,
            })));
            setFlashArticles(INITIAL_FLASH_ARTICLES.map((article) => ({
              ...article,
              readCount: 0,
              totalRecipients: 0,
              readRate: 0,
            })));
            setAdmin(a);
            setSettings((prev) => ({
              ...prev,
              companyName: a.companyName,
              companySize: a.companySize,
              services: a.services,
            }));
            setViewMode('app');
          }}
          onBack={() => setViewMode('landing')}
        />
      </div>
    );
  }

  // 2. APP VIEW MODE (Full-featured Console & Resilience Engine)
  return (
    <div
      data-vigilo-theme={theme}
      className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors ${
        isDark ? 'dark bg-[var(--background)] text-[var(--foreground)]' : 'bg-[var(--background)] text-[var(--foreground)]'
      }`}
    >
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        onOpenEmployeeSimulator={() => handleOpenSimulator()}
        onGoToLanding={handleLogout}
        settings={settings}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenMobileNav={() => setMobileNavOpen(true)}
      />

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'campaigns') {
              setSelectedCampaignId(null);
            }
          }}
          onGoToLanding={handleLogout}
          activeCampaignCount={activeCampaignCount}
          trainingCount={trainings.length}
          language={language}
          theme={theme}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-8 min-w-0 w-full">
          {campaignLoadError && (
            <p role="alert" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {campaignLoadError}
            </p>
          )}
          {activeTab === 'overview' && (
            <OverviewTab
              campaigns={campaigns}
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
                  onPrepareTrainingInvite={handlePrepareCampaignTrainingInvite}
                  isGeneratingTraining={isGeneratingTraining}
                  trainingGenerationError={trainingGenerationError}
                  onSimulate={(camp) => handleOpenSimulator(camp)}
                  onLaunchCampaign={handleLaunchCampaign}
                  onSimulateEvent={handleSimulateCampaignEvent}
                  onCompleteCampaign={handleCompleteCampaign}
                />
              ) : (
                <CampaignList
                  campaigns={campaigns}
                  onSelectCampaign={(id) => setSelectedCampaignId(id)}
                  onOpenCreateModal={() => handleOpenCreateCampaignModal()}
                  onSimulateCampaign={(camp) => handleOpenSimulator(camp)}
                  onLaunchCampaign={handleLaunchCampaign}
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

          {activeTab === 'directory' && (
            <DirectoryView
              employees={employees}
              onEmployeesChange={setEmployees}
            />
          )}

          {activeTab === 'training' && (
            <TrainingView
              trainings={trainings}
              onOpenPlayer={(mod) => setActiveInteractiveTraining(mod)}
              onEditModule={(mod) => setTrainingToEdit(mod)}
              onAssignModule={(mod) => setTrainingToAssign(mod)}
            />
          )}

          {activeTab === 'flash-news' && (
            <FlashNewsView
              articles={flashArticles}
              onCreateArticle={handleCreateFlashArticle}
              isDark={isDark}
            />
          )}

          {activeTab === 'retest' && (
            <ReTestView
              retestRecord={null}
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
              isProfileLoading={!companyProfileLoaded}
              onUpdateSettings={async (newSettings) => {
                const profile = await vigiloOrgService.updateProfile(newSettings);
                setSettings((current) => ({ ...current, ...newSettings, ...profile }));
              }}
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
        employees={employees}
        departments={orgDepartments}
        onCreate={handleCreateCampaign}
        preselectedScenarioId={createCampaignScenarioId}
        isReTestMode={isReTestCreateMode}
        baselineCampaign={reTestBaselineCampaign}
        onSeedDemoDirectory={async () => {
          await vigiloOrgService.seedDemoDirectory();
          await fetchOrgDirectory();
        }}
      />

      {/* 2. Generate Scenario Modal with Vigilo Coach */}
      <GenerateScenarioModal
        isOpen={isGenerateScenarioOpen}
        onClose={() => setIsGenerateScenarioOpen(false)}
        companyProfile={settings}
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
        onEmployeeClickedTrap={() => undefined}
        onEmployeeReportedPhish={() => undefined}
        onStartTrainingFromTrap={handleStartTrainingFromTrap}
        initialViewState={simulatorInitialViewState}
        isDark={isDark}
      />

      <EditTrainingModal
        isOpen={Boolean(trainingToEdit)}
        module={trainingToEdit}
        generationWarning={trainingGenerationWarning}
        onClose={() => {
          setTrainingToEdit(null);
          setTrainingGenerationWarning('');
          setPendingCampaignTrainingTargetIds(null);
        }}
        onSave={handleSaveTraining}
      />

      <AssignTrainingModal
        isOpen={Boolean(trainingToAssign)}
        module={trainingToAssign}
        employees={employees}
        initialEmployeeIds={campaignTrainingTargetIds}
        onClose={() => {
          setTrainingToAssign(null);
          setCampaignTrainingTargetIds([]);
        }}
        onAssign={handleAssignTraining}
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