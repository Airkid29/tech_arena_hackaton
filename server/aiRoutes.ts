import { GoogleGenAI } from '@google/genai';
import type { Response } from 'express';
import type { AuthRequest } from './authMiddleware';

type AiProvider = 'gemini' | 'rodium';

interface AiGeneration {
  text: string;
  provider: AiProvider;
  model: string;
}

interface DepartmentInput {
  name: string;
  targeted: number;
  clicked: number;
  reported: number;
  clickRate: number;
  reportRate: number;
}

const SCENARIO_TYPES = [
  'Phishing',
  'Fake Invoice',
  'WhatsApp Phishing',
  'Smishing',
  'MFA Fatigue',
  'Social Engineering',
  'QR Code (Quishing)',
] as const;
const DIFFICULTIES = ['Facile', 'Moyen', 'Difficile'] as const;

function boundedText(value: unknown, fallback: string, maxLength = 180): string {
  if (typeof value !== 'string') return fallback;
  const cleaned = value.trim().replace(/[\u0000-\u001f\u007f]/g, ' ');
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function nonNegativeNumber(value: unknown, name: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1_000_000) {
    throw Object.assign(new Error(`${name} doit être un nombre positif valide`), { status: 400 });
  }
  return parsed;
}

function configuredProviders(): Array<{ provider: AiProvider; model: string }> {
  const preference = process.env.AI_PROVIDER;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const rodiumModel = process.env.RODIUM_MODEL || geminiModel;
  const available: Array<{ provider: AiProvider; model: string }> = [];
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    available.push({ provider: 'gemini', model: geminiModel });
  }
  if (process.env.RODIUM_API_KEY) {
    available.push({ provider: 'rodium', model: rodiumModel });
  }

  if (preference === 'gemini' || preference === 'rodium') {
    return [
      ...available.filter(({ provider }) => provider === preference),
      ...available.filter(({ provider }) => provider !== preference),
    ];
  }
  return available;
}

async function callProvider(
  provider: AiProvider,
  model: string,
  prompt: string
): Promise<AiGeneration> {
  if (provider === 'gemini') {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });
    if (!response.text) throw new Error('Gemini a renvoyé une réponse vide');
    return { text: response.text, provider, model };
  }

  const response = await fetch(
    process.env.RODIUM_API_URL || 'https://api.rodiumai.io/v1/chat/completions',
    {
      method: 'POST',
      signal: AbortSignal.timeout(20_000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RODIUM_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    }
  );
  if (!response.ok) throw new Error(`RodiumAI a répondu HTTP ${response.status}`);
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = payload.choices?.[0]?.message?.content;
  if (!text) throw new Error('RodiumAI a renvoyé une réponse vide');
  return { text, provider, model };
}

async function generateJson(prompt: string): Promise<{
  value: Record<string, unknown> | null;
  engine: string;
  warning?: string;
}> {
  const providers = configuredProviders();
  const failures: string[] = [];

  for (const { provider, model } of providers) {
    try {
      const generated = await callProvider(provider, model, prompt);
      const value = JSON.parse(generated.text) as Record<string, unknown>;
      return {
        value,
        engine: `${generated.provider}:${generated.model}`,
        ...(failures.length ? { warning: 'Le fournisseur IA prioritaire a échoué; un fournisseur secondaire a répondu.' } : {}),
      };
    } catch (error) {
      console.error(`[VIGILO IA] Échec du fournisseur ${provider}:`, error);
      failures.push(provider);
    }
  }

  return {
    value: null,
    engine: 'vigilo-builtin',
    ...(providers.length ? { warning: 'Les fournisseurs IA sont indisponibles; réponse de secours intégrée utilisée.' } : {}),
  };
}

function parseJsonArray(value: unknown, fallback: string[], maxItems = 8): string[] {
  if (!Array.isArray(value)) return fallback;
  const items = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => boundedText(entry, '', 240))
    .filter(Boolean)
    .slice(0, maxItems);
  return items.length ? items : fallback;
}

