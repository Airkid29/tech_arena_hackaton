export type ScenarioCategory =
  | 'Phishing'
  | 'Fake Invoice'
  | 'WhatsApp Phishing'
  | 'Smishing'
  | 'MFA Fatigue'
  | 'Social Engineering'
  | 'Ransomware'
  | 'QR Code (Quishing)';
export type DifficultyLevel = 'Facile' | 'Moyen' | 'Difficile';
export type CampaignStatus = 'brouillon' | 'planifiée' | 'en_cours' | 'terminée';
export type AppViewMode = 'landing' | 'app' | 'login';

export type TrainingAssignmentStatus = 'envoyé' | 'complété';

export interface EmployeeTrainingAssignment {
  moduleId: string;
  moduleTitle: string;
  assignedAt: string;
  channel: 'Email' | 'WhatsApp';
  status: TrainingAssignmentStatus;
}

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  role: string;
  riskScore: number;
  trainingAssignments?: EmployeeTrainingAssignment[];
}

export interface FlashArticle {
  id: string;
  title: string;
  category: 'Alerte Urgente' | 'Bonne Pratique' | 'Menace Émergente' | 'Conseil Outils';
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  readCount: number;
  totalRecipients: number;
  readRate: number;
  keyTakeaway: string;
  channels: ('Email' | 'WhatsApp')[];
}

export interface WhatsAppMessage {
  id: string;
  sender: 'attacker' | 'system' | 'collaborator';
  text: string;
  timestamp: string;
  hasLink?: boolean;
  linkUrl?: string;
  linkText?: string;
  hasAttachment?: boolean;
  attachmentName?: string;
  attachmentType?: 'pdf' | 'qr' | 'link';
  status?: 'sent' | 'delivered' | 'read';
}

export interface WhatsAppScenarioDetails {
  senderPhoneNumber: string;
  senderTitle: string;
  avatarText?: string;
  avatarBgColor?: string;
  isOnline?: boolean;
  lastSeen?: string;
  messages: WhatsAppMessage[];
  quickReplies?: string[];
  safeActionAdvised?: string;
}

export interface DepartmentStats {
  name: string;
  targeted: number;
  opened: number;
  clicked: number;
  reported: number;
  clickRate: number;
  reportRate: number;
}

export interface AIAnalysis {
  executiveSummary: string;
  riskLevel: 'Faible' | 'Modéré' | 'Élevé' | 'Critique';
  vulnerabilityFactor: string;
  departmentVulnerabilities: Array<{
    department: string;
    riskScore: string;
    comment: string;
  }>;
  recommendations: string[];
  trainingAdvice: string;
  analyzedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  scenarioId: string;
  scenarioName: string;
  category: ScenarioCategory;
  difficulty: DifficultyLevel;
  targetGroup: string;
  status: CampaignStatus;
  createdAt: string;
  launchedAt?: string;
  completedAt?: string;
  targeted: number;
  delivered: number;
  opened: number;
  clicked: number;
  reported: number;
  clickRate: number;
  reportRate: number;
  medianReactionTimeMinutes: number;
  departments: DepartmentStats[];
  aiAnalysis?: AIAnalysis;
  isReTest?: boolean;
  baselineCampaignId?: string;
  associatedTrainingId?: string;
}

export interface Scenario {
  id: string;
  name: string;
  category: ScenarioCategory;
  difficulty: DifficultyLevel;
  senderName: string;
  senderEmail: string;
  subject: string;
  previewText: string;
  body: string;
  psychologicalTriggers: string[];
  redFlags: string[];
  landingPageContent: string;
  isAiGenerated?: boolean;
  whatsappDetails?: WhatsAppScenarioDetails;
}

export interface WarningSign {
  sign: string;
  description: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  category: ScenarioCategory;
  difficulty?: DifficultyLevel;
  targetAudience?: string;
  durationMinutes: number;
  completedCount: number;
  totalAssigned: number;
  campaignId?: string;
  situation: {
    context: string;
    sampleSnippet: string;
  };
  warningSigns: WarningSign[];
  correctReaction: {
    rule: string;
    steps: string[];
  };
  miniQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface ReTestRecord {
  id: string;
  title: string;
  scenarioCategory: ScenarioCategory;
  targetCohort: string;
  baselineCampaign: {
    id: string;
    name: string;
    date: string;
    targeted: number;
    clickRate: number;
    reportRate: number;
    clicked: number;
    reported: number;
  };
  retestCampaign: {
    id: string;
    name: string;
    date: string;
    targeted: number;
    clickRate: number;
    reportRate: number;
    clicked: number;
    reported: number;
  };
  evolution: {
    clickRateDropPercent: number; // e.g. -72%
    reportRateGainPercent: number; // e.g. +38%
    humanVigilanceScore: number; // 0 to 100
  };
}

export interface SimulationProviderSettings {
  provider: 'mock' | 'gophish';
  gophishUrl: string;
  gophishApiKey: string;
  mockMode: {
    interactivePreview: boolean;
    autoSimulateReplies: boolean;
    educationalLandingActive: boolean;
  };
  companyName: string;
  companyDomain: string;
}
