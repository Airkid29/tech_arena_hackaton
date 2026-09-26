import { Campaign, Scenario, TrainingModule, ReTestRecord, SimulationProviderSettings, FlashArticle, Employee } from '../types';

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 'emp-1', firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@entreprise.com', department: 'Finance', role: 'Comptable', riskScore: 85 },
  { id: 'emp-2', firstName: 'Marie', lastName: 'Curie', email: 'marie.curie@entreprise.com', department: 'IT', role: 'Développeuse', riskScore: 12 },
  { id: 'emp-3', firstName: 'Paul', lastName: 'Martin', email: 'paul.martin@entreprise.com', department: 'RH', role: 'Manager', riskScore: 45 },
];

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
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold;">Montant à régler :</td><td style="padding:8px;border:1px solid #e2e8f0;">2 840,00 € TTC</td></tr>
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
    Votre livraison professionnelle n° CP-981024 n'a pas pu être déposée. Merci de reprogrammer votre passage et régler 1,95 € avant ce soir sur : <br><br>
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