function safeScenario(
  generated: Record<string, unknown> | null,
  scenarioType: string,
  targetAudience: string,
  difficulty: string
) {
  const name = boundedText(generated?.name, `Exercice pédagogique : ${scenarioType}`, 100);
  const redFlags = parseJsonArray(generated?.redFlags, [
    'Demande inattendue ou urgente',
    'Expéditeur ou contexte à vérifier',
    'Vérifier par un canal officiel connu avant toute action',
  ]);
  const psychologicalTriggers = parseJsonArray(generated?.psychologicalTriggers, [
    'Urgence',
    'Autorité',
    'Demande inhabituelle',
  ]);
  const learningPoint = boundedText(
    generated?.landingPageContent,
    'Avant toute action, vérifiez l’identité de l’expéditeur par un canal officiel déjà connu.',
    400
  );

  return {
    name,
    category: scenarioType,
    difficulty,
    senderName: 'Exemple pédagogique VIGILO',
    senderEmail: 'exemple@simulation.invalid',
    subject: `[EXERCICE VIGILO] Situation de sensibilisation — ${scenarioType}`,
    previewText: `Cas pédagogique pour le public : ${targetAudience}`,
    body: `<div style="font-family:sans-serif;padding:20px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#0f172a;">
      <strong>EXERCICE PÉDAGOGIQUE — NON ENVOYÉ</strong>
      <p>Étudiez cette situation de sensibilisation sur le thème « ${scenarioType} ».</p>
      <p>Réflexe attendu : ne partagez aucune information et vérifiez la demande par un canal officiel connu.</p>
      <ul>${redFlags.map((flag) => `<li>${escapeHtml(flag)}</li>`).join('')}</ul>
    </div>`,
    psychologicalTriggers,
    redFlags,
    landingPageContent: learningPoint,
    isAiGenerated: Boolean(generated),
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]!);
}

export async function handleGenerateScenario(req: AuthRequest, res: Response) {
  const scenarioType =
    typeof req.body.scenarioType === 'string' && SCENARIO_TYPES.includes(req.body.scenarioType)
      ? req.body.scenarioType
      : 'Phishing';
  const difficulty =
    typeof req.body.difficulty === 'string' && DIFFICULTIES.includes(req.body.difficulty)
      ? req.body.difficulty
      : 'Moyen';
  const targetAudience = boundedText(req.body.targetAudience, 'Collaborateurs de PME', 100);
  const companyContext = boundedText(req.body.companyContext, 'PME au Togo', 300);
  const prompt = `Tu es un coach de sensibilisation à la cybersécurité. Fournis uniquement un cas pédagogique non exploitable, en JSON avec name, psychologicalTriggers, redFlags et landingPageContent.
Le cas porte sur ${scenarioType}, pour ${targetAudience}, difficulté ${difficulty}, contexte ${companyContext}.
Ne rédige aucun email ou message crédible prêt à envoyer. N'inclus ni marque réelle, ni adresse réelle, ni URL cliquable, ni collecte d'identifiants, ni demande de paiement. Le scénario doit explicitement encourager la vérification par un canal officiel connu.`;
  const result = await generateJson(prompt);
  return res.json({
    success: true,
    data: safeScenario(result.value, scenarioType, targetAudience, difficulty),
    engine: result.engine,
    ...(result.warning ? { warning: result.warning } : {}),
  });
}

function fallbackAnalysis(input: {
  campaignName: string;
  clickRate: number;
  reportRate: number;
  scenarioType: string;
  departments: DepartmentInput[];
}) {
  const riskLevel = input.clickRate > 30 ? 'Critique' : input.clickRate > 20 ? 'Élevé' : input.clickRate > 10 ? 'Modéré' : 'Faible';
  return {
    executiveSummary: `La campagne de démonstration « ${input.campaignName} » présente un taux de clic de ${input.clickRate}% et un taux de signalement de ${input.reportRate}%. Ces indicateurs décrivent uniquement les données fournies et ne constituent pas une mesure d’efficacité validée.`,
    riskLevel,
    vulnerabilityFactor: input.scenarioType === 'Fake Invoice'
      ? 'Les demandes de changement de coordonnées ou de paiement doivent être vérifiées sur un canal indépendant.'
      : 'La pression temporelle et les demandes inhabituelles peuvent réduire le temps consacré à la vérification.',
    departmentVulnerabilities: input.departments.map((department) => ({
      department: department.name,
      riskScore: `${Math.min(10, Math.max(1, Math.round(department.clickRate / 10)))}/10`,
      comment: 'Indicateur agrégé à interpréter avec prudence; il ne doit pas servir à sanctionner des personnes.',
    })),
    recommendations: [
      'Vérifier toute demande inhabituelle auprès d’un contact connu par un canal indépendant.',
      'Encourager le signalement précoce et proposer une courte formation pédagogique.',
      'Comparer ces indicateurs à un re-test autorisé avant de conclure à une évolution.',
    ],
    trainingAdvice: `Proposer un module de sensibilisation sur ${input.scenarioType}, puis mesurer à nouveau avec une campagne de démonstration autorisée.`,
  };
}

