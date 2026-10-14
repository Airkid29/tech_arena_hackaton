# VIGILO — Pitch de quart de finale AI4Youth-Lomé 2026

**Format :** 8 minutes de pitch et démonstration, puis 2 minutes de questions.

**Objectif du jury à cette étape :** impact et pertinence (30 %), centralité de l’IA (35 %), faisabilité et clarté technique (25 %), qualité/complétude du pitch (10 %).
**Important :** aucun livrable n’est exigé aux quarts de finale selon la charte. Ce script sert à l’oral ; adapter les éléments entre crochets avec les informations réelles de l’équipe.

## Fil rouge

Suivre un seul cas du début à la fin : un message WhatsApp urgent prétendant venir d’un dirigeant, puis montrer comment une PME peut entraîner ses collaborateurs à le vérifier et mesurer leur progression. Présenter le cas comme une **simulation pédagogique contrôlée**, jamais comme une attaque réelle.

## Script minuté

### 0:00–0:50 — Le problème et l’impact

> « Imaginez une PME de Lomé. Une personne de l’équipe finance reçoit un message urgent qui semble venir de la direction et demande de valider un paiement. Elle hésite : comment savoir si son équipe reconnaîtra la pression et vérifiera l’identité de l’expéditeur ?
> Les petites entreprises ont rarement un spécialiste cyber ou le temps de suivre des formations longues. Pourtant, un seul réflexe — vérifier par un canal indépendant et signaler — peut interrompre une fraude. VIGILO part de ce besoin concret : entraîner les comportements, pas seulement diffuser des conseils. »

**À l’écran :** afficher le titre VIGILO et la boucle Simuler → Mesurer → Analyser → Former → Re-tester.

**À ne pas dire sans source vérifiable :** « 80/90 % des attaques réussies passent par l’humain » ou un montant moyen de fraude comme s’il s’agissait de données établies pour le Togo. Si une statistique est ajoutée, citer sa source et son périmètre.

### 0:50–1:35 — La solution

> « VIGILO est un prototype de console de cyber-résilience destiné aux PME. Il rassemble cinq étapes : créer une simulation par email ou dans un parcours WhatsApp pédagogique, observer les clics et les signalements, obtenir une analyse, proposer un court module ciblé, puis comparer une campagne de re-test.
> L’objectif est non punitif : transformer les erreurs en apprentissage et encourager le signalement. Le projet vise d’abord le contexte des PME togolaises et ouest-africaines, où les équipes ont besoin d’outils simples et abordables. »

### 1:35–3:35 — Démonstration du prototype

**1. Choisir ou générer un scénario (≈ 35 s)**

Ouvrir le catalogue ou la génération de scénario. Montrer le public cible, le type de scénario et les signes d’alerte produits. Ne présenter le résultat comme généré par une API externe que si son fonctionnement a été vérifié avant le passage ; sinon, annoncer clairement que le scénario affiché vient du moteur de secours intégré.

**2. Montrer l’expérience collaborateur (≈ 35 s)**

Ouvrir le simulateur WhatsApp et montrer le message urgent, puis la bonne réaction : vérifier par un canal connu et signaler. Préciser : « C’est un simulateur dans l’application ; l’intégration WhatsApp Business et l’envoi réel de campagnes WhatsApp ne sont pas implémentés. »

**3. Montrer la mesure et le Coach (≈ 35 s)**

Revenir au tableau de bord ou à une campagne de démonstration. Montrer les indicateurs de clic et de signalement, puis ouvrir l’analyse du Coach. Dire : « Les chiffres préchargés dans cette démonstration sont des données de prototype ; ils ne représentent pas les résultats d’un pilote réel. »

**4. Montrer l’apprentissage et le re-test (≈ 15 s)**

Ouvrir un module interactif avec ses signes d’alerte et son quiz, puis la vue de comparaison du re-test. Présenter celle-ci comme le parcours fonctionnel du prototype, pas comme une amélioration déjà validée auprès d’utilisateurs.

**Si la démo bloque :** passer à des captures d’écran préparées et poursuivre l’explication sans prétendre qu’une action a réussi.

### 3:35–4:55 — Pourquoi l’IA est centrale

> « L’IA intervient à trois moments précis : proposer des scénarios adaptés au public et au contexte saisis, analyser les résultats d’une campagne, puis générer une micro-formation sur la vulnérabilité identifiée. Elle aide une petite structure sans expert cyber à passer des indicateurs à une prochaine action concrète.
> Techniquement, le frontend React/TypeScript appelle un backend Node/Express. Le serveur peut utiliser Gemini ou RodiumAI lorsque les clés et le service sont configurés ; les clés ne sont pas envoyées au navigateur. Des réponses de secours intégrées permettent aussi de faire fonctionner le parcours de démonstration lorsque l’IA externe est indisponible. »

**À montrer si disponible :** le moteur utilisé (« Gemini », « RodiumAI » ou « vigilo-builtin ») et un exemple de scénario, d’analyse ou de formation généré. Distinguer une réponse réellement produite par un modèle d’une réponse de secours.

