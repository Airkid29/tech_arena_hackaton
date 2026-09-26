import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI on the server if key is provided
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  aiClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// RodiumAI fetch helper
const callRodiumAI = async (prompt: string, model: string = 'gemini-3.8-flash') => {
  const rodiumKey = process.env.RODIUM_API_KEY;
  if (!rodiumKey) throw new Error('RODIUM_API_KEY non définie');

  // Tentative d'utilisation de l'API Rodium (compatible OpenAI)
  const rodiumUrl = process.env.RODIUM_API_URL || 'https://api.rodiumai.io/v1/chat/completions';
  const response = await fetch(rodiumUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${rodiumKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`Erreur RodiumAI: HTTP ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error('Réponse RodiumAI invalide');
  return text;
};

// Vigilo Cyber Coach API Endpoints
const handleGenerateScenario = async (req: Request, res: Response) => {
  const { targetAudience, scenarioType, difficulty, companyContext } = req.body;

  // Function to provide high-fidelity fallback
  const getFallbackScenario = () => {
    const templates = {
      Phishing: {
        name: `Phishing : Synchronisation d'accès - ${targetAudience || 'Équipes'}`,
        senderName: 'Microsoft Identity Support',
        senderEmail: 'notifications@m365-cloud-sync.com',
        subject: 'Important : 3 courriels en attente de synchronisation sur votre boîte',
        previewText: 'Imitation d alerte M365 avec sentiment de blocage de messages de travail',
        body: `<div style="font-family:sans-serif;color:#242424;padding:20px;border:1px solid #e1dfdd;border-radius:6px;background:#ffffff;">
  <p style="font-size:15px;margin-top:0;">Bonjour,</p>
  <p style="font-size:14px;line-height:1.5;">Votre boîte aux lettres a atteint une limite temporaire de synchronisation. <strong>3 courriels entrants importants</strong> sont actuellement retenus sur nos serveurs de transit.</p>
  <div style="background:#fff4ce;border-left:4px solid #797673;padding:12px 16px;margin:16px 0;font-size:13px;">
    <strong>Délai d expiration : 3 heures</strong><br>Sans action de confirmation, vos accès collaboratifs seront mis en pause.
  </div>
  <p><a href="#vigilo-trap-link" style="background-color:#0078d4;color:white;padding:10px 18px;text-decoration:none;border-radius:4px;font-weight:600;display:inline-block;">Conserver et synchroniser mes courriels</a></p>
  <p style="font-size:11px;color:#71717a;border-top:1px solid #edebe9;padding-top:12px;">Microsoft Identity Cloud Services - Réf: MS-993821</p>
</div>`,
        psychologicalTriggers: ['Curiosité professionnelle', 'Urgence (messages perdus)', 'Confiance dans la marque'],
        redFlags: ['Domaine d expéditeur factice m365-cloud-sync.com', 'Délai d expiration agressif (3h)', 'Lien demandant des identifiants'],
      },
      'Fake Invoice': {
        name: `Fake Invoice : Changement RIB Fournisseur - ${targetAudience || 'Comptabilité'}`,
        senderName: 'Service Facturation - Orange Business Telecom',
        senderEmail: 'comptabilite@orange-pro-facturation.net',
        subject: 'URGENT : Mise à jour RIB pour règlement facture N° FR-2026-9810',
        previewText: 'Tentative de fraude au virement par usurpation de fournisseur récurrent',
        body: `<div style="font-family:sans-serif;color:#1e293b;padding:20px;border:1px solid #cbd5e1;border-radius:6px;background:#ffffff;">
  <p style="font-size:14px;margin-top:0;">Madame, Monsieur du service Comptabilité,</p>
  <p style="font-size:14px;line-height:1.6;">Dans le cadre de la clôture comptable trimestrielle et du changement de notre teneur de compte bancaire, nous vous prions de bien vouloir noter nos nouvelles coordonnées bancaires (IBAN FR76 3000 ...) pour le règlement de la facture N° FR-2026-9810 échue le 28 du mois en cours.</p>
  <p><a href="#vigilo-trap-link" style="background-color:#ea580c;color:white;padding:10px 18px;text-decoration:none;border-radius:4px;font-weight:600;display:inline-block;">Télécharger le nouveau RIB certifié</a></p>
  <p style="font-size:11px;color:#64748b;">Orange Business Services - Trésorerie & Recouvrement</p>
</div>`,
        psychologicalTriggers: ['Autorité administrative', 'Légitimité apparente (nom de fournisseur courant)', 'Contrainte de délai de clôture'],
        redFlags: ['Modification de RIB demandée par simple email', 'Domaine orange-pro-facturation.net non officiel', 'Absence de contre-appel téléphonique'],
      },
      'WhatsApp Phishing': {
        name: `WhatsApp Whishing : Fraude au Dirigeant - ${targetAudience || 'Direction & Finance'}`,
        senderName: 'Marc V. (PDG - Direction Générale)',
        senderEmail: '+33 6 88 12 94 02',
        subject: 'Message WhatsApp urgent du chef d entreprise (Validation confidentielle)',
        previewText: 'Ingénierie sociale mobile avec usurpation d identité et prétexte de réunion fermée',
        body: `<div style="max-width:380px;margin:0 auto;background:#111b21;color:#e9edef;padding:16px;border-radius:12px;font-family:sans-serif;">
  <p><strong>Marc V. (PDG)</strong> · +33 6 88 12 94 02</p>
  <p>Bonjour, je suis en réunion d'affaires confidentielle (NDA). J'ai impérativement besoin que tu valides le bon de commande serveur avant midi sur notre portail d'urgence :</p>
  <p><a href="#vigilo-trap-link" style="color:#53bdeb;">https://validation-tresorerie-groupe.net/auth</a></p>
  <p>Ne m'appelle pas, confirme-moi par message dès que c'est fait.</p>
</div>`,
        psychologicalTriggers: ['Autorité hiérarchique directe', 'Faux secret (clause NDA)', 'Urgence temporelle (avant midi)'],
        redFlags: [
          'Numéro de portable inconnu prétendant être le PDG',
          'Interdiction formelle d appeler par téléphone',
          'Lien externe vers validation-tresorerie-groupe.net',
          'Contournement des procédures régulières de comptabilité'
        ],
        whatsappDetails: {
          senderPhoneNumber: '+33 6 88 12 94 02',
          senderTitle: 'Marc V. (PDG - Direction Générale)',
          avatarText: 'MV',
          avatarBgColor: '#00a884',
          isOnline: true,
          messages: [
            {
              id: 'wa-1',
              sender: 'attacker',
              text: 'Bonjour, c\'est Marc. Je suis actuellement en réunion d\'affaires fermée sous clause de confidentialité (NDA).',
              timestamp: '10:41',
              status: 'read',
            },
            {
              id: 'wa-2',
              sender: 'attacker',
              text: 'J\'ai un besoin critique et urgent : valide l\'acompte fournisseur sur le portail sécurisé avant 12h00 pour éviter toute coupure serveur :',
              timestamp: '10:42',
              status: 'read',
              hasLink: true,
              linkUrl: 'https://validation-tresorerie-groupe.net/auth',
              linkText: 'Portail d\'approbation express · validation-tresorerie-groupe.net',
            },
            {
              id: 'wa-3',
              sender: 'attacker',
              text: 'Ne m\'appelle pas, je ne peux pas décrocher en réunion. Confirme-moi par message dès que c\'est fait.',
              timestamp: '10:43',
              status: 'read',
            },
          ],
          quickReplies: ['Je t\'appelle sur ton fixe', 'D\'accord, j\'ouvre le lien', 'Je vérifie avec la compta'],
          safeActionAdvised: 'Appeler le dirigeant sur son numéro fixe officiel connu dans l\'annuaire.',
        }
      },
    };

    let selected: any = templates.Phishing;
    if (scenarioType === 'Fake Invoice') selected = templates['Fake Invoice'];
    if (scenarioType === 'WhatsApp Phishing') selected = templates['WhatsApp Phishing'];
    return {
      ...selected,
      category: scenarioType || 'Phishing',
      difficulty: difficulty || 'Moyen',
      landingPageContent: 'Alerte VIGILO : Vous venez de cliquer sur une simulation de cyberattaque contrôlée. Règle d or : toujours procéder à un contre-appel téléphonique indépendant.',
    };
  };

  if (process.env.RODIUM_API_KEY || aiClient) {
    try {
      const prompt = `Tu es Vigilo Coach, l'IA experte en cyber-résilience humaine intégrée à la plateforme SaaS VIGILO.
VIGILO aide les PME à mesurer et renforcer la vigilance de leurs équipes selon le cycle : Simuler → Mesurer → Analyser → Former → Re-tester.

Génère un scénario d'attaque contrôlée (simulation autorisée) ultra-réaliste adapté à :
- Type de scénario: ${scenarioType || 'Phishing'}
- Public cible: ${targetAudience || 'Tous les collaborateurs'}
- Niveau de difficulté: ${difficulty || 'Moyen'}
- Contexte de la PME: ${companyContext || 'PME de services, outils cloud (M365, Slack, outil de facturation)'}

Format de réponse attendu en JSON strict sans balises markdown superflues:
{
  "name": "Nom du scénario",
  "category": "${scenarioType || 'Phishing'}",
  "difficulty": "${difficulty || 'Moyen'}",
  "senderName": "Nom de l'expéditeur simulé",
  "senderEmail": "adresse@domaine-simule.com",
  "subject": "Objet de l'email ou du message",
  "previewText": "Courte description pour l'admin",
  "body": "Contenu HTML complet du message de simulation",
  "psychologicalTriggers": ["Urgence", "Autorité", "Appât financier"],
  "redFlags": ["Domaine usurpé", "Bouton d'action suspect", "Pression temporelle"],
  "landingPageContent": "Explication pédagogique affichée si l'utilisateur clique"
}`;

      let responseText = '';
      let engineUsed = '';
      
      if (process.env.RODIUM_API_KEY) {
        try {
          responseText = await callRodiumAI(prompt, 'gemini-3.8-flash');
          engineUsed = 'rodium-ai-gemini';
        } catch (rodiumErr: any) {
          console.warn('[Rodium Coach] Erreur API Rodium, fallback:', rodiumErr.message);
          if (aiClient) {
            const response = await aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' },
            });
            responseText = response.text || '';
            engineUsed = 'gemini-3.8-flash';
          } else {
            throw rodiumErr;
          }
        }
      } else if (aiClient) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        responseText = response.text || '';
        engineUsed = 'gemini-3.8-flash';
      }

      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed, engine: engineUsed });
    } catch (err: any) {
      console.warn('[Vigilo Coach] IA unavailable, falling back to built-in generator:', err.message);
      return res.json({ success: true, data: getFallbackScenario(), engine: 'vigilo-builtin' });
    }
  }

  return res.json({ success: true, data: getFallbackScenario(), engine: 'vigilo-builtin' });
};

