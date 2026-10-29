import { Campaign, Scenario, ScenarioCategory, DifficultyLevel, AIAnalysis, TrainingModule } from '../types';
import type {
  AdminPublic,
  CompanySize,
  VigiloService,
  CompanyDepartment,
  OrgEmployee,
  OrgSummary,
  SimulationProviderSettings,
  GophishCampaignSummary,
} from '../types';

async function apiFetch(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  return response;
}

export const vigiloAuthService = {
  async register(payload: {
    email: string;
    password: string;
    companyName: string;
    companySize: CompanySize;
    services: VigiloService[];
  }): Promise<AdminPublic> {
    const res = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Inscription échouée');
    if (!data.data) throw new Error('Réponse inscription invalide');
    return data.data;
  },

  async login(email: string, password: string): Promise<AdminPublic> {
    const res = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Connexion échouée');
    if (!data.data) throw new Error('Réponse connexion invalide');
    return data.data;
  },

  async logout(): Promise<void> {
    await apiFetch('/api/auth/logout', { method: 'POST' });
  },

  async me(): Promise<AdminPublic | null> {
    const res = await apiFetch('/api/auth/me');
    if (res.status === 401) return null;
    const data = await res.json();
    if (!res.ok) return null;
    return data.data;
  },
};

export interface GenerateScenarioParams {
  scenarioType: ScenarioCategory;
  targetAudience: string;
  difficulty: DifficultyLevel;
  companyContext: string;
  trainingTone: 'professionnel' | 'accessible' | 'direct';
}