### 4:55–5:55 — Impact mesurable et éthique

> « Nous ne revendiquons pas encore une baisse mesurée des incidents : nous sommes au stade prototype. Pour un pilote, nous établirons une mesure de départ, proposerons une formation ciblée, puis comparerons un scénario de re-test. Les indicateurs seront le taux de clic, le taux de signalement, la complétion du module et l’évolution entre les deux campagnes.
> Nous voulons une démarche pédagogique, avec autorisation de l’entreprise, information claire des participants et résultats utilisés pour améliorer les pratiques, pas pour sanctionner des personnes. Les règles de conservation, d’accès et d’agrégation des données devront être définies avant tout déploiement réel. »

### 5:55–6:55 — Faisabilité et limites actuelles

> « Le prototype comprend une console, un simulateur email/WhatsApp, des campagnes, un Coach IA, des modules interactifs et une vue de re-test. Le backend expose les routes de génération, d’analyse et de formation. Pour l’envoi, un endpoint email SMTP existe ; le moteur de démonstration est principalement alimenté par des données initiales et l’état de l’application.
> Nous ne présentons donc pas encore un produit de production : les données métier ne sont pas persistées dans une base, l’authentification est une maquette, le parcours WhatsApp est simulé et l’efficacité n’a pas encore été validée par un pilote. Le prochain jalon est de tester le parcours avec des PME et d’améliorer le prototype à partir de leurs retours. »

### 6:55–7:35 — Équipe et plan immédiat

> « Notre équipe réunit [nom et rôle], [nom et rôle] et [nom et rôle]. Nos compétences complémentaires couvrent [technique / cybersécurité / produit / terrain].
> Après ce quart de finale, nos priorités sont de valider les besoins avec des PME, localiser les scénarios avec des exemples pertinents pour le Togo, fiabiliser la mesure et la protection des données, puis préparer un prototype plus robuste pour les demi-finales. »

**Avant le pitch :** remplacer les crochets par les personnes, rôles et expériences réellement vérifiables. Vérifier aussi l’éligibilité universitaire de l’équipe et la disponibilité des justificatifs authentiques demandés pour les phases concernées.

### 7:35–8:00 — Conclusion

> « VIGILO transforme une simulation autorisée en apprentissage mesurable : on repère un réflexe à renforcer, on forme, puis on re-teste. Nous voulons construire avec les PME du Togo un outil simple, responsable et adapté à leurs risques réels. AI4Youth nous aidera à valider cette approche et à faire évoluer le prototype. Merci. »

## Préparation des 2 minutes de questions

Répondre en une idée principale, puis un fait concret du prototype.

**« Est-ce que l’IA fonctionne déjà ? »**

« Le backend intègre les appels aux services Gemini et RodiumAI lorsqu’ils sont configurés. Le prototype a aussi un moteur de secours. Pendant la démo, je préciserai le moteur réellement utilisé pour chaque résultat. »

**« WhatsApp est-il connecté ? »**

« Non. Le parcours WhatsApp est une simulation pédagogique dans l’application. Une intégration WhatsApp Business contrôlée reste un travail futur. »

**« Vos chiffres prouvent-ils une réduction du risque ? »**

« Non, pas encore. Les chiffres visibles aujourd’hui servent à la démonstration. Nous mesurerons l’évolution lors d’un pilote, en comparant une campagne de départ et un re-test avec les mêmes indicateurs. »

**« Qu’est-ce qui est déjà fonctionnel ? »**

« Le prototype permet de parcourir la console, visualiser des campagnes, utiliser le simulateur, consulter une analyse et un module, et voir le principe du re-test. Les données d’exemple sont locales au prototype ; ce n’est pas encore une plateforme multi-client persistante. »

**« Comment protégez-vous les employés et leurs données ? »**

« La démarche prévue est autorisée, transparente et non punitive. Avant un pilote, nous préciserons les données collectées, qui y accède, combien de temps elles sont gardées et quelles vues agrégées sont présentées à l’entreprise. »

**« Pourquoi ne pas simplement faire une formation annuelle ? »**

« VIGILO propose une boucle courte et ciblée : simulation, retour pédagogique, module lié au comportement observé, puis re-test. Le pilote devra vérifier si cette approche améliore effectivement les indicateurs. »

## Vérifications juste avant le passage

- Confirmer l’horaire, la plateforme et le partage d’écran ; garder l’application et une capture de secours prêtes.
- Tester le backend, l’accès réseau et les clés IA **sans afficher ni partager les secrets**.
- Précharger la bonne vue et limiter la démo à deux minutes ; le jury note surtout l’impact, la place de l’IA et la faisabilité.
- Ne pas présenter comme acquis : les statistiques de fraude non sourcées, un impact déjà mesuré, l’envoi WhatsApp réel, une base de données de production ou une authentification finalisée.
- Préparer les noms/rôles de l’équipe et une réponse concise sur l’éligibilité universitaire.
- Respecter la charte de conduite et attendre au moins 24 heures avant tout message de suivi.
