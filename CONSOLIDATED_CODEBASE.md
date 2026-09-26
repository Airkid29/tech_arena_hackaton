# CONSOLIDATED VIGILO CODEBASE

Ce fichier regroupe l'ensemble des fichiers source du projet VIGILO SaaS B2B.

==================================================
FILE: package.json
==================================================
`json
{
  "name": "vigilo-saas",
  "private": true,
  "version": "2.4.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "node server.ts",
    "build": "vite build",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "lucide-react": "^0.546.0",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0",
    "express": "^4.21.2",
    "dotenv": "^17.2.3",
    "motion": "^12.23.24"
  },
  "devDependencies": {
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.28.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2",
    "@types/express": "^4.17.21"
  }
}

`

==================================================
FILE: vite.config.ts
==================================================
`typescript
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

`

==================================================
FILE: tsconfig.json
==================================================
`json
{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "allowImportingTsExtensions": true,
    "noEmit": true
  }
}

`

==================================================
FILE: index.html
==================================================
`html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>VIGILO — Cybersécurité & Vigilance Humaine</title>
    <meta name="description" content="Plateforme SaaS B2B pour PME : Simuler des cyberattaques contrôlées sur Email et WhatsApp, mesurer les comportements, analyser avec Vigilo Coach, former et re-tester." />
    <meta property="og:title" content="VIGILO — Cybersécurité & Vigilance Humaine" />
    <meta property="og:description" content="Plateforme SaaS B2B pour PME : Simuler des cyberattaques contrôlées sur Email et WhatsApp, mesurer les comportements, analyser avec Vigilo Coach, former et re-tester." />
    <meta property="og:type" content="website" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>


`

==================================================
FILE: server.ts
==================================================
`typescript
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

  if (aiClient) {
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

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed, engine: 'gemini-3.8-flash' });
    } catch (err: any) {
      console.warn('[Vigilo Coach] Gemini unavailable, falling back to built-in generator:', err.message);
      return res.json({ success: true, data: getFallbackScenario(), engine: 'vigilo-builtin' });
    }
  }

  return res.json({ success: true, data: getFallbackScenario(), engine: 'vigilo-builtin' });
};

// 2. AI Analysis of Campaign Results
const handleAnalyzeResults = async (req: Request, res: Response) => {
  try {
    const { campaignName, targeted, delivered, opened, clicked, reported, clickRate, reportRate, scenarioType, departments } = req.body;

    if (aiClient) {
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

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed, engine: 'gemini-3.8-flash' });
      } catch {
        // fallback
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

    if (aiClient) {
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

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const responseText = response.text || '';
      try {
        const parsed = JSON.parse(responseText);
        return res.json({ success: true, data: parsed, engine: 'gemini-3.8-flash' });
      } catch {
        // fallback
      }
    }

    const fallbackTraining = scenarioType === 'Fake Invoice' ? {
      title: "Fraude au faux RIB : Les réflexes anti-arnaque comptable",
      durationMinutes: 4,
      category: "Fake Invoice",
      situation: {
        context: "Vous recevez un courriel urgent d'un sous-traitant habituel annonçant un changement soudain de domiciliation bancaire pour une facture imminente.",
        sampleSnippet: "« Suite à une fusion bancaire, merci de virer le solde de 14 250 F CFA sur notre nouvel IBAN sous 48h. »"
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

`

==================================================
FILE: src/index.css
==================================================
`css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@layer base {
  :root {
    color-scheme: dark;
  }

  body {
    background-color: #080b11;
    color: #f3f4f6;
    font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    transition: background-color 0.25s ease, color 0.25s ease;
    overflow-x: hidden;
  }

  /* Light mode override if explicitly requested */
  html:not(.dark) body {
    background-color: #0b0f19;
    color: #f8fafc;
  }
}

/* Custom Rodium-AI style glowing utilities */
.rodium-grid-pattern {
  background-image: 
    linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 85%);
  -webkit-mask-image: radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 85%);
}

.rodium-orange-glow {
  background: radial-gradient(closest-side, rgba(242, 98, 10, 0.18), rgba(242, 98, 10, 0.03) 65%, transparent 100%);
}

.rodium-cyan-glow {
  background: radial-gradient(closest-side, rgba(6, 182, 212, 0.15), rgba(6, 182, 212, 0.02) 65%, transparent 100%);
}

.rodium-card {
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.rodium-card:hover {
  border-color: rgba(242, 98, 10, 0.3);
  box-shadow: 0 12px 40px -12px rgba(242, 98, 10, 0.15);
}

.rodium-card-interactive {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%), rgba(10, 15, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
}

.rodium-card-interactive:hover {
  border-color: rgba(242, 98, 10, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(242, 98, 10, 0.2);
}

.rodium-btn-orange {
  background: linear-gradient(135deg, #f2620a 0%, #ea580c 50%, #d97706 100%);
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 4px 20px rgba(242, 98, 10, 0.35);
  transition: all 0.2s ease;
}

.rodium-btn-orange:hover {
  background: linear-gradient(135deg, #ff6b14 0%, #f2620a 50%, #e55a00 100%);
  box-shadow: 0 6px 25px rgba(242, 98, 10, 0.5);
  transform: translateY(-1px);
}

.rodium-btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #f3f4f6;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}

.rodium-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.rodium-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.875rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.75rem;
  font-weight: 500;
  color: #94a3b8;
  backdrop-filter: blur(8px);
}

.rodium-pill-orange {
  background: rgba(242, 98, 10, 0.1);
  border: 1px solid rgba(242, 98, 10, 0.3);
  color: #fb923c;
}

.rodium-pill-emerald {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.rodium-pill-cyan {
  background: rgba(6, 182, 212, 0.1);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: #38bdf8;
}

.rodium-glow-text {
  background: linear-gradient(135deg, #ffffff 0%, #f3f4f6 40%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.rodium-orange-text-gradient {
  background: linear-gradient(135deg, #ff7a1a 0%, #f2620a 50%, #fbbf24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Custom sleek scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #080b11;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(242, 98, 10, 0.5);
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.97); }
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite cubic-bezier(0.4, 0, 0.6, 1);
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.animate-marquee {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}

`

==================================================
FILE: src/main.tsx
==================================================
`typescript
import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

`

==================================================
FILE: src/types/index.ts
==================================================
`typescript
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
export type AppViewMode = 'landing' | 'app';

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

`

==================================================
FILE: src/i18n/translations.ts
==================================================
`typescript
export type Language = 'fr' | 'en';

export const translations = {
  fr: {
    // Brand & Slogan
    brandName: 'VIGILO',
    brandTagline: 'Mesurez et renforcez la vigilance cyber de votre équipe.',
    sloganShort: 'Simuler → Mesurer → Analyser → Former → Re-tester',

    // Nav & Sidebar
    nav: {
      overview: 'Tableau de bord',
      campaigns: 'Campagnes',
      scenarios: 'Scénarios',
      coach: 'Vigilo Coach',
      trainings: 'Formations',
      retest: 'Re-test & Mesure',
      flashNews: 'Flash Sécurité',
      settings: 'Paramètres',
      landing: 'Présentation',
      enterConsole: 'Accéder à la console',
      liveTest: 'Tester la simulation live',
      switchTheme: 'Basculer le thème',
      adminRole: 'Responsable Sécurité IT',
      activeCampaigns: 'campagnes actives',
    },

    // Landing Page
    landing: {
      kicker: 'Plateforme SaaS B2B · Cyber-résilience humaine',
      heroTitle: 'Mesurez et renforcez la vigilance de votre équipe.',
      heroSubtitle: 'Réalisez des simulations d\'attaques contrôlées sur Email et WhatsApp. Évaluez les comportements réels et déployez des micro-formations ciblées en 4 minutes.',
      startCycle: 'Démarrer le cycle VIGILO',
      simulateTrap: 'Tester la simulation en direct',
      standardsLabel: 'Compatibilité & standards opérationnels',
      cycleSectionTitle: 'L\'architecture en 5 étapes VIGILO',
      cycleSectionDesc: 'Un protocole continu éprouvé pour réduire le taux de clic sous 8% et ancrer les réflexes de signalement.',
      stepSimulate: 'Simuler',
      stepSimulateDesc: 'Lancement de campagnes autorisées et validées par l\'administrateur sur Email & WhatsApp.',
      stepMeasure: 'Mesurer',
      stepMeasureDesc: 'Comptabilisation objective des taux d\'ouverture, de clics piégés et de signalements réflexes.',
      stepAnalyze: 'Analyser',
      stepAnalyzeDesc: 'Vigilo Coach identifie les leviers psychologiques et départements sous tension.',
      stepTrain: 'Former',
      stepTrainDesc: 'Diffusion immédiate de micro-modules de 4 minutes axés sur les signaux d\'alerte.',
      stepRetest: 'Re-tester',
      stepRetestDesc: 'Mesure de l\'évolution sur la même cohorte à J+14 pour valider la progression.',
      featureWhatsappTitle: 'Vecteur WhatsApp & Whishing',
      featureWhatsappDesc: '82% des attaques d\'ingénierie sociale contournent les emails. Simulez des attaques WhatsApp fidèles au millimètre (Fraude au Président, support IT).',
      featureAdminTitle: 'Validation Administrateur Stricte',
      featureAdminDesc: 'Garde-fou éthique et légal. Aucune simulation n\'est diffusée sans accord formel de la direction.',
      featureDashboardTitle: 'Indicateurs Non-SIEM Clairs',
      featureDashboardDesc: 'Conçu pour les PME : visualisez les taux de clic et de signalement par service sans jargon complexe.',
      featureCoachTitle: 'Vigilo Cyber Coach',
      featureCoachDesc: 'Conseils personnalisés d\'atténuation des risques et génération de scénarios adaptés à votre contexte métier.',
      trainingTitle: 'Micro-formations ciblées de 4 minutes',
      trainingDesc: 'Fini les présentations théoriques de 45 minutes. Chaque module s\'appuie sur une situation réelle, des signaux d\'alerte et un mini-quiz.',
      exploreTrainings: 'Explorer toutes les formations',
      flashTitle: 'Veille & Flash Info Collaborateurs',
      flashDesc: 'Envoyez en un clic des articles et alertes de sensibilisation pour tenir vos équipes informées des menaces émergentes.',
      exploreFlash: 'Découvrir les Flash Infos',
      finalCtaTitle: 'Prêt à renforcer la résilience de vos collaborateurs ?',
      finalCtaDesc: 'Démarrez votre première simulation en moins de 3 minutes.',
      rightsReserved: 'Tous droits réservés. Conforme aux recommandations ANCy pour la sensibilisation en entreprise.',
    },

    // WhatsApp & Simulator
    simulator: {
      title: 'Simulateur d\'expérience collaborateur',
      emailTab: 'Email Pro (Outlook)',
      whatsAppTab: 'WhatsApp Pro (Whishing)',
      backToInbox: 'Revoir le message',
      reportButton: 'Signaler à VIGILO',
      counterCallButton: 'Tester le contre-appel',
      simulateClick: 'Simuler le clic (Piège)',
      unknownSender: 'Numéro inconnu',
      online: 'en ligne',
      typing: 'est en train d\'écrire...',
      sendPlaceholder: 'Répondre sur WhatsApp...',
      quickRepliesLabel: 'Réponses types :',
      quickCall: '📞 Je t\'appelle sur ton fixe d\'abord',
      quickProcedure: '🔒 Respect de la procédure comptable',
      quickOpen: '⚠️ D\'accord, j\'ouvre le lien',
      counterCallModalTitle: 'La règle d\'or : Le contre-appel indépendant',
      counterCallModalDesc: 'Vous composez le numéro officiel de la direction (annuaire interne) :',
      counterCallSuccess: '« Allô ? Marc à l\'appareil. Un virement d\'urgence sur WhatsApp ? C\'est une arnaque, je ne t\'ai rien demandé ! »',
      counterCallExplanation: 'Le simple fait d\'appeler par un canal distinct stoppe 100% des fraudes au président sur WhatsApp.',
      returnToChat: 'Retour au message',
      reportNow: 'Signaler la tentative',
      trapAlertTitle: 'Oups ! Ceci était une simulation de cyberattaque contrôlée.',
      trapAlertDesc: 'Vos mots de passe et données personnelles ne sont absolument pas compromis. Cet exercice vous aide à déceler les pièges du quotidien.',
      startTrainingNow: 'Suivre la formation maintenant (4 min)',
      reportSuccessTitle: 'Bravo ! Vous avez déjoué la cyberattaque.',
      reportSuccessDesc: 'Votre signalement a été instantanément enregistré dans le tableau de bord cyber de l\'entreprise.',
      finishSimulation: 'Terminer la simulation',
    },

    // Flash News Feature
    flash: {
      title: 'Flash Infos & Bulletins Collaborateurs',
      subtitle: 'Diffusez des articles courts et alertes d\'actualité pour maintenir vos équipes vigilantes au quotidien.',
      newArticle: 'Rédiger une alerte',
      sendToAll: 'Diffuser à l\'équipe',
      sentSuccess: 'Alerte envoyée avec succès aux collaborateurs !',
      readRate: 'Taux de lecture',
      audience: 'Audience ciblée',
      date: 'Date de diffusion',
      readArticle: 'Lire l\'article',
      articleLength: 'Lecture 2 min',
      pushVia: 'Canaux : Email interne & Notification WhatsApp Pro',
    },

    // Coach
    coach: {
      title: 'Vigilo Cyber Coach',
      subtitle: 'Moteur d\'analyse comportementale et d\'assistance cyber pour PME.',
      pillar1: '1. Génération de scénarios',
      pillar1Desc: 'Création de leurres réalistes et adaptés à votre secteur d\'activité.',
      pillar2: '2. Diagnostic comportemental',
      pillar2Desc: 'Identification des biais psychologiques et départements les plus exposés.',
      pillar3: '3. Remédiation & Re-test',
      pillar3Desc: 'Recommandation des micro-formations prioritaires et suivi du re-test.',
      generateButton: 'Générer un scénario sur-mesure',
      runAnalysis: 'Lancer l\'analyse comportementale',
      analyzing: 'Analyse des comportements en cours...',
    },
  },

  en: {
    // Brand & Slogan
    brandName: 'VIGILO',
    brandTagline: 'Measure and strengthen your team\'s cyber vigilance.',
    sloganShort: 'Simulate → Measure → Analyze → Train → Re-test',

    // Nav & Sidebar
    nav: {
      overview: 'Dashboard',
      campaigns: 'Campaigns',
      scenarios: 'Scenarios',
      coach: 'Vigilo Coach',
      trainings: 'Trainings',
      retest: 'Re-test & Metrics',
      flashNews: 'Security Flash',
      settings: 'Settings',
      landing: 'Home',
      enterConsole: 'Enter Console',
      liveTest: 'Test Live Simulation',
      switchTheme: 'Toggle theme',
      adminRole: 'Security IT Lead',
      activeCampaigns: 'active campaigns',
    },

    // Landing Page
    landing: {
      kicker: 'B2B SaaS Platform · Human Cyber Resilience',
      heroTitle: 'Measure and strengthen your team\'s cyber vigilance.',
      heroSubtitle: 'Run controlled attack simulations on Email and WhatsApp. Benchmark real human behavior and trigger targeted 4-minute micro-learning modules.',
      startCycle: 'Start VIGILO Cycle',
      simulateTrap: 'Test live simulation',
      standardsLabel: 'Operational standards & compatibility',
      cycleSectionTitle: 'The 5-Step VIGILO Architecture',
      cycleSectionDesc: 'A continuous, proven framework to reduce click rates below 8% and build intuitive reporting reflexes.',
      stepSimulate: 'Simulate',
      stepSimulateDesc: 'Deploy administrator-authorized simulation campaigns across Email and WhatsApp.',
      stepMeasure: 'Measure',
      stepMeasureDesc: 'Accurate tracking of open rates, compromise clicks, and rapid reporting reflexes.',
      stepAnalyze: 'Analyze',
      stepAnalyzeDesc: 'Vigilo Coach highlights psychological manipulation triggers and vulnerable departments.',
      stepTrain: 'Train',
      stepTrainDesc: 'Instant 4-minute interactive micro-trainings focused on concrete warning signs.',
      stepRetest: 'Re-test',
      stepRetestDesc: 'Measure progress with the exact same cohort at D+14 to validate true resilience.',
      featureWhatsappTitle: 'WhatsApp & Whishing Vector',
      featureWhatsappDesc: '82% of modern social engineering bypasses email filters. Simulate pixel-perfect WhatsApp attacks (CEO fraud, IT impersonation).',
      featureAdminTitle: 'Strict Admin Validation',
      featureAdminDesc: 'Ethical and legal safeguard. No simulation is launched without explicit administrator authorization.',
      featureDashboardTitle: 'Clear Non-SIEM Metrics',
      featureDashboardDesc: 'Designed for SMEs: view click and reporting rates by department with zero cumbersome SIEM overhead.',
      featureCoachTitle: 'Vigilo Cyber Coach',
      featureCoachDesc: 'Tailored risk mitigation advice and scenario creation adapted to your company tools.',
      trainingTitle: 'Targeted 4-Minute Micro-Trainings',
      trainingDesc: 'No more boring 45-minute lectures. Every module features a real-world scenario, warning signs, and a quick quiz.',
      exploreTrainings: 'Explore all modules',
      flashTitle: 'Security Bulletins & Employee News',
      flashDesc: 'Push quick security alerts and awareness articles with one click to keep your teams updated on new threats.',
      exploreFlash: 'Browse Flash Bulletins',
      finalCtaTitle: 'Ready to build human cyber resilience?',
      finalCtaDesc: 'Launch your first simulation in less than 3 minutes.',
      rightsReserved: 'All rights reserved. Designed for enterprise cybersecurity resilience and awareness.',
    },

    // WhatsApp & Simulator
    simulator: {
      title: 'Employee Experience Simulator',
      emailTab: 'Pro Email (Outlook)',
      whatsAppTab: 'WhatsApp Pro (Whishing)',
      backToInbox: 'Back to message',
      reportButton: 'Report to VIGILO',
      counterCallButton: 'Test Counter-Call',
      simulateClick: 'Simulate Click (Trap)',
      unknownSender: 'Unknown number',
      online: 'online',
      typing: 'is typing...',
      sendPlaceholder: 'Reply on WhatsApp...',
      quickRepliesLabel: 'Quick answers:',
      quickCall: '📞 Calling your desk phone first',
      quickProcedure: '🔒 Follow ERP standard procedure',
      quickOpen: '⚠️ Sure, opening the link',
      counterCallModalTitle: 'Golden Rule: Independent Counter-Call',
      counterCallModalDesc: 'You dial the executive\'s official internal extension (company directory):',
      counterCallSuccess: '"Hello? Marc speaking. An urgent wire via WhatsApp? Absolutely not, it is a scam!"',
      counterCallExplanation: 'Dialing an independent official number stops 100% of WhatsApp CEO fraud attempts.',
      returnToChat: 'Return to message',
      reportNow: 'Report attack',
      trapAlertTitle: 'Oops! This was a controlled cyberattack simulation.',
      trapAlertDesc: 'Your passwords and private accounts are completely safe. This drill helps you identify modern everyday traps.',
      startTrainingNow: 'Start training now (4 min)',
      reportSuccessTitle: 'Great job! You foiled the attack.',
      reportSuccessDesc: 'Your reporting reflex was immediately logged in the company security dashboard.',
      finishSimulation: 'Finish simulation',
    },

    // Flash News Feature
    flash: {
      title: 'Security Bulletins & Employee Flash Alerts',
      subtitle: 'Push bite-sized articles and breaking alerts to keep all employees updated on current cyber threats.',
      newArticle: 'Draft New Alert',
      sendToAll: 'Broadcast to Team',
      sentSuccess: 'Security alert successfully broadcasted to all employees!',
      readRate: 'Read Rate',
      audience: 'Target Audience',
      date: 'Broadcast Date',
      readArticle: 'Read Bulletin',
      articleLength: '2 min read',
      pushVia: 'Channels: Corporate Email & WhatsApp Pro notification',
    },

    // Coach
    coach: {
      title: 'Vigilo Cyber Coach',
      subtitle: 'Behavioral analysis engine and cyber resilience advisor for SMEs.',
      pillar1: '1. Scenario Generation',
      pillar1Desc: 'Generate tailored, realistic lures designed around your company software.',
      pillar2: '2. Behavioral Diagnostics',
      pillar2Desc: 'Spot psychological vulnerabilities and departments at risk.',
      pillar3: '3. Remediation & Re-test',
      pillar3Desc: 'Recommend priority micro-trainings and track progress on re-tests.',
      generateButton: 'Generate Custom Scenario',
      runAnalysis: 'Run Behavioral Analysis',
      analyzing: 'Analyzing team behavior...',
    },
  },
};

`

==================================================
FILE: src/services/api.ts
==================================================
`typescript
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

`

==================================================
FILE: src/data/mockData.ts
==================================================
`typescript
import { Campaign, Scenario, TrainingModule, ReTestRecord, SimulationProviderSettings, FlashArticle } from '../types';

export const INITIAL_SCENARIOS: Scenario[] = [
  {
    id: 'scen-phishing-m365',
    name: 'Phishing : Synchronisation & Alerte de sécurité Microsoft 365',
    category: 'Phishing',
    difficulty: 'Moyen',
    senderName: 'Microsoft 365 Identity Support',
    senderEmail: 'notifications@m365-security-alert.cloud',
    subject: 'Action requise : Votre mot de passe expire dans 4 heures (3 messages bloqués)',
    previewText: 'Imitation d une notification Microsoft Cloud incitant à débloquer des courriels',
    body: `<div style="font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#242424;max-width:600px;margin:0 auto;border:1px solid #e1dfdd;border-radius:6px;overflow:hidden;background:#ffffff;">
  <div style="background:#0078d4;padding:16px 24px;color:#ffffff;display:flex;align-items:center;">
    <span style="font-size:18px;font-weight:600;letter-spacing:-0.2px;">Microsoft 365 Security Center</span>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;margin-top:0;">Bonjour,</p>
    <p style="font-size:14px;line-height:1.5;">Votre politique d'accès d'entreprise requiert une confirmation d'identité régulière. <strong>3 courriels professionnels entrants</strong> sont actuellement retenus en quarantaine temporaire.</p>
    <div style="background:#fff4ce;border-left:4px solid #797673;padding:12px 16px;margin:20px 0;font-size:13px;">
      <strong>Délai restant : 3 heures 45 minutes</strong><br>Sans action de votre part, les accès aux outils collaboratifs (Teams, OneDrive) seront suspendus.
    </div>
    <div style="text-align:center;margin:28px 0;">
      <a href="#vigilo-trap-link" style="background:#0078d4;color:#ffffff;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:600;font-size:14px;display:inline-block;">Conserver mes accès et libérer mes emails</a>
    </div>
    <p style="font-size:12px;color:#605e5c;border-top:1px solid #edebe9;padding-top:16px;margin-bottom:0;">
      Identifiant de sécurité : MS-TENANT-984210 · Serveur de passerelle EMEA-WEST
    </p>
  </div>
