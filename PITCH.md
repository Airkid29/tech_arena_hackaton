# VIGILO — Pitch de qualification demi-finale AI4Youth 2026

**Format : 10 minutes de présentation et démonstration, puis 5 minutes de questions techniques.**

> Script de travail à adapter aux personnes, aux résultats vérifiés et à la configuration réellement active le jour du pitch. Les campagnes/KPI montrés dans le prototype ne sont pas des résultats de pilote.

## Déroulé minuté (10 minutes)

### 0:00–1:00 — Le problème

> « Imaginez une PME de Lomé. Une personne de l’équipe finance reçoit une demande urgente qui semble venir de la direction. Le bon réflexe serait de vérifier l’identité par un canal indépendant, mais aujourd’hui l’entreprise n’a souvent ni spécialiste cyber ni temps pour des formations longues. VIGILO part de ce problème : aider une PME à pratiquer ces réflexes avant qu’une vraie situation ne survienne. »

Ne citer un chiffre de fraude ou d’attaques que si la source, la date et le périmètre sont vérifiables.

### 1:00–2:00 — La solution et le contexte local

> « VIGILO est un prototype de cyber-résilience pensé pour les PME du Togo et de l’Afrique de l’Ouest. Il met en scène des situations pédagogiques inspirées des risques rencontrés par les équipes : demande financière inattendue, pression hiérarchique ou message suspect sur un canal mobile. La boucle produit est simple : simuler dans l’application, observer les indicateurs de démonstration, analyser, apprendre, puis préparer un re-test autorisé. Notre ambition est un outil léger, abordable et non punitif. »

Préciser que WhatsApp est actuellement un **simulateur dans l’application** et non un canal d’envoi connecté.

### 2:00–4:00 — Démonstration du prototype

Suivre un seul exemple, sans prétendre qu’il s’agit d’une campagne réelle :

1. Dans le catalogue, choisir un exemple pédagogique ou demander au Coach un scénario.
2. Ouvrir le simulateur de message et montrer le réflexe attendu : ne pas agir sous pression, vérifier par un canal connu et signaler.
3. Afficher les métriques de démonstration et ouvrir une analyse du Coach.
4. Montrer le module interactif et expliquer le principe du re-test.

> « Ces KPI sont des données de démonstration. Nous n’avons pas encore de résultats de pilote permettant de revendiquer une baisse du risque. »

Si l’API IA externe est disponible, montrer le champ `engine` ou annoncer le moteur retourné. Si la réponse vient de `vigilo-builtin`, le dire explicitement.

### 4:00–5:30 — IA et données (25 %)

> « Le Coach intervient pour proposer un cas pédagogique, analyser des indicateurs agrégés et préparer une micro-formation. Le backend peut appeler Gemini ou RodiumAI selon les clés et le fournisseur configurés ; aucune clé n’est exposée au navigateur. Si aucun fournisseur ne répond, il retourne une réponse de secours intégrée et l’identifie comme telle. Nous n’avons pas entraîné ni affiné de modèle sur des données togolaises : nous utilisons des instructions contextuelles et des modèles externes. »

> « Pour l’analyse, nous transmettons des statistiques de campagne, pas des mots de passe ni le contenu de boîtes mail. Notre évaluation actuelle porte sur le parcours et la cohérence pédagogique des sorties, pas sur un benchmark ni un pilote d’efficacité. La prochaine étape est une revue humaine des scénarios, puis un pilote consenti avec des indicateurs définis à l’avance. »

Avant le passage, noter le fournisseur réellement activé et préparer un exemple reproductible avec une réponse de secours si le réseau échoue.

### 5:30–7:30 — Architecture détaillée (20 %)

Afficher le diagramme de [PITCH_ARCHITECTURE.md](./PITCH_ARCHITECTURE.md).

