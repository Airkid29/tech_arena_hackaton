# Dossier de candidature — AI4Youth 2026 (Neuractif)

> **À déposer avant le 30 septembre 2026** sur [ai4youth.neuractif.org](https://ai4youth.neuractif.org)  
> Équipe : **2 à 4 personnes** · Thème : **Cybersécurité** · Livrables : concept + **vidéo ≤ 2 min** + **PowerPoint**

Coller les blocs ci-dessous dans le formulaire. Adapter les noms d’équipe et des membres.

---

## 1. Identification (formulaire)

| Champ | Réponse proposée |
|--------|------------------|
| **Nom de l’équipe** | VIGILO |
| **Nom du projet** | VIGILO — Cyber-résilience comportementale pour PME africaines |
| **Pays** | Togo |
| **Thème / défi** | **Cybersécurité** |
| **Taille d’équipe** | 2 à 4 personnes |
| **Type de solution** | Outil / service SaaS + IA (prototype fonctionnel) |
| **Stade** | Prototype interactif (console PME + Coach IA + simulateur WhatsApp/Email) |
| **Lien démo / GitHub** | *(coller l’URL GitHub : `https://github.com/Airkid29/tech_arena_hackaton` et l’URL Vercel si déployée)* |

---

## 2. Pitch court (150–200 mots) — champ « concept »

**Le problème.** En Afrique de l’Ouest, 80 à 90 % des cyberattaques qui réussissent passent par l’humain : WhatsApp (fraude au président, « whishing »), Mobile Money, fausses factures. Les PME togolaises n’ont ni RSSI, ni budget KnowBe4, ni le temps pour des e-learning d’une heure. Un seul virement frauduleux (souvent ≥ 500 000 FCFA) peut détruire des mois de marge.

**La solution.** VIGILO est un SaaS B2B de **cyber-résilience comportementale**. Une boucle en 5 étapes, assistée par l’IA (RodiumAI / Gemini) : **Simuler** (Email + WhatsApp) → **Mesurer** (clics / signalements) → **Analyser** (Coach IA) → **Former** (micro-modules 2 min) → **Re-tester** (preuve de progrès). L’expérience est **non punitive** : on ancre des réflexes, on ne sanctionne pas.

**Pourquoi l’IA.** Sans expert cyber, la PME ne peut ni rédiger des leurres réalistes ni interpréter les résultats. Le Coach IA agit comme un **RSSI virtuel** : génération de scénarios locaux, diagnostic des leviers psychologiques (urgence, autorité), recommandation de formation ciblée.

**Impact attendu.** Réduction mesurable du taux de clic, hausse des signalements, score de vigilance exportable. Prix forfaitaire adapté au pouvoir d’achat (dès 12 000 FCFA/mois), pas un tarif USD par utilisateur.

---

## 3. Problème africain (alignement jury AI4Youth)

AI4Youth demande des **solutions IA concrètes pour l’Afrique**, éthiques et mesurables. VIGILO répond ainsi :

1. **Problème local réel** — WhatsApp est le canal pro n°1 ; Mobile Money et fraude au président sont le risque quotidien des PME, pas le ransomware « Silicon Valley ».
2. **IA utile, pas cosmétique** — génération de scénarios, analyse comportementale, micro-coaching ciblé. Clés API **côté serveur** (éthique et sécurité).
3. **Impact mesurable** — KPI : taux de clic, taux de signalement, score de vigilance, complétion des modules 2 min.
4. **Éthique** — charte non punitive, stats agrégées, information préalable des employés, alignement RGPD / loi togolaise 2019-014 sur les données.
5. **Exécution** — prototype déjà démontrable (console, simulateur, Coach IA, formations, re-test).

---

## 4. Comment l’IA est utilisée (technique — 1 paragraphe)

L’architecture sépare le **frontend React** (console admin + simulateur collaborateur) d’un **backend Node/Express**. Toutes les requêtes IA passent par le serveur (`/api/vigilo-ai/*` et alias RodiumAI) : génération de scénarios, analyse de campagnes, génération de micro-formations. Les secrets (`RODIUM_API_KEY`, `GEMINI_API_KEY`) ne quittent pas le serveur. Si l’API est indisponible, un **moteur de secours** embarqué permet la démo (éthique du « always-on » pour un jury). L’envoi d’emails de simulation / invitations formation passe par SMTP. Le moteur de campagne est **Mock** (pilote) ou **Gophish** (production).

---

## 5. Différenciation (1 paragraphe)

KnowBe4, Proofpoint, PhishSkill ou Threatcop prouvent que le marché existe. Ils sont chers, souvent en USD, et peu adaptés au **WhatsApp + Mobile Money + PME sans RSSI**. VIGILO combine : vecteur **WhatsApp**, formations **2 minutes**, Coach IA **RodiumAI**, forfaits **FCFA**, et une boucle **re-test** qui vend une **baisse de risque mesurable**, pas une vidéo annuelle.

---

## 6. Business model (3 lignes)

SaaS B2B forfaitaire : **Starter 12 000 FCFA/mois** (5–15 pers.) · **PME 35 000** (16–50) · **Business 55 000** (51–100). Jamais « prix × nombre de salariés ». Pilote Lomé 30 jours gratuit. Distribution via **cabinets comptables** et MSP. Une fraude évitée (> 500 k FCFA) rentabilise plusieurs mois d’abonnement.

---

## 7. Feuille de route si sélectionnés (sprint AI4Youth)

Le hackathon AI4Youth = **4 semaines de mentorat** puis sprint novembre–décembre. Priorités si on est retenus :

1. Auth réelle + persistance Postgres (campagnes, annuaire, formations).
2. Scénarios **Mobile Money / Flooz / Moov** (templates génériques, sans usurpation illégale).
3. Renforcer le Coach IA (contexte PME UEMOA, français local).
4. Export PDF « score de vigilance » pour banques / partenaires.
5. Facturation Mobile Money (CinetPay) en backlog post-finale.

---

## 8. Script vidéo 2 minutes (à lire à l’écran)

**0:00–0:20 — Accroche**  
« Un lundi matin à Lomé. Le comptable reçoit un WhatsApp : “C’est le DG, virement urgent de 3 500 euros, ne m’appelle pas.” En 30 secondes, l’argent part. 90 % des attaques réussies passent par l’humain. Les PME n’ont pas de RSSI. »

**0:20–0:50 — Solution**  
« Nous avons créé VIGILO, un RSSI virtuel pour PME africaines. On ne vend pas une formation ennuyeuse. On **simule** une attaque Email ou WhatsApp, on **mesure** qui clique et qui signale, l’**IA RodiumAI analyse** pourquoi l’équipe a cédé, on **forme** en 2 minutes, puis on **re-teste**. »

**0:50–1:20 — Démo (écran)**  
Montrer : landing → console → simulateur WhatsApp → signalement → micro-formation → KPI / re-test. Dire : « Tout est déjà prototype, en français, pensé pour une PME de 15 à 100 personnes. »

**1:20–1:45 — IA + éthique**  
« L’IA n’est pas un gadget : elle génère les scénarios et joue le rôle de RSSI. Les clés restent sur le serveur. Les collaborateurs ne sont pas punis : on construit une culture du signalement. »

**1:45–2:00 — Appel**  
« Thème Cybersécurité, impact Afrique, prototype vivant. Avec AI4Youth, on industrialise VIGILO pour les PME du Togo puis de l’UEMOA. Merci. »

---

## 9. Plan PowerPoint (8–10 slides)

1. **Titre** — VIGILO · Cyber-résilience PME · AI4Youth 2026 · Thème Cybersécurité  
2. **Le problème** — WhatsApp, Mobile Money, PME sans RSSI, coût d’une fraude  
3. **La solution** — boucle 5 étapes  
4. **Démo** — captures console + WhatsApp + Coach IA  
5. **Rôle de l’IA** — RodiumAI / Gemini, proxy serveur, fallback  
6. **Impact mesurable** — clics ↓, signalements ↑, 2 min de formation  
7. **Marché & prix** — forfaits FCFA, 15 clients → ~5,4 M FCFA/an (ordre de grandeur)  
8. **Éthique & données** — non punitif, agrégation, loi TG 2019-014  
9. **Équipe & besoin** — 2–4 profils (tech, produit, cyber) · ce qu’on attend du mentorat  
10. **Ask** — sélection demi-finale · industrialiser le prototype  

---

## 10. Checklist dépôt (aujourd’hui)

- [ ] Équipe de **2 à 4** membres inscrite (noms, emails, école/entreprise)
- [ ] Thème coché : **Cybersécurité**
- [ ] Texte concept collé (§2)
- [ ] Lien GitHub / démo
- [ ] PPT exporté PDF (slides §9)
- [ ] Vidéo ≤ **2 min** (script §8) — YouTube non listé ou Drive « tout le monde avec le lien »
- [ ] Une femme dans l’équipe si possible (le programme valorise la participation féminine)
- [ ] Envoi **avant minuit le 30 septembre 2026**

---

## 11. Ce qu’on ne dit pas / pièges

- Ne pas présenter VIGILO comme un outil d’attaque ou de phishing malveillant : **simulations autorisées**, cadre entreprise, charte.
- Ne pas dire que WhatsApp Business API est déjà en production : **simulateur pédagogique** aujourd’hui, API en roadmap.
- Ne pas coller KnowBe4 comme ennemi : **complément PME Afrique**, pas un clone US.
- Tech Arena ESIG (25–26 sept.) est **un autre événement** : cette candidature est **AI4Youth / Neuractif**.

---

*Document généré pour coller le projet VIGILO existant sur le cadre AI4Youth 2026 (IA, Afrique, éthique, impact mesurable, prototype).*
