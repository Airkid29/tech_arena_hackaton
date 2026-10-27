# VIGILO — Console PME

VIGILO est un prototype pédagogique de cyber-résilience comportementale destiné aux PME. Il propose un parcours de démonstration autour de la simulation, de la mesure, de l'analyse agrégée, de la formation et du re-test.

## Ce qui fonctionne dans le prototype

- Console web React 19 / TypeScript / Vite.
- API Node.js / Express avec authentification administrateur et annuaire d'entreprise.
- Comptes, départements et collaborateurs persistés dans Supabase PostgreSQL.
- Coach IA côté serveur, avec Gemini et/ou RodiumAI si leurs clés sont configurées ; les réponses intégrées sont signalées comme telles.
- Invitations email de formation, sous réserve d'une configuration SMTP et d'un destinataire appartenant à l'annuaire du compte.
- Simulateurs Email/WhatsApp pédagogiques dans l'interface.

Les campagnes, indicateurs, événements et re-tests restent des données de démonstration en mémoire navigateur. Le schéma PostgreSQL prévoit des tables pour les rendre persistants dans une étape suivante. L'envoi réel de simulations email est désactivé ; WhatsApp Business et Gophish ne sont pas connectés.

## Démarrage local

1. Installez les dépendances :

   ```bash
   npm install
   ```

2. Créez un projet Supabase et exécutez le script :
   `supabase/migrations/20261026220000_initial_schema.sql`

3. Copiez `.env.example` vers `.env` et renseignez au minimum :
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SESSION_SECRET` (valeur aléatoire longue)

4. Pour activer l'IA, définissez `GEMINI_API_KEY` et/ou `RODIUM_API_KEY`. Les clés restent dans l'environnement serveur ; le modèle Gemini est configurable via `GEMINI_MODEL`.

5. Pour envoyer des invitations pédagogiques, configurez `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER` et `SMTP_PASS`. L'application n'envoie pas de simulations trompeuses.

6. Lancez l'application :

   ```bash
   npm run dev
   ```

Pour Vercel, configurez les mêmes variables dans les paramètres d'environnement du projet et exécutez la migration Supabase avant la mise en ligne. Ne mettez jamais la clé `service_role`, les clés IA ou le mot de passe SMTP dans le frontend, une capture d'écran ou Git. `.env.example` contient uniquement des valeurs fictives.

## Données et architecture

Le compte administrateur est le tenant de données : les départements et collaborateurs sont toujours filtrés par l'identifiant authentifié côté serveur. Les migrations SQL activent la sécurité au niveau des lignes et interdisent l'accès direct aux tables depuis les rôles navigateur.

Voir [PITCH_ARCHITECTURE.md](./PITCH_ARCHITECTURE.md) pour le schéma de flux, les tables, les limites actuelles et la préparation technique du pitch. Aucun fichier `admins.json` ou `org.json` local n'a été trouvé dans le dépôt ; si des données existent ailleurs, exportez-les avant toute migration et ne supprimez pas les originaux.

## Commandes

- `npm run dev` — serveur de développement et interface Vite.
- `npm run build` — build frontend.
- `npm run lint` — vérification TypeScript du projet.
