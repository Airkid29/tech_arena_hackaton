# VIGILO — Coût total pour une mise en production réelle

> Estimation **indicative** (2026), taux de change **1 € ≈ 655 FCFA**.  
> Prototype hackathon ≠ produit exploitable : ce document couvre **ce qu’il faut ajouter** pour servir de vraies PME au Togo.

---

## 1. Ce que vous avez déjà (coût ≈ 0 en infra)

- Console React + API Express (`server.ts`) + déploiement Vercel possible
- Mock simulation, Coach IA (Gemini/Rodium), SMTP optionnel
- **Manque pour la prod :** auth multi-tenant, base de données, facturation, durcissement sécurité, monitoring, WhatsApp réel (optionnel)

---

## 2. Trois scénarios de mise en place

| Scénario | Objectif | Horizon |
|----------|----------|---------|
| **A — MVP pilote** | 1–3 PME pilotes à Lomé, email + mock/Gophish light | 3–4 mois |
| **B — SaaS régional** | 10–30 clients PME, facturation, support | 12 mois |
| **C — Scale UEMOA** | WhatsApp API, MSP, conformité renforcée | 18–24 mois |

---

## 3. Coûts one-shot (investissement initial)

### A. Finalisation produit (développement)

| Poste | MVP pilote (A) | SaaS régional (B) | Scale (C) |
|-------|----------------|-------------------|-----------|
| Auth (login réel, rôles admin) | 400 000 – 800 000 | inclus | inclus |
| Base de données + API persistance (Postgres, CRUD campagnes/annuaire) | 600 000 – 1 200 000 | 1,5 – 2,5 M | 2,5 – 4 M |
| Multi-tenant (1 compte = 1 PME) | — | 800 000 – 1,5 M | inclus |
| Paiement (CinetPay / PayGate / Stripe) | — | 400 000 – 800 000 | inclus |
| Tests, corrections UX, mobile | 200 000 – 400 000 | 400 000 – 800 000 | 800 000 – 1,2 M |
| **Sous-total dev** | **1,2 – 2,4 M FCFA** | **3,1 – 5,6 M FCFA** | **3,3 – 5,2 M FCFA** |
| | **≈ 1 800 – 3 700 €** | **≈ 4 700 – 8 500 €** | **≈ 5 000 – 8 000 €** |

*Fourchettes basées sur équipe locale / freelance ; divisé par 2 si l’équipe hackathon le fait sans facturer.*

### B. Juridique & conformité (Togo / UEMOA)

| Poste | FCFA | EUR |
|-------|------|-----|
| Statuts / structure (si nouvelle entité) | 150 000 – 500 000 | 230 – 760 |
| Politique confidentialité + CGU + charte simulation RH | 100 000 – 350 000 | 150 – 530 |
| Conseil APDP / protection des données (light) | 200 000 – 600 000 | 300 – 920 |
| **Sous-total juridique** | **450 000 – 1 450 000** | **680 – 2 200 €** |

### C. Identité & lancement

| Poste | FCFA | EUR |
|-------|------|-----|
| Nom de domaine `.com` / `.tg` (1 an) | 15 000 – 45 000 | 23 – 70 |
| Email pro (Google Workspace × 2–5 users, 1 an) | 80 000 – 200 000 | 120 – 300 |
| Landing + doc commerciale (si externalisé) | 0 – 300 000 | 0 – 460 |
| **Sous-total launch** | **95 000 – 545 000** | **145 – 830 €** |

### **TOTAL ONE-SHOT (fourchette)**

| Scénario | Min FCFA | Max FCFA | Min € | Max € |
|----------|----------|----------|-------|-------|
| **A — MVP pilote** | **1,75 M** | **4,4 M** | **≈ 2 700 €** | **≈ 6 700 €** |
| **B — SaaS régional** | **3,65 M** | **7,6 M** | **≈ 5 600 €** | **≈ 11 600 €** |
| **C — Scale** | **3,85 M** | **7,2 M** | **≈ 5 900 €** | **≈ 11 000 €** |

---

## 4. Coûts récurrents (par mois) — infra & services

### Stack technique recommandée (alignée architecture actuelle)

| Service | Rôle | MVP (A) / mois | SaaS (B) / mois | Notes |
|---------|------|----------------|-----------------|-------|
| **Vercel** (Pro ou équivalent) | SPA + serverless API | 0 – 40 000 | 40 000 – 80 000 | Free possible au début ; Pro ~20 $/user |
| **Neon / Supabase Postgres** | Données PME, campagnes | 0 – 25 000 | 25 000 – 65 000 | Free tier puis ~25 $/mois |
| **Gemini / RodiumAI** | Scénarios + analyse | 15 000 – 80 000 | 80 000 – 350 000 | Variable selon nb campagnes |
| **SMTP** (SendGrid, Brevo, ou SMTP pro) | Emails simulation + formations | 0 – 30 000 | 30 000 – 100 000 | Free tier ~300 mails/j |
| **Monitoring** (Sentry, logs) | Erreurs prod | 0 – 15 000 | 15 000 – 40 000 | Optionnel MVP |
| **Sauvegardes / DNS / misc** | | 5 000 – 15 000 | 10 000 – 25 000 | |
| **Gophish VPS** (optionnel) | Phishing réel self-hosted | 25 000 – 50 000 | 50 000 – 100 000 | ~5–15 €/mois VPS + temps admin |
| **WhatsApp Business API** (phase C) | Whishing réel | — | — | 100 000 – 400 000+ selon volume |

