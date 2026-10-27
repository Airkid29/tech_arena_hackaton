# VIGILO — Console PME

VIGILO est un prototype pédagogique de cyber-résilience comportementale destiné aux PME. Il propose un parcours de démonstration autour de la simulation, de la mesure, de l'analyse agrégée, de la formation et du re-test.

## Ce qui fonctionne dans le prototype

- Console web React 19 / TypeScript / Vite.
- API Node.js / Express avec authentification administrateur et annuaire d'entreprise.
- Comptes, départements et collaborateurs persistés dans Supabase PostgreSQL.
- Coach IA côté serveur, avec Gemini et/ou RodiumAI si leurs clés sont configurées ; les réponses intégrées sont signalées comme telles.
- Invitations email de formation, sous réserve d'une configuration SMTP et d'un destinataire appartenant à l'annuaire du compte.
- Simulateurs Email/WhatsApp pédagogiques dans l'interface.
- Profil d'entreprise persistant (secteur, pays, langue, ton de formation et couleur de marque), utilisé par les contenus pédagogiques et les invitations.
- Connecteur Gophish serveur en lecture seule pour consulter les campagnes et des statistiques agrégées. La création, le lancement et l'envoi de campagnes Gophish ne sont pas exposés.

Les campagnes créées dans VIGILO sont enregistrées comme brouillons dans Supabase. Aucun lancement, email de campagne, événement ou indicateur n'est généré automatiquement ; les aperçus du simulateur ne sont pas comptabilisés comme des résultats. L'envoi réel de simulations email est désactivé ; WhatsApp Business n'est pas connecté.

## Démarrage local

1. Installez les dépendances :

   ```bash
   npm install
   ```

2. Créez un projet Supabase et exécutez les scripts de `supabase/migrations` dans l'ordre chronologique.

3. Copiez `.env.example` vers `.env` et renseignez au minimum :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` (valeur aléatoire d'au moins 32 caractères ; le serveur refuse la valeur fictive de `.env.example`)

4. Pour activer l'IA, définissez `GEMINI_API_KEY` et/ou `RODIUM_API_KEY`. Les clés restent dans l'environnement serveur ; le modèle Gemini est configurable via `GEMINI_MODEL`. Si RodiumAI est utilisé, renseignez `RODIUM_MODEL` avec l'identifiant exact fourni par RodiumAI. Les erreurs fournisseur sont indiquées et la réponse intégrée est explicitement signalée en cas de repli.

5. Pour connecter une instance Gophish à un compte entreprise, configurez `GOPHISH_URL` (HTTPS avec certificat valide), `GOPHISH_API_KEY` et `GOPHISH_ADMIN_ID` (identifiant du compte autorisé) uniquement côté serveur. L’instance est ainsi cloisonnée à un seul tenant. Le connecteur lit les campagnes et ne permet pas de les créer ou de les lancer.

6. Pour envoyer des invitations pédagogiques, configurez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` et `SMTP_PASS`. L'application n'envoie pas de simulations trompeuses.

7. Lancez l'application :

   ```bash
   npm run dev
   ```

Pour Vercel, configurez les mêmes variables dans les paramètres d'environnement du projet et exécutez toutes les migrations Supabase avant la mise en ligne. Ne mettez jamais les clés `service_role`, IA ou Gophish, ni le mot de passe SMTP dans le frontend, une capture d'écran ou Git. `.env.example` ne contient que des valeurs fictives.

## Données et architecture

Le compte administrateur est le tenant de données : les départements et collaborateurs sont toujours filtrés par l'identifiant authentifié côté serveur. Les migrations SQL activent la sécurité au niveau des lignes et interdisent l'accès direct aux tables depuis les rôles navigateur.

Voir [PITCH_ARCHITECTURE.md](./PITCH_ARCHITECTURE.md) pour le schéma de flux, les tables, les limites actuelles et la préparation technique du pitch. Aucun fichier `admins.json` ou `org.json` local n'a été trouvé dans le dépôt ; si des données existent ailleurs, exportez-les avant toute migration et ne supprimez pas les originaux.

## Commandes

- `npm run dev` — serveur de développement et interface Vite.
- `npm run build` — build frontend.
- `npm run lint` — vérification TypeScript du projet.
