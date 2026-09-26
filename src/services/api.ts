import { Campaign, ScenarioCategory, DifficultyLevel, AIAnalysis, TrainingModule } from '../types';

export interface GenerateScenarioParams {
  scenarioType: ScenarioCategory;
  targetAudience: string;
  difficulty: DifficultyLevel;
  companyContext: string;
}

export const vigiloAiService = {
  async generateScenario(params: GenerateScenarioParams) {
    try {
      const response = await fetch('/api/vigilo-ai/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) {
        throw new Error(`Erreur réseau HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.warn('[VIGILO] Utilisation du moteur de secours Vigilo Coach local', err);
      // Realistic fallback
      return {
        name: `${params.scenarioType} : Simulation de contrôle ${params.targetAudience}`,
        category: params.scenarioType,
        difficulty: params.difficulty,
        senderName: params.scenarioType === 'Fake Invoice' ? 'Trésorerie & Comptabilité Partenaires' : 'Centre d Authentification Sécurisée',
        senderEmail: params.scenarioType === 'Fake Invoice' ? 'compta@service-reglement-securise.fr' : 'securite@cloud-identity-verification.net',
        subject: params.scenarioType === 'Fake Invoice' ? 'Notification : Changement de RIB fournisseur pour règlement urgent' : 'Alerte de sécurité : Confirmation obligatoire de vos accès sous 4h',
        previewText: 'Simulation ciblée configurée par Vigilo Coach',
        body: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:6px;background:#fff;">
          <p>Bonjour,</p>
          <p>Ceci est une simulation contrôlée envoyée dans le cadre de votre programme de vigilance.</p>
          <p style="margin:20px 0;"><a href="#vigilo-trap-link" style="background:#2563eb;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none;font-weight:600;">Vérifier et continuer</a></p>
          <p style="color:#64748b;font-size:12px;">Équipe Cybersécurité VIGILO</p>
        </div>`,
        psychologicalTriggers: ['Urgence', 'Autorité', 'Conformité'],
        redFlags: ['Nom de domaine non habituel', 'Délai d expiration court', 'Lien non officiel'],
        landingPageContent: 'Ceci était un test contrôlé VIGILO. Aucun mot de passe n a été transmis.',
      };
    }
  },

  async analyzeCampaign(campaign: Campaign): Promise<AIAnalysis> {
    try {
      const response = await fetch('/api/vigilo-ai/analyze-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaign.name,
          targeted: campaign.targeted,
          delivered: campaign.delivered,
          opened: campaign.opened,
          clicked: campaign.clicked,
          reported: campaign.reported,
          clickRate: campaign.clickRate,
          reportRate: campaign.reportRate,
          scenarioType: campaign.category,
          departments: campaign.departments,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur réseau HTTP ${response.status}`);
      }
      const data = await response.json();
      return {
        ...data.data,
        analyzedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('[VIGILO] Utilisation de l analyse Vigilo Coach intégrée', err);
      const isHighClick = campaign.clickRate > 20;
      const riskLevel = campaign.clickRate > 30 ? 'Critique' : isHighClick ? 'Élevé' : campaign.clickRate > 10 ? 'Modéré' : 'Faible';

      return {
        executiveSummary: `La campagne "${campaign.name}" affiche un taux de compromission de ${campaign.clickRate}% et un taux de signalement de ${campaign.reportRate}%. L analyse comportementale démontre une sensibilité accrue aux sentiments d urgence.`,
        riskLevel,
        vulnerabilityFactor: campaign.category === 'Fake Invoice' 
          ? 'L automatisme de paiement et la pression d échéance sont les principaux facteurs déclencheurs.'
          : 'La peur de perdre l accès aux emails ou aux fichiers partagés a primé sur la vérification d identité.',
        departmentVulnerabilities: campaign.departments.map(d => ({
          department: d.name,
          riskScore: d.clickRate > 25 ? '8/10' : d.clickRate > 15 ? '6/10' : '3/10',
          comment: d.clickRate > 25 ? 'Taux de clic supérieur à la moyenne : formation prioritaire requise.' : 'Bon niveau de détection et signalements rapides.',
        })),
        recommendations: [
          'Diffuser la micro-formation VIGILO ciblée de 4 minutes à l ensemble de la cohorte.',
          'Mettre en avant publiquement les collaborateurs ayant signalé le courriel pour encourager l émulation positive.',
          'Planifier un re-test automatisé sous 10 à 14 jours.',
        ],
        trainingAdvice: `Le taux de clic de ${campaign.clickRate}% indique un besoin immédiat d entraînement sur le scénario ${campaign.category}. Nous recommandons la micro-formation interactive VIGILO de 4 minutes.`,
        analyzedAt: new Date().toISOString(),
      };
    }
  },

  async generateTraining(scenarioType: ScenarioCategory, vulnerabilityFocus: string): Promise<Partial<TrainingModule>> {
    try {
      const response = await fetch('/api/vigilo-ai/generate-training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioType, vulnerabilityFocus }),
      });
      if (!response.ok) {
        throw new Error(`Erreur réseau HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.data;
    } catch (err) {
      console.warn('[VIGILO] Utilisation du module de formation par défaut', err);
      return {
        title: `Micro-formation ciblée : Déjouer les attaques de type ${scenarioType}`,
        durationMinutes: 4,
        category: scenarioType,
        situation: {
          context: `Un collaborateur est confronté à un message suspect de type ${scenarioType} conçu pour exploiter un réflexe d urgence.`,
          sampleSnippet: '« Important : Action requise immédiatement pour régulariser votre situation. »',
        },
        warningSigns: [
          { sign: 'Urgence anormale', description: 'Une menace de pénalité ou de blocage rapide sans préavis.' },
          { sign: 'Canal de contact douteux', description: 'Une demande sensible transmise par email sans canal sécurisé.' },
          { sign: 'Absence d authentification', description: 'Lien demandant des informations confidentielles sans MFA.' },
        ],
        correctReaction: {
          rule: 'Prenez 30 secondes de recul : observez, vérifiez le canal et signalez.',
          steps: [
            '1. Ne pas cliquer sur les liens ni ouvrir les pièces jointes.',
            '2. Contacter le service émetteur par un canal téléphonique vérifié.',
            '3. Cliquer sur le bouton Signaler VIGILO pour sécuriser l entreprise.',
          ],
        },
        miniQuiz: {
          question: `Quel est le premier réflexe de sécurité face à une demande suspecte de type ${scenarioType} ?`,
          options: [
            'Cliquer pour vérifier ce qui est demandé.',
            'Survoler le lien sans cliquer et vérifier par téléphone si nécessaire.',
            'Transférer le message à ses proches pour demander leur avis.',
          ],
          correctIndex: 1,
          explanation: 'La vérification sans action active sur le message préserve l intégrité du poste et permet d identifier le leurre.',
        },
      };
    }
  },
};

// Backwards compatibility alias
export const rodiumAiService = vigiloAiService;

export const vigiloTrainingService = {
  async sendTrainingInvite(params: {
    email: string;
    firstName: string;
    module: TrainingModule;
    origin: string;
  }): Promise<boolean> {
    try {
      const response = await fetch('/api/send-training-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (!response.ok) return false;
      const data = await response.json();
      return Boolean(data.success);
    } catch {
      return false;
    }
  },
};