function safeAnalysis(
  generated: Record<string, unknown> | null,
  fallback: ReturnType<typeof fallbackAnalysis>
) {
  const riskLevels = ['Faible', 'Modéré', 'Élevé', 'Critique'] as const;
  const generatedDepartments = Array.isArray(generated?.departmentVulnerabilities)
    ? generated.departmentVulnerabilities.slice(0, 30)
    : [];
  const departmentVulnerabilities = generatedDepartments
    .filter((entry): entry is Record<string, unknown> =>
      Boolean(entry && typeof entry === 'object' && !Array.isArray(entry))
    )
    .map((entry) => ({
      department: boundedText(entry.department, 'Équipe', 80),
      riskScore: boundedText(entry.riskScore, 'Non évalué', 20),
      comment: boundedText(entry.comment, 'Indicateur agrégé à interpréter avec prudence.', 240),
    }));
  const generatedRisk = generated?.riskLevel;
  const riskLevel = riskLevels.find((level) => level === generatedRisk);
  return {
    executiveSummary: boundedText(generated?.executiveSummary, fallback.executiveSummary, 600),
    riskLevel: riskLevel || fallback.riskLevel,
    vulnerabilityFactor: boundedText(generated?.vulnerabilityFactor, fallback.vulnerabilityFactor, 400),
    departmentVulnerabilities:
      departmentVulnerabilities.length > 0
        ? departmentVulnerabilities
        : fallback.departmentVulnerabilities,
    recommendations: parseJsonArray(generated?.recommendations, fallback.recommendations, 8),
    trainingAdvice: boundedText(generated?.trainingAdvice, fallback.trainingAdvice, 400),
    analyzedAt: new Date().toISOString(),
  };
}