### **Sous-total infra / mois**

| Scénario | Min FCFA/mois | Max FCFA/mois | Min €/mois | Max €/mois |
|----------|---------------|---------------|------------|------------|
| **A — MVP** | **45 000** | **240 000** | **≈ 70 €** | **≈ 370 €** |
| **B — SaaS (10–30 clients)** | **200 000** | **735 000** | **≈ 305 €** | **≈ 1 120 €** |
| **C — + WhatsApp volume** | **350 000** | **1 200 000** | **≈ 535 €** | **≈ 1 830 €** |

---

## 5. Coûts humains récurrents (souvent oubliés)

| Poste | MVP | SaaS B |
|-------|-----|--------|
| Support / onboarding PME (temps partiel) | 50 000 – 150 000 / mois | 150 000 – 400 000 / mois |
| Maintenance dev (bugfix, 2–5 j/mois) | 100 000 – 300 000 / mois | 300 000 – 800 000 / mois |
| Commercial / partenaires comptables (commissions) | 0 – 10 % CA | 15 – 25 % CA |

*Si l’équipe fondateur fait tout bénévolement au début, **0 FCFA** en ligne comptable — mais coût d’opportunité réel.*

---

## 6. Coût variable par client PME (unit economics infra)

Ordre de grandeur **coût technique** pour **1 PME active** (1 campagne/mois, 30 users, quelques appels IA) :

| Poste | FCFA / client / mois |
|-------|----------------------|
| IA (2–5 analyses + 1 scénario) | 3 000 – 12 000 |
| Email (≤ 50 envois) | 1 000 – 5 000 |
| DB + bande passante (quote-part) | 2 000 – 8 000 |
| **Total variable** | **6 000 – 25 000** |

Forfait **35 000 FCFA/mois** (palier PME) → marge infra confortable si > **10 clients** partagent les fixes.

---

## 7. **TOTAL synthèse — « combien pour vraiment lancer ? »**

### Option 1 — **Pilote sérieux (recommandé post-hackathon)**

| | FCFA | EUR |
|---|------|-----|
| One-shot (dev MVP + domaine + juridique light) | **2,5 M** (milieu de fourchette) | **≈ 3 800 €** |
| Infra **12 mois** (milieu ~120 k/mois) | **1,44 M** | **≈ 2 200 €** |
| **Total année 1 pilote** | **≈ 3,9 M FCFA** | **≈ 6 000 €** |

*Sans salaires fondateurs ; 1–3 PME payantes à partir du mois 4–6 amortissent une partie.*

### Option 2 — **SaaS opérationnel (10+ clients visés)**

| | FCFA | EUR |
|---|------|-----|
| One-shot (dev B + juridique + paiement) | **5,5 M** | **≈ 8 400 €** |
| Infra **12 mois** (~400 k/mois moyen) | **4,8 M** | **≈ 7 300 €** |
| Support + maintenance light **12 mois** | **2,4 M** | **≈ 3 700 €** |
| **Total année 1 SaaS** | **≈ 12,7 M FCFA** | **≈ 19 400 €** |

### Option 3 — **Équipe qui code tout en interne (hackathon → prod minimale)**

| | FCFA | EUR |
|---|------|-----|
| Dev (sweat equity) | 0 | 0 |
| Domaine + email + juridique minimal | **300 000 – 800 000** | **460 – 1 220 €** |
| Infra 12 mois (free tiers max) | **540 000 – 1,5 M** | **825 – 2 300 €** |
| **Total bootstrap année 1** | **≈ 0,8 – 2,3 M FCFA** | **≈ 1 300 – 3 500 €** |

---

## 8. Recettes vs coûts (sanity check)

Avec la grille forfaitaire (`BUSINESS_MODEL_AFRIQUE_TOGO.md`) :

| Clients actifs (mix) | CA mensuel indicatif | CA annuel |
|----------------------|----------------------|-----------|
| 5 × Starter (12 k) | 60 000 | 720 000 |
| 8 × PME (35 k) | 280 000 | 3,36 M |
| 2 × Business (55 k) | 110 000 | 1,32 M |
| **15 clients** | **450 000 / mois** | **≈ 5,4 M / an** |

→ **15 clients** couvrent largement un **pilote année 1 (~3,9 M)** et une partie du scénario SaaS si l’équipe reste lean.

---

## 9. Phrase pour le jury

*« Le prototype coûte quasi rien à héberger. Pour un **pilote industriel au Togo**, comptez **environ 4 millions FCFA la première année** (~6 000 €) hors salaires — domaine, conformité light, base de données et API IA. Avec **15 PME à 35 000 FCFA/mois**, le modèle devient **autofinanceable** dès la première année d’exploitation. »*

---

## 10. Checklist « prêt prod » (impact coût)

- [ ] Authentification + isolation des tenants  
- [ ] Postgres (campagnes, annuaire, assignations formations)  
- [ ] Secrets uniquement serveur (déjà le cas IA)  
- [ ] SMTP production + limites d’envoi  
- [ ] CGU / charte simulation signée par le client PME  
- [ ] Facturation Mobile Money ou virement  
- [ ] (Plus tard) Gophish ou équivalent + WhatsApp Business API  

---

*Document à ajuster avec devis réels (Vercel, Neon, CinetPay, cabinet juridique Lomé).*
