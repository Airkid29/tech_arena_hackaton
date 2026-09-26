# VIGILO — Business Model (Afrique de l’Ouest · Togo · PME)

> Document de référence hackathon Tech Arena 2026 — aligné produit, marché local et monétisation réaliste.

---

## 1. Synthèse exécutive

**VIGILO** est un SaaS B2B de **cyber-résilience comportementale** : simuler (Email + **WhatsApp**), mesurer, analyser (Coach IA), former (2 min), re-tester.  
Au **Togo** et en **Afrique de l’Ouest francophone**, le risque n’est pas seulement le ransomware des multinationales : ce sont les **arnaques Mobile Money**, la **fraude au président** sur WhatsApp, les **fausses factures** (Orange, Moov, ENEO, douanes) et l’**usurpation de la hiérarchie** dans des PME sans RSSI.

**Proposition locale en une phrase :**  
*« Le RSSI virtuel des PME togolaises : transformer WhatsApp et la boîte mail en terrain d’entraînement, avec des preuves chiffrées pour la direction et les partenaires (banques, assureurs, donneurs d’ordre). »*

---

## 2. Problème contextualisé (Togo / UEMOA)

| Réalité locale | Impact business |
|----------------|-----------------|
| **WhatsApp = canal pro N°1** (direction, compta, terrain) | Phishing / whishing plus efficace que l’email seul |
| **Mobile Money & virements urgents** | Une seule fraude peut absorber des mois de marge |
| **PME 5–150 salariés**, souvent **1 personne « fait l’IT »** | Pas de budget KnowBe4 ni de SOC |
| **Digitalisation CEET, banques, e-facturation** | Surface d’attaque qui grandit plus vite que la sensibilisation |
| **Exigences partenaires / NIS2 / clients export** | Besoin de **preuves** de programme de sensibilisation |
| **Coût data & infra** | Solution doit être **légère**, mobile-first, FCFA-friendly |

**Douleur acheteur (ICP) :** le gérant ou le DAF togolais qui a déjà vu un collègue se faire demander un « virement confidentiel » ou un « code Moov Money » sur WhatsApp, sans outil pour **tester** ni **prouver** la progression de l’équipe.

---

## 3. Segments clients (priorisation Togo → sous-région)

### Tier 1 — Cœur de cible (année 1)
- **PME togolaises** : 15–120 employés (commerce, BTP, logistique, agro, services B2B).
- **Institutions financières régionales / microfinance** (sensibilisation agences).
- **ETI filiales** à Lomé (reporting vers maison-mère).

### Tier 2 — Accélération (année 2)
- **Cabinets comptables & fiduciaires** (revendeurs : « pack conformité + cyber humain »).
- **Intégrateurs IT / MSP** locaux (marque blanche VIGILO).
- **ONG & projets digitaux** (données sensibles, budgets formation limités).

### Tier 3 — Expansion UEMOA
- Bénin, Côte d’Ivoire, Sénégal : mêmes vecteurs WhatsApp + Mobile Money, même structure PME.

**Personas décisionnaires**
1. **Gérant / DG** — veut éviter une perte cash et rassurer la banque.
2. **Responsable admin & finance** — cible des arnaques RIB / factures.
3. **Prestataire IT externe** — cherche un produit clé en main à revendre.

---

## 4. Proposition de valeur différenciante (vs marché)

| Concurrent type | Limite en contexte local | VIGILO |
|-----------------|--------------------------|--------|
| KnowBe4 / Proofpoint | Prix USD, lourd, peu WhatsApp | **WhatsApp natif**, déploiement &lt; 1 h |
| Formations e-learning génériques | Théorique, langue/contexte éloignés | **Scénarios UEMOA** (Moov, Orange, fraude président) |
| Affiches / ateliers ponctuels | Non mesurable | **KPI clics / signalements / re-test** |
| RSSI consultant | Coût récurrent élevé | **Coach IA** = copilote permanent |

**KPI promis au client (alignés produit)**
- Baisse du taux de clic sur simulations (−50 à −75 % sur 90 jours, objectif pilote).
- Hausse des signalements spontanés.
- **Score Vigilance** exportable (PDF) pour audit interne / partenaire.

---

## 5. Modèle économique précis

### 5.1 Structure de revenus (SaaS + services)

| Flux | Description | Part du CA cible (Y3) |
|------|-------------|------------------------|
| **Abonnement SaaS** | Accès console, campagnes, coach IA, modules | ~70 % |
| **Setup & onboarding** | Import annuaire, charte éthique, 1ère campagne | ~15 % |
| **Partenaires (MSP / comptables)** | Marge revendeur 20–30 % | ~10 % |
| **Modules premium** | Scénarios sectoriels, SMS, API, SSO | ~5 % |

### 5.2 Grille tarifaire FCFA (PME Togo — indicative)

Prix psychologique **inférieur au coût d’une seule fraude** (souvent 500 000 – 5 000 000 FCFA).