</div>`,
    psychologicalTriggers: ['Urgence temporelle (4h)', 'Peur de rupture du flux de travail', 'Autorité de la marque Microsoft'],
    redFlags: [
      'Nom de domaine non officiel (m365-security-alert.cloud au lieu de microsoft.com)',
      'Menace de suspension immédiate des accès',
      'Lien d action redirigeant vers une page de collecte d identifiants',
    ],
    landingPageContent: 'Vous avez cliqué sur un lien simulé par VIGILO. Un attaquant aurait pu intercepter vos identifiants d entreprise. Suivez la micro-formation pour acquérir les réflexes de contrôle.',
  },
  {
    id: 'scen-fake-invoice-orange',
    name: 'Fake Invoice : Modification urgente de RIB Orange Business',
    category: 'Fake Invoice',
    difficulty: 'Difficile',
    senderName: 'Service Facturation Entreprises - Orange Business',
    senderEmail: 'recouvrement@orange-business-telecom.net',
    subject: 'URGENT : Nouvel IBAN pour règlement de la facture N° FR-8942-B',
    previewText: 'Usurpation de l opérateur télécom annonçant un changement de banque pour une facture échue',
    body: `<div style="font-family:Arial,sans-serif;color:#1e293b;max-width:620px;margin:0 auto;border:1px solid #cbd5e1;border-radius:6px;background:#ffffff;">
  <div style="background:#ff7900;padding:14px 20px;color:#ffffff;font-weight:700;font-size:16px;">
    ORANGE BUSINESS · Notification Trésorerie
  </div>
  <div style="padding:24px;">
    <p style="font-size:14px;margin-top:0;">Madame, Monsieur du service Comptabilité,</p>
    <p style="font-size:14px;line-height:1.6;">
      Dans le cadre de l'harmonisation de nos comptes bancaires d'encaissement européens et pour éviter tout rejet de virement lors de la clôture mensuelle, nous vous informons du <strong>changement de nos coordonnées bancaires</strong>.
    </p>
    <table style="width:100%;border-collapse:collapse;margin:18px 0;font-size:13px;background:#f8fafc;">
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Facture concernée :</td><td style="padding:8px;border:1px solid #e2e8f0;">FR-8942-B (Abonnements fibre & téléphonie)</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Montant à régler :</td><td style="padding:8px;border:1px solid #e2e8f0;">2 840,00 F CFA TTC</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Échéance :</td><td style="padding:8px;border:1px solid #e2e8f0;color:#dc2626;font-weight:bold;">Règlement sous 48 heures</td></tr>
    </table>
    <div style="text-align:center;margin:24px 0;">
      <a href="#vigilo-trap-link" style="background:#0f172a;color:#ffffff;padding:12px 24px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:13px;display:inline-block;">Télécharger le nouveau RIB certifié (PDF)</a>
    </div>
    <p style="font-size:12px;color:#64748b;">
      Attention : Ne plus effectuer de virement sur l'ancien IBAN sous peine de pénalités de retard.<br>
      Orange Business Services France S.A.
    </p>
  </div>
</div>`,
    psychologicalTriggers: ['Autorité administrative', 'Légitimité apparente du fournisseur récurrent', 'Peur de coupure de service internet'],
    redFlags: [
      'Demande de changement de RIB transmise uniquement par email',
      'Domaine orange-business-telecom.net non officiel',
      'Absence de procédure de contre-appel téléphonique de sécurité',
    ],
    landingPageContent: 'Alerte VIGILO : Vous venez de simuler le téléchargement d un faux RIB. La fraude au virement est l une des plus coûteuses pour les PME. Règle d or : toujours valider par téléphone sur un numéro préexistant.',
  },
  {
    id: 'scen-smishing-chronopost',
    name: 'Smishing : Colis en attente avec frais de douane',
    category: 'Smishing',
    difficulty: 'Facile',
    senderName: 'INFO-LIVRAISON',
    senderEmail: '+33 6 44 98 12 04',
    subject: 'SMS : Votre envoi n° 4R982 a rencontré une anomalie d adresse',
    previewText: 'Simulation par SMS d un colis bloqué invitant à cliquer sur un lien raccourci',
    body: `<div style="max-width:380px;margin:0 auto;background:#18181b;color:#f4f4f5;padding:20px;border-radius:16px;font-family:sans-serif;">
  <div style="text-align:center;font-size:12px;color:#a1a1aa;margin-bottom:16px;">Message SMS · INFO-COLIS</div>
  <div style="background:#27272a;padding:14px;border-radius:12px;font-size:14px;line-height:1.5;">
    Votre livraison professionnelle n° CP-981024 n'a pas pu être déposée. Merci de reprogrammer votre passage et régler 1,95 F CFA avant ce soir sur : <br><br>
    <a href="#vigilo-trap-link" style="color:#38bdf8;word-break:break-all;">https://suivi-relais-colis24.fr/step?id=9810</a>
  </div>
</div>`,
    psychologicalTriggers: ['Curiosité', 'Attente d un colis professionnel', 'Faible montant demandé pour abaisser la garde'],
    redFlags: ['Numéro mobile pour un transporteur national', 'Lien raccourci non officiel', 'Demande de carte bancaire pour un colis d entreprise'],
    landingPageContent: 'Simulation VIGILO Smishing : Ne cliquez jamais sur des liens SMS inattendus.',
  },
  {
    id: 'scen-mfa-fatigue',
    name: 'MFA Fatigue : Notifications push d approbation répétées',
    category: 'MFA Fatigue',
    difficulty: 'Difficile',
    senderName: 'Microsoft Authenticator Push Simulator',
    senderEmail: 'mfa-daemon@cloud-identity.internal',
    subject: 'Simulation : 5 notifications d approbation consécutives envoyées sur smartphone',
    previewText: 'Technique d harcèlement push incitant le collaborateur à valider par lassitude',
    body: `<div style="font-family:sans-serif;color:#0f172a;padding:20px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
  <p><strong>Simulation d attaque par bombardement MFA (Push Bombing) :</strong></p>
  <p>Le collaborateur reçoit 4 à 6 notifications consécutives 'Approuver la connexion ?' sur son téléphone à 23h30 ou durant une réunion.</p>
  <p>Objectif : tester si le collaborateur refuse et signale l incident immédiatement, ou s il clique par mégarde sur 'Approuver'.</p>
</div>`,
    psychologicalTriggers: ['Fatigue cognitive', 'Lassitude', 'Inattention en situation multitâche'],
    redFlags: ['Demande de code ou de confirmation sans action de connexion en cours', 'Heures indues'],
    landingPageContent: 'Simulation MFA Fatigue VIGILO : Toute notification push inattendue doit être refusée et signalée immédiatement à l équipe IT.',
  },
  {
    id: 'scen-whatsapp-ceo-fraud',
    name: 'WhatsApp Phishing : Fraude au Président (CEO Urgent Wire)',
    category: 'WhatsApp Phishing',
    difficulty: 'Difficile',
    senderName: 'Marc V. (PDG - Direction Générale)',
    senderEmail: '+33 6 88 12 94 02',
    subject: 'WhatsApp : Négociation confidentielle d\'urgence — Validation bon de commande',
    previewText: 'Usurpation WhatsApp du chef d\'entreprise avec prétexte de réunion secrète pour contourner les procédures',
    body: `<div style="max-width:380px;margin:0 auto;background:#111b21;color:#e9edef;padding:16px;border-radius:12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;">
  <div style="background:#202c33;padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:12px;">
    <strong style="color:#00a884;">Marc V. (PDG)</strong> · +33 6 88 12 94 02<br>
    <span style="color:#8696a0;font-size:11px;">En réunion confidentielle</span>
  </div>
  <div style="background:#202c33;padding:12px;border-radius:8px;font-size:13px;line-height:1.4;">
    Bonjour, c'est Marc. Je suis en négociation client fermée (NDA). J'ai un besoin critique : notre fournisseur IT menace de couper les serveurs si on ne valide pas l'acompte avant 12h. Peux-tu te connecter tout de suite sur le portail d'approbation et valider ? C'est strictement confidentiel :<br><br>
    <a href="#vigilo-trap-link" style="color:#53bdeb;word-break:break-all;text-decoration:none;font-weight:bold;">👉 https://validation-tresorerie-groupe.net/auth</a><br><br>
    Ne m'appelle pas, je ne peux pas décrocher en réunion. Confirme-moi par message dès que c'est fait.
  </div>
</div>`,
    psychologicalTriggers: ['Autorité hiérarchique directe', 'Faux secret/confidentialité (NDA)', 'Urgence temporelle (avant 12h)'],
    redFlags: [
      'Numéro de portable non répertorié dans l\'annuaire d\'entreprise',
      'Interdiction explicite d\'appeler par téléphone',
      'Contournement des procédures normales d\'approbation financière',
      'Lien externe vers validation-tresorerie-groupe.net',
    ],
    landingPageContent: 'Simulation VIGILO Whishing WhatsApp : 100% des fraudes au président sont stoppées net par un contre-appel au numéro fixe officiel connu du dirigeant.',
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
          text: 'Bonjour, c\'est Marc. Je suis actuellement en réunion d\'affaires fermée sous clause de confidentialité (NDA) avec nos auditeurs.',
          timestamp: '10:41',
          status: 'read',
        },
        {
          id: 'wa-2',
          sender: 'attacker',
          text: 'J\'ai un besoin critique et urgent : notre prestataire d\'infrastructure menace de suspendre les accès si l\'acompte exceptionnel n\'est pas confirmé avant midi.',
          timestamp: '10:42',
          status: 'read',
        },
        {
          id: 'wa-3',
          sender: 'attacker',
          text: 'Peux-tu te connecter tout de suite sur le portail d\'approbation rapide et valider le bon de commande ? C\'est strictement confidentiel, ne préviens personne d\'autre pour l\'instant :',
          timestamp: '10:43',
          status: 'read',
          hasLink: true,
          linkUrl: 'https://validation-tresorerie-groupe.net/auth?token=sec-98124',
          linkText: 'Accès portail virement d\'urgence · validation-tresorerie-groupe.net',
        },
        {
          id: 'wa-4',
          sender: 'attacker',
          text: 'Ne m\'appelle pas sur ce numéro, je ne peux pas décrocher en réunion. Confirme-moi ici par message dès que tu as validé.',
          timestamp: '10:44',
          status: 'read',
        },
      ],
      quickReplies: ['Je vérifie avec la compta', 'D\'accord, j\'ouvre le lien', 'Je t\'appelle sur ton fixe'],
      safeActionAdvised: 'Composer le numéro de téléphone fixe officiel du dirigeant pour valider la demande.',
    },
  },
  {
    id: 'scen-whatsapp-it-portal',
    name: 'WhatsApp Phishing : Faux Support IT & Réinitialisation MFA',
    category: 'WhatsApp Phishing',
    difficulty: 'Moyen',
    senderName: 'Astreinte Sécurité IT Groupe',
    senderEmail: '+33 7 56 42 19 80',
    subject: 'WhatsApp : Alerte intrusion détectée — Réinitialisez votre token MFA',
    previewText: 'Message d\'usurpation du support informatique prétextant une attaque en cours sur le compte du collaborateur',
    body: `<div style="max-width:380px;margin:0 auto;background:#111b21;color:#e9edef;padding:16px;border-radius:12px;font-family:sans-serif;">
  <div style="background:#202c33;padding:12px;border-radius:8px;font-size:13px;line-height:1.4;">
    ⚠️ [ALERTE SÉCURITÉ IT] Bonjour, une connexion suspecte depuis l'étranger a été détectée sur votre compte Office 365 / VPN à 09h18. Afin d'éviter la désactivation préventive de vos accès entreprise, veuillez renouveler votre clé de sécurité MFA sur notre portail d'astreinte :<br><br>
    <a href="#vigilo-trap-link" style="color:#53bdeb;word-break:break-all;">https://portail-m365-helpdesk.cloud/renew-token</a>
  </div>
</div>`,
    psychologicalTriggers: ['Peur de la sanction', 'Urgence technique', 'Autorité du support informatique'],
    redFlags: [
      'Le support informatique de l\'entreprise ne contacte jamais les salariés sur WhatsApp privé',
      'Menace de coupure immédiate des accès',
      'Domaine web portail-m365-helpdesk.cloud non conforme',
    ],
    landingPageContent: 'Simulation VIGILO WhatsApp IT : Ne confiez jamais vos identifiants ou vos codes MFA suite à un message sur WhatsApp ou SMS.',
    whatsappDetails: {
      senderPhoneNumber: '+33 7 56 42 19 80',
      senderTitle: 'Astreinte Sécurité IT Groupe',
      avatarText: 'IT',
      avatarBgColor: '#0284c7',
      isOnline: true,
      messages: [
        {
          id: 'wa-it-1',
          sender: 'attacker',
          text: '⚠️ [URGENT · DSI GROUPE] Bonjour, une tentative d\'intrusion anormale a été détectée sur votre compte professionnel à 09h18.',
          timestamp: '09:22',
          status: 'read',
        },
        {
          id: 'wa-it-2',
          sender: 'attacker',
          text: 'Pour bloquer l\'attaquant et éviter la suspension immédiate de votre messagerie, vous devez valider votre identité sur notre portail d\'astreinte sécurisé sous 15 minutes :',
          timestamp: '09:23',
          status: 'read',
          hasLink: true,
          linkUrl: 'https://portail-m365-helpdesk.cloud/renew-token',
          linkText: 'Portail d\'astreinte MFA · portail-m365-helpdesk.cloud',
        },
      ],
      quickReplies: ['J\'ouvre le lien', 'Je contacte l\'IT sur Slack interne'],
      safeActionAdvised: 'Contacter l\'équipe IT via le canal officiel interne (Slack, Teams, ou téléphone direct).',
    },
  },
  {
    id: 'scen-whatsapp-quishing',
    name: 'WhatsApp Quishing : Faux QR Code de synchronisation d\'appareil Pro',
    category: 'WhatsApp Phishing',
    difficulty: 'Difficile',
    senderName: 'WhatsApp Business Sécurité Entreprise',
    senderEmail: '+33 6 19 02 88 41',
    subject: 'WhatsApp : Synchronisation requise de votre session pour le travail hybride',
    previewText: 'Attaque par Quishing (QRLJacking) incitant à scanner un QR code pour voler la session WhatsApp de la victime',
    body: `<div style="max-width:380px;margin:0 auto;background:#111b21;color:#e9edef;padding:16px;border-radius:12px;font-family:sans-serif;">
  <p>Nouvelle politique de sécurité entreprise : veuillez scanner le QR code ci-dessous depuis vos réglages WhatsApp pour maintenir votre poste connecté.</p>