export const vigiloAiService = {
  async generateScenario(params: GenerateScenarioParams) {
    const response = await apiFetch('/api/vigilo-ai/generate-scenario', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || `Erreur génération IA (HTTP ${response.status})`);
    }
    return {
      ...data.data,
      _engine: data.engine || 'vigilo-builtin',
      _warning: data.warning || '',
    } as Record<string, unknown>;
  },

  async analyzeCampaign(campaign: Campaign): Promise<AIAnalysis> {
    const response = await apiFetch('/api/vigilo-ai/analyze-results', {
      method: 'POST',
      body: JSON.stringify({
        campaignId: campaign.id,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || `Erreur d'analyse IA (HTTP ${response.status})`);
    }
    return {
      ...data.data,
      engine: typeof data.engine === 'string' ? data.engine : 'vigilo-builtin',
      warning: typeof data.warning === 'string' ? data.warning : undefined,
    } as AIAnalysis;
  },

  async generateTraining(
    scenarioType: ScenarioCategory,
    vulnerabilityFocus: string
  ): Promise<Partial<TrainingModule> & { _engine: string; _warning?: string }> {
    const response = await apiFetch('/api/vigilo-ai/generate-training', {
      method: 'POST',
      body: JSON.stringify({ scenarioType, vulnerabilityFocus }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || `Erreur de génération IA (HTTP ${response.status})`);
    }
    return {
      ...data.data,
      _engine: typeof data.engine === 'string' ? data.engine : 'vigilo-builtin',
      _warning: typeof data.warning === 'string' ? data.warning : undefined,
    } as Partial<TrainingModule> & { _engine: string; _warning?: string };
  },
};

export const vigiloCampaignService = {
  async listCampaigns(): Promise<Campaign[]> {
    const response = await apiFetch('/api/campaigns');
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !Array.isArray(data.data)) {
      throw new Error(data.error || 'Impossible de charger les campagnes');
    }
    return data.data as Campaign[];
  },

  async createCampaign(campaign: Pick<
    Campaign,
    'name' | 'description' | 'scenarioId' | 'scenarioName' | 'category' |
    'difficulty' | 'targetEmployeeIds' | 'isReTest' | 'baselineCampaignId'
  > & {
    launchImmediately?: boolean;
    sendRealEmails?: boolean;
    scenarioBody?: string;
  }): Promise<Campaign> {
    const response = await apiFetch('/api/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaign),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Impossible de créer la campagne');
    }
    return data.data as Campaign;
  },

  async createDraft(campaign: Pick<
    Campaign,
    'name' | 'description' | 'scenarioId' | 'scenarioName' | 'category' |
    'difficulty' | 'targetEmployeeIds' | 'isReTest' | 'baselineCampaignId'
  >): Promise<Campaign> {
    return this.createCampaign({ ...campaign, launchImmediately: false });
  },

  async launchCampaign(
    campaignId: string,
    options?: { sendRealEmails?: boolean; scenarioBody?: string }
  ): Promise<{ campaign: Campaign; message: string; emailsSent: number }> {
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/launch`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Impossible de lancer la campagne');
    }
    return {
      campaign: data.data as Campaign,
      message: data.message || 'Campagne lancée avec succès',
      emailsSent: Number(data.emailsSent) || 0,
    };
  },

  async simulateCampaignEvent(
    campaignId: string,
    eventType: 'open' | 'click' | 'report' | 'auto_cohort'
  ): Promise<Campaign> {
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/simulate-event`, {
      method: 'POST',
      body: JSON.stringify({ eventType }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Échec de la simulation d’événement');
    }
    return data.data as Campaign;
  },

  async completeCampaign(campaignId: string): Promise<Campaign> {
    const response = await apiFetch(`/api/campaigns/${encodeURIComponent(campaignId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Impossible de clôturer la campagne');
    }
    return data.data as Campaign;
  },

  async sendLiveTest(
    email: string,
    scenario: Scenario,
    origin?: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiFetch('/api/send-live-test', {
      method: 'POST',
      body: JSON.stringify({
        email,
        scenario,
        origin: origin || window.location.origin,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Impossible d’envoyer le test live');
    }
    return {
      success: true,
      message: data.message || 'Email de test envoyé avec succès',
    };
  },
};

export const vigiloOrgService = {
  async getSummary(): Promise<OrgSummary> {
    const res = await apiFetch('/api/org/summary');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Impossible de charger le résumé org');
    return data.data;
  },

  async seedDemoDirectory(): Promise<{ departmentsCount: number; employeesCount: number }> {
    const res = await apiFetch('/api/org/seed-demo', { method: 'POST', body: JSON.stringify({}) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Impossible d’initialiser l’annuaire de démonstration');
    return data.data;
  },

  async listDepartments(): Promise<CompanyDepartment[]> {
    const res = await apiFetch('/api/org/departments');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Impossible de charger les services');
    return data.data;
  },

  async getProfile(): Promise<Pick<
    SimulationProviderSettings,
    'provider' | 'companyName' | 'companyDomain' | 'industry' | 'country' | 'preferredLanguage' | 'trainingTone' | 'brandColor'
  >> {
    const res = await apiFetch('/api/org/profile');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Impossible de charger le profil entreprise');
    return data.data;
  },

  async updateProfile(profile: Pick<
    SimulationProviderSettings,
    'provider' | 'companyName' | 'companyDomain' | 'industry' | 'country' | 'preferredLanguage' | 'trainingTone' | 'brandColor'
  >) {
    const res = await apiFetch('/api/org/profile', {
      method: 'PATCH',
      body: JSON.stringify(profile),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Enregistrement du profil entreprise impossible');
    return data.data as typeof profile;
  },

  async createDepartment(name: string): Promise<CompanyDepartment> {
    const res = await apiFetch('/api/org/departments', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Création du service échouée');
    return data.data;
  },

  async deleteDepartment(id: string): Promise<void> {
    const res = await apiFetch(`/api/org/departments/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Suppression du service échouée');
  },

  async listEmployees(departmentId?: string): Promise<OrgEmployee[]> {
    const q = departmentId ? `?departmentId=${encodeURIComponent(departmentId)}` : '';
    const res = await apiFetch(`/api/org/employees${q}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Impossible de charger les collaborateurs');
    return data.data;
  },

  async createEmployee(payload: {
    firstName: string;
    lastName: string;
    email: string;
    departmentId: string;
    role?: string;
  }): Promise<OrgEmployee> {
    const res = await apiFetch('/api/org/employees', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Ajout collaborateur échoué');
    return data.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    const res = await apiFetch(`/api/org/employees/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Suppression collaborateur échouée');
  },
};

// Backwards compatibility alias
export const rodiumAiService = vigiloAiService;

export const vigiloGophishService = {
  async getCampaigns(): Promise<{ configured: boolean; campaigns: GophishCampaignSummary[] }> {
    const response = await apiFetch('/api/integrations/gophish/campaigns');
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Impossible de contacter Gophish');
    }
    return data.data;
  },
};

export const vigiloTrainingService = {
  async getTrainingInvitation(token: string): Promise<{ module: TrainingModule; completed: boolean }> {
    const response = await apiFetch(`/api/public/training-invitations/${encodeURIComponent(token)}`);
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success || !data.data) {
      throw new Error(data.error || 'Lien de formation invalide ou expiré');
    }
    return { module: data.data as TrainingModule, completed: Boolean(data.completed) };
  },

  async completeTrainingInvitation(token: string): Promise<void> {
    const response = await apiFetch(
      `/api/public/training-invitations/${encodeURIComponent(token)}/complete`,
      { method: 'POST' }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Impossible d’enregistrer la fin de formation');
    }
  },

  async sendTrainingInvite(params: {
    email: string;
    firstName: string;
    module: TrainingModule;
    origin: string;
  }): Promise<boolean> {
    const response = await apiFetch('/api/send-training-invite', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Échec de l’envoi de l’invitation');
    }
    return true;
  },
};