| Offre | Cible | Prix / mois | Inclus |
|-------|--------|-------------|--------|
| **Starter** | 5–15 users | **15 000 FCFA** (~23 €) | 1 campagne/mois, email, 3 scénarios, stats basiques |
| **PME** | 16–50 users | **1 500 FCFA / user** (min. 25 000) | Email + WhatsApp simulé, Coach IA, 7 modules, re-test |
| **Business** | 51–150 users | **1 200 FCFA / user** (min. 60 000) | Tout PME + Flash News, annuaire, export PDF, support prioritaire |
| **Partenaire MSP** | Revendeur | **Wholesale −25 %** | Multi-tenant, logo client, facturation centralisée |

**Équivalent EUR (communication internationale) :** ~2–3 € / user / mois PME — **40 à 60 % sous** les grands acteurs US.

### 5.3 Freemium & pilote (go-to-market hackathon → terrain)

- **Pilote Lomé 30 jours** : 1 campagne WhatsApp + 1 email, jusqu’à 20 users — **gratuit** (conversion cible 40 % vers PME).
- **Freemium permanent** : 1 simulation / trimestre, 5 users max — lead gen via cabinets comptables.
- **Setup unique** : **50 000 – 150 000 FCFA** selon taille (import CSV, charte, formation admin 2 h).

### 5.4 Unit economics (hypothèses conservatrices)

| Métrique | Hypothèse |
|----------|-----------|
| **ARPU** moyen | 45 000 FCFA / mois (~69 €) |
| **Coût variable** (IA Gemini, SMS/WhatsApp API, hébergement) | 8 000 – 12 000 FCFA / client / mois |
| **Marge brute SaaS** | ~65–75 % |
| **CAC** (partenaire comptable) | 30 000 – 80 000 FCFA |
| **LTV** (24 mois, churn 5 % / mois après an 1) | ~540 000 FCFA |
| **LTV/CAC** | &gt; 5 visé via canal partenaire |

---

## 6. Canaux de distribution (Togo first)

1. **Partenariats cabinets comptables / audit** (Lomé, Kara) — offre « Pack clôture + cyber vigilance ».
2. **Intégrateurs IT** (déploiement Microsoft 365, réseau) — bundle installation + VIGILO.
3. **Chambre de Commerce / CCIT / incubateurs** (Tech Arena, Woelab, etc.) — pilotes groupés sectoriels.
4. **Banques & microfinances** — sensibilisation **agents** + offre PME clientes (co-marketing).
5. **Contenu** : études de cas « fraude WhatsApp DG », webinars en français avec **Moov / Flooz** dans les scénarios (sans marque non autorisée en prod — templates génériques).

---

## 7. Conformité & confiance (argument vente local)

- **RGPD / loi n° 2019-014 (Togo) sur la protection des données** : minimisation, information préalable des employés, stats agrégées.
- **Charte non punitive** VIGILO (déjà produit) — essentiel en entreprise familiale / hiérarchie forte.
- **Hébergement** : priorité **UE ou Afrique de l’Ouest** (AWS Cape Town / partenaire local) selon contrat client.
- **Alignement ANSSI / bonnes pratiques** : repositionné en « référentiel international adapté PME », complété par guides **APDP Togo**.

---

## 8. Roadmap produit liée au revenu

| Trimestre | Livrable | Levier commercial |
|-----------|----------|-------------------|
| Q1 | Scénarios **Mobile Money**, **Moov/Flooz** génériques, FR local | Closing PME Lomé |
| Q2 | **SMS** simulation, export PDF assurance | Banques / assureurs |
| Q3 | **API MSP**, facturation FCFA (CinetPay / PayGate) | Scale partenaires |
| Q4 | Intégration **Microsoft 365** légère (signaler phishing) | ETI |

---

## 9. Risques & mitigations

| Risque | Mitigation |
|--------|------------|
| Sensibilité WhatsApp (confiance) | Charte, simulation **sans** usurpation illégale ; mode « template interne » |
| Pouvoir d’achat FCFA | Plans par palier, paiement **mobile money** annuel (−2 mois) |
| Dépendance API IA | Cache analyses, scénarios pré-générés, mode dégradé |
| Concurrence globale | Position **hyper-local** + partenaires comptables |

---

## 10. Pitch jury — chiffres à retenir (30 secondes)

- **Cible :** 15–150 employés, Togo puis UEMOA.  
- **Prix :** dès **15 000 FCFA/mois** ; ~**1 500 FCFA/user** en PME.  
- **ROI :** une fraude évitée (&gt; 500 k FCFA) &gt; **3 ans** d’abonnement typique.  
- **Différenciation :** boucle 5 étapes + **WhatsApp** + Coach IA + **2 min** de formation.  
- **GTM :** comptables, MSP, banques — pas vente directe pure au début.

---

*Document généré à partir de l’analyse codebase VIGILO (console PME, campagnes, Coach IA, re-test, Flash News) et du contexte marché Togo / Afrique de l’Ouest.*