// 2. AI Analysis of Campaign Results
const handleAnalyzeResults = async (req: Request, res: Response) => {
  try {
    const { campaignName, targeted, delivered, opened, clicked, reported, clickRate, reportRate, scenarioType, departments } = req.body;

    if (process.env.RODIUM_API_KEY || aiClient) {
      const prompt = `Tu es Vigilo Coach, le moteur d'analyse cyber comportementale de la plateforme VIGILO.
VIGILO est un SaaS B2B destiné aux PME. Sa devise : « Mesurez et renforcez la vigilance de votre équipe. »
Principe : Simuler → Mesurer → Analyser → Former → Re-tester.
Note : VIGILO n'est pas un SIEM, l'objectif est d'analyser le comportement humain et la culture de sécurité sans surveillance intrusive.

Voici les résultats de la campagne :
- Nom : "${campaignName}"
- Type de scénario : ${scenarioType}
- Ciblés : ${targeted}
- Délivrés : ${delivered}
- Ouverts : ${opened}
- Clics (piégés) : ${clicked} (Taux de clic : ${clickRate}%)
- Signalements vertueux : ${reported} (Taux de signalement : ${reportRate}%)
- Détail par équipe : ${JSON.stringify(departments || [])}

Fournis une analyse synthétique et percutante au format JSON strict :
{
  "executiveSummary": "Synthèse exécutive en 2 phrases pour le dirigeant ou le responsable IT",
  "riskLevel": "Faible" | "Modéré" | "Élevé" | "Critique",
  "vulnerabilityFactor": "Explication du principal facteur psychologique ou technique qui a trompé les collaborateurs",
  "departmentVulnerabilities": [
    {"department": "Nom du service", "riskScore": "Score de 1 à 10", "comment": "Observation"}
  ],
  "recommendations": [
    "Recommandation opérationnelle concrète 1",
    "Recommandation opérationnelle concrète 2"
  ],
  "trainingAdvice": "Le taux de clic indique un risque important concernant ... Nous recommandons une formation de 5 minutes sur ..."
}`;

      let responseText = '';
      let engineUsed = '';

      if (process.env.RODIUM_API_KEY) {
        try {
          responseText = await callRodiumAI(prompt, 'gemini-3.8-flash');
          engineUsed = 'rodium-ai-gemini';
        } catch (err) {
          if (aiClient) {
            const response = await aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' },
            });
            responseText = response.text || '';
            engineUsed = 'gemini-3.8-flash';
          }
        }
      } else if (aiClient) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        responseText = response.text || '';
        engineUsed = 'gemini-3.8-flash';
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ success: true, data: parsed, engine: engineUsed });
        } catch {
          // fallback below
        }
      }
    }

    // Built-in expert analysis algorithm
    const isHighClick = Number(clickRate) > 20;
    const isLowReport = Number(reportRate) < 40;
    const riskLevel = Number(clickRate) > 30 ? 'Critique' : isHighClick ? 'Élevé' : Number(clickRate) > 10 ? 'Modéré' : 'Faible';

    const fallbackAnalysis = {
      executiveSummary: `La campagne "${campaignName}" enregistre un taux de compromission de ${clickRate}% et un taux de réflexe défensif (signalement) de ${reportRate}%. Le niveau de vulnérabilité globale de la structure est qualifié de ${riskLevel}.`,
      riskLevel,
      vulnerabilityFactor: scenarioType === 'Fake Invoice' 
        ? "La pression temporelle liée à une prétendue clôture comptable et l'apparence officielle des documents bancaires constituent le principal levier de vulnérabilité."
        : "La crainte de perturbation du flux de travail (perte d'emails professionnels ou suspension d'accès) a provoqué un passage à l'acte rapide sans vérification de l'URL.",
      departmentVulnerabilities: (departments || []).map((d: any) => ({
        department: d.name,
        riskScore: d.clickRate > 25 ? '8/10' : d.clickRate > 15 ? '6/10' : '3/10',
        comment: d.clickRate > 25 
          ? 'Sensibilité forte aux sollicitations financières ou de support externe.'
          : 'Comportement prudent avec une proportion satisfaisante de signalements.',
      })),
      recommendations: [
        scenarioType === 'Fake Invoice'
          ? "Mettre en place une procédure stricte de double validation téléphonique (contre-appel sur numéro certifié) pour tout changement de RIB."
          : "Sensibiliser les équipes au survol des liens hypertextes et à la vérification systématique de l'extension de domaine.",
        "Valoriser les collaborateurs ayant utilisé le bouton de signalement pour ancrer la culture positive de la cybersécurité.",
        "Déployer la micro-formation ciblée de 4 minutes avant de lancer le re-test d'évaluation.",
      ],
      trainingAdvice: `Le taux de clic de ${clickRate}% indique un risque notable sur les scénarios de type ${scenarioType}. Nous recommandons la micro-formation VIGILO de 4 minutes pour enseigner les 3 réflexes clés de détection.`,
    };

    return res.json({ success: true, data: fallbackAnalysis, engine: 'vigilo-builtin' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 3. AI Generation / Customization of Micro-Training
const handleGenerateTraining = async (req: Request, res: Response) => {
  try {
    const { scenarioType, vulnerabilityFocus } = req.body;

    if (process.env.RODIUM_API_KEY || aiClient) {
      const prompt = `Tu es Vigilo Coach, le formateur en cyber-résilience humaine de VIGILO. Génère une micro-formation interactive de cybersécurité de 3 à 5 minutes pour des collaborateurs de PME.
Thème : ${scenarioType || 'Phishing'}
Point de vulnérabilité identifié : ${vulnerabilityFocus || 'Détection des liens piégés et sentiment d urgence'}

Structure obligatoire conforme au cahier des charges VIGILO :
1. Situation (mise en situation concrète)
2. Signes d'alerte (red flags repérables)
3. Bonne réaction (procédure pas à pas)
4. Mini-question (quiz pratique avec explication de la bonne réponse)

Format JSON strict :
{
  "title": "Titre clair et pédagogique",
  "durationMinutes": 4,
  "category": "${scenarioType || 'Phishing'}",
  "situation": {
    "context": "Description de la situation de départ vécue par le collaborateur",
    "sampleSnippet": "Extrait du message suspect"
  },
  "warningSigns": [
    {"sign": "Nom du signe d'alerte", "description": "Explication simple"},
    {"sign": "Nom du deuxième signe", "description": "Explication simple"},
    {"sign": "Nom du troisième signe", "description": "Explication simple"}
  ],
  "correctReaction": {
    "rule": "La règle d'or à retenir",
    "steps": [
      "Étape 1 : Ne pas cliquer / Ne pas répondre",
      "Étape 2 : Vérifier le canal officiel",
      "Étape 3 : Cliquer sur le bouton Signaler VIGILO"
    ]
  },
  "miniQuiz": {
    "question": "Question pratique basée sur une situation réelle",
    "options": [
      "Option A",
      "Option B",
      "Option C"
    ],
    "correctIndex": 1,
    "explanation": "Pourquoi cette réponse protège l'entreprise"
  }
}`;

      let responseText = '';
      let engineUsed = '';

      if (process.env.RODIUM_API_KEY) {
        try {
          responseText = await callRodiumAI(prompt, 'gemini-3.8-flash');
          engineUsed = 'rodium-ai-gemini';
        } catch (err) {
          if (aiClient) {
            const response = await aiClient.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: prompt,
              config: { responseMimeType: 'application/json' },
            });
            responseText = response.text || '';
            engineUsed = 'gemini-3.8-flash';
          }
        }
      } else if (aiClient) {
        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });
        responseText = response.text || '';
        engineUsed = 'gemini-3.8-flash';
      }

      if (responseText) {
        try {
          const parsed = JSON.parse(responseText);
          return res.json({ success: true, data: parsed, engine: engineUsed });
        } catch {
          // fallback
        }
      }
    }

    const fallbackTraining = scenarioType === 'Fake Invoice' ? {
      title: "Fraude au faux RIB : Les réflexes anti-arnaque comptable",
      durationMinutes: 4,
      category: "Fake Invoice",
      situation: {
        context: "Vous recevez un courriel urgent d'un sous-traitant habituel annonçant un changement soudain de domiciliation bancaire pour une facture imminente.",
        sampleSnippet: "« Suite à une fusion bancaire, merci de virer le solde de 14 250 € sur notre nouvel IBAN sous 48h. »"
      },
      warningSigns: [
        { sign: "Changement de coordonnées bancaires par email simple", description: "Les escrocs piratent une boîte mail ou usurpent le nom de domaine pour détourner les virements." },
        { sign: "Pression temporelle inhabituelle", description: "L'émetteur insiste sur l'urgence d'un règlement pour éviter que vous ayez le temps de contre-vérifier." },
        { sign: "Refus du contact téléphonique direct", description: "L'escroc prétend être en déplacement, en réunion ou indisponible par téléphone." }
      ],
      correctReaction: {
        rule: "Le principe du canal séparé : Jamais de validation de RIB sans contre-appel téléphonique certifié.",
        steps: [
          "Ne modifiez jamais un RIB dans votre logiciel de paie ou comptable sur la base d'un simple courriel.",
          "Appelez immédiatement le fournisseur en utilisant le numéro de téléphone figurant sur votre contrat initial (et JAMAIS le numéro indiqué dans le courriel suspect).",
          "Signalez le courriel à votre responsable informatique ou via le bouton VIGILO."
        ]
      },
      miniQuiz: {
        question: "Votre principal fournisseur de serveurs vous envoie un nouveau RIB par email avec un logo officiel très net. Que faites-vous ?",
        options: [
          "J'enregistre le nouvel IBAN et je programme le virement pour ne pas bloquer les serveurs.",
          "Je compose le numéro habituel du service comptabilité enregistré dans notre ERP pour valider l'information à l'oral.",
          "Je réponds au courriel en demandant s'il s'agit bien de la vraie société."
        ],
        correctIndex: 1,
        explanation: "Un contre-appel téléphonique sur un numéro connu et déjà éprouvé est la seule parade infaillible contre la fraude au président ou au faux fournisseur."
      }
    } : {
      title: "Démasquer les emails de phishing M365 & Cloud",
      durationMinutes: 4,
      category: "Phishing",
      situation: {
        context: "Un email estampillé Microsoft vous alerte sur la suspension imminente de votre compte si vous ne confirmez pas vos identifiants immédiatement.",
        sampleSnippet: "« Votre session a expiré. Cliquez ici pour éviter la suppression de vos courriels professionnels sous 2 heures. »"
      },
      warningSigns: [
        { sign: "L'adresse d'expédition masquée", description: "Le nom d'affichage dit 'Microsoft Security', mais l'adresse réelle est 'noreply@verify-cloud-auth.fr'." },
        { sign: "Le sentiment d'urgence anxiogène", description: "Des limites temporelles courtes (2h, 4h) sont utilisées pour court-circuiter votre esprit critique." },
        { sign: "L'URL cachée derrière le bouton", description: "Au survol de la souris, le lien pointe vers un serveur inconnu et non vers microsoft.com." }
      ],
      correctReaction: {
        rule: "Survolez avant de cliquer, et en cas de doute : signalez.",
        steps: [
          "Passez votre curseur sur le lien pour afficher l'URL réelle en bas de l'écran.",
          "Ne saisissez JAMAIS vos identifiants ou mot de passe sur une page ouverte depuis un courriel inattendu.",
          "Cliquez sur le bouton VIGILO 'Signaler' de votre messagerie pour alerter l'équipe cyber."
        ]
      },
      miniQuiz: {
        question: "Vous recevez un email alarmant vous demandant de reconnecter votre boîte mail. Quel est le premier geste à adopter ?",
        options: [
          "Cliquer tout de suite pour voir si la page demande vraiment un mot de passe.",
          "Survoler le lien sans cliquer pour vérifier le domaine exact de destination.",
          "Transférer le mail à toute l'équipe pour leur demander leur avis."
        ],
        correctIndex: 1,
        explanation: "Le survol du lien permet de révéler le vrai domaine d'atterrissage sans exposer votre poste de travail à une infection ou un vol de session."
      }
    };

    return res.json({ success: true, data: fallbackTraining, engine: 'vigilo-builtin' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Register routes with both vigilo-ai and rodium-ai (for backwards compatibility)
app.post('/api/vigilo-ai/generate-scenario', handleGenerateScenario);
app.post('/api/rodium-ai/generate-scenario', handleGenerateScenario);

app.post('/api/vigilo-ai/analyze-results', handleAnalyzeResults);
app.post('/api/rodium-ai/analyze-results', handleAnalyzeResults);

app.post('/api/vigilo-ai/generate-training', handleGenerateTraining);
app.post('/api/rodium-ai/generate-training', handleGenerateTraining);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    service: 'VIGILO Cybersecurity Platform',
    aiEnabled: !!aiClient,
  });
});

// Setup Vite in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`\n  ➜  VIGILO App:  http://localhost:${PORT}/\n`);
  });
}

startServer();