> « L’administrateur utilise une console React et TypeScript. Elle appelle une API Node/Express qui vérifie un cookie de session HttpOnly et limite les données d’organisation au compte connecté. Les comptes, départements et collaborateurs sont persistés dans Supabase PostgreSQL ; les mots de passe sont hachés avec bcrypt.
>
> Le Coach est appelé côté serveur. Les réponses et le fournisseur utilisé sont renvoyés à la console. L’email SMTP est limité aux invitations de formation destinées à l’annuaire ; le lien utilise un jeton aléatoire stocké sous forme hachée et expire après sept jours.
>
> Les campagnes et leurs indicateurs restent encore dans l’état local du prototype : les tables SQL existent, mais le branchement de persistance n’est pas terminé. Gophish et WhatsApp Business ne sont pas connectés. L’envoi réel de simulations est désactivé. »

Suivre sur le schéma le chemin complet : saisie dans la console → API authentifiée → PostgreSQL ou fournisseur IA → réponse structurée → interface. Pour une invitation, montrer aussi le chemin SMTP → lien de formation → validation du jeton → module.

### 7:30–8:30 — Vie privée, connectivité, erreurs et coût

> « Nous séparons les secrets du navigateur et activons les politiques RLS sur les tables. Les analyses doivent rester agrégées ; un déploiement réel exige une règle claire d’information, d’accès, de conservation et de suppression. En cas d’indisponibilité IA, le moteur intégré assure un parcours de démonstration, mais ce n’est pas de l’inférence hors ligne. L’authentification, Supabase et l’IA distante nécessitent une connexion. Nous n’avons pas encore mesuré le coût réel par utilisateur : un pilote devra relever les appels IA, l’email et l’hébergement avant toute promesse de marge. »

### 8:30–9:15 — Modèle économique et marché

> « Notre hypothèse commerciale est un SaaS B2B forfaitaire adapté aux PME : Starter à 12 000 FCFA par mois, PME à 35 000, Business à 55 000 et ETI locale à 75 000, selon l’effectif. Ce sont des tarifs envisagés, pas encore validés par des ventes. Notre premier apprentissage marché sera de vérifier la volonté de payer auprès de PME à Lomé et de partenaires locaux. »

Vérifier que ces tarifs restent cohérents avec le [modèle économique Afrique/Togo](./BUSINESS_MODEL_AFRIQUE_TOGO.md).

### 9:15–10:00 — Équipe, feuille de route et conclusion

> « Notre équipe réunit [noms et rôles réellement vérifiés]. D’ici la finale, nous voulons persister campagnes et événements, tester avec quelques PME volontaires, évaluer la qualité pédagogique avec des personnes du domaine, et documenter les coûts et la protection des données. Nous n’activerons des envois réels qu’après avoir défini l’autorisation, les garde-fous et le cadre opérationnel.
>
> VIGILO veut transformer la sensibilisation en réflexes pratiques et mesurables, sans culpabiliser les collaborateurs. Avec AI4Youth, nous voulons valider cette approche avec les PME du Togo. Merci. »

## Défense technique — questions probables

**Quelles données servent à entraîner le modèle ?**
« Aucune donnée d’entraînement propre à VIGILO : pas de fine-tuning revendiqué. Les services IA reçoivent des instructions et, pour l’analyse, des statistiques agrégées. »

**Comment avez-vous mesuré la performance ?**
« Nous n’avons pas encore de résultats pilotes. Les chiffres visibles sont des données de démonstration. Nous devons faire un pilote consenti, définir une mesure initiale et comparer un re-test. »

**Où sont stockées les données ?**
« Les comptes, départements et collaborateurs sont dans Supabase PostgreSQL. Les campagnes et KPI sont encore locaux au prototype ; les tables correspondantes sont préparées mais leur API de persistance reste à terminer. »

**WhatsApp, Gophish et l’envoi de campagnes sont-ils opérationnels ?**
« Non. WhatsApp est un simulateur, Gophish n’est pas connecté et l’envoi de simulations est désactivé. L’email SMTP sert uniquement aux invitations de formation autorisées. »

**Que se passe-t-il si Gemini/RodiumAI est indisponible ?**
« Le serveur essaie l’autre fournisseur si celui-ci est configuré, puis retourne une réponse pédagogique intégrée en l’identifiant. Cette réponse n’est pas produite par une IA hors ligne. »

**Comment protégez-vous les collaborateurs ?**
« Les exercices visent l’apprentissage, pas la sanction. Avant un pilote, l’entreprise devra autoriser et expliquer la démarche, limiter les accès, fixer la rétention et privilégier des résultats agrégés. »