</div>`,
    psychologicalTriggers: ['Routine informatique', 'Curiosité technologique', 'Illusion de légitimité'],
    redFlags: [
      'Demande de scan de QR code sur un écran inconnu',
      'Technique de détournement de session WhatsApp Web (QRLJacking)',
    ],
    landingPageContent: 'Simulation VIGILO Quishing WhatsApp : Ne scannez jamais un QR code inattendu dans WhatsApp.',
    whatsappDetails: {
      senderPhoneNumber: '+33 6 19 02 88 41',
      senderTitle: 'WhatsApp Business Sécurité Entreprise',
      avatarText: 'WB',
      avatarBgColor: '#10b981',
      isOnline: false,
      lastSeen: 'vu aujourd\'hui à 08:30',
      messages: [
        {
          id: 'wa-q-1',
          sender: 'attacker',
          text: 'Mise à niveau de conformité entreprise : Dans le cadre de la protection des données professionnelles, veuillez valider la synchronisation de votre appareil en scannant le badge numérique joint.',
          timestamp: '08:30',
          status: 'read',
          hasAttachment: true,
          attachmentName: 'Badge_Securite_Synchronisation_Poste.pdf',
          attachmentType: 'qr',
        },
      ],
      safeActionAdvised: 'Ne jamais scanner de QR Code inconnu sans confirmation auprès de la DSI.',
    },
  },
];

export const INITIAL_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-01-m365',
    name: 'Campagne Phishing T3 — Alerte M365 Quarantaine',
    description: 'Campagne de mesure initiale du niveau de vigilance de l ensemble des collaborateurs face à une usurpation de messagerie cloud.',
    scenarioId: 'scen-phishing-m365',
    scenarioName: 'Phishing : Synchronisation & Alerte de sécurité Microsoft 365',
    category: 'Phishing',
    difficulty: 'Moyen',
    targetGroup: 'Tous les collaborateurs',
    status: 'terminée',
    createdAt: '2026-09-10T08:00:00Z',
    launchedAt: '2026-09-12T09:30:00Z',
    completedAt: '2026-09-15T18:00:00Z',
    targeted: 32,
    delivered: 32,
    opened: 27,
    clicked: 8,
    reported: 19,
    clickRate: 25,
    reportRate: 59,
    medianReactionTimeMinutes: 14,
    departments: [
      { name: 'Direction & Finance', targeted: 6, opened: 6, clicked: 2, reported: 4, clickRate: 33.3, reportRate: 66.7 },
      { name: 'Équipe Commerciale', targeted: 10, opened: 9, clicked: 4, reported: 5, clickRate: 40.0, reportRate: 50.0 },
      { name: 'Ressources Humaines', targeted: 5, opened: 4, clicked: 1, reported: 3, clickRate: 20.0, reportRate: 60.0 },
      { name: 'Technique & Dev', targeted: 11, opened: 8, clicked: 1, reported: 7, clickRate: 9.1, reportRate: 63.6 },
    ],
    aiAnalysis: {
      executiveSummary: 'La campagne enregistre un taux de compromission de 25% (8 clics sur 32) et un taux de réflexe défensif honorable de 59%. Les équipes commerciales et financières sont les plus réactives aux faux sentiments d urgence.',
      riskLevel: 'Élevé',
      vulnerabilityFactor: 'Le sentiment d urgence (délai de 4 heures avant coupure) et la crainte de perdre des courriels professionnels ont court-circuité la vérification de l URL expéditrice.',
      departmentVulnerabilities: [
        { department: 'Équipe Commerciale', riskScore: '8/10', comment: 'Forte tendance à cliquer rapidement pour ne manquer aucun prospect ou email client.' },
        { department: 'Direction & Finance', riskScore: '7/10', comment: 'Vulnérabilité face aux demandes d authentification administrative.' },
        { department: 'Ressources Humaines', riskScore: '5/10', comment: 'Niveau de vigilance moyen, signalements réguliers.' },
        { department: 'Technique & Dev', riskScore: '3/10', comment: 'Bon réflexe de vérification des en-têtes et du nom de domaine.' },
      ],
      recommendations: [
        'Organiser la micro-formation VIGILO de 4 minutes axée sur la détection des fausses URLs de messagerie.',
        'Sensibiliser particulièrement l équipe commerciale au survol systématique des liens avant tout clic.',
        'Programmer un re-test à J+14 pour valider la réduction du taux de clic sous le seuil critique des 10%.'
      ],
      trainingAdvice: 'Le taux de clic de 25% indique un risque important concernant les demandes urgentes liées aux accès Microsoft 365. Nous recommandons une formation de 4 minutes sur la détection des faux écrans de connexion.',
      analyzedAt: '2026-09-15T18:30:00Z',
    },
    associatedTrainingId: 'train-phishing-m365',
    reTestChildId: 'camp-03-m365-retest',
  } as any,
  {
    id: 'camp-02-invoice',
    name: 'Campagne Fake Invoice — Clôture Fournisseur Orange',
    description: 'Simulation ciblée sur les équipes habilitées aux virements pour mesurer la résistance à la fraude au faux président et faux RIB.',
    scenarioId: 'scen-fake-invoice-orange',
    scenarioName: 'Fake Invoice : Modification urgente de RIB Orange Business',
    category: 'Fake Invoice',
    difficulty: 'Difficile',
    targetGroup: 'Direction & Finance',
    status: 'en_cours',
    createdAt: '2026-09-20T10:00:00Z',
    launchedAt: '2026-09-24T08:00:00Z',
    targeted: 12,
    delivered: 12,
    opened: 11,
    clicked: 3,
    reported: 7,
    clickRate: 25,
    reportRate: 58.3,
    medianReactionTimeMinutes: 28,
    departments: [
      { name: 'Direction Générale', targeted: 3, opened: 3, clicked: 1, reported: 2, clickRate: 33.3, reportRate: 66.7 },
      { name: 'Comptabilité & Trésorerie', targeted: 9, opened: 8, clicked: 2, reported: 5, clickRate: 22.2, reportRate: 55.6 },
    ],
  },
  {
    id: 'camp-03-m365-retest',
    name: 'Re-test Phishing T3 — Alerte M365 (Post-Formation)',
    description: 'Campagne de re-test menée auprès de la même cohorte de 32 collaborateurs après complétion de la micro-formation VIGILO.',
    scenarioId: 'scen-phishing-m365',
    scenarioName: 'Phishing : Synchronisation & Alerte de sécurité Microsoft 365',
    category: 'Phishing',
    difficulty: 'Moyen',
    targetGroup: 'Tous les collaborateurs',
    status: 'terminée',
    createdAt: '2026-09-22T08:00:00Z',
    launchedAt: '2026-09-23T09:00:00Z',
    completedAt: '2026-09-24T17:00:00Z',
    targeted: 32,
    delivered: 32,
    opened: 29,
    clicked: 2,
    reported: 26,
    clickRate: 6.25,
    reportRate: 81.25,
    medianReactionTimeMinutes: 6,
    departments: [
      { name: 'Direction & Finance', targeted: 6, opened: 6, clicked: 0, reported: 6, clickRate: 0.0, reportRate: 100.0 },
      { name: 'Équipe Commerciale', targeted: 10, opened: 10, clicked: 1, reported: 8, clickRate: 10.0, reportRate: 80.0 },
      { name: 'Ressources Humaines', targeted: 5, opened: 5, clicked: 1, reported: 4, clickRate: 20.0, reportRate: 80.0 },
      { name: 'Technique & Dev', targeted: 11, opened: 8, clicked: 0, reported: 8, clickRate: 0.0, reportRate: 72.7 },
    ],
    isReTest: true,
    baselineCampaignId: 'camp-01-m365',
  },
  {
    id: 'camp-04-whatsapp-ceo',
    name: 'Campagne Whishing WhatsApp — Fraude au Président',
    description: 'Test en conditions réelles de résistance au phishing WhatsApp usurpant le dirigeant en négociation confidentielle.',
    scenarioId: 'scen-whatsapp-ceo-fraud',
    scenarioName: 'WhatsApp Phishing : Fraude au Président (CEO Urgent Wire)',
    category: 'WhatsApp Phishing',
    difficulty: 'Difficile',
    targetGroup: 'Direction & Finance',
    status: 'en_cours',
    createdAt: '2026-09-24T14:00:00Z',
    launchedAt: '2026-09-25T08:30:00Z',
    targeted: 12,
    delivered: 12,
    opened: 11,
    clicked: 3,
    reported: 7,
    clickRate: 25.0,
    reportRate: 58.3,
    medianReactionTimeMinutes: 8,
    departments: [
      { name: 'Direction Générale', targeted: 4, opened: 4, clicked: 1, reported: 3, clickRate: 25.0, reportRate: 75.0 },
      { name: 'Comptabilité & Trésorerie', targeted: 8, opened: 7, clicked: 2, reported: 4, clickRate: 25.0, reportRate: 50.0 },
    ],
    aiAnalysis: {
      executiveSummary: 'Sur le canal WhatsApp, la vigilance baisse de 35% par rapport à l email en raison de l intimité perçue du canal et de la pression d urgence attribuée au PDG.',
      riskLevel: 'Élevé',
      vulnerabilityFactor: 'L utilisation du canal WhatsApp et l interdiction d appeler pour cause de réunion fermée (NDA) créent un contournement efficace des réflexes habituels.',
      departmentVulnerabilities: [
        { department: 'Comptabilité & Trésorerie', riskScore: '7.5/10', comment: 'Pression forte face aux demandes d acomptes fournisseurs sous contrainte de temps.' },
        { department: 'Direction Générale', riskScore: '5/10', comment: 'Bonne réactivité mais 1 collaborateur a validé sans contre-appel.' },
      ],
      recommendations: [
        'Instaurer une règle formelle : AUCUN ordre de paiement ou de validation d accès ne doit être exécuté suite à un message WhatsApp sans contre-appel vocal.',
        'Diffuser la micro-formation VIGILO sur le Whishing et la fraude au président.',
        'Planifier un re-test WhatsApp à J+21.',
      ],
      trainingAdvice: 'Former spécifiquement les assistants de direction et la comptabilité au réflexe systématique du contre-appel indépendant.',
      analyzedAt: '2026-09-25T09:15:00Z',
    },
    associatedTrainingId: 'train-whatsapp-whishing',
  },
];

export const INITIAL_TRAININGS: TrainingModule[] = [
  {
    id: 'train-phishing-m365',
    title: 'Démasquer les emails de phishing M365 & Cloud',
    category: 'Phishing',
    difficulty: 'Moyen',
    targetAudience: 'Tous les collaborateurs',
    durationMinutes: 4,
    completedCount: 28,
    totalAssigned: 32,
    campaignId: 'camp-01-m365',
    situation: {
      context: 'Un email apparemment envoyé par le support technique Microsoft ou le service informatique interne vous avertit que vos emails professionnels vont être bloqués sous 4 heures si vous ne validez pas votre compte.',
      sampleSnippet: '« Action requise : Votre mot de passe expire dans 4 heures. Cliquez ici pour libérer vos courriels retenus en quarantaine. »',
    },
    warningSigns: [
      {
        sign: 'Le domaine d expéditeur trompeur',
        description: 'Le nom d affichage indique "Microsoft Security", mais l adresse réelle est "@m365-security-alert.cloud" au lieu de microsoft.com.',
      },
      {
        sign: 'Le sentiment d urgence artificielle',
        description: 'L ultimatum de 4 heures est un levier psychologique conçu pour vous empêcher de réfléchir ou de poser une question.',
      },
      {
        sign: 'L URL cachée derrière le bouton',
        description: 'Au survol du curseur, le bouton renvoie vers un domaine tiers qui collecte les mots de passe et les sessions.',
      },
    ],
    correctReaction: {
      rule: 'Règle d or VIGILO : Ne cliquez jamais sous le coup de l urgence. Survolez le lien et signalez.',
      steps: [
        '1. Survolez le lien avec votre souris sans cliquer pour lire la véritable adresse de destination.',
        '2. En cas de doute sur votre compte professionnel, connectez-vous directement sur portal.office.com via vos favoris habituels.',
        '3. Cliquez sur le bouton "Signaler à VIGILO / Sécurité" intégré à votre messagerie pour protéger vos collègues.',
      ],
    },
    miniQuiz: {
      question: 'Vous recevez un courriel urgent affirmant que 3 emails importants sont bloqués et demandant votre mot de passe pour les débloquer. Quelle est la réaction recommandée ?',
      options: [
        'Cliquer sur le lien pour vérifier si vos identifiants fonctionnent encore.',
        'Survoler le lien sans cliquer, constater le domaine non officiel, et cliquer sur le bouton VIGILO de signalement.',
        'Répondre au courriel en demandant à l expéditeur de renvoyer les messages bloqués.',
      ],
      correctIndex: 1,
      explanation: 'Parfait ! Le survol du lien sans clic permet de déceler la supercherie en quelques secondes, et le signalement immédiat déclenche l alerte pour toute l entreprise.',
    },
  },
  {
    id: 'train-fake-invoice-orange',
    title: 'Fraude au faux RIB : Protéger les virements d entreprise',
    category: 'Fake Invoice',
    difficulty: 'Difficile',
    targetAudience: 'Direction & Finance',
    durationMinutes: 4,
    completedCount: 10,
    totalAssigned: 12,
    campaignId: 'camp-02-invoice',
    situation: {
      context: 'Un fournisseur habituel vous adresse une facture échue avec une mention urgente : "Nos coordonnées bancaires ont changé suite à une fusion, merci d utiliser le nouveau RIB joint sous peine de suspension de contrat".',
      sampleSnippet: '« URGENT : Nouvel IBAN pour règlement de la facture N° FR-8942-B sous 48h. »',
    },
    warningSigns: [
      {
        sign: 'Changement d IBAN transmis par simple email',
        description: 'Les escrocs s introduisent dans les messageries ou imitent les adresses pour détourner des montants importants.',
      },
      {
        sign: 'Pression sur l échéance et menaces de coupure',
        description: 'La contrainte de temps réduit la vigilance habituelle des gestionnaires administratifs et financiers.',
      },
      {
        sign: 'Légères variations dans le nom de domaine de l expéditeur',
        description: 'Exemple : orange-business-telecom.net au lieu du domaine contractuel de votre opérateur.',
      },
    ],
    correctReaction: {
      rule: 'La règle du contre-appel : Tout changement de RIB doit faire l objet d un appel téléphonique sur un numéro connu.',
      steps: [
        '1. Ne jamais modifier un RIB dans votre logiciel ou auprès de la banque sur la foi d un courriel.',
        '2. Téléphoner au fournisseur en utilisant exclusivement le numéro répertorié dans votre annuaire ou contrat d origine (jamais celui du mail suspect).',
        '3. Faire valider le changement par un double signataire et alerter la direction financière.',
      ],
    },
    miniQuiz: {
      question: 'Un fournisseur de longue date vous transmet un nouveau RIB par email avec papier à en-tête certifié. Que devez-vous faire avant tout paiement ?',
      options: [
        'Exécuter le virement immédiatement car le papier à en-tête semble tout à fait authentique.',
        'Appeler le comptable habituel du fournisseur sur son numéro enregistré dans l ERP pour confirmer de vive voix le changement de banque.',
        'Demander confirmation en répondant simplement "Répondre à" dans le courriel reçu.',
      ],
      correctIndex: 1,
      explanation: 'Exact ! Seul le contre-appel sur un numéro préexistant et indépendant garantit que vous parlez au véritable interlocuteur et non à un pirate.',
    },
  },
  {
    id: 'train-quishing-qr',
    title: 'Quishing : Les pièges des QR codes piégés en entreprise',
    category: 'QR Code (Quishing)',
    difficulty: 'Moyen',
    targetAudience: 'Tous les collaborateurs',
    durationMinutes: 3,
    completedCount: 22,
    totalAssigned: 32,
    situation: {
      context: 'Vous trouvez une affichette dans la salle de pause ou recevez un PDF avec un QR code stipulant : "Migration obligatoire Wi-Fi Entreprise / Mise à jour RH - Scannez avec votre mobile personnel".',
      sampleSnippet: '« Scannez ce QR Code pour valider votre certificat de sécurité mobile sous peine de déconnexion. »',
    },
    warningSigns: [
      {
        sign: 'QR Code pour une procédure d entreprise interne',
        description: 'Les attaquants contournent les filtres antispam de messagerie car les logiciels d analyse ont plus de difficulté à analyser le contenu d une image QR.',
      },
      {
        sign: 'Redirection vers un nom de domaine raccourci sur mobile',
        description: 'L écran restreint du smartphone masque souvent l URL réelle lors du scan.',
      },
      {
        sign: 'Demande de saisie de mot de passe professionnel sur téléphone perso',
        description: 'Les attaques par Quishing visent à contourner les protections EDR installées sur les PC de bureau.',
      },
    ],
    correctReaction: {
      rule: 'Ne scannez jamais un QR code professionnel sans canal de confirmation officiel.',
      steps: [
        '1. Ne scannez pas de QR code provenant d un email ou d un PDF pour vous connecter à un service pro.',
        '2. Si une mise à jour réseau ou RH est réelle, elle figure dans le portail intranet accessible depuis votre navigateur favori.',
        '3. Signalez le PDF ou l affiche suspecte au responsable informatique via VIGILO.',
      ],
    },
    miniQuiz: {
      question: 'Vous recevez un email avec un QR Code prétendant mettre à jour votre authentificateur Microsoft MFA. Que faites-vous ?',
      options: [
        'Je le scanne directement avec mon smartphone personnel pour gagner du temps.',
        'Je refuse de le scanner et je me rends sur mon espace officiel de sécurité Microsoft via mon navigateur de travail pour vérifier.',
        'Je le transfère à mon collègue de bureau pour voir si ça marche chez lui.',
      ],
      correctIndex: 1,
      explanation: 'Le réflexe souverain : jamais de scan aveugle ! Se rendre sur l adresse officielle connue est la seule méthode sûre.',
    },
  },
  {
    id: 'train-mfa-push-bombing',
    title: 'MFA Fatigue : Déjouer le harcèlement de notifications push',
    category: 'MFA Fatigue',
    difficulty: 'Difficile',
    targetAudience: 'Technique & Dev, Direction',
    durationMinutes: 4,
    completedCount: 19,
    totalAssigned: 26,
    situation: {
      context: 'À 22h45 ou au beau milieu d une réunion dense, votre téléphone vibre 5 fois de suite avec la notification Microsoft Authenticator : "Approuvez-vous la connexion à Paris, France ? [Oui / Non]".',
      sampleSnippet: '« Notification d authentification : Approuver la connexion ? (Tentative 4 sur 5) »',
    },
    warningSigns: [
      {
        sign: 'Notifications répétées sans tentative de connexion de votre part',
        description: 'L attaquant dispose déjà de votre mot de passe et tente de vous user psychologiquement pour que vous appuyiez sur "Oui" par inadvertance ou pour faire cesser les bips.',
      },
      {
        sign: 'Horaires inhabituels ou localisation géographique anormale',
        description: 'Les vagues de push bombing surviennent souvent la nuit ou le week-end.',
      },
      {
        sign: 'Sentiment d exaspération ou de lassitude',
        description: 'Le pirate compte précisément sur votre fatigue pour court-circuiter votre esprit critique.',
      },
    ],
    correctReaction: {
      rule: 'Cliquez sur "NON / Refuser" et changez immédiatement votre mot de passe.',
      steps: [
        '1. Appuyez sur "Refuser" ou "Ce n est pas moi" sur chaque notification push non sollicitée.',
        '2. Ne cédez JAMAIS en cliquant "Oui" juste pour faire cesser les alertes sonores.',
        '3. Modifiez sans attendre votre mot de passe de messagerie et avertissez l équipe IT VIGILO.',
      ],
    },
    miniQuiz: {
      question: 'Votre téléphone reçoit 4 demandes d approbation MFA consécutives alors que vous êtes en train de dîner. Quelle décision protège l entreprise ?',
      options: [
        'Cliquer "Oui" pour que le téléphone s arrête de vibrer et voir qui se connecte.',
        'Cliquer "Refuser / Non", couper la notification et avertir l administrateur IT car mon mot de passe est probablement compromis.',
        'Éteindre mon téléphone et attendre le lendemain sans rien faire.',
      ],
      correctIndex: 1,
      explanation: 'Parfait ! Une notification inattendue signifie qu un tiers possède votre mot de passe. Cliquer "Refuser" bloque l accès, et le signalement permet la réinitialisation d urgence.',
    },
  },
  {
    id: 'train-ransomware-macros',
    title: 'Ransomware : Détecter les pièces jointes piégées & macros Office',
    category: 'Ransomware',
    difficulty: 'Difficile',
    targetAudience: 'Tous les collaborateurs',
    durationMinutes: 5,
    completedCount: 24,
    totalAssigned: 32,
    situation: {
      context: 'Un courriel d apparence officielle contient une pièce jointe Excel ou Word intitulée "Devis_Signe_Urgent_3941.xlsm" ou une archive ZIP avec un mot de passe fourni dans le corps du texte.',
      sampleSnippet: '« Veuillez activer le contenu et les macros pour visualiser ce document chiffré par notre service juridique. »',
    },
    warningSigns: [
      {
        sign: 'Demande explicite d "Activer les macros / Activer le contenu"',
        description: 'Les pirates cachent du code malveillant (droppers) qui télécharge le rançongiciel dès que vous activez les macros.',
      },
      {
        sign: 'Archive protégée par un mot de passe dans l email',
        description: 'Cette technique sert à empêcher l antivirus de la messagerie de scanner le contenu de la pièce jointe.',
      },
      {
        sign: 'Double extension vicieuse (ex: Facture.pdf.exe ou document.vbs)',
        description: 'L extension finale réelle est un fichier exécutable conçu pour infecter votre machine.',
      },
    ],
    correctReaction: {
      rule: 'N activez JAMAIS les macros Office sur un fichier reçu de l extérieur.',
      steps: [
        '1. Ne cliquez jamais sur le ruban jaune "Activer le contenu" pour un document inattendu.',
        '2. Ne décompressez pas de fichiers protégés par un mot de passe envoyé par un tiers inconnu.',
        '3. Si vous avez ouvert le fichier par erreur, déconnectez immédiatement votre câble réseau et le Wi-Fi, puis appelez l IT.',
      ],
    },
    miniQuiz: {
      question: 'Un fichier Excel s ouvre avec une bannière jaune : "Les macros ont été désactivées. Activer le contenu pour voir le devis". Que devez-vous faire ?',
      options: [
        'Cliquer sur "Activer le contenu" car sinon les calculs du devis ne s afficheront pas.',
        'Laisser la bannière désactivée, fermer le fichier et le signaler immédiatement comme potentiellement dangereux.',
        'Enregistrer le fichier sur le serveur partagé de l entreprise pour que le responsable l ouvre.',
      ],
      correctIndex: 1,
      explanation: 'Exactement ! L activation des macros accorde à l attaquant les droits d exécuter des scripts sur votre système.',
    },
  },
  {
    id: 'train-social-engineering-phone',
    title: 'Social Engineering : La fraude au faux technicien informatique',
    category: 'Social Engineering',
    difficulty: 'Difficile',
    targetAudience: 'Tous les collaborateurs',
    durationMinutes: 4,
    completedCount: 16,
    totalAssigned: 32,
    situation: {
      context: 'Vous recevez un appel téléphonique d une personne très polie et assurée se présentant comme "Marc du support informatique délégué" qui vous demande de lui installer AnyDesk ou de lui dicter un code reçu par SMS pour une maintenance urgente.',
      sampleSnippet: '« Bonjour, nous détectons des paquets anormaux sur votre poste. Je vous envoie un code de sécurité par SMS, donnez-le-moi pour que je nettoie votre machine. »',
    },
    warningSigns: [
      {
        sign: 'Demande orale d un code reçu par SMS ou notification',
        description: 'Aucun support informatique légitime n a besoin de votre code SMS personnel pour dépanner un poste.',
      },
      {
        sign: 'Installation demandée d un logiciel d accès distant tiers',
        description: 'AnyDesk, TeamViewer ou RustDesk utilisés pour prendre le contrôle total de votre ordinateur.',
      },
      {
        sign: 'Refus de vous laisser rappeler par le standard de la société',
        description: 'L appelant insiste sur l urgence pour que vous ne raccrochiez pas.',
      },
    ],
    correctReaction: {
      rule: 'Raccrochez poliment et rappelez le numéro officiel de votre service informatique.',
      steps: [
        '1. Ne donnez JAMAIS aucun code temporaire, mot de passe ou validation par téléphone.',
        '2. Refusez toute installation de logiciel de contrôle distant demandée par un appel entrant.',
        '3. Raccrochez et informez immédiatement votre direction ou le référent cybersécurité.',
      ],
    },
    miniQuiz: {
      question: 'Une personne au téléphone affirme être du support informatique et vous demande le code à 6 chiffres que vous venez de recevoir par SMS. Que faites-vous ?',
      options: [
        'Je lui donne le code car il s agit du support informatique interne de la société.',
        'Je refuse catégoriquement, je raccroche et je signale la tentative d usurpation au responsable IT.',
        'Je lui demande son matricule d entreprise avant de lui dicter le code.',
      ],
      correctIndex: 1,
      explanation: 'Bravo ! Les codes SMS sont strictement personnels. Même un administrateur réseau n a jamais le droit de vous demander votre second facteur.',
    },
  },
  {
    id: 'train-whatsapp-whishing',
    title: 'Déjouer le phishing & les arnaques sur WhatsApp (Whishing & Fraude au Président)',
    category: 'WhatsApp Phishing',
    difficulty: 'Moyen',
    targetAudience: 'Tous les collaborateurs, Direction & Cadres',
    durationMinutes: 4,
    completedCount: 19,
    totalAssigned: 32,
    campaignId: 'camp-04-whatsapp-ceo',
    situation: {
      context: 'Un contact inconnu sur WhatsApp ou messagerie instantanée utilise le nom et la photo de votre PDG ou directeur financier, prétextant une réunion secrète pour vous ordonner une validation urgente ou un virement sans passer par les circuits habituels.',
      sampleSnippet: '« Bonjour, c\'est Marc le PDG. Je suis en réunion fermée sous NDA. J\'ai un besoin critique : valide vite ce bon de commande sur ce lien avant 12h, ne m\'appelle pas. »',
    },
    warningSigns: [
      {
        sign: 'Le numéro mobile inconnu ou non répertorié',
        description: 'La photo de profil et le nom sont facilement copiés depuis LinkedIn ou le site web de l\'entreprise. Le numéro réel ne correspond pas à l\'annuaire d\'entreprise.',
      },
      {
        sign: 'L\'interdiction formelle d\'appeler par téléphone',
        description: 'L\'attaquant invente un prétexte (« en réunion confidentielle », « pas de réseau ») pour vous empêcher de vérifier son identité à la voix.',
      },
      {
        sign: 'La pression d\'urgence temporelle et le secret absolu',
        description: 'L\'ultimatum (« avant midi », « sous clause NDA ») a pour seul but de vous faire court-circuiter les procédures de validation normales de l\'entreprise.',
      },
      {
        sign: 'La demande de paiement, de codes ou de lien externe',
        description: 'Aucune transaction légitime de trésorerie ne doit être déclenchée sur ordre reçu via WhatsApp sans bon de commande validé sur l\'ERP interne.',
      },
    ],
    correctReaction: {
      rule: 'Appliquez systématiquement la règle d\'or du contre-appel indépendant.',
      steps: [
        '1. Ne cliquez sur aucun lien et ne transférez aucun document confidentiel sur WhatsApp.',
        '2. Décrochez votre téléphone et appelez le numéro de poste fixe officiel de votre interlocuteur connu dans l\'annuaire.',
        '3. En cas de doute, alertez immédiatement le responsable administratif et signalez la tentative à la sécurité VIGILO.',
      ],
    },
    miniQuiz: {
      question: 'Vous recevez un WhatsApp d\'un numéro inconnu avec la photo de votre directrice générale vous demandant d\'acheter d\'urgence 5 cartes cadeaux ou de valider un acompte avant 11h. Que faites-vous ?',
      options: [
        'J\'exécute la demande rapidement car elle émane de la Direction Générale et semble urgente.',
        'Je lui réponds sur WhatsApp pour lui demander une confirmation écrite avant d\'agir.',
        'Je n\'exécute rien du tout, j\'appelle la directrice sur son numéro interne officiel ou je me déplace à son bureau pour vérifier.',
      ],
      correctIndex: 2,
      explanation: 'Excellent réflexe ! Le contre-appel sur un canal officiel indépendant est la seule méthode infaillible pour neutraliser les usurpations d\'identité et fraudes au président sur WhatsApp.',
    },
  },
];

export const INITIAL_RETEST_RECORD: ReTestRecord = {
  id: 'retest-m365-t3',
  title: 'Évolution de la vigilance : Campagne Phishing M365 T3',
  scenarioCategory: 'Phishing',
  targetCohort: 'Tous les collaborateurs (32 pers.)',
  baselineCampaign: {
    id: 'camp-01-m365',
    name: 'Campagne Initiale Phishing M365',
    date: '15 Sept 2026',
    targeted: 32,
    clickRate: 25.0,
    reportRate: 59.0,
    clicked: 8,
    reported: 19,
  },
  retestCampaign: {
    id: 'camp-03-m365-retest',
    name: 'Re-test Phishing M365 (Post-Micro-formation)',
    date: '24 Sept 2026',
    targeted: 32,
    clickRate: 6.25,
    reportRate: 81.25,
    clicked: 2,
    reported: 26,
  },
  evolution: {
    clickRateDropPercent: -75.0, // (6.25 - 25) / 25 = -75%
    reportRateGainPercent: 37.7, // (81.25 - 59) / 59 = +37.7%
    humanVigilanceScore: 89, // Score de cyber-résilience
  },
};

export const INITIAL_SETTINGS: SimulationProviderSettings = {
  provider: 'mock',
  gophishUrl: 'https://gophish.internal.vigilo.local:3333',
  gophishApiKey: 'gp_sec_89f0293da82103a8f9b9',
  mockMode: {
    interactivePreview: true,
    autoSimulateReplies: true,
    educationalLandingActive: true,
  },
  companyName: 'Acme Conseil & Solutions',
  companyDomain: 'acme-conseil.fr',
};

export const INITIAL_FLASH_ARTICLES: FlashArticle[] = [
  {
    id: 'flash-01-whatsapp-fraud',
    title: 'Alerte Vague de Whishing : Faux messages WhatsApp usurpant les dirigeants',
    category: 'Alerte Urgente',
    summary: 'Plusieurs PME partenaires signalent des tentatives d\'usurpation de leurs dirigeants sur WhatsApp demandant des virements ou cartes cadeaux sous prétexte de confidentialités (NDA).',
    content: `Une recrudescence d'attaques par ingénierie sociale cible actuellement les téléphones professionnels et personnels des collaborateurs.