export async function handleAnalyzeResults(req: AuthRequest, res: Response) {
  try {
    const campaignName = boundedText(req.body.campaignName, 'Campagne', 120);
    const targeted = nonNegativeNumber(req.body.targeted, 'targeted');
    const clicked = nonNegativeNumber(req.body.clicked, 'clicked');
    const reported = nonNegativeNumber(req.body.reported, 'reported');
    if (clicked > targeted || reported > targeted) {
      return res.status(400).json({ success: false, error: 'Les clics et signalements ne peuvent dépasser les personnes ciblées' });
    }
    const clickRate = targeted ? Number(((clicked / targeted) * 100).toFixed(1)) : 0;
    const reportRate = targeted ? Number(((reported / targeted) * 100).toFixed(1)) : 0;
    const scenarioType = boundedText(req.body.scenarioType, 'Phishing', 50);
    const departments = Array.isArray(req.body.departments)
        ? req.body.departments.slice(0, 30).map((department: unknown) => {
            if (!department || typeof department !== 'object' || Array.isArray(department)) {
              throw Object.assign(new Error('Format de département invalide'), { status: 400 });
            }
            const entry = department as Record<string, unknown>;
            return {
              name: boundedText(entry.name, 'Équipe', 80),
              targeted: nonNegativeNumber(entry.targeted ?? 0, 'department.targeted'),
              clicked: nonNegativeNumber(entry.clicked ?? 0, 'department.clicked'),
              reported: nonNegativeNumber(entry.reported ?? 0, 'department.reported'),
              clickRate: nonNegativeNumber(entry.clickRate ?? 0, 'department.clickRate'),
              reportRate: nonNegativeNumber(entry.reportRate ?? 0, 'department.reportRate'),
            };
          })
      : [];
    const prompt = `Analyse uniquement ces statistiques agrégées d'une campagne de sensibilisation. N'infère pas d'identité individuelle, n'invente aucune preuve d'efficacité. Réponds en JSON avec executiveSummary, riskLevel (Faible/Modéré/Élevé/Critique), vulnerabilityFactor, departmentVulnerabilities, recommendations et trainingAdvice.
Données: ${JSON.stringify({ campaignName, targeted, clicked, reported, clickRate, reportRate, scenarioType, departments })}`;
    const result = await generateJson(prompt);
    const fallback = fallbackAnalysis({ campaignName, clickRate, reportRate, scenarioType, departments });
    const value = result.value;
    const valid =
      value &&
      typeof value.executiveSummary === 'string' &&
      ['Faible', 'Modéré', 'Élevé', 'Critique'].includes(String(value.riskLevel)) &&
      typeof value.vulnerabilityFactor === 'string' &&
      Array.isArray(value.recommendations) &&
      typeof value.trainingAdvice === 'string';
    const data = safeAnalysis(valid ? value : null, fallback);
    return res.json({
      success: true,
      data,
      engine: valid ? result.engine : 'vigilo-builtin',
      ...(!valid && result.engine !== 'vigilo-builtin'
        ? { warning: 'La réponse IA était invalide; analyse de secours utilisée.' }
        : result.warning ? { warning: result.warning } : {}),
    });
  } catch (error) {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? Number(error.status)
        : 500;
    if (status >= 500) console.error('[VIGILO Coach] Erreur analyse:', error);
    return res.status(status).json({
      success: false,
      error: status < 500 && error instanceof Error ? error.message : 'Analyse indisponible',
    });
  }
}

function fallbackTraining(scenarioType: string, vulnerabilityFocus: string) {
  return {
    title: `Réflexes de vérification : ${scenarioType}`,
    durationMinutes: 4,
    category: scenarioType,
    situation: {
      context: `Une demande inattendue liée à « ${scenarioType} » vous invite à agir rapidement.`,
      sampleSnippet: 'Exemple neutralisé : « [demande inhabituelle — vérifier avant d’agir] »',
    },
    warningSigns: [
      { sign: 'Urgence inhabituelle', description: 'La pression temporelle peut empêcher une vérification normale.' },
      { sign: 'Identité non confirmée', description: 'Un nom ou une photo ne suffit pas à prouver l’identité.' },
      { sign: 'Canal inattendu', description: 'Une demande sensible reçue sur un canal inhabituel mérite une vérification indépendante.' },
    ],
    correctReaction: {
      rule: 'Ne pas agir sous pression : vérifier par un canal officiel déjà connu.',
      steps: [
        'Ne cliquez pas et ne transmettez aucune information sensible.',
        'Contactez l’organisation ou la personne via un numéro ou une adresse déjà vérifiés.',
        'Signalez le message selon la procédure définie par votre entreprise.',
      ],
    },
    miniQuiz: {
      question: 'Une demande inhabituelle exige une action urgente. Quel est le meilleur premier réflexe ?',
      options: [
        'Répondre directement au message pour confirmer.',
        'Vérifier par un canal officiel connu avant toute action.',
        'Transférer le message à tous les collègues.',
      ],
      correctIndex: 1,
      explanation: 'Un canal indépendant déjà connu réduit le risque d’agir sur une identité usurpée.',
    },
    focus: vulnerabilityFocus,
  };
}

