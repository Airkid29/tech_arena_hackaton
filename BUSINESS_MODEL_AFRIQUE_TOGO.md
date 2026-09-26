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

### 5.2 Grille tarifaire FCFA (PME Togo — réaliste)

Prix **inférieur au coût d’une seule fraude** (souvent 500 000 – 5 000 000 FCFA), et **compatible pouvoir d’achat local**.

#### ⚠️ Erreur fréquente (à ne jamais dire au jury)

**On ne multiplie pas le forfait Starter par le nombre de salariés.**

- ❌ Faux : 15 000 × 51 salariés = **765 000 FCFA/mois**  
- ✅ Vrai : une entreprise de **51 salariés** est au palier **Business** → **55 000 FCFA/mois** (forfait), pas 765 k.

**Règle simple :** 1 palier = **1 facture mensuelle fixe** (fourchette claire). Pas de « 15 000 par personne ».

#### Paliers — forfaits mensuels uniquement

| Offre | Effectif | **Prix / mois (TTC)** | Inclus |
|-------|----------|------------------------|--------|
| **Starter** | 5–15 salariés | **12 000 FCFA** | 1 campagne/mois, email, 3 scénarios, stats |
| **PME** | 16–50 salariés | **35 000 FCFA** | Email + WhatsApp simulé, Coach IA, modules, re-test |
| **Business** | 51–100 salariés | **55 000 FCFA** | Tout PME + Flash News, annuaire, export PDF |
| **ETI locale** | 101–150 salariés | **75 000 FCFA** | Business + support prioritaire, multi-admin |
| **Partenaire MSP** | Revendeur | **−20 %** sur le palier | Marque blanche, facturation groupée |

**Paiement annuel (Mobile Money / virement) :** −2 mois (≈ **10 mois payés pour 12**).

#### Exemples pour le pitch (facture réelle)

| Salariés | Palier | **Facture mensuelle** | **Facture annuelle** (avec −2 mois) |
|----------|--------|------------------------|-------------------------------------|
| 10 | Starter | **12 000 FCFA** | **120 000 FCFA** |
| 25 | PME | **35 000 FCFA** | **350 000 FCFA** |
| **51** | **Business** | **55 000 FCFA** | **550 000 FCFA** |
| 80 | Business | **55 000 FCFA** | **550 000 FCFA** |
| 120 | ETI locale | **75 000 FCFA** | **750 000 FCFA** |

**Ordre de grandeur EUR :** 12 k ≈ 18 € · 35 k ≈ 53 € · 55 k ≈ 84 € / mois.

**ROI pitch :** une fraude WhatsApp / faux virement évitée (&gt; 500 k FCFA) **&gt; 9 mois** d’abonnement Business à 55 k.

### 5.3 Freemium & pilote (go-to-market hackathon → terrain)

- **Pilote Lomé 30 jours** : 1 campagne WhatsApp + 1 email, jusqu’à 20 users — **gratuit** (conversion cible 40 % vers PME).
- **Freemium permanent** : 1 simulation / trimestre, 5 users max — lead gen via cabinets comptables.
- **Setup unique** : **25 000 – 75 000 FCFA** (import annuaire, charte, 1ère campagne).

### 5.4 Unit economics (hypothèses conservatrices)

| Métrique | Hypothèse |
|----------|-----------|
| **ARPU** moyen (mix Starter + PME + Business) | ~38 000 FCFA / mois (~58 €) |
| **Coût variable** (IA, hébergement, email) | 5 000 – 10 000 FCFA / client / mois |
| **Marge brute SaaS** | ~65–75 % |
| **CAC** (partenaire comptable) | 20 000 – 50 000 FCFA |
| **LTV** (24 mois, churn 5 % / mois après an 1) | ~456 000 FCFA (sur base ARPU 38 k) |
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
- **Prix :** **12 k** (≤15 pers.) · **35 k** (16–50) · **55 k** (51–100) · **75 k** (101–150) FCFA/mois — **forfait**, jamais × nombre de salariés.  
- **ROI :** une fraude évitée (&gt; 500 k FCFA) &gt; **1 an** d’abonnement PME (35 k/mois) ou **9 mois** en Business (55 k).  
- **Différenciation :** boucle 5 étapes + **WhatsApp** + Coach IA + **2 min** de formation.  
- **GTM :** comptables, MSP, banques — pas vente directe pure au début.

---

*Document généré à partir de l’analyse codebase VIGILO (console PME, campagnes, Coach IA, re-test, Flash News) et du contexte marché Togo / Afrique de l’Ouest.*