Comment opèrent les attaquants ?
1. Ils récupèrent les noms et photos du dirigeant ou du DAF sur LinkedIn ou le site public.
2. Ils envoient un WhatsApp depuis un numéro inconnu : "Je suis en réunion confidentielle fermée, valide cet acompte d'urgence".
3. Ils interdisent formellement d'appeler par téléphone pour empêcher toute vérification vocale.

La consigne d'or absolue :
Aucun virement ni aucune modification de données sensibles ne doit JAMAIS être effectuée sur simple instruction WhatsApp. Décrochez toujours votre téléphone et appelez le numéro interne officiel de l'annuaire d'entreprise.`,
    author: 'Pôle Sécurité IT VIGILO',
    publishedAt: '2026-09-24',
    readCount: 29,
    totalRecipients: 32,
    readRate: 90.6,
    keyTakeaway: 'Exigez toujours un contre-appel au numéro fixe officiel avant d\'exécuter tout ordre reçu par messagerie.',
    channels: ['WhatsApp', 'Email'],
  },
  {
    id: 'flash-02-quishing-qr',
    title: 'Méfiance face aux QR Codes inattendus (Quishing)',
    category: 'Menace Émergente',
    summary: 'Les cybercriminels collent de faux QR codes sur les bornes ou les intègrent dans des emails pour vous rediriger vers de faux portails Microsoft 365.',
    content: `Le Quishing (QR code Phishing) est la nouvelle technique pour contourner les analyseurs de liens des messageries d'entreprise.

Pourquoi est-ce dangereux ?
Les filtres antispam ont du mal à lire le lien dissimulé dans une image QR code. En scannant le code avec votre smartphone, vous quittez le réseau sécurisé de l'entreprise.

Conseil de sécurité :
Ne scannez aucun QR code reçu par email demandant une réauthentification ou une validation de session de travail. Les services informatiques officiels utilisent des liens texte visibles, jamais de QR codes inattendus.`,
    author: 'Pôle Sécurité IT VIGILO',
    publishedAt: '2026-09-22',
    readCount: 26,
    totalRecipients: 32,
    readRate: 81.3,
    keyTakeaway: 'Ne scannez jamais de QR code demandant des identifiants professionnels.',
    channels: ['Email'],
  },
  {
    id: 'flash-03-mfa-security',
    title: 'Fatigue MFA : Que faire si vous recevez des notifications push inattendues ?',
    category: 'Bonne Pratique',
    summary: 'Si votre application Microsoft Authenticator ou Google Authenticator vibre plusieurs fois d\'affilée sans action de votre part, refusez et signalez immédiatement.',
    content: `L'attaque par "Push Bombing" ou fatigue MFA consiste à envoyer des dizaines de demandes d'approbation sur votre smartphone, souvent tard le soir ou durant une réunion, en espérant que vous cliquiez par mégarde sur "Approuver".

Réflexe immédiat :
1. Cliquez toujours sur "Refuser" (ou "Ce n'est pas moi").
2. Modifiez immédiatement le mot de passe de votre compte : si l'attaquant déclenche le push, c'est qu'il connaît déjà votre premier mot de passe !
3. Informez le support IT pour révoquer les sessions actives.`,
    author: 'Pôle Sécurité IT VIGILO',
    publishedAt: '2026-09-18',
    readCount: 31,
    totalRecipients: 32,
    readRate: 96.8,
    keyTakeaway: 'Un push MFA inattendu signifie qu\'un attaquant a votre mot de passe : refusez et changez-le.',
    channels: ['Email', 'WhatsApp'],
  },
];

`

==================================================
FILE: src/App.tsx
==================================================
`typescript
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
  const [simulatedCampaign, setSimulatedCampaign] = useState<Campaign | null>(null);
  const [simulatedScenario, setSimulatedScenario] = useState<Scenario | null>(null);

  const [activeInteractiveTraining, setActiveInteractiveTraining] = useState<TrainingModule | null>(null);

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
          onEnterDashboard={() => setViewMode('app')}
          onOpenLiveSimulator={() => handleOpenSimulator()}
          onExploreTrainings={() => {
            setViewMode('app');
            setActiveTab('training');
          }}
          onOpenFlashNews={() => {
            setViewMode('app');
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

  // 2. APP VIEW MODE (Full-featured Console & Resilience Engine)
  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white transition-colors ${
      isDark ? 'dark bg-[#070b13] text-slate-100' : 'bg-[#f8fafc] text-slate-900'
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

`

==================================================
FILE: src/components/layout/Navbar.tsx
==================================================
`typescript
import React from 'react';
import { Shield, Building2, Eye, LayoutTemplate, Sun, Moon, Sparkles, Terminal } from 'lucide-react';
import { SimulationProviderSettings } from '../../types';
import { Language, translations } from '../../i18n/translations';

interface NavbarProps {
  activeTab: string;
  onOpenEmployeeSimulator: () => void;
  onGoToLanding: () => void;
  settings: SimulationProviderSettings;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onOpenEmployeeSimulator,
  onGoToLanding,
  settings,
  language,
  onToggleLanguage,
  theme,
  onToggleTheme,
}) => {
  const isDark = theme === 'dark';
  const t = translations[language];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-white/10 backdrop-blur-xl bg-[#080b11]/90 text-slate-100 px-6 flex items-center justify-between transition-all">
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div
          onClick={onGoToLanding}
          className="flex items-center gap-3 cursor-pointer group"
          title="Retour à la présentation VIGILO"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f2620a] to-[#d97706] flex items-center justify-center text-white shadow-[0_0_15px_rgba(242,98,10,0.4)] group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight font-mono text-white">
                VIGILO
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f2620a]/15 text-[#fb923c] border border-[#f2620a]/30">
                Console PME
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block font-mono">
              Vigilance & Cyber Risk SaaS
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Language switcher */}
        <div className="flex items-center p-0.5 rounded-lg border border-white/10 bg-white/5 text-xs font-mono">
          <button
            onClick={() => onToggleLanguage('fr')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'fr' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            FR
          </button>
          <button
            onClick={() => onToggleLanguage('en')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              language === 'en' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title={t.nav.switchTheme}
        >
          {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
        </button>

        {/* Landing Page button */}
        <button
          onClick={onGoToLanding}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer"
          title="Afficher la page de présentation"
        >
          <LayoutTemplate className="w-3.5 h-3.5 text-[#fb923c]" />
          <span>{t.nav.landing}</span>
        </button>

        {/* Simulation Provider indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs border border-white/10 bg-white/5 rounded-lg px-3 py-1.5 text-slate-300 font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-400">Moteur:</span>
          <strong className="text-white">
            {settings.provider === 'mock' ? 'Mock Engine' : 'Gophish API'}
          </strong>
        </div>

        {/* Employee Simulation Trigger */}
        <button
          onClick={onOpenEmployeeSimulator}
          className="rodium-btn-orange flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-sm"
          title="Tester le rendu de l'email / WhatsApp"
        >
          <Eye className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t.nav.liveTest}</span>
          <span className="sm:hidden">Test live</span>
        </button>

        {/* User Role */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10 text-xs font-mono">
          <div className="w-7 h-7 rounded-full bg-[#f2620a]/20 border border-[#f2620a]/40 flex items-center justify-center font-bold text-xs text-[#fb923c]">
            IT
          </div>
          <span className="hidden lg:inline font-medium text-slate-300">
            {t.nav.adminRole}
          </span>
        </div>
      </div>
    </header>
  );
};

`

==================================================
FILE: src/components/layout/Sidebar.tsx
==================================================
`typescript
import React from 'react';
import {
  LayoutDashboard,
  Send,
  FileCode2,
  GraduationCap,
  Sparkles,
  RotateCcw,
  Settings,
  ShieldCheck,
  LayoutTemplate,
  Bell,
} from 'lucide-react';
import { Language, translations } from '../../i18n/translations';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onGoToLanding: () => void;
  activeCampaignCount: number;
  language: Language;
  theme: 'dark' | 'light';
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onGoToLanding,
  activeCampaignCount,
  language,
  theme,
}) => {
  const t = translations[language];

  const navItems = [
    {
      id: 'overview',
      label: t.nav.overview,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'campaigns',
      label: t.nav.campaigns,
      icon: Send,
      badge: activeCampaignCount > 0 ? `${activeCampaignCount} ${language === 'fr' ? 'actives' : 'active'}` : null,
    },
    {
      id: 'scenarios',
      label: t.nav.scenarios,
      icon: FileCode2,
      badge: null,
    },
    {
      id: 'ai-coach',
      label: t.nav.coach,
      icon: Sparkles,
      badge: 'Gemini 2.5',
    },
    {
      id: 'training',
      label: t.nav.trainings,
      icon: GraduationCap,
      badge: '7 modules',
    },
    {
      id: 'flash-news',
      label: t.nav.flashNews,
      icon: Bell,
      badge: language === 'fr' ? 'Nouveau' : 'New',
    },
    {
      id: 'retest',
      label: t.nav.retest,
      icon: RotateCcw,
      badge: null,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <aside className="w-64 border-r border-white/10 bg-[#080b11] text-slate-200 flex flex-col justify-between shrink-0 select-none transition-all">
      <div className="p-4 space-y-6">
        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#f2620a]/15 text-white border border-[#f2620a]/40 shadow-[0_0_15px_rgba(242,98,10,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#fb923c]' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      item.badge === 'Nouveau' || item.badge === 'New' || item.badge === 'Gemini 2.5'
                        ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/30'
                        : 'bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Continuous resilience formula box */}
        <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-white">
            <ShieldCheck className="w-4 h-4 text-[#fb923c]" />
            <span>Cycle Continu VIGILO</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 font-mono">
            {t.sloganShort}
          </p>
        </div>
      </div>

      {/* Footer link to landing */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={onGoToLanding}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium transition-all cursor-pointer"
        >
          <LayoutTemplate className="w-4 h-4 text-[#fb923c]" />
          <span>{t.nav.landing}</span>
        </button>
      </div>
    </aside>
  );
};

`

==================================================
FILE: src/components/landing/LandingPage.tsx
==================================================
`typescript
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
              className="rodium-btn-orange flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
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
        <div className="absolute inset-0 rodium-grid-pattern pointer-events-none z-0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rodium-orange-glow rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f2620a]/30 bg-[#f2620a]/10 text-slate-300 text-xs font-medium mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
            <span className="text-[#fb923c] font-semibold">{t.landing.kicker}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">ANCy & RGPD Compliant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] text-white">
            {language === 'fr' ? (
              <>
                Transformez vos équipes en <br />
                <span className="rodium-orange-text-gradient">votre premier pare-feu humain</span>
              </>
            ) : (
              <>
                Transform your employees into <br />
                <span className="rodium-orange-text-gradient">your primary human firewall</span>
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
              className="rodium-btn-orange flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold shadow-[0_0_30px_rgba(242,98,10,0.4)] cursor-pointer"
            >
              <span>{t.landing.startCycle}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onOpenLiveSimulator}
              className="rodium-btn-secondary flex items-center gap-2.5 px-7 py-4 rounded-xl text-sm font-semibold cursor-pointer"
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
            <span>ANCy Guidelines Compliant</span>
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
          <div className="rodium-card p-8 flex flex-col justify-between group">
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
          <div className="rodium-card p-8 flex flex-col justify-between group">
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
          <div className="rodium-card p-8 flex flex-col justify-between group">
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
        <div className="rodium-card p-8 sm:p-12 border border-white/15 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rodium-orange-glow rounded-full blur-3xl pointer-events-none" />

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
                  className="rodium-btn-orange flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold cursor-pointer"
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
                  "Bonjour Marc, je suis en réunion client confidentielle. J'ai besoin d'un virement d'acompte urgent de 4 800F CFA à valider immédiatement par ce lien :"
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
          <div className="rodium-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-[#fb923c] font-mono tracking-tight">
              -74%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Taux de clic post-retest</p>
          </div>

          <div className="rodium-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-emerald-400 font-mono tracking-tight">
              +88%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Taux de signalement spontané</p>
          </div>

          <div className="rodium-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-amber-400 font-mono tracking-tight">
              2 min
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Durée d'un micro-training</p>
          </div>

          <div className="rodium-card p-6">
            <div className="text-4xl sm:text-5xl font-extrabold text-cyan-400 font-mono tracking-tight">
              100%
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-400">Conforme Directives ANCy</p>
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION FINAL SECTION — Rodium AI Dark CTA Box */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-white/15 bg-gradient-to-b from-[#0f1523] to-[#070a12] p-10 sm:p-16 text-center overflow-hidden shadow-2xl">
          <div className="absolute inset-0 rodium-orange-glow pointer-events-none" />

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
                className="rodium-btn-orange flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold cursor-pointer"
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
            <span>ANCy Compliant</span>
            <span>RGPD Compliant</span>
            <span>Gophish Native API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

`