function safeTraining(
  generated: Record<string, unknown> | null,
  scenarioType: string,
  fallback: ReturnType<typeof fallbackTraining>
) {
  const situation =
    generated?.situation && typeof generated.situation === 'object' && !Array.isArray(generated.situation)
      ? generated.situation as Record<string, unknown>
      : null;
  const reaction =
    generated?.correctReaction && typeof generated.correctReaction === 'object' && !Array.isArray(generated.correctReaction)
      ? generated.correctReaction as Record<string, unknown>
      : null;
  const quiz =
    generated?.miniQuiz && typeof generated.miniQuiz === 'object' && !Array.isArray(generated.miniQuiz)
      ? generated.miniQuiz as Record<string, unknown>
      : null;
  const warningSigns = Array.isArray(generated?.warningSigns)
    ? generated.warningSigns
        .filter((entry): entry is Record<string, unknown> =>
          Boolean(entry && typeof entry === 'object' && !Array.isArray(entry))
        )
        .map((entry) => ({
          sign: boundedText(entry.sign, '', 100),
          description: boundedText(entry.description, '', 240),
        }))
        .filter((entry) => entry.sign && entry.description)
        .slice(0, 8)
    : [];
  const steps = Array.isArray(reaction?.steps)
    ? reaction.steps
        .filter((step): step is string => typeof step === 'string')
        .map((step) => boundedText(step, '', 240))
        .filter(Boolean)
        .slice(0, 8)
    : [];
  const options = Array.isArray(quiz?.options)
    ? quiz.options
        .filter((option): option is string => typeof option === 'string')
        .map((option) => boundedText(option, '', 180))
        .filter(Boolean)
        .slice(0, 5)
    : [];
  const correctIndex = Number(quiz?.correctIndex);
  const valid =
    typeof generated?.title === 'string' &&
    situation !== null &&
    typeof situation.context === 'string' &&
    typeof situation.sampleSnippet === 'string' &&
    warningSigns.length > 0 &&
    reaction !== null &&
    typeof reaction.rule === 'string' &&
    steps.length > 0 &&
    quiz !== null &&
    typeof quiz.question === 'string' &&
    options.length >= 2 &&
    Number.isInteger(correctIndex) &&
    correctIndex >= 0 &&
    correctIndex < options.length &&
    typeof quiz.explanation === 'string';
  if (!valid) return fallback;

  const duration = Number(generated.durationMinutes);
  return {
    ...fallback,
    title: boundedText(generated.title, fallback.title, 120),
    durationMinutes: Number.isFinite(duration) && duration >= 3 && duration <= 5
      ? Math.round(duration)
      : fallback.durationMinutes,
    category: scenarioType,
    situation: {
      context: boundedText(situation.context, fallback.situation.context, 500),
      sampleSnippet: boundedText(situation.sampleSnippet, fallback.situation.sampleSnippet, 300),
    },
    warningSigns,
    correctReaction: {
      rule: boundedText(reaction.rule, fallback.correctReaction.rule, 240),
      steps,
    },
    miniQuiz: {
      question: boundedText(quiz.question, fallback.miniQuiz.question, 300),
      options,
      correctIndex,
      explanation: boundedText(quiz.explanation, fallback.miniQuiz.explanation, 300),
    },
  };
}

export async function handleGenerateTraining(req: AuthRequest, res: Response) {
  const scenarioType = boundedText(req.body.scenarioType, 'Phishing', 50);
  const vulnerabilityFocus = boundedText(
    req.body.vulnerabilityFocus,
    'Vérification des demandes inattendues',
    220
  );
  const prompt = `Génère en français une micro-formation pédagogique de cybersécurité, au format JSON (title, durationMinutes, category, situation, warningSigns, correctReaction, miniQuiz). Durée 3 à 5 minutes. Scénario: ${scenarioType}. Point à enseigner: ${vulnerabilityFocus}. Utilise des exemples neutralisés, aucune URL réelle, aucune collecte de secret, aucune marque imitée, aucun contenu prêt à envoyer. Accent sur la vérification indépendante et le signalement.`;
  const result = await generateJson(prompt);
  const fallback = fallbackTraining(scenarioType, vulnerabilityFocus);
  const data = safeTraining(result.value, scenarioType, fallback);
  const generated = data !== fallback;
  return res.json({
    success: true,
    data,
    engine: generated ? result.engine : 'vigilo-builtin',
    ...(!generated
      ? {
          warning: result.value
            ? 'La réponse IA ne respectait pas le format attendu; module pédagogique de secours utilisé.'
            : result.warning,
        }
      : {}),
  });
}
