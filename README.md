# VIGILO - Console PME

VIGILO est une plateforme SaaS B2B de cyber-résilience comportementale conçue spécifiquement pour les PME. 

## 🚀 Le Concept
Contrairement aux plateformes classiques de sensibilisation, VIGILO remplace les formations théoriques annuelles par une boucle de cyber-résilience en 5 étapes, soutenue par l'Intelligence Artificielle :
1. **Simuler :** Attaques contrôlées sur Email & WhatsApp.
2. **Mesurer :** Suivi en temps réel des clics et signalements.
3. **Analyser :** Diagnostic comportemental par Gemini 2.5 (Vigilo Coach IA).
4. **Former :** Micro-modules interactifs ciblés post-simulation (2 min).
5. **Re-tester :** Mesure de l'évolution concrète et validation des acquis.

## 🎨 Design & Architecture
L'application adopte un design ultra-premium, minimaliste et professionnel, rompant avec les interfaces "AI-made" chargées. 
- **Frontend :** React 19, TypeScript, TailwindCSS (V4).
- **Design System :** "Propre et poussé", inspiré des meilleurs standards SaaS B2B (Figma, Vercel, Linear). Utilisation de variables CSS customisées pour un mode sombre élégant et performant.

## 🛠️ Lancer le projet
\`\`\`bash
# Installer les dépendances
npm install

# Lancer l'environnement de développement
npm run dev
\`\`\`

## 📁 Structure du projet
- \`src/components/layout\` : Navigation et Sidebar (Premium UI).
- \`src/components/campaigns\` : Gestion des simulations (Gophish logic).
- \`src/components/overview\` : Tableau de bord principal.
- \`src/components/ai-coach\` : Interface Gemini 2.5.
- \`src/index.css\` : Système de design (Tokens, Variables).

## 💡 Objectif Hackathon
Délivrer un prototype interactif, visuellement irréprochable et fonctionnel, démontrant l'apport de l'IA générative dans l'automatisation du rôle de RSSI pour une PME.