==================================================
FILE: src/components/overview/OverviewTab.tsx
==================================================
`typescript
import React from 'react';
import {
  Users,
  MousePointerClick,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
} from 'lucide-react';
import { Campaign, ReTestRecord } from '../../types';

interface OverviewTabProps {
  campaigns: Campaign[];
  retestRecord: ReTestRecord;
  onSelectCampaign: (campaignId: string) => void;
  onNavigate: (tab: string) => void;
  onOpenCreateCampaign: () => void;
  onOpenEmployeeSimulator: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  campaigns,
  retestRecord,
  onSelectCampaign,
  onNavigate,
  onOpenCreateCampaign,
  onOpenEmployeeSimulator,
}) => {
  // Aggregate statistics across campaigns
  const totalTargeted = campaigns.reduce((acc, c) => acc + c.targeted, 0);
  const totalClicked = campaigns.reduce((acc, c) => acc + c.clicked, 0);
  const totalReported = campaigns.reduce((acc, c) => acc + c.reported, 0);

  const avgClickRate = totalTargeted > 0 ? ((totalClicked / totalTargeted) * 100).toFixed(1) : '0';
  const avgReportRate = totalTargeted > 0 ? ((totalReported / totalTargeted) * 100).toFixed(1) : '0';

  const activeCampaign = campaigns.find((c) => c.status === 'en_cours') || campaigns[0];
  const lastFinishedCampaign = campaigns.find((c) => c.status === 'terminée' && c.aiAnalysis);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Principle Banner — Rodium AI Dark Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-r from-[#0d1424] via-[#080c16] to-[#111728] p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 rodium-orange-glow rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
              <span>Principe VIGILO</span>
              <span className="text-slate-600">·</span>
              <span className="text-emerald-400">Cyber-résilience PME</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              « Mesurez et renforcez la vigilance de votre équipe. »
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Testez concrètement vos collaborateurs face aux cybermenaces réelles sur Email & WhatsApp plutôt que de vous limiter à des formations théoriques.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenCreateCampaign}
              className="rodium-btn-orange flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm cursor-pointer shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Créer une campagne</span>
            </button>
            <button
              onClick={onOpenEmployeeSimulator}
              className="rodium-btn-secondary flex items-center gap-2 px-4 py-3 rounded-xl text-slate-200 font-semibold text-sm cursor-pointer"
            >
              <span>Tester en direct</span>
            </button>
          </div>
        </div>

        {/* 5-step loop visualization */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Simuler', desc: 'Attaque contrôlée (Email / WhatsApp)' },
            { step: '02', title: 'Mesurer', desc: 'Comportements réels (Clics & Signalements)' },
            { step: '03', title: 'Analyser', desc: 'Diagnostic Gemini 2.5 Coach' },
            { step: '04', title: 'Former', desc: 'Micro-module de 2 minutes' },
            { step: '05', title: 'Re-tester', desc: 'Mesure de l évolution concrète' },
          ].map((item, idx) => (
            <div
              key={item.step}
              className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1 backdrop-blur-md"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[#fb923c] font-bold">{item.step}</span>
                {idx < 4 && <ArrowRight className="w-3 h-3 text-slate-600 hidden sm:block" />}
              </div>
              <div className="font-bold text-white text-sm">{item.title}</div>
              <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="rodium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Total Collaborateurs</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-white font-mono">{totalTargeted}</div>
            <p className="text-xs text-slate-400 mt-1">Ciblés sur les campagnes récents</p>
          </div>
        </div>

        <div className="rodium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Taux de Clic Moyen</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-400 font-mono">{avgClickRate}%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-18.4% vs mois dernier</span>
            </div>
          </div>
        </div>

        <div className="rodium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Taux de Signalement</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-400 font-mono">{avgReportRate}%</div>
            <div className="flex items-center gap-1 text-xs text-emerald-400 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+24.1% adoption du reflexe</span>
            </div>
          </div>
        </div>

        <div className="rodium-card p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Score de Vigilance</span>
            <div className="w-8 h-8 rounded-xl bg-[#f2620a]/15 text-[#fb923c] flex items-center justify-center border border-[#f2620a]/30">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-[#fb923c] font-mono">84 / 100</div>
            <p className="text-xs text-slate-400 mt-1">Niveau Élevé (ANCy Standard)</p>
          </div>
        </div>
      </div>

      {/* Main Dashboard Section: Active Campaign + AI Coach Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Campaign */}
        <div className="lg:col-span-2 rodium-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-mono text-[#fb923c]">Campagne en cours</span>
              <h2 className="text-lg font-bold text-white">{activeCampaign.name}</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              En cours
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center py-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-xs text-slate-400 font-mono">Ciblés</div>
              <div className="text-2xl font-bold text-white mt-1 font-mono">{activeCampaign.targeted}</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-xs text-slate-400 font-mono">Piégés (Clic)</div>
              <div className="text-2xl font-bold text-rose-400 mt-1 font-mono">{activeCampaign.clicked} ({activeCampaign.clickRate}%)</div>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10">
              <div className="text-xs text-slate-400 font-mono">Signalés</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{activeCampaign.reported} ({activeCampaign.reportRate}%)</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => onSelectCampaign(activeCampaign.id)}
              className="text-xs font-bold text-[#fb923c] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Voir le rapport détaillé</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenEmployeeSimulator}
              className="rodium-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
            >
              Tester l'aperçu collaborateur
            </button>
          </div>
        </div>

        {/* Right Col: AI Coach Snapshot */}
        <div className="rodium-card p-6 space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>Vigilo Coach IA (Gemini 2.5)</span>
            </div>
            <h3 className="text-base font-bold text-white">Recommandation Stratégique</h3>
            <p className="text-xs text-slate-300 leading-relaxed bg-white/[0.02] border border-white/10 p-4 rounded-xl">
              "L'équipe Finance affiche une vulnérabilité aux pièges WhatsApp de type Urgence Direction. Déployer un micro-module sur la vérification hors-canal."
            </p>
          </div>

          <button
            onClick={() => onNavigate('ai-coach')}
            className="w-full rodium-btn-orange py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Consulter le Coach IA</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/ai-coach/AiCoachView.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  GraduationCap,
  Wand2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Building,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Zap,
} from 'lucide-react';
import { Campaign, AIAnalysis } from '../../types';
import { rodiumAiService } from '../../services/api';

interface AiCoachViewProps {
  campaigns: Campaign[];
  onOpenScenarioGenerator: () => void;
  onNavigateToTraining: () => void;
  onNavigateToCampaign: (campaignId: string) => void;
  onUpdateCampaignAnalysis: (campaignId: string, analysis: AIAnalysis) => void;
}

export const AiCoachView: React.FC<AiCoachViewProps> = ({
  campaigns,
  onOpenScenarioGenerator,
  onNavigateToTraining,
  onNavigateToCampaign,
  onUpdateCampaignAnalysis,
}) => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>(
    campaigns[0]?.id || ''
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const selectedCampaign =
    campaigns.find((c) => c.id === selectedCampaignId) || campaigns[0];

  const handleRunAnalysis = async () => {
    if (!selectedCampaign) return;
    setIsAnalyzing(true);
    try {
      const result = await rodiumAiService.analyzeCampaign(selectedCampaign);
      onUpdateCampaignAnalysis(selectedCampaign.id, result);
    } catch (err) {
      console.error('Erreur analyse RodiumAI', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Banner — Rodium AI Dark Hero */}
      <div className="rodium-card p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 rodium-orange-glow rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#f2620a] animate-pulse" />
              <span>Conseiller de résilience humaine</span>
              <span className="text-slate-600">·</span>
              <span className="text-amber-400 font-bold">Gemini 2.5 Flash Coach</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Sparkles className="w-7 h-7 text-[#fb923c]" />
              <span>Vigilo Cyber Coach IA</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Le moteur d'intelligence comportementale de VIGILO. Il intervient à 3 niveaux : Génération des leurres contextuels, Diagnostic des facteurs humains et Remédiation par micro-formation ciblée.
            </p>
          </div>

          <button
            onClick={onOpenScenarioGenerator}
            className="rodium-btn-orange flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold shadow-lg cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>Générer un scénario sur-mesure</span>
          </button>
        </div>

        {/* 3 AI Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/10 text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-[#fb923c]">1. Génération de leurres</div>
            <p className="text-slate-400">
              Créer ou adapter des scénarios de simulation ultra-réalistes aux canaux de votre PME (Email, WhatsApp).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-amber-400">2. Diagnostic comportemental</div>
            <p className="text-slate-400">
              Identifier les leviers d'ingénierie sociale déclenchés (Urgence, Autorité, Panique) et départements vulnérables.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <div className="font-bold text-emerald-400">3. Remédiation & Re-test</div>
            <p className="text-slate-400">
              Recommander les micro-modules de 2 minutes et programmer le re-test automatique à 14 jours.
            </p>
          </div>
        </div>
      </div>

      {/* Main Campaign Selection & Analysis Section */}
      <div className="rodium-card p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <span className="text-xs font-mono text-slate-400">Sélectionner une campagne à analyser</span>
            <h2 className="text-lg font-bold text-white mt-1">Diagnostic comportemental approfondi</h2>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedCampaignId}
              onChange={(e) => setSelectedCampaignId(e.target.value)}
              className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded-xl px-4 py-2.5 font-mono focus:outline-none focus:border-[#f2620a]"
            >
              {campaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.clickRate}% clic)
                </option>
              ))}
            </select>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing}
              className="rodium-btn-orange px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{isAnalyzing ? 'Analyse Gemini...' : 'Relancer l\'analyse IA'}</span>
            </button>
          </div>
        </div>

        {selectedCampaign && selectedCampaign.aiAnalysis ? (
          <div className="space-y-6">
            {/* Summary Banner */}
            <div className="p-5 rounded-xl bg-[#f2620a]/10 border border-[#f2620a]/30 text-xs text-slate-200 leading-relaxed space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#fb923c]">
                <Zap className="w-4 h-4" />
                <span>Synthèse du Coach Gemini 2.5 :</span>
              </div>
              <p>{selectedCampaign.aiAnalysis.summary}</p>
            </div>

            {/* Diagnostic Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vulnerabilities */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-rose-400 text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Leviers Psychologiques Déclenchés</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedCampaign.aiAnalysis.keyVulnerabilities.map((v, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              {/* Vulnerable Cohorts */}
              <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-400 text-xs uppercase tracking-wider">
                  <Building className="w-4 h-4" />
                  <span>Cohortes à Risque Élevé</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {selectedCampaign.aiAnalysis.vulnerableCohorts.map((c, i) => (
                    <span key={i} className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommended Training */}
            <div className="p-6 rounded-xl bg-white/[0.03] border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Micro-Formation de Remédiation Recommandée</span>
                </div>
                <span className="text-xs font-mono text-slate-400">Durée : 2 minutes</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-white/10">
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedCampaign.aiAnalysis.recommendedTraining.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{selectedCampaign.aiAnalysis.recommendedTraining.reasoning}</p>
                </div>

                <button
                  onClick={onNavigateToTraining}
                  className="rodium-btn-orange px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <span>Suivre le module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400 text-xs">
            Aucune analyse Gemini disponible pour cette campagne. Cliquez sur "Relancer l'analyse IA".
          </div>
        )}
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/campaigns/CampaignList.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  Users,
  MousePointerClick,
  ShieldCheck,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Campaign } from '../../types';

interface CampaignListProps {
  campaigns: Campaign[];
  onSelectCampaign: (id: string) => void;
  onOpenCreateModal: () => void;
  onSimulateCampaign: (campaign: Campaign) => void;
}

export const CampaignList: React.FC<CampaignListProps> = ({
  campaigns,
  onSelectCampaign,
  onOpenCreateModal,
  onSimulateCampaign,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesFilter =
      filterStatus === 'all'
        ? true
        : filterStatus === 'retest'
        ? c.isReTest
        : c.status === filterStatus;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.targetGroup.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Send className="w-5 h-5 text-[#fb923c]" />
            <span>Campagnes de simulation</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Gérez vos exercices de cyberattaques contrôlées (Email & WhatsApp) et suivez les comportements en direct.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="rodium-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Créer une campagne</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une campagne, scénario, groupe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f2620a]"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Toutes' },
            { id: 'en_cours', label: 'En cours' },
            { id: 'terminée', label: 'Terminées' },
            { id: 'retest', label: 'Re-tests' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                filterStatus === tab.id
                  ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCampaigns.map((camp) => (
          <div
            key={camp.id}
            className="rodium-card p-6 flex flex-col justify-between space-y-4 group hover:border-[#f2620a]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {camp.category}
                </span>

                <div className="flex items-center gap-2">
                  {camp.isReTest && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                      <RotateCcw className="w-3 h-3" /> Re-Test
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                      camp.status === 'en_cours'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {camp.status === 'en_cours' ? '● En cours' : 'Terminée'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-white text-base group-hover:text-[#fb923c] transition-colors">
                  {camp.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Groupe cible : <span className="text-slate-200">{camp.targetGroup}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Ciblés</div>
                  <div className="font-bold text-white font-mono mt-0.5">{camp.targeted}</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Clics</div>
                  <div className="font-bold text-rose-400 font-mono mt-0.5">
                    {camp.clicked} ({camp.clickRate}%)
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/10">
                  <div className="text-[10px] text-slate-400 font-mono">Signalés</div>
                  <div className="font-bold text-emerald-400 font-mono mt-0.5">
                    {camp.reported} ({camp.reportRate}%)
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <button
                onClick={() => onSimulateCampaign(camp)}
                className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer font-mono text-[11px]"
              >
                <Eye className="w-3.5 h-3.5 text-[#fb923c]" />
                <span>Tester le piège</span>
              </button>

              <button
                onClick={() => onSelectCampaign(camp.id)}
                className="text-xs font-bold text-[#fb923c] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Détails & Rapport</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/campaigns/CampaignDetail.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  ArrowLeft,
  Users,
  Send,
  MousePointerClick,
  ShieldCheck,
  Sparkles,
  Play,
  RotateCcw,
  GraduationCap,
  Eye,
  AlertTriangle,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Campaign, AIAnalysis } from '../../types';
import { rodiumAiService } from '../../services/api';

interface CampaignDetailProps {
  campaign: Campaign;
  onBack: () => void;
  onUpdateCampaignAnalysis: (campaignId: string, analysis: AIAnalysis) => void;
  onLaunchReTest: (campaign: Campaign) => void;
  onGenerateTraining: (campaign: Campaign) => void;
  onSimulate: (campaign: Campaign) => void;
}

export const CampaignDetail: React.FC<CampaignDetailProps> = ({
  campaign,
  onBack,
  onUpdateCampaignAnalysis,
  onLaunchReTest,
  onGenerateTraining,
  onSimulate,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleRequestAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysis = await rodiumAiService.analyzeCampaign(campaign);
      onUpdateCampaignAnalysis(campaign.id, analysis);
    } catch (err) {
      console.error('Erreur analyse IA', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour aux campagnes</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onSimulate(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Tester l'email (Simulateur)</span>
          </button>

          <button
            onClick={() => onGenerateTraining(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-medium border border-indigo-500/40 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            <span>Générer formation ciblée</span>
          </button>

          <button
            onClick={() => onLaunchReTest(campaign)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-medium border border-emerald-500/40 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>Lancer un re-test</span>
          </button>
        </div>
      </div>

      {/* Campaign Header Card */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${
                  campaign.status === 'en_cours'
                    ? 'bg-blue-950/80 text-blue-400 border-blue-800/60'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                {campaign.status === 'en_cours' ? '● En cours' : '✓ Terminée'}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-mono text-slate-400">{campaign.category}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Difficulté : {campaign.difficulty}</span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs text-slate-400">Cible : {campaign.targetGroup}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">{campaign.name}</h1>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              {campaign.description}
            </p>
          </div>

          <div className="text-left md:text-right shrink-0">
            <div className="text-xs text-slate-400">Temps médian de réaction</div>
            <div className="text-xl font-bold font-mono text-slate-200">
              {campaign.medianReactionTimeMinutes} min
            </div>
          </div>
        </div>

        {/* 7 Core Indicators per Section 5 */}
        <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Ciblés</div>
            <div className="text-xl font-bold font-mono text-white mt-1">{campaign.targeted}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Délivrés</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">{campaign.delivered}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-slate-400">Ouverts</div>
            <div className="text-xl font-bold font-mono text-slate-200 mt-1">{campaign.opened}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-red-400">Clics (Piégés)</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">{campaign.clicked}</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
            <div className="text-xs text-emerald-400">Signalements</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{campaign.reported}</div>
          </div>
          <div className="p-3 rounded-lg bg-red-950/20 border border-red-900/40">
            <div className="text-xs text-red-300 font-medium">Click Rate</div>
            <div className="text-xl font-bold font-mono text-red-400 mt-1">{campaign.clickRate}%</div>
          </div>
          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
            <div className="text-xs text-emerald-300 font-medium">Report Rate</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{campaign.reportRate}%</div>
          </div>
        </div>
      </div>

      {/* Two columns: Department breakdown & AI RodiumAI Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column (5 cols): Department Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-400" />
              <span>Ventilation par département</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              {campaign.departments.length} équipes
            </span>
          </div>

          <div className="space-y-3">
            {campaign.departments.map((dept) => (
              <div
                key={dept.name}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-200">{dept.name}</span>
                  <span className="text-slate-400 font-mono">{dept.targeted} ciblés</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Taux de clic :</span>
                    <strong className="text-red-400 font-mono">{dept.clickRate}%</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Signalements :</span>
                    <strong className="text-emerald-400 font-mono">{dept.reportRate}%</strong>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-red-500 h-full"
                    style={{ width: `${dept.clickRate}%` }}
                    title={`Clics: ${dept.clickRate}%`}
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${dept.reportRate}%` }}
                    title={`Signalés: ${dept.reportRate}%`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column (7 cols): AI Cyber Coach — RodiumAI */}
        <div className="lg:col-span-7 p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-950 border border-emerald-800/70 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Vigilo Cyber Coach</h3>
                <p className="text-[11px] text-slate-400">Analyse comportementale & Remédiation</p>
              </div>
            </div>

            <button
              onClick={handleRequestAiAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-medium cursor-pointer disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span>{campaign.aiAnalysis ? 'Réanalyser avec l IA' : 'Demander analyse IA'}</span>
            </button>
          </div>

          {campaign.aiAnalysis ? (
            <div className="space-y-4 text-xs">
              {/* Executive Summary */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Synthèse d analyse comportementale</span>
                  <span
                    className={`font-mono text-[10px] px-2 py-0.5 rounded border ${
                      campaign.aiAnalysis.riskLevel === 'Critique' || campaign.aiAnalysis.riskLevel === 'Élevé'
                        ? 'bg-red-950/80 text-red-300 border-red-800/60'
                        : 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                    }`}
                  >
                    Risque : {campaign.aiAnalysis.riskLevel}
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {campaign.aiAnalysis.executiveSummary}
                </p>
              </div>

              {/* Vulnerability Factor */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                <div className="font-semibold text-amber-300 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Facteur de vulnérabilité identifié</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {campaign.aiAnalysis.vulnerabilityFactor}
                </p>
              </div>

              {/* Operational Recommendations */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="font-semibold text-slate-200">Recommandations managériales :</div>
                <ul className="space-y-1.5 text-slate-300">
                  {campaign.aiAnalysis.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Remediation Advice & CTA */}
              <div className="p-4 rounded-lg bg-blue-950/40 border border-blue-900/60 space-y-3">
                <div className="text-blue-300 font-semibold flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Remédiation recommandée par RodiumAI :</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {campaign.aiAnalysis.trainingAdvice}
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => onGenerateTraining(campaign)}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    Lancer la micro-formation (4 min)
                  </button>
                  <button
                    onClick={() => onLaunchReTest(campaign)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 cursor-pointer"
                  >
                    Planifier le re-test
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-lg bg-slate-900/40 border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <div className="text-sm font-medium text-slate-300">Aucune analyse IA effectuée</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Cliquez sur « Demander analyse IA » pour que RodiumAI évalue les comportements et propose la remédiation adaptée.
              </p>
              <button
                onClick={handleRequestAiAnalysis}
                disabled={isAnalyzing}
                className="mt-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                {isAnalyzing ? 'Analyse en cours...' : 'Lancer l analyse RodiumAI'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/campaigns/CreateCampaignModal.tsx
==================================================
`typescript
import React, { useState } from 'react';
import { X, Play, ShieldAlert, Sparkles, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { Campaign, Scenario, ScenarioCategory, DifficultyLevel } from '../../types';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  scenarios: Scenario[];
  onCreate: (campaignData: Partial<Campaign>) => void;
  preselectedScenarioId?: string;
  isReTestMode?: boolean;
  baselineCampaign?: Campaign;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  scenarios,
  onCreate,
  preselectedScenarioId,
  isReTestMode,
  baselineCampaign,
}) => {
  if (!isOpen) return null;

  const defaultScenario = preselectedScenarioId
    ? scenarios.find((s) => s.id === preselectedScenarioId) || scenarios[0]
    : scenarios[0];

  const [name, setName] = useState(
    isReTestMode && baselineCampaign
      ? `Re-test : ${baselineCampaign.name} (Post-Formation)`
      : `Campagne ${defaultScenario.category} — ${new Date().toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}`
  );
  const [description, setDescription] = useState(
    isReTestMode && baselineCampaign
      ? `Campagne de re-test pour mesurer la réduction du risque cyber après la micro-formation.`
      : `Simulation contrôlée de type ${defaultScenario.category} pour évaluer le réflexe de vérification des équipes.`
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState(defaultScenario.id);
  const [targetGroup, setTargetGroup] = useState(
    baselineCampaign ? baselineCampaign.targetGroup : 'Tous les collaborateurs'
  );
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(defaultScenario.difficulty);
  const [adminValidated, setAdminValidated] = useState(false);

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminValidated) return;

    // Target sizes per cohort
    const cohortSizes: Record<string, number> = {
      'Tous les collaborateurs': 32,
      'Direction & Finance': 12,
      'Équipe Commerciale': 10,
      'Ressources Humaines': 6,
      'Technique & R&D': 14,
    };
    const targetedCount = cohortSizes[targetGroup] || 25;

    // Build departments
    const departments =
      targetGroup === 'Direction & Finance'
        ? [
            { name: 'Direction Générale', targeted: 4, opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Comptabilité & Trésorerie', targeted: 8, opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
          ]
        : [
            { name: 'Direction & Finance', targeted: Math.round(targetedCount * 0.2), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Équipe Commerciale', targeted: Math.round(targetedCount * 0.3), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Ressources Humaines', targeted: Math.round(targetedCount * 0.15), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
            { name: 'Technique & Dev', targeted: Math.round(targetedCount * 0.35), opened: 0, clicked: 0, reported: 0, clickRate: 0, reportRate: 0 },
          ];

    const newCampaign: Partial<Campaign> = {
      id: `camp-${Date.now()}`,
      name,
      description,
      scenarioId: selectedScenario.id,
      scenarioName: selectedScenario.name,
      category: selectedScenario.category,
      difficulty,
      targetGroup,
      status: 'en_cours',
      createdAt: new Date().toISOString(),
      launchedAt: new Date().toISOString(),
      targeted: targetedCount,
      delivered: targetedCount,
      opened: Math.round(targetedCount * 0.4),
      clicked: Math.round(targetedCount * (isReTestMode ? 0.08 : 0.25)),
      reported: Math.round(targetedCount * (isReTestMode ? 0.75 : 0.45)),
      clickRate: isReTestMode ? 8.0 : 25.0,
      reportRate: isReTestMode ? 75.0 : 45.0,
      medianReactionTimeMinutes: isReTestMode ? 7 : 18,
      departments,
      isReTest: isReTestMode,
      baselineCampaignId: baselineCampaign?.id,
    };

    onCreate(newCampaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#0d131f] border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <Play className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isReTestMode ? 'Créer une campagne de Re-test' : 'Nouvelle campagne de simulation'}
              </h2>
              <p className="text-xs text-slate-400">
                {isReTestMode
                  ? 'Évaluez les progrès des collaborateurs après la micro-formation'
                  : 'Configurez et lancez une cyberattaque contrôlée'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Nom de la campagne</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-200">Objectif opérationnel</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Select Scenario */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-200">Scénario d'attaque contrôlée</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {scenarios.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => {
                    setSelectedScenarioId(scen.id);
                    setDifficulty(scen.difficulty);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScenarioId === scen.id
                      ? 'border-blue-500 bg-blue-950/30'
                      : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{scen.category}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{scen.difficulty}</span>
                  </div>
                  <div className="text-slate-300 font-medium text-[11px] mt-1 line-clamp-1">
                    {scen.name}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5 line-clamp-1">
                    Expéditeur : {scen.senderName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Target Population & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Population cible</label>
              <select
                value={targetGroup}
                onChange={(e) => setTargetGroup(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="Tous les collaborateurs">Tous les collaborateurs (32)</option>
                <option value="Direction & Finance">Direction & Finance (12)</option>
                <option value="Équipe Commerciale">Équipe Commerciale (10)</option>
                <option value="Ressources Humaines">Ressources Humaines (6)</option>
                <option value="Technique & R&D">Technique & R&D (14)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-200">Niveau de difficulté</label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setDifficulty(lvl)}
                    className={`py-2 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                      difficulty === lvl
                        ? 'border-blue-500 bg-blue-600/20 text-blue-300 font-semibold'
                        : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory Administrator Validation Checkbox (Section 6) */}
          <div className="p-3.5 rounded-lg border border-amber-900/60 bg-amber-950/20 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="admin-validate"
                checked={adminValidated}
                onChange={(e) => setAdminValidated(e.target.checked)}
                className="mt-0.5 rounded border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="admin-validate" className="text-slate-300 leading-relaxed cursor-pointer">
                <strong className="text-amber-300">Validation administrateur obligatoire :</strong> J'atteste que cette campagne est déployée dans un cadre de sensibilisation autorisé et contrôlé au sein de l'entreprise, conformément aux recommandations de l'ANCy.
              </label>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!adminValidated}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-md shadow-blue-900/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isReTestMode ? 'Démarrer le Re-test' : 'Lancer la simulation'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/scenarios/ScenarioCatalog.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  FileCode2,
  Sparkles,
  Plus,
  Play,
  Mail,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { Scenario, ScenarioCategory } from '../../types';

interface ScenarioCatalogProps {
  scenarios: Scenario[];
  onOpenCreateCampaignWithScenario: (scenarioId: string) => void;
  onOpenAiGenerator: () => void;
  onSimulateScenario: (scenario: Scenario) => void;
}

export const ScenarioCatalog: React.FC<ScenarioCatalogProps> = ({
  scenarios,
  onOpenCreateCampaignWithScenario,
  onOpenAiGenerator,
  onSimulateScenario,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(scenarios[0]?.id || '');

  const filteredScenarios = scenarios.filter((s) =>
    selectedCategory === 'all' ? true : s.category === selectedCategory
  );

  const activeScenario =
    scenarios.find((s) => s.id === selectedScenarioId) || filteredScenarios[0] || scenarios[0];

  const categories = [
    { id: 'all', label: 'Tous les scénarios' },
    { id: 'WhatsApp Phishing', label: ' WhatsApp (Whishing)' },
    { id: 'Phishing', label: ' Phishing Email' },
    { id: 'Fake Invoice', label: ' Fake Invoice' },
    { id: 'Smishing', label: ' Smishing (SMS)' },
    { id: 'MFA Fatigue', label: ' MFA Fatigue' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-[#fb923c]" />
            <span>Catalogue des scénarios d'attaque contrôlée</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Modèles de simulation testés conformes au cadre légal de sensibilisation des collaborateurs (Email & WhatsApp).
          </p>
        </div>

        <button
          onClick={onOpenAiGenerator}
          className="rodium-btn-orange flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Générer avec Gemini 2.5 Coach</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-1.5 p-2 rounded-xl border border-white/10 bg-slate-900/80 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
              selectedCategory === cat.id
                ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Two columns: Scenario list & Detail Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredScenarios.map((scen) => {
            const isSelected = activeScenario?.id === scen.id;
            return (
              <div
                key={scen.id}
                onClick={() => setSelectedScenarioId(scen.id)}
                className={`rodium-card p-4 border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-[#f2620a] bg-[#f2620a]/10 shadow-[0_0_15px_rgba(242,98,10,0.2)]'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {scen.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      scen.difficulty === 'Élevé'
                        ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        : scen.difficulty === 'Moyen'
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    Niveau : {scen.difficulty}
                  </span>
                </div>

                <h3 className="font-bold text-white text-sm">{scen.name}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{scen.previewText}</p>
              </div>
            );
          })}
        </div>

        {/* Right Active Scenario Preview */}
        {activeScenario && (
          <div className="lg:col-span-7 rodium-card p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono text-[#fb923c]">Détail du scénario sélectionné</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activeScenario.name}</h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSimulateScenario(activeScenario)}
                  className="rodium-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  Aperçu live
                </button>
                <button
                  onClick={() => onOpenCreateCampaignWithScenario(activeScenario.id)}
                  className="rodium-btn-orange px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Lancer la campagne
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-slate-400">Expéditeur simulé :</span>
                  <div className="font-bold text-white mt-1">{activeScenario.senderName} ({activeScenario.senderEmail})</div>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
                  <span className="text-slate-400">Objet du message :</span>
                  <div className="font-bold text-white mt-1">{activeScenario.subject}</div>
                </div>
              </div>

              {/* Psychological Triggers */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                  Leviers psychologiques ciblés :
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeScenario.psychologicalTriggers.map((trig, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full text-xs font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      {trig}
                    </span>
                  ))}
                </div>
              </div>

              {/* Message Body Preview Card */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400">Aperçu du contenu du message :</span>
                <div
                  className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-200 font-mono leading-relaxed overflow-x-auto max-h-60"
                  dangerouslySetInnerHTML={{ __html: activeScenario.body }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/scenarios/GenerateScenarioModal.tsx
==================================================
`typescript
import React, { useState } from 'react';
import { X, Sparkles, Wand2, Eye, ShieldAlert, Check } from 'lucide-react';
import { Scenario, ScenarioCategory, DifficultyLevel } from '../../types';
import { rodiumAiService } from '../../services/api';

interface GenerateScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioGenerated: (newScenario: Scenario) => void;
}

export const GenerateScenarioModal: React.FC<GenerateScenarioModalProps> = ({
  isOpen,
  onClose,
  onScenarioGenerated,
}) => {
  if (!isOpen) return null;

  const [scenarioType, setScenarioType] = useState<ScenarioCategory>('Phishing');
  const [targetAudience, setTargetAudience] = useState('Direction & Finance');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Moyen');
  const [companyContext, setCompanyContext] = useState(
    'PME de 35 collaborateurs, utilisation quotidienne de Microsoft 365, Teams et logiciel de facturation cloud.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const data = await rodiumAiService.generateScenario({
        scenarioType,
        targetAudience,
        difficulty,
        companyContext,
      });
      setGeneratedResult(data);
    } catch (err) {
      console.error('Erreur génération scénario', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveAndUse = () => {
    if (!generatedResult) return;
    const newScenario: Scenario = {
      id: `scen-ai-${Date.now()}`,
      name: generatedResult.name || `${scenarioType} sur-mesure Vigilo Coach`,
      category: scenarioType,
      difficulty,
      senderName: generatedResult.senderName || 'Notification Sécurité',
      senderEmail: generatedResult.senderEmail || 'alerte@support-securite-cloud.fr',
      subject: generatedResult.subject || 'Action requise sur votre compte',
      previewText: generatedResult.previewText || 'Scénario généré par Vigilo Coach',
      body: generatedResult.body || '<p>Ceci est un test de simulation VIGILO.</p>',
      psychologicalTriggers: generatedResult.psychologicalTriggers || ['Urgence', 'Autorité'],
      redFlags: generatedResult.redFlags || ['Nom de domaine non officiel', 'Pression temporelle'],
      landingPageContent:
        generatedResult.landingPageContent ||
        'Ceci était un exercice VIGILO. Aucun identifiant n a été compromis.',
      isAiGenerated: true,
    };
    onScenarioGenerated(newScenario);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0d131f] border border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Générateur de scénario — Vigilo Coach
              </h2>
              <p className="text-xs text-slate-400">
                Créez un leurre sur-mesure adapté aux outils et habitudes de votre PME
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {!generatedResult ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Type de scénario</label>
                  <select
                    value={scenarioType}
                    onChange={(e) => setScenarioType(e.target.value as ScenarioCategory)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="WhatsApp Phishing">💬 WhatsApp Phishing (Whishing & Fraude au Président)</option>
                    <option value="Phishing">✉️ Phishing (Email usurpé)</option>
                    <option value="Fake Invoice">📄 Fake Invoice (Fraude au faux RIB)</option>
                    <option value="Smishing">📱 Smishing (SMS frauduleux)</option>
                    <option value="MFA Fatigue">🔔 MFA Fatigue (Push spamming)</option>
                    <option value="Social Engineering">👤 Social Engineering (Support IT)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-200">Public cible</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Direction & Finance">Direction & Finance</option>
                    <option value="Équipe Commerciale">Équipe Commerciale</option>
                    <option value="Ressources Humaines">Ressources Humaines</option>
                    <option value="Technique & R&D">Technique & R&D</option>
                    <option value="Tous les collaborateurs">Tous les collaborateurs</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">Niveau de difficulté souhaité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Facile', 'Moyen', 'Difficile'] as DifficultyLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-2 rounded-lg font-medium text-xs border transition-all cursor-pointer ${
                        difficulty === lvl
                          ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-semibold'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-200">
                  Contexte spécifique de la PME (fournisseurs, logiciels, période)
                </label>
                <textarea
                  value={companyContext}
                  onChange={(e) => setCompanyContext(e.target.value)}
                  rows={3}
                  placeholder="Ex : Fin d'année fiscale, changement d'outil RH récent, sous-traitant transport habituel..."
                  className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-md shadow-emerald-950 disabled:opacity-50 transition-all cursor-pointer"
                >
                  <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Génération RodiumAI en cours...' : 'Générer avec RodiumAI'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">Scénario généré par RodiumAI avec succès</span>
                </div>
                <button
                  onClick={() => setGeneratedResult(null)}
                  className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
                >
                  Modifier les paramètres
                </button>
              </div>

              {/* Preview Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
                <div>
                  <span className="text-[10px] font-mono text-emerald-400 uppercase">
                    {generatedResult.category} · {generatedResult.difficulty}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">{generatedResult.name}</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300 bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500">Expéditeur simulé : </span>
                    <strong className="text-slate-200">{generatedResult.senderName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Adresse : </span>
                    <code className="text-blue-400 font-mono text-[11px]">{generatedResult.senderEmail}</code>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-500">Objet : </span>
                    <span className="text-slate-200 font-medium">{generatedResult.subject}</span>
                  </div>
                </div>

                {/* Email Body preview */}
                <div className="space-y-1">
                  <span className="text-slate-400 font-medium">Contenu du message de test :</span>
                  <div
                    className="p-4 rounded-lg bg-white text-slate-900 border border-slate-700 overflow-x-auto text-xs"
                    dangerouslySetInnerHTML={{ __html: generatedResult.body }}
                  />
                </div>

                {/* Red Flags & Triggers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-slate-200">Leviers psychologiques :</span>
                    <ul className="mt-1 space-y-1 text-slate-400">
                      {generatedResult.psychologicalTriggers?.map((tr: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span>{tr}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                    <span className="font-semibold text-slate-200">Signes d'alerte (Red flags) :</span>
                    <ul className="mt-1 space-y-1 text-slate-400">
                      {generatedResult.redFlags?.map((rf: string, i: number) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span>{rf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndUse}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium cursor-pointer transition-colors"
                >
                  Ajouter au catalogue et utiliser
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/training/TrainingView.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  GraduationCap,
  Clock,
  Play,
  CheckCircle2,
  Users,
  Sparkles,
  ArrowRight,
  BookOpen,
  Search,
  Filter,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { TrainingModule, ScenarioCategory } from '../../types';

interface TrainingViewProps {
  trainings: TrainingModule[];
  onOpenPlayer: (module: TrainingModule) => void;
  onNavigateToReTest: () => void;
}

export const TrainingView: React.FC<TrainingViewProps> = ({
  trainings,
  onOpenPlayer,
  onNavigateToReTest,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTrainings = trainings.filter((t) => {
    const matchesCategory = selectedCategory === 'all' ? true : t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.situation.context.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', label: 'Toutes les formations' },
    { id: 'WhatsApp Phishing', label: '💬 WhatsApp (Whishing)' },
    { id: 'Phishing', label: '✉️ Phishing M365' },
    { id: 'Fake Invoice', label: '📄 Fake Invoice (RIB)' },
    { id: 'QR Code (Quishing)', label: '📱 Quishing (QR Code)' },
    { id: 'MFA Fatigue', label: '🔔 MFA Fatigue' },
    { id: 'Ransomware', label: '🔒 Ransomware & Macros' },
    { id: 'Social Engineering', label: '👤 Social Engineering' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#fb923c]" />
            <span>Catalogue des Micro-formations ciblées (2 min)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formations interactives courtes pour ancrer les réflexes réflexes : Situation → Signes d'alerte → Bonne réaction → Mini-quiz.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-300 border border-white/10 rounded-xl px-3.5 py-2 bg-white/5">
          <BookOpen className="w-3.5 h-3.5 text-[#fb923c]" />
          <span>{trainings.length} modules interactifs</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une formation (titre, mot-clé, vecteur d'attaque)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#f2620a]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                selectedCategory === c.id
                  ? 'bg-[#f2620a]/20 text-[#fb923c] border border-[#f2620a]/40 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTrainings.map((mod) => (
          <div
            key={mod.id}
            className="rodium-card p-6 flex flex-col justify-between space-y-4 group hover:border-[#f2620a]/40 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  {mod.category}
                </span>
                <span className="text-[10px] font-mono text-[#fb923c] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {mod.durationMinutes} min
                </span>
              </div>

              <h3 className="font-bold text-white text-base group-hover:text-[#fb923c] transition-colors">
                {mod.title}
              </h3>

              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {mod.situation.context}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                {mod.quiz.questions.length} questions interactives
              </span>

              <button
                onClick={() => onOpenPlayer(mod)}
                className="rodium-btn-orange px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Lancer</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/training/InteractiveTrainingPlayer.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { TrainingModule } from '../../types';

interface InteractiveTrainingPlayerProps {
  module: TrainingModule;
  onClose: () => void;
  onComplete: (moduleId: string) => void;
  onNavigateToReTest: () => void;
}

export const InteractiveTrainingPlayer: React.FC<InteractiveTrainingPlayerProps> = ({
  module,
  onClose,
  onComplete,
  onNavigateToReTest,
}) => {
  // Steps: 0: Situation, 1: Signes d'alerte, 2: Bonne réaction, 3: Mini-question, 4: Terminé
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  const stepsMeta = [
    { title: '1. Situation', subtitle: 'Mise en contexte réelle' },
    { title: "2. Signes d'alerte", subtitle: 'Red flags repérables' },
    { title: '3. Bonne réaction', subtitle: 'Procédure recommandée' },
    { title: '4. Mini-quiz', subtitle: 'Validation pratique' },
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 3 && isAnswerSubmitted) {
      onComplete(module.id);
      setCurrentStep(4); // Finished step
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0 && currentStep <= 3) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitQuiz = () => {
    if (selectedQuizAnswer !== null) {
      setIsAnswerSubmitted(true);
    }
  };

  const isQuizCorrect =
    selectedQuizAnswer !== null && selectedQuizAnswer === module.miniQuiz.correctIndex;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase text-blue-400 bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800">
                  Micro-formation {module.durationMinutes} min
                </span>
                <span className="text-xs text-slate-400">· {module.category}</span>
              </div>
              <h2 className="text-sm font-bold text-white mt-0.5">{module.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress indicator */}
        <div className="grid grid-cols-4 border-b border-slate-800 bg-slate-950/40 text-xs">
          {stepsMeta.map((s, idx) => {
            const isActive = currentStep === idx;
            const isCompleted = currentStep > idx;
            return (
              <div
                key={idx}
                className={`p-3 border-r last:border-r-0 border-slate-800/80 transition-all ${
                  isActive
                    ? 'bg-blue-600/10 border-b-2 border-b-blue-500'
                    : isCompleted
                    ? 'bg-slate-900/40 text-slate-300'
                    : 'text-slate-500'
                }`}
              >
                <div className={`font-semibold ${isActive ? 'text-blue-400' : isCompleted ? 'text-emerald-400' : ''}`}>
                  {s.title}
                </div>
                <div className="text-[10px] text-slate-500 hidden sm:block truncate">{s.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-xs space-y-6">
          {/* STEP 1: SITUATION */}
          {currentStep === 0 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="text-slate-400 font-medium">Mise en situation vécue au quotidien :</div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {module.situation.context}
                </p>
              </div>

              <div className="space-y-2">
                <div className="text-slate-400 font-medium">Exemple de message typique reçu :</div>
                <div className="p-4 rounded-xl border border-amber-900/40 bg-amber-950/20 text-amber-200 font-mono text-xs leading-relaxed italic">
                  {module.situation.sampleSnippet}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-blue-900/40 bg-blue-950/20 text-slate-300 leading-relaxed space-y-1">
                <div className="font-semibold text-blue-300">Pourquoi cela fonctionne-t-il si souvent ?</div>
                <p>
                  Les attaquants ne cherchent pas à pirater vos serveurs : ils exploitent la surcharge cognitive, le sentiment d'urgence professionnelle ou la confiance naturelle envers vos outils quotidiens.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: SIGNES D'ALERTE */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="text-slate-300 font-medium">
                Voici les 3 signes d'alerte clés à toujours inspecter avant d'agir :
              </div>

              <div className="space-y-3">
                {module.warningSigns.map((ws, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-1.5 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <span className="w-5 h-5 rounded-full bg-amber-950 border border-amber-800/80 flex items-center justify-center text-[11px] font-mono text-amber-400">
                        0{i + 1}
                      </span>
                      <span>{ws.sign}</span>
                    </div>
                    <p className="text-slate-300 pl-7 leading-relaxed">{ws.description}</p>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-slate-900/90 border border-slate-800 flex items-center gap-2 text-slate-400">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Astuce pratique :</strong> Un nom affiché ("Microsoft", "Direction") ne prouve rien. Seule l'adresse après le symbole @ et le domaine du lien font foi.
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: BONNE RÉACTION */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-emerald-900/60 bg-emerald-950/20 space-y-1">
                <div className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider">
                  Règle d'or de vigilance
                </div>
                <div className="text-sm font-bold text-white leading-relaxed">
                  {module.correctReaction.rule}
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-slate-400 font-medium">La procédure réflexe en 3 étapes :</div>
                {module.correctReaction.steps.map((st, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-xs font-mono font-bold text-emerald-400 shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div className="text-slate-200 leading-relaxed font-medium">{st}</div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 rounded-lg bg-blue-950/30 border border-blue-900/50 text-blue-200 text-xs">
                <strong>Le bouton de signalement :</strong> En signalant un email suspect plutôt qu'en le supprimant silencieusement, vous protégez instantanément vos collègues moins avertis.
              </div>
            </div>
          )}

          {/* STEP 4: MINI-QUESTION */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center gap-2 font-mono text-[10px] text-blue-400 uppercase">
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>Mise en pratique</span>
                </div>
                <div className="text-sm font-bold text-white leading-relaxed">
                  {module.miniQuiz.question}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2.5">
                {module.miniQuiz.options.map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === module.miniQuiz.correctIndex;

                  let style = 'border-slate-800 bg-slate-900/60 text-slate-200 hover:border-slate-700';

                  if (isAnswerSubmitted) {
                    if (isCorrect) {
                      style = 'border-emerald-500 bg-emerald-950/40 text-emerald-200 font-semibold';
                    } else if (isSelected && !isCorrect) {
                      style = 'border-red-500 bg-red-950/40 text-red-200';
                    }
                  } else if (isSelected) {
                    style = 'border-blue-500 bg-blue-950/40 text-white font-medium';
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => !isAnswerSubmitted && setSelectedQuizAnswer(idx)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${style}`}
                    >
                      <div className="w-5 h-5 rounded-full border border-slate-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono">
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <div className="flex-1 leading-relaxed">{opt}</div>
                    </div>
                  );
                })}
              </div>

              {/* Feedback when submitted */}
              {isAnswerSubmitted && (
                <div
                  className={`p-4 rounded-xl border space-y-1.5 animate-in fade-in duration-200 ${
                    isQuizCorrect
                      ? 'border-emerald-500/60 bg-emerald-950/30 text-emerald-200'
                      : 'border-red-500/60 bg-red-950/30 text-red-200'
                  }`}
                >
                  <div className="font-bold flex items-center gap-2">
                    {isQuizCorrect ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Bonne réponse ! Réflexe validé.</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                        <span>Ce n'était pas la bonne réaction :</span>
                      </>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {module.miniQuiz.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: COMPLÉTION */}
          {currentStep === 4 && (
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center mx-auto shadow-xl shadow-emerald-950">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Micro-formation complétée !</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Les réflexes d'alerte et de vérification sont assimilés. Vos collaborateurs sont désormais prêts pour la phase de <strong>Re-test</strong> afin de mesurer concrètement la baisse du taux de clic.
              </p>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={onNavigateToReTest}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-lg shadow-emerald-950 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Passer au Re-test</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  Retour au catalogue
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {currentStep <= 3 && (
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Précédent</span>
            </button>

            {currentStep === 3 && !isAnswerSubmitted ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={selectedQuizAnswer === null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer"
              >
                <span>Valider ma réponse</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={currentStep === 3 && !isAnswerSubmitted}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs disabled:opacity-40 cursor-pointer"
              >
                <span>{currentStep === 3 ? 'Terminer' : 'Suivant'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/retest/ReTestView.tsx
==================================================
`typescript
import React from 'react';
import {
  RotateCcw,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  Play,
  ArrowRight,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ReTestRecord, Campaign } from '../../types';

interface ReTestViewProps {
  retestRecord: ReTestRecord;
  campaigns: Campaign[];
  onLaunchNewReTest: (campaign: Campaign) => void;
  onNavigateToCampaign: (campaignId: string) => void;
}

export const ReTestView: React.FC<ReTestViewProps> = ({
  retestRecord,
  campaigns,
  onLaunchNewReTest,
  onNavigateToCampaign,
}) => {
  const eligibleCampaigns = campaigns.filter((c) => !c.isReTest);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-[#fb923c]" />
            <span>Re-test & Mesure de la rétention</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Comparez le comportement de vos équipes Avant et Après la micro-formation à 14 jours d'intervalle.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 border border-emerald-500/30 rounded-xl px-3.5 py-2 bg-emerald-500/10">
          <ShieldCheck className="w-4 h-4" />
          <span>Vigilance humaine en hausse</span>
        </div>
      </div>

      {/* Main Comparative Benchmark Card */}
      <div className="rodium-card p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#fb923c]">
              <span>{retestRecord.scenarioCategory}</span>
              <span>·</span>
              <span>{retestRecord.targetCohort}</span>
            </div>
            <h3 className="text-xl font-extrabold text-white mt-1">{retestRecord.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Score de cyber-résilience :</span>
            <span className="text-3xl font-extrabold font-mono text-[#fb923c]">
              {retestRecord.evolution.humanVigilanceScore}
            </span>
            <span className="text-xs text-slate-500 font-mono">/ 100</span>
          </div>
        </div>

        {/* 3-Column Comparison: Avant / Après / Évolution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Avant Formation */}
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                1. Avant formation (Test initial)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.baselineCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Collaborateurs piégés) :</div>
              <div className="text-3xl font-extrabold font-mono text-rose-400">
                {retestRecord.baselineCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.baselineCampaign.clicked} clics sur {retestRecord.baselineCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-rose-500/20 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-slate-300">
                {retestRecord.baselineCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-500">
                {retestRecord.baselineCampaign.reported} signalements spontanés
              </div>
            </div>
          </div>

          {/* Column 2: Après Formation */}
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                2. Après formation (Re-test à 14j)
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {retestRecord.retestCampaign.date}
              </span>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-slate-400">Taux de clic (Nouveau test) :</div>
              <div className="text-3xl font-extrabold font-mono text-emerald-400">
                {retestRecord.retestCampaign.clickRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.retestCampaign.clicked} clics sur {retestRecord.retestCampaign.targeted} ciblés
              </div>
            </div>

            <div className="pt-3 border-t border-emerald-500/20 space-y-1">
              <div className="text-xs text-slate-400">Taux de signalement :</div>
              <div className="text-xl font-bold font-mono text-emerald-300">
                {retestRecord.retestCampaign.reportRate}%
              </div>
              <div className="text-xs text-slate-400">
                {retestRecord.retestCampaign.reported} signalements spontanés
              </div>
            </div>
          </div>

          {/* Column 3: Évolution Globale */}
          <div className="p-5 rounded-xl border border-[#f2620a]/30 bg-[#f2620a]/10 space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#fb923c]">
                3. Bilan de résilience
              </span>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Réduction du taux de clic :</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    {retestRecord.evolution.clickRateDropPercent}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">Hausse des signalements :</span>
                  <span className="font-bold font-mono text-emerald-400 text-sm">
                    +{retestRecord.evolution.reportRateGainPercent}%
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/10 text-xs text-slate-300 leading-relaxed font-mono">
              "L'ancrage des réflexes s'est confirmé à 14 jours avec une baisse drastique du risque d'usurpation."
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/employee-simulator/EmployeeSimulatorModal.tsx
==================================================
`typescript
import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  MessageSquare,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  ExternalLink,
  Info,
  CheckCircle2,
  Inbox,
  ArrowRight,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Campaign, Scenario } from '../../types';
import { WhatsAppSimulator } from './WhatsAppSimulator';

interface EmployeeSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaign?: Campaign | null;
  scenario?: Scenario | null;
  onEmployeeClickedTrap: (campaignId: string) => void;
  onEmployeeReportedPhish: (campaignId: string) => void;
  onStartTrainingFromTrap: (targetCategoryOrId?: string) => void;
  isDark?: boolean;
}

export const EmployeeSimulatorModal: React.FC<EmployeeSimulatorModalProps> = ({
  isOpen,
  onClose,
  campaign,
  scenario,
  onEmployeeClickedTrap,
  onEmployeeReportedPhish,
  onStartTrainingFromTrap,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const currentCategory = campaign ? campaign.category : scenario?.category || 'Phishing';
  const isWhatsAppInitial = currentCategory === 'WhatsApp Phishing';

  // Active Channel: 'email' | 'whatsapp'
  const [channel, setChannel] = useState<'email' | 'whatsapp'>(isWhatsAppInitial ? 'whatsapp' : 'email');

  // View state: 'inbox' | 'landing_page_clicked' | 'reported_success'
  const [viewState, setViewState] = useState<'inbox' | 'landing_page_clicked' | 'reported_success'>('inbox');

  // Sync channel if scenario changes
  useEffect(() => {
    if (currentCategory === 'WhatsApp Phishing') {
      setChannel('whatsapp');
    }
  }, [currentCategory]);

  const currentScenarioName =
    channel === 'whatsapp'
      ? 'WhatsApp Phishing : Fraude au Président & Whishing'
      : (campaign ? campaign.scenarioName : scenario?.name || 'Simulation Phishing');

  const currentSenderName = scenario?.senderName || 'Microsoft 365 Identity Support';
  const currentSenderEmail = scenario?.senderEmail || 'notifications@m365-security-alert.cloud';
  const currentSubject = scenario?.subject || 'Action requise : Votre mot de passe expire dans 4 heures';
  const currentBody = scenario?.body || '<p>Contenu de simulation</p>';

  const emailRedFlags = scenario?.redFlags || [
    'Nom de domaine non officiel (m365-security-alert.cloud)',
    'Menace de coupure de service sous 4h (fausse urgence)',
    'Lien demandant la saisie immédiate des identifiants',
  ];

  const whatsAppRedFlags = [
    'Numéro de mobile non enregistré dans l\'annuaire interne d\'entreprise',
    'Usurpation d\'un dirigeant (Fraude au Président) ou d\'un support informatique',
    'Prétexte de réunion confidentielle ou NDA pour interdire tout appel vocal',
    'Demande inhabituelle d\'action financière ou de clic sur un lien non sécurisé',
  ];

  const activeRedFlags = channel === 'whatsapp' ? whatsAppRedFlags : emailRedFlags;

  const handleSimulateClickTrap = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (campaign) {
      onEmployeeClickedTrap(campaign.id);
    }
    setViewState('landing_page_clicked');
  };

  const handleSimulateReport = () => {
    if (campaign) {
      onEmployeeReportedPhish(campaign.id);
    }
    setViewState('reported_success');
  };

  const handleLaunchTargetTraining = () => {
    onClose();
    onStartTrainingFromTrap(currentCategory);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] rounded-2xl border border-white/15 bg-[#080b11] text-slate-100 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f2620a]/20 border border-[#f2620a]/40 text-[#fb923c] flex items-center justify-center font-bold text-xs">
              LIVE
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">Aperçu Collaborateur — {currentScenarioName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Mode Simulation
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Test de la réaction réelle du collaborateur sous pression
              </p>
            </div>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono">
              <button
                onClick={() => {
                  setChannel('email');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'email' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email (M365)</span>
              </button>
              <button
                onClick={() => {
                  setChannel('whatsapp');
                  setViewState('inbox');
                }}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === 'whatsapp' ? 'bg-[#f2620a] text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#05070c]">
          {viewState === 'inbox' && (
            <div className="space-y-6">
              {channel === 'email' ? (
                /* Email View */
                <div className="p-6 rounded-2xl border border-white/10 bg-slate-900 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 text-xs font-mono text-slate-400">
                    <div>
                      <div><strong className="text-white">De :</strong> {currentSenderName} &lt;{currentSenderEmail}&gt;</div>
                      <div className="mt-1"><strong className="text-white">Objet :</strong> {currentSubject}</div>
                    </div>

                    {/* Report button */}
                    <button
                      onClick={handleSimulateReport}
                      className="rodium-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 text-emerald-400 border-emerald-500/30 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Signaler l'attaque</span>
                    </button>
                  </div>

                  {/* Body preview */}
                  <div
                    className="text-xs text-slate-200 leading-relaxed font-sans cursor-pointer p-4 bg-slate-950 rounded-xl border border-white/5"
                    onClick={() => handleSimulateClickTrap()}
                    dangerouslySetInnerHTML={{ __html: currentBody }}
                  />
                </div>
              ) : (
                /* WhatsApp View */
                <WhatsAppSimulator
                  onClickedTrap={handleSimulateClickTrap}
                  onReportedPhish={handleSimulateReport}
                />
              )}
            </div>
          )}

          {viewState === 'landing_page_clicked' && (
            /* Trap Clicked Awareness View */
            <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-extrabold text-white">Ceci était une simulation VIGILO</h3>
                <p className="text-sm text-slate-300">
                  Vous avez cliqué sur un lien ou accepté une demande suspecte. Pas de panique, il s'agissait d'un exercice de prévention non punitif !
                </p>
              </div>

              {/* Red Flags List */}
              <div className="p-5 rounded-xl bg-slate-900 border border-white/10 text-left max-w-xl mx-auto space-y-2">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Indices qu'il s'agissait d'un piège :
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeRedFlags.map((flag, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold">•</span>
                      <span>{flag}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleLaunchTargetTraining}
                className="rodium-btn-orange px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Suivre le micro-module de 2 minutes</span>
              </button>
            </div>
          )}

          {viewState === 'reported_success' && (
            /* Reported Success View */
            <div className="p-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-xl mx-auto">
                <h3 className="text-2xl font-extrabold text-white">Excellent réflexe de sécurité !</h3>
                <p className="text-sm text-slate-300">
                  Vous avez identifié et signalé l'attaque avec succès. Votre geste protège l'ensemble de l'entreprise.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-emerald-400 max-w-md mx-auto">
                +15 Points de Vigilance Humaine attribués à votre cohorte !
              </div>

              <button
                onClick={onClose}
                className="rodium-btn-secondary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer le simulateur
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

`

==================================================
FILE: src/components/employee-simulator/WhatsAppSimulator.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Video,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Mic,
  Send,
  Lock,
  ExternalLink,
  CheckCheck,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Sparkles,
  Play,
  Pause,
  MessageCircle,
  Sun,
  Moon,
  FileText,
  Image,
  Camera,
  User,
  BarChart2,
  Check,
} from 'lucide-react';
import { Scenario, WhatsAppMessage } from '../../types';

interface WhatsAppSimulatorProps {
  scenario?: Scenario | null;
  onClickedTrap: () => void;
  onReportedPhish: () => void;
  isDark?: boolean;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  scenario,
  onClickedTrap,
  onReportedPhish,
  isDark: initialIsDark = true,
}) => {
  // Allow toggling WhatsApp theme between official Dark (#111B21) and Light (#EFEAE2)
  const [waTheme, setWaTheme] = useState<'dark' | 'light'>(initialIsDark ? 'dark' : 'light');
  const isWaDark = waTheme === 'dark';

  // Active chat conversation switcher
  const [activeChatId, setActiveChatId] = useState<'ceo' | 'it' | 'quishing'>('ceo');

  // Contact configurations
  const contacts = {
    ceo: {
      name: scenario?.whatsappDetails?.senderTitle || 'Marc V. (PDG - Direction Générale)',
      phone: scenario?.whatsappDetails?.senderPhoneNumber || '+33 6 88 12 94 02',
      initials: scenario?.whatsappDetails?.avatarText || 'MV',
      avatarBg: '#075E54', // Official Sapin Teal
      subtitle: 'en ligne',
      unreadCount: 1,
      lastTime: '10:44',
      lastMessage: 'Ne m\'appelle pas, je ne peux pas...',
      isUnknown: true,
    },
    it: {
      name: 'Astreinte DSI & Sécurité IT',
      phone: '+33 7 56 42 19 80',
      initials: 'IT',
      avatarBg: '#128C7E', // Official Sapin Teal secondary
      subtitle: 'en ligne',
      unreadCount: 1,
      lastTime: '09:23',
      lastMessage: '⚠️ Alerte intrusion anormale M365...',
      isUnknown: true,
    },
    quishing: {
      name: 'WhatsApp Business Sécurité',
      phone: '+33 6 19 02 88 41',
      initials: 'WB',
      avatarBg: '#008069',
      subtitle: 'vu aujourd\'hui à 08:30',
      unreadCount: 0,
      lastTime: '08:30',
      lastMessage: 'Synchronisation d\'appareil Pro...',
      isUnknown: true,
    },
  };

  const activeContact = contacts[activeChatId];

  // Ceo Lure Messages
  const initialCeoMessages: WhatsAppMessage[] = [
    {
      id: 'wa-1',
      sender: 'attacker',
      text: 'Bonjour, c\'est Marc. Je suis actuellement en réunion d\'affaires fermée sous clause de confidentialité (NDA) avec nos auditeurs et la banque.',
      timestamp: '10:41',
      status: 'read',
    },
    {
      id: 'wa-2',
      sender: 'attacker',
      text: 'J\'ai un besoin critique et immédiat : notre prestataire d\'hébergement menace de couper nos serveurs à 12h00 si l\'acompte n\'est pas confirmé par virement.',
      timestamp: '10:42',
      status: 'read',
    },
    {
      id: 'wa-3',
      sender: 'attacker',
      text: 'Peux-tu te connecter tout de suite sur le portail d\'approbation rapide et valider le bon de commande ? C\'est strictement confidentiel, ne préviens personne d\'autre pour l\'instant :',
      timestamp: '10:43',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://validation-tresorerie-groupe.net/auth?token=sec-98124',
      linkText: 'Portail Validation Trésorerie · validation-tresorerie-groupe.net',
    },
    {
      id: 'wa-4',
      sender: 'attacker',
      text: 'Ne m\'appelle pas sur ce numéro, je ne peux pas décrocher en réunion devant les auditeurs. Confirme-moi par message ici dès que tu as validé.',
      timestamp: '10:44',
      status: 'read',
    },
  ];

  // IT Lure Messages
  const initialItMessages: WhatsAppMessage[] = [
    {
      id: 'wa-it-1',
      sender: 'attacker',
      text: '⚠️ [DSI GROUPE · Astreinte 24/7] Bonjour, une tentative d\'intrusion anormale a été détectée sur votre session Microsoft 365 à 09h18.',
      timestamp: '09:22',
      status: 'read',
    },
    {
      id: 'wa-it-2',
      sender: 'attacker',
      text: 'Pour bloquer l\'attaquant et éviter la suspension immédiate de votre messagerie, vous devez valider votre second facteur sur notre portail d\'astreinte sous 15 minutes :',
      timestamp: '09:23',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://portail-m365-helpdesk.cloud/renew-token',
      linkText: 'Portail d\'astreinte MFA · portail-m365-helpdesk.cloud',
    },
  ];

  // Quishing Lure Messages
  const initialQuishingMessages: WhatsAppMessage[] = [
    {
      id: 'wa-q-1',
      sender: 'attacker',
      text: '🔒 [WhatsApp Sécurité Entreprise] Dans le cadre du déploiement de la double authentification hybride, veuillez synchroniser votre terminal pro en validant le portail ci-dessous :',
      timestamp: '08:30',
      status: 'read',
      hasLink: true,
      linkUrl: 'https://whatsapp-web-sso.cloud/device-link',
      linkText: 'Synchronisation Appareil Pro · whatsapp-web-sso.cloud',
    },
  ];

  const [chatConversations, setChatConversations] = useState<{
    ceo: WhatsAppMessage[];
    it: WhatsAppMessage[];
    quishing: WhatsAppMessage[];
  }>({
    ceo: scenario?.whatsappDetails?.messages || initialCeoMessages,
    it: initialItMessages,
    quishing: initialQuishingMessages,
  });

  const messages = chatConversations[activeChatId];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCounterCallModal, setShowCounterCallModal] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sending message simulation
  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim()) return;

    const userMsg: WhatsAppMessage = {
      id: `user-${Date.now()}`,
      sender: 'collaborator',
      text: content,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status: 'delivered',
    };

    setChatConversations((prev) => ({
      ...prev,
      [activeChatId]: [...prev[activeChatId], userMsg],
    }));

    if (!textToSend) setInputText('');

    // Simulate attacker typing & psychological pressure reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      let replyText = 'Dépêche-toi s\'il te plaît, le directeur financier attend ma confirmation pour débloquer les serveurs !';
      if (content.toLowerCase().includes('fixe') || content.toLowerCase().includes('appelle') || content.toLowerCase().includes('téléphone')) {
        replyText = 'Je t\'ai dit que je suis enfermé en négociation avec les auditeurs, je ne peux pas prendre d\'appel ! Fais la validation sur le portail rapidement.';
      } else if (content.toLowerCase().includes('procédure') || content.toLowerCase().includes('comptable') || content.toLowerCase().includes('rib')) {
        replyText = 'C\'est une dérogation exceptionnelle que j\'assume personnellement. Clique sur le lien et je signe l\'ordre en revenant.';
      } else if (content.toLowerCase().includes('lien') || content.toLowerCase().includes('valide')) {
        replyText = 'Parfait, clique immédiatement sur le lien au-dessus et dis-moi dès que la page confirme la validation.';
      }

      const botMsg: WhatsAppMessage = {
        id: `att-reply-${Date.now()}`,
        sender: 'attacker',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      setChatConversations((prev) => ({
        ...prev,
        [activeChatId]: [...prev[activeChatId], botMsg],
      }));
    }, 1400);
  };

  // Official Colors Palette strictly matching user specifications:
  // * Le Vert Clair (Vibrant) – #25D366 (Main brand signature, logo, unread badges, primary buttons, online dot)
  // * Le Vert Sapin (Teal) – #075E54 et #128C7E (Structural contrast, headers, avatars)
  // * Le Fond Noir (Mode Sombre) – #111B21 (Global chat background)
  // * Bulles Envoyées (Mode Sombre) – #005C4B (Official discreet dark green)
  // * Bulles Reçues (Mode Sombre) – #2A3942 (Official dark blue-gray)
  //
  // Mode Clair WhatsApp:
  // * Header – #008069 / #075E54
  // * Fond – #EFEAE2 (Beige WhatsApp)
  // * Bulles Envoyées – #D9FDD3 (Light green)
  // * Bulles Reçues – #FFFFFF (White)
  const colors = isWaDark
    ? {
        mainBg: '#111B21',
        sidebarBg: '#111B21',
        headerBg: '#202C33',
        headerBorder: '#222D34',
        searchBarBg: '#202C33',
        searchInputBg: '#111B21',
        chatBorder: '#222D34',
        chatHover: '#202C33',
        chatActive: '#2A3942',
        receivedBubble: '#2A3942',
        sentBubble: '#005C4B',
        textPrimary: '#E9EDEF',
        textSecondary: '#8696A0',
        inputBarBg: '#202C33',
        inputFieldBg: '#2A3942',
        encryptionPillBg: '#182229',
        encryptionPillBorder: '#222E35',
        encryptionText: '#FFD279',
        dateChipBg: '#182229',
        cardBg: '#182229',
        cardBorder: '#222D34',
      }
    : {
        mainBg: '#EFEAE2',
        sidebarBg: '#FFFFFF',
        headerBg: '#075E54', // Official Sapin Teal for classic WhatsApp header
        headerBorder: '#064F46',
        searchBarBg: '#F0F2F5',
        searchInputBg: '#FFFFFF',
        chatBorder: '#E9EDEF',
        chatHover: '#F5F6F6',
        chatActive: '#EBEFEB',
        receivedBubble: '#FFFFFF',
        sentBubble: '#D9FDD3',
        textPrimary: '#111B21',
        textSecondary: '#667781',
        inputBarBg: '#F0F2F5',
        inputFieldBg: '#FFFFFF',
        encryptionPillBg: '#FFEECD',
        encryptionPillBorder: '#F5DFB5',
        encryptionText: '#54656F',
        dateChipBg: '#FFFFFF',
        cardBg: '#F0F2F5',
        cardBorder: '#D1D7DB',
      };

  return (
    <div
      className="flex-1 flex flex-col h-full select-none overflow-hidden font-sans"
      style={{ backgroundColor: colors.mainBg, color: colors.textPrimary }}
    >
      {/* 1. WHATSAPP WEB TOPBAR / MODE CONTROLS */}
      <div
        className="px-4 py-2 border-b flex items-center justify-between text-xs z-10 shrink-0"
        style={{
          backgroundColor: isWaDark ? '#1F2C34' : '#008069',
          borderColor: isWaDark ? '#222D34' : '#075E54',
          color: '#FFFFFF',
        }}
      >
        <div className="flex items-center gap-2">
          {/* Authentic WhatsApp Bubble Logo */}
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center shadow-xs"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.25 7.15C9.07 7.15 8.78 7.22 8.53 7.48C8.28 7.75 7.57 8.41 7.57 9.76C7.57 11.11 8.55 12.41 8.69 12.6C8.83 12.78 10.6 15.53 13.34 16.71C14 17 14.52 17.17 14.92 17.3C15.6 17.5 16.22 17.48 16.71 17.41C17.26 17.33 18.4 16.72 18.64 16.05C18.88 15.37 18.88 14.8 18.81 14.67C18.74 14.55 18.56 14.48 18.28 14.34C18.01 14.2 16.69 13.55 16.44 13.46C16.19 13.37 16.01 13.32 15.83 13.6C15.65 13.87 15.13 14.48 14.97 14.67C14.81 14.85 14.65 14.87 14.38 14.74C14.1 14.6 13.23 14.31 12.19 13.39C11.38 12.67 10.84 11.78 10.68 11.51C10.52 11.23 10.66 11.08 10.8 10.94C10.93 10.81 11.09 10.6 11.23 10.43C11.37 10.26 11.41 10.14 11.51 9.94C11.6 9.74 11.55 9.57 11.48 9.43C11.41 9.29 10.86 7.95 10.64 7.4C10.42 6.87 10.2 6.94 10.03 6.93C9.88 6.93 9.7 6.93 9.52 6.93L9.25 7.15Z" />
            </svg>
          </div>
          <span className="font-semibold tracking-wide">WhatsApp Web</span>
          <span className="text-[11px] opacity-80 hidden sm:inline">· Simulation Cyber VIGILO</span>
        </div>

        {/* WhatsApp Theme Switcher (Dark Mode / Light Mode) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg p-0.5 border border-white/20 bg-black/20 text-[11px]">
            <button
              onClick={() => setWaTheme('dark')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                isWaDark ? 'bg-white/20 text-white font-bold' : 'text-white/70 hover:text-white'
              }`}
              title="Mode Sombre officiel WhatsApp (#111B21, #005C4B, #2A3942)"
            >
              <Moon className="w-3 h-3" />
              <span>Sombre</span>
            </button>
            <button
              onClick={() => setWaTheme('light')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded cursor-pointer transition-colors ${
                !isWaDark ? 'bg-white/30 text-white font-bold shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="Mode Clair classique WhatsApp (#075E54, #EFEAE2, #D9FDD3)"
            >
              <Sun className="w-3 h-3" />
              <span>Clair</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN WHATSAPP SPLIT LAYOUT (SIDEBAR + CHAT AREA) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: CHAT LIST SIDEBAR */}
        <div
          className="w-72 sm:w-80 md:w-88 border-r flex flex-col shrink-0 overflow-hidden transition-colors"
          style={{
            backgroundColor: colors.sidebarBg,
            borderColor: colors.headerBorder,
          }}
        >
          {/* User profile bar */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b shrink-0"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-xs"
                style={{ backgroundColor: '#128C7E' }}
              >
                PRO
              </div>
              <div className="leading-tight">
                <span className="font-semibold text-xs block truncate" style={{ color: colors.textPrimary }}>
                  Session Collaborateur
                </span>
                <span className="text-[10px]" style={{ color: colors.textSecondary }}>
                  Compte d'entreprise
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2" style={{ color: colors.textSecondary }}>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Statut"
              >
                <span className="w-4 h-4 rounded-full border-2 border-current block" />
              </button>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Nouvelle discussion"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div
            className="p-2 border-b shrink-0"
            style={{
              backgroundColor: isWaDark ? colors.mainBg : '#FFFFFF',
              borderColor: colors.headerBorder,
            }}
          >
            <div
              className="rounded-lg px-3 py-1.5 flex items-center gap-2 text-xs"
              style={{
                backgroundColor: colors.searchBarBg,
                color: colors.textSecondary,
              }}
            >
              <Search className="w-3.5 h-3.5" style={{ color: colors.textSecondary }} />
              <input
                type="text"
                placeholder="Rechercher ou démarrer une discussion"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs focus:outline-none w-full"
                style={{ color: colors.textPrimary }}
              />
            </div>
          </div>

          {/* Conversations list */}
          <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: colors.headerBorder }}>
            {/* Conversation 1: CEO Lure (Active) */}
            <div
              onClick={() => setActiveChatId('ceo')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors relative"
              style={{
                backgroundColor: activeChatId === 'ceo' ? colors.chatActive : 'transparent',
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{ backgroundColor: contacts.ceo.avatarBg }}
                >
                  {contacts.ceo.initials}
                </div>
                {/* Official WhatsApp vibrant green online dot: #25D366 */}
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? '#111B21' : '#FFFFFF',
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.ceo.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.ceo.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <p className="truncate flex items-center gap-1" style={{ color: colors.textSecondary }}>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB] shrink-0" />
                    <span>{contacts.ceo.lastMessage}</span>
                  </p>
                  {/* Official WhatsApp vibrant green unread badge: #25D366 */}
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-[#111B21] flex items-center justify-center shrink-0 ml-1 shadow-xs"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    {contacts.ceo.unreadCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation 2: DSI Astreinte IT */}
            <div
              onClick={() => setActiveChatId('it')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors relative"
              style={{
                backgroundColor: activeChatId === 'it' ? colors.chatActive : 'transparent',
              }}
            >
              <div className="relative shrink-0">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs"
                  style={{ backgroundColor: contacts.it.avatarBg }}
                >
                  {contacts.it.initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? '#111B21' : '#FFFFFF',
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.it.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.it.lastTime}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <p className="truncate" style={{ color: colors.textSecondary }}>
                    {contacts.it.lastMessage}
                  </p>
                  <span
                    className="w-5 h-5 rounded-full text-[10px] font-bold text-[#111B21] flex items-center justify-center shrink-0 ml-1"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    1
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation 3: Quishing QR Code */}
            <div
              onClick={() => setActiveChatId('quishing')}
              className="p-3 flex items-center gap-3 cursor-pointer transition-colors"
              style={{
                backgroundColor: activeChatId === 'quishing' ? colors.chatActive : 'transparent',
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xs text-white shrink-0"
                style={{ backgroundColor: contacts.quishing.avatarBg }}
              >
                {contacts.quishing.initials}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between text-xs mb-0.5">
                  <span className="font-semibold truncate" style={{ color: colors.textPrimary }}>
                    {contacts.quishing.name}
                  </span>
                  <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                    {contacts.quishing.lastTime}
                  </span>
                </div>
                <p className="text-[11px] truncate" style={{ color: colors.textSecondary }}>
                  {contacts.quishing.lastMessage}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MAIN CHAT WINDOW */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          style={{ backgroundColor: colors.mainBg }}
        >
          {/* A. CONVERSATION HEADER */}
          <div
            className="px-4 py-2.5 flex items-center justify-between border-b shrink-0 z-10 transition-colors shadow-xs"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-xs"
                  style={{ backgroundColor: activeContact.avatarBg }}
                >
                  {activeContact.initials}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                  style={{
                    backgroundColor: '#25D366',
                    borderColor: isWaDark ? colors.headerBg : '#FFFFFF',
                  }}
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-xs sm:text-sm truncate" style={{ color: colors.textPrimary }}>
                    {activeContact.name}
                  </h3>
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.2 rounded border shrink-0"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.12)',
                      color: '#EF4444',
                      borderColor: 'rgba(239, 68, 68, 0.3)',
                    }}
                  >
                    Numéro Inconnu
                  </span>
                </div>
                <p className="text-[11px] flex items-center gap-1.5 truncate" style={{ color: colors.textSecondary }}>
                  <span>{activeContact.phone}</span>
                  <span>·</span>
                  <span style={{ color: '#25D366' }} className="font-medium">
                    {activeContact.subtitle}
                  </span>
                </p>
              </div>
            </div>

            {/* VIGILO Reflex Buttons in Header */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Counter-call button (The Golden Rule against Whishing) */}
              <button
                onClick={() => setShowCounterCallModal(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-xs"
                style={{
                  backgroundColor: isWaDark ? '#2A3942' : '#FFFFFF',
                  borderColor: isWaDark ? '#3B4A54' : '#D1D7DB',
                  color: isWaDark ? '#E9EDEF' : '#111B21',
                }}
                title="Tester le réflexe du contre-appel indépendant sur numéro officiel"
              >
                <PhoneCall className="w-3.5 h-3.5 text-[#53BDEB]" />
                <span className="hidden md:inline">Tester le contre-appel</span>
              </button>

              {/* VIGILO Report Button: Official Vibrant Green #25D366 */}
              <button
                onClick={onReportedPhish}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all shadow-md cursor-pointer hover:opacity-95"
                style={{
                  backgroundColor: '#25D366', // Official Vibrant Green signature
                  color: '#111B21',
                }}
                title="Signaler ce message suspect comme tentative de Whishing / Fraude à VIGILO"
              >
                <ShieldCheck className="w-4 h-4 text-[#111B21]" />
                <span>Signaler à VIGILO</span>
              </button>

              <div
                className="hidden lg:flex items-center gap-1 pl-2 border-l"
                style={{
                  borderColor: isWaDark ? '#2A3942' : '#D1D7DB',
                  color: colors.textSecondary,
                }}
              >
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Video className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Phone className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* B. CHAT MESSAGES BODY WITH AUTHENTIC WHATSAPP BACKGROUND */}
          <div
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 relative transition-colors"
            style={{
              backgroundColor: colors.mainBg,
              // Authentic WhatsApp subtle doodle wallpaper
              backgroundImage: isWaDark
                ? `radial-gradient(#1e2c34 1px, transparent 1px)`
                : `radial-gradient(#d1d7db 1px, transparent 1px)`,
              backgroundSize: '16px 16px',
            }}
          >
            {/* Authentic WhatsApp Encryption Banner */}
            <div
              className="max-w-md mx-auto my-2 p-2.5 rounded-lg border shadow-xs flex items-start gap-2 text-center text-[11px] leading-relaxed select-text"
              style={{
                backgroundColor: colors.encryptionPillBg,
                borderColor: colors.encryptionPillBorder,
                color: colors.encryptionText,
              }}
            >
              <Lock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Les messages et les appels sont chiffrés de bout en bout. Aucun tiers en dehors de cette discussion, pas même WhatsApp, ne peut les lire ni les écouter. Cliquez pour en savoir plus.
              </span>
            </div>

            {/* Date separator pill */}
            <div className="flex justify-center my-2">
              <span
                className="px-3 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider shadow-xs"
                style={{
                  backgroundColor: colors.dateChipBg,
                  color: colors.textSecondary,
                }}
              >
                Aujourd'hui
              </span>
            </div>

            {/* Official Unknown Contact Safety Card */}
            <div
              className="max-w-lg mx-auto p-3 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-xs"
              style={{
                backgroundColor: isWaDark ? '#1F2C34' : '#FFFFFF',
                borderColor: colors.headerBorder,
              }}
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[11px]" style={{ color: colors.textSecondary }}>
                  <strong className="text-amber-500">Alerte sécurité :</strong> Cet expéditeur ne figure pas dans vos contacts.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={onReportedPhish}
                  className="px-2.5 py-1 rounded text-[11px] font-semibold border border-red-500/30 text-red-500 hover:bg-red-500/10 cursor-pointer"
                >
                  Bloquer
                </button>
              </div>
            </div>

            {/* Message Stream with Official WhatsApp Bubbles */}
            <div className="space-y-3 max-w-xl mx-auto pt-2">
              {messages.map((msg) => {
                const isAttacker = msg.sender === 'attacker';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isAttacker ? 'items-start' : 'items-end'}`}
                  >
                    {/* Message bubble with authentic WhatsApp pointy tail */}
                    <div
                      className={`relative max-w-[88%] sm:max-w-[80%] rounded-xl p-3 shadow-xs text-xs leading-relaxed select-text ${
                        isAttacker ? 'rounded-tl-xs' : 'rounded-tr-xs'
                      }`}
                      style={{
                        // Exact WhatsApp Official Colors:
                        // Sombre: Reçu #2A3942 | Envoyé #005C4B
                        // Clair: Reçu #FFFFFF | Envoyé #D9FDD3
                        backgroundColor: isAttacker ? colors.receivedBubble : colors.sentBubble,
                        color: isAttacker
                          ? isWaDark ? '#E9EDEF' : '#111B21'
                          : isWaDark ? '#E9EDEF' : '#111B21',
                      }}
                    >
                      {/* Triangle speech notch */}
                      <span
                        className="absolute top-0 w-0 h-0 border-solid"
                        style={
                          isAttacker
                            ? {
                                left: '-7px',
                                borderWidth: '0 8px 8px 0',
                                borderColor: `transparent ${colors.receivedBubble} transparent transparent`,
                              }
                            : {
                                right: '-7px',
                                borderWidth: '8px 8px 0 0',
                                borderColor: `${colors.sentBubble} transparent transparent transparent`,
                              }
                        }
                      />

                      {/* Attacker Sender info */}
                      {isAttacker && (
                        <div
                          className="text-[11px] font-bold mb-1 flex items-center gap-1.5"
                          style={{ color: '#25D366' }} // Official WhatsApp green signature
                        >
                          <span>{activeContact.name}</span>
                          <span
                            className="text-[10px] font-normal"
                            style={{ color: colors.textSecondary }}
                          >
                            ({activeContact.phone})
                          </span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      {/* Phishing Trap Link Card: WhatsApp rich preview format */}
                      {msg.hasLink && (
                        <div
                          onClick={onClickedTrap}
                          className="mt-2.5 p-2.5 rounded-lg border cursor-pointer transition-all group flex flex-col gap-1.5 shadow-inner"
                          style={{
                            backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
                            borderColor: colors.chatBorder,
                          }}
                          title="Cliquer pour simuler le comportement du collaborateur"
                        >
                          <div
                            className="flex items-center gap-1.5 font-bold text-[11px]"
                            style={{ color: '#25D366' }}
                          >
                            <ExternalLink className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                            <span>Portail d'Accès Sécurisé VIGILO</span>
                          </div>

                          <div
                            className="text-xs font-semibold group-hover:underline transition-colors"
                            style={{ color: colors.textPrimary }}
                          >
                            {msg.linkText || 'Cliquer ici pour valider l\'ordre de virement sous 2h'}
                          </div>

                          <div className="text-[10px] font-mono truncate" style={{ color: '#53BDEB' }}>
                            {msg.linkUrl}
                          </div>

                          <div
                            className="pt-1 border-t flex items-center justify-between text-[10px] font-semibold"
                            style={{ borderColor: colors.chatBorder }}
                          >
                            <span className="text-amber-500">Demande d'action sous 2h</span>
                            <span
                              className="flex items-center gap-0.5 font-bold"
                              style={{ color: '#25D366' }}
                            >
                              Ouvrir le portail <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Timestamp & read status receipts */}
                      <div
                        className="flex items-center justify-end gap-1 mt-1 text-[10px]"
                        style={{ color: colors.textSecondary }}
                      >
                        <span>{msg.timestamp}</span>
                        {!isAttacker && (
                          <CheckCheck className="w-3.5 h-3.5 text-[#53BDEB]" /> // Official blue double checks
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Simulated Voice Message Lure */}
              {activeChatId === 'ceo' && (
                <div className="flex flex-col items-start">
                  <div
                    className="relative max-w-[88%] sm:max-w-[75%] rounded-xl rounded-tl-xs p-3 text-xs space-y-2 shadow-xs"
                    style={{
                      backgroundColor: colors.receivedBubble,
                      color: colors.textPrimary,
                    }}
                  >
                    <span
                      className="absolute top-0 w-0 h-0 border-solid"
                      style={{
                        left: '-7px',
                        borderWidth: '0 8px 8px 0',
                        borderColor: `transparent ${colors.receivedBubble} transparent transparent`,
                      }}
                    />

                    <div className="flex items-center gap-3">
                      {/* Play button with Official Green: #25D366 */}
                      <button
                        onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer shadow-xs hover:scale-105 transition-transform"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4 text-[#111B21]" />
                        ) : (
                          <Play className="w-4 h-4 fill-[#111B21] text-[#111B21]" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        {/* Audio wave visualization */}
                        <div className="flex items-center gap-0.5 h-5">
                          {[10, 18, 8, 22, 14, 26, 12, 20, 9, 24, 16, 12, 18, 8, 14, 22, 10].map(
                            (h, idx) => (
                              <span
                                key={idx}
                                className="w-1 rounded-full transition-colors"
                                style={{
                                  height: `${h}px`,
                                  backgroundColor: isPlayingAudio && idx < 8 ? '#25D366' : colors.textSecondary,
                                }}
                              />
                            )
                          )}
                        </div>
                        <div
                          className="flex items-center justify-between text-[10px]"
                          style={{ color: colors.textSecondary }}
                        >
                          <span>{isPlayingAudio ? '0:07 / 0:18' : '0:18'}</span>
                          <span className="font-semibold" style={{ color: '#25D366' }}>
                            Note vocale urgente du PDG
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="flex items-center justify-end text-[10px]"
                      style={{ color: colors.textSecondary }}
                    >
                      <span>10:45</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div
                  className="flex items-center gap-2 text-xs italic px-2 animate-pulse"
                  style={{ color: colors.textSecondary }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: '#25D366' }}
                  />
                  <span>{activeContact.name} est en train d'écrire...</span>
                </div>
              )}
            </div>

            {/* Quick Testing Bar for Administrators / Evaluators */}
            <div
              className="max-w-xl mx-auto mt-6 p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
              style={{
                backgroundColor: colors.cardBg,
                borderColor: colors.cardBorder,
              }}
            >
              <span className="text-[11px]" style={{ color: colors.textSecondary }}>
                <strong>VIGILO Test :</strong> Cliquez sur le lien pour simuler un collaborateur piégé et déclencher la formation WhatsApp Whishing, ou sur <em>Signaler</em> pour tester le réflexe de défense.
              </span>
              <button
                onClick={onClickedTrap}
                className="px-3 py-1.5 rounded-lg text-red-500 border border-red-500/40 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 hover:bg-red-500/10"
              >
                Simuler le piège (Clic)
              </button>
            </div>
          </div>

          {/* C. QUICK SUGGESTED ANSWERS */}
          <div
            className="px-4 py-2 border-t flex items-center gap-2 overflow-x-auto shrink-0 z-10"
            style={{
              backgroundColor: isWaDark ? colors.headerBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            <span
              className="text-[10px] uppercase font-mono shrink-0 font-bold"
              style={{ color: colors.textSecondary }}
            >
              Réponses types :
            </span>
            {[
              '📞 Je t\'appelle d\'abord sur ton fixe officiel',
              '🔒 Respect de la procédure comptable habituelle',
              '⚠️ D\'accord, je clique sur le lien pour valider',
            ].map((reply, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(reply)}
                className="px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap transition-colors cursor-pointer shrink-0 shadow-xs hover:border-[#25D366]"
                style={{
                  backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
                  borderColor: colors.headerBorder,
                  color: colors.textPrimary,
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          {/* D. AUTHENTIC WHATSAPP INPUT BAR */}
          <div
            className="p-3 border-t flex items-center gap-2.5 shrink-0 z-10 transition-colors"
            style={{
              backgroundColor: isWaDark ? colors.inputBarBg : '#F0F2F5',
              borderColor: colors.headerBorder,
            }}
          >
            {/* Smile / Emoji */}
            <button
              className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
              style={{ color: colors.textSecondary }}
              title="Émojis"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Paperclip / Attachments */}
            <div className="relative">
              <button
                onClick={() => setShowAttachMenu(!showAttachMenu)}
                className="p-1.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: colors.textSecondary }}
                title="Joindre"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Attachment Popover menu */}
              {showAttachMenu && (
                <div
                  className="absolute bottom-12 left-0 p-2 rounded-xl shadow-xl border flex flex-col gap-2 z-30 animate-in fade-in zoom-in-95 duration-150"
                  style={{
                    backgroundColor: isWaDark ? '#202C33' : '#FFFFFF',
                    borderColor: colors.headerBorder,
                  }}
                >
                  {[
                    { label: 'Document', icon: FileText, color: '#7F66FF' },
                    { label: 'Photos et vidéos', icon: Image, color: '#007BFC' },
                    { label: 'Caméra', icon: Camera, color: '#FF2E74' },
                    { label: 'Contact', icon: User, color: '#009DE2' },
                    { label: 'Sondage', icon: BarChart2, color: '#FFBC38' },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        onClick={() => setShowAttachMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-black/10 dark:hover:bg-white/10 text-xs transition-colors"
                        style={{ color: colors.textPrimary }}
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: item.color }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-medium whitespace-nowrap">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Input field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex-1 flex items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Écrivez un message sur WhatsApp..."
                className="w-full px-4 py-2 rounded-lg text-xs focus:outline-none transition-colors"
                style={{
                  backgroundColor: colors.inputFieldBg,
                  color: colors.textPrimary,
                }}
              />
            </form>

            {/* Mic or Send button: Official Vibrant Green #25D366 */}
            {inputText.trim() ? (
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-md cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: '#25D366' }} // Official signature green
                title="Envoyer"
              >
                <Send className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
                style={{ color: colors.textSecondary }}
                title="Message vocal"
              >
                <Mic className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MODAL DE CONTRE-APPEL (LA RÈGLE D'OR WHATSAPP) */}
      {showCounterCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div
            className="w-full max-w-md rounded-2xl border p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: isWaDark ? '#111B21' : '#FFFFFF',
              borderColor: isWaDark ? '#2A3942' : '#D1D7DB',
              color: colors.textPrimary,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-md"
                style={{ backgroundColor: '#075E54' }}
              >
                <PhoneCall className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider font-semibold" style={{ color: '#25D366' }}>
                  Réflexe VIGILO · Règle d'or
                </span>
                <h3 className="text-base font-bold" style={{ color: colors.textPrimary }}>
                  Le Contre-Appel Indépendant
                </h3>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border text-xs space-y-2 leading-relaxed"
              style={{
                backgroundColor: isWaDark ? '#182229' : '#F0F2F5',
                borderColor: isWaDark ? '#222D34' : '#E2E8F0',
              }}
            >
              <p className="font-semibold text-emerald-500">
                Vous composez le numéro fixe officiel de Marc figurant dans l'annuaire d'entreprise :
              </p>
              <p className="italic border-l-2 pl-3 py-1" style={{ borderColor: '#25D366' }}>
                « Allô ? Marc à l'appareil. Un virement d'urgence sur WhatsApp ? C'est absolument faux, je n'ai envoyé aucun message ! C'est une tentative de fraude au président ! »
              </p>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: colors.textSecondary }}>
              <strong>Bilan :</strong> En passant par un canal séparé (le poste fixe interne), vous venez de neutraliser l'attaque en moins de 30 secondes sans rien compromettre !
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowCounterCallModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium cursor-pointer border"
                style={{
                  borderColor: colors.headerBorder,
                  color: colors.textSecondary,
                }}
              >
                Retour au chat
              </button>
              <button
                onClick={() => {
                  setShowCounterCallModal(false);
                  onReportedPhish();
                }}
                className="px-4 py-2 rounded-lg font-bold text-xs text-[#111B21] shadow-md cursor-pointer hover:opacity-95"
                style={{ backgroundColor: '#25D366' }}
              >
                Signaler la tentative à VIGILO
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

`

==================================================
FILE: src/components/flash-news/FlashNewsView.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  Bell,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Users,
  MessageSquare,
  Mail,
  ShieldAlert,
  ArrowRight,
  BookOpen,
  X,
  Share2,
  Sparkles,
} from 'lucide-react';
import { FlashArticle } from '../../types';

interface FlashNewsViewProps {
  articles: FlashArticle[];
  onBroadcastArticle: (articleId: string) => void;
  onCreateArticle: (newArticle: Omit<FlashArticle, 'id' | 'publishedAt' | 'readCount' | 'readRate'>) => void;
  isDark?: boolean;
}

export const FlashNewsView: React.FC<FlashNewsViewProps> = ({
  articles,
  onBroadcastArticle,
  onCreateArticle,
  isDark = true,
}) => {
  const [selectedArticleId, setSelectedArticleId] = useState<string>(articles[0]?.id || '');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [broadcastedNotice, setBroadcastedNotice] = useState<string | null>(null);

  // New article form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Alerte Urgente' | 'Bonne Pratique' | 'Menace Émergente' | 'Conseil Outils'>('Alerte Urgente');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [channels, setChannels] = useState<('Email' | 'WhatsApp')[]>(['Email', 'WhatsApp']);

  const activeArticle = articles.find((a) => a.id === selectedArticleId) || articles[0];

  const handleBroadcast = (id: string, articleTitle: string) => {
    onBroadcastArticle(id);
    setBroadcastedNotice(`Bulletin diffusé avec succès sur Email et WhatsApp à l'ensemble des 32 collaborateurs !`);
    setTimeout(() => setBroadcastedNotice(null), 5000);
  };

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onCreateArticle({
      title,
      category,
      summary: summary || title,
      content,
      author: 'Pôle Sécurité IT VIGILO',
      totalRecipients: 32,
      keyTakeaway: keyTakeaway || 'Toujours vérifier avant de cliquer ou de transférer des fonds.',
      channels,
    });

    setTitle('');
    setContent('');
    setSummary('');
    setKeyTakeaway('');
    setIsCreateModalOpen(false);
    setBroadcastedNotice('Nouvelle alerte rédigée et prête à être diffusée !');
    setTimeout(() => setBroadcastedNotice(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Flash Infos & Veille Cyber</h1>
            <span className="text-xs px-2 py-0.5 rounded font-mono bg-blue-500/10 text-blue-500 border border-blue-500/20">
              Sensibilisation continue
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Mettez au parfum vos collaborateurs entre deux campagnes via des alertes courtes diffusées sur Email & WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Rédiger une alerte</span>
        </button>
      </div>

      {/* Broadcast Toast Notice */}
      {broadcastedNotice && (
        <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{broadcastedNotice}</span>
          </div>
          <button
            onClick={() => setBroadcastedNotice(null)}
            className="text-xs font-semibold hover:underline"
          >
            Fermer
          </button>
        </div>
      )}

      {/* Two columns: Articles list & Active article reading pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Articles List */}
        <div className="lg:col-span-5 space-y-3">
          {articles.map((art) => {
            const isSelected = activeArticle?.id === art.id;
            return (
              <div
                key={art.id}
                onClick={() => setSelectedArticleId(art.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-slate-900 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">{art.publishedAt}</span>
                    <span>·</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{art.category}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-slate-500">
                    {art.channels.includes('WhatsApp') && <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />}
                    {art.channels.includes('Email') && <Mail className="w-3.5 h-3.5 text-blue-500" />}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {art.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>{art.readCount}/{art.totalRecipients} lecteurs ({art.readRate}%)</span>
                  </span>

                  <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5">
                    Consulter <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Article Details & Push actions */}
        {activeArticle && (
          <div className="lg:col-span-7 p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                  {activeArticle.category} · {activeArticle.publishedAt}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">Canaux activés :</span>
                  {activeArticle.channels.map((ch) => (
                    <span
                      key={ch}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      {ch}
                    </span>
                  ))}
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-snug">
                {activeArticle.title}
              </h2>

              <p className="text-xs text-slate-500">
                Rédigé par <strong className="text-slate-700 dark:text-slate-300">{activeArticle.author}</strong> · Lecture estimée : 2 minutes
              </p>
            </div>

            {/* Key takeaway card */}
            <div className="p-3.5 rounded-lg border border-amber-500/20 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300 text-xs space-y-1">
              <strong className="block font-semibold">Le réflexe à retenir :</strong>
              <p>{activeArticle.keyTakeaway}</p>
            </div>

            {/* Article Content */}
            <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line space-y-3 font-sans">
              {activeArticle.content}
            </div>

            {/* Read Stats & Broadcast Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{activeArticle.readCount} collaborateurs ont validé la lecture sur 32</span>
                </div>
                <div className="w-48 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${activeArticle.readRate}%` }}
                  />
                </div>
              </div>

              <button
                onClick={() => handleBroadcast(activeArticle.id, activeArticle.title)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                title="Renvoyer une notification rappel aux collaborateurs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Diffuser aux collaborateurs</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Rédiger un nouveau Flash Info */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Rédiger un Flash Info de sensibilisation
                </h3>
                <p className="text-[11px] text-slate-500">
                  Ce bulletin sera notifié aux collaborateurs par email et/ou WhatsApp
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNew} className="p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Titre de l'alerte</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Attention aux faux emails de facture Orange reçus ce matin"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Catégorie</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="Alerte Urgente">Alerte Urgente</option>
                    <option value="Bonne Pratique">Bonne Pratique</option>
                    <option value="Menace Émergente">Menace Émergente</option>
                    <option value="Conseil Outils">Conseil Outils</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Canaux de diffusion</label>
                  <div className="flex items-center gap-4 pt-2">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.includes('Email')}
                        onChange={(e) => {
                          if (e.target.checked) setChannels((prev) => [...prev, 'Email']);
                          else setChannels((prev) => prev.filter((c) => c !== 'Email'));
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>Email</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channels.includes('WhatsApp')}
                        onChange={(e) => {
                          if (e.target.checked) setChannels((prev) => [...prev, 'WhatsApp']);
                          else setChannels((prev) => prev.filter((c) => c !== 'WhatsApp'));
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span>WhatsApp Pro</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Contenu du message (court et percutant)</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Décrivez la menace, pourquoi elle est dangereuse, et ce que chaque employé doit faire..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Le réflexe à retenir (1 phrase)</label>
                <input
                  type="text"
                  placeholder="ex: Toujours téléphoner au fournisseur sur son numéro habituel avant de changer un RIB."
                  value={keyTakeaway}
                  onChange={(e) => setKeyTakeaway(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs cursor-pointer"
                >
                  Enregistrer et diffuser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

`

==================================================
FILE: src/components/settings/SettingsView.tsx
==================================================
`typescript
import React, { useState } from 'react';
import {
  Settings,
  Server,
  Building2,
  Shield,
  CheckCircle2,
  Key,
  Globe,
  Sliders,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { SimulationProviderSettings } from '../../types';

interface SettingsViewProps {
  settings: SimulationProviderSettings;
  onUpdateSettings: (newSettings: SimulationProviderSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
}) => {
  const [provider, setProvider] = useState<'mock' | 'gophish'>(settings.provider);
  const [gophishUrl, setGophishUrl] = useState(settings.gophishUrl);
  const [gophishApiKey, setGophishApiKey] = useState(settings.gophishApiKey);
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [companyDomain, setCompanyDomain] = useState(settings.companyDomain);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      provider,
      gophishUrl,
      gophishApiKey,
      companyName,
      companyDomain,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <span>Paramètres de la plateforme VIGILO</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Configurez le moteur de simulation, l'environnement de l'entreprise et les politiques d'exercice.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Simulation Provider selection (Mock vs Gophish per specs) */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-400" />
              <span>Moteur de simulation (Simulation Engine)</span>
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Opérationnel
            </span>
          </div>

          <p className="text-slate-400 text-xs">
            Choisissez entre le <strong>Mock Simulation Provider</strong> (idéal pour la démonstration immédiate et le test du parcours collaborateur) et le <strong>Gophish Provider</strong> (intégration autorisée d'un serveur d'envoi réel).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div
              onClick={() => setProvider('mock')}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                provider === 'mock'
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Mock Simulation Provider</span>
                {provider === 'mock' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Recommandé pour la démonstration sans dépendance externe. Simule la boîte de messagerie, les clics et le plugin de signalement.
              </p>
            </div>

            <div
              onClick={() => setProvider('gophish')}
              className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                provider === 'gophish'
                  ? 'border-blue-500 bg-blue-950/30'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-sm">Gophish API Provider</span>
                {provider === 'gophish' && <CheckCircle2 className="w-4 h-4 text-blue-400" />}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Connecteur API officiel pour serveur Gophish d'entreprise (contexte autorisé uniquement).
              </p>
            </div>
          </div>

          {/* Gophish settings if active */}
          {provider === 'gophish' && (
            <div className="p-4 rounded-lg bg-slate-900/80 border border-slate-800 space-y-3 pt-3 animate-in fade-in">
              <div className="space-y-1">
                <label className="font-semibold text-slate-300">URL du serveur Gophish</label>
                <input
                  type="text"
                  value={gophishUrl}
                  onChange={(e) => setGophishUrl(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-300">Clé API Gophish (Admin Token)</label>
                <input
                  type="password"
                  value={gophishApiKey}
                  onChange={(e) => setGophishApiKey(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* Company Settings */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Organisation PME cible</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Nom de l'entreprise</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Domaine de messagerie officiel</label>
              <input
                type="text"
                value={companyDomain}
                onChange={(e) => setCompanyDomain(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* AI & Security Policy Notice */}
        <div className="p-6 rounded-xl border border-slate-800 bg-[#0d131f] space-y-3">
          <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Architecture sécurisée RodiumAI</span>
          </div>

          <p className="text-slate-400 leading-relaxed text-xs">
            Conformément aux spécifications de sécurité VIGILO, les clés d'API (RodiumAI / Gemini) sont gérées exclusivement côté serveur via les variables d'environnement (<code>process.env.GEMINI_API_KEY</code>). Aucune clé secrète n'est exposée au navigateur.
          </p>

          <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono pt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Serveur proxy backend actif · User-Agent aistudio-build vérifié</span>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          {savedNotification ? (
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paramètres enregistrés avec succès.</span>
            </span>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-900/40 cursor-pointer transition-all"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
};

`

