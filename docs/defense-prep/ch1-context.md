# Chapter 1: Project Context and Problem Definition

## Intro — 3lech el projet hedha mawjoud?

Ay organisation 3andha barcha activités — développement, design, marketing — lazem tcoordini beynethom. Ki l'équipe tekber, les problèmes yekbrou m3aha: project boards mferr9in f kol blasa, attendance tracking yetsa3mel bel yed, calendriers mahoumech connectés, notifications informal (messages directs), w makaench vue globale 3la chnou 9a3ed yosra f l'organisation lkol.

Hedha l chapitre ye7ki 3la hedhi l mushkla f le contexte mta3 **Tawer Digital Group**, yedres les solutions li mawjoudin f le marché, w y9addem la solution li bninaaha pendant le stage.

---

## L'Organisme d'Accueil — Tawer Digital Group (TDG)

### Présentation

**Tawer Digital Group** hiya agence digitale hybride, qa3dtha f Sfax, Tunisie (Imm Lafrane Centre, Nassreya). Tsami services créatifs w techniques — ya3ni branding, marketing, w software engineering lkol f blasa wa7da.

> Figure 1.1 — Logo mta3 TDG

### Business domain — domaine d'activité

TDG m9asma l **2 unités complémentaires**:

1. **Tawer Dev**: web dev, mobile dev, UI/UX design, software consulting, SEO, w AI-powered SEO (AISO).
2. **Tawer Creative**: branding, social media management, digital marketing consulting, campagnes email/WhatsApp, packaging w merchandise design.

**L'idée**: client yji 3andhom, ya3tiweh kol chay — mel brand identity lel marketing lel produit logiciel li warah.

### Structure organisationnelle

Équipe sghira, 7awali 7 membres. 3 co-fondateurs:

- **Ahmed Awedi** — CEO (Chief Executive Officer)
- **Mohamed Awedi** — CTO (Chief Technology Officer)  
- **Omar Graia** — CMO (Chief Marketing Officer)

W l'équipe fiha développeurs, designers, w stagiaires yekhdmou 3al les 2 unités.

### Contexte du stage

El projet hedha sar ka **PFE** (Projet de Fin d'Études) f TDG, mel **20 Février lel 20 Juillet 2026** (5 mois).

- **Stagiaire w développeur principal**: Aymen BenHsan (ena) — responsable 3al full-stack design, implémentation, w livraison.
- **Encadrants**:
  - Ahmed Awedi (CEO) — Product Owner w superviseur frontend.
  - Mohamed Awedi (CTO) — superviseur backend.

---

## Business Context — Le Contexte Métier

### Stakeholders — achkoun yhemmou bel plateforme?

El plateforme hiya **outil interne** — ya3ni exclusive lel employés mta3 TDG, mahiyech client-facing, mahiyech exposée l barra.

Les stakeholders principaux:

| Stakeholder | Rôle |
|-------------|------|
| Executives (CEO, CTO, CMO) | Vue globale, visibilité cross-unit, décisions stratégiques |
| Project managers / Scrum Masters | Gestion lifecycle mta3 les projets, gouvernance sprint, coordination |
| Développeurs / designers | Exécution quotidienne: tasks, time logging, collaboration |
| HR / staff administratif | Onboarding, suivi attendance, gestion équipes |
| DevOps engineers | Enregistrement infrastructure, monitoring uptime |

### Users — achkoun yesta3melha?

Kol les employés mta3 TDG homa users. El système y3arref **~31 types de rôles** pour modéliser les différents niveaux de responsabilité. Kol user ye9der ykoun 3andou plus qu'un rôle, w la plateforme tenforce chnou kol rôle ya3mel w chnou yara.

### Business needs — les besoins métier

Les workflows quotidiens mta3 TDG li l'plateforme lazem tcouvri:

1. **Project management**: création w suivi des projets ta7t aya unité, avec membership w invitations par email.
2. **Agile et workflows flexibles**: support Scrum complet (epics, sprints, milestones, burndown, velocity) ET workflows freeform. Le choix yetsa3mel par projet au moment de la création.
3. **Task tracking**: Kanban board bel custom columns, WIP limits, dependencies, time logging, commentaires, labels.
4. **Attendance**: check-in / check-out quotidien (remote wella on-site), calcul heures travaillées, statistiques par équipe.
5. **Calendar & events**: réunions partagées, événements personnels, rappels multi-canal.
6. **Notifications**: in-app inbox, email, push notifications, Telegram, ntfy.
7. **Infrastructure monitoring**: enregistrement serveurs w services, health checks automatiques, alertes outage.
8. **AI-assisted insights**: copilot li yjawebek questions basé 3al data mta3 les projets, w estimateur effort tasks basé 3al historique.

### Contraintes

- **Self-hosted w interne**: mafamech dépendance 3la service externe pour stocker data les projets.
- **Bilingue** (anglais + français): parce que l'équipe testa3mel les 2 langues.
- **Fine-grained access control**: kol endpoint lazem yetgouverné, parce que users men rôles w unités différents y partagiw le même système.
- **Maintenable par une petite équipe**: codebase structure uniforme — ki tet3alem le pattern, kol module ye9ra nafsou.

---

## Problem Statement — El Mushkla

### Chnou kanet la situation 9bal?

9bal el projet hedha, TDG kenet tgéri khedmetaha principalement bel **GitHub Projects** — board léger intégré f l'écosystème GitHub. W la coordination au quotidien kenet informelle: messages directs pour les rappels, processus manuels pour l'attendance, w la pas de calendrier centralisé, pas de système de notification, pas de monitoring infrastructure.

### 3lech hedhi la situation mech behi?

5 problèmes principaux:

1. **Fragmentation**: project tracking, attendance, calendrier, notifications, monitoring infrastructure — kol wa7da f outil mfar9a, wella tout simplement makench. Manager ma3andouch blasa wa7da ychouf fih l'état du projet + achkoun présent lyoum + est-ce que les serveurs sains.

2. **Limited project modeling**: GitHub Projects y3awnek ba task boards plates. Mafamech agile artifacts (epics, sprints, milestones, burndown charts), mafamech distinction bin agile workflow w freeform, mafamech RBAC par projet.

3. **No attendance tracking**: check-in/check-out, calcul heures, statistiques présence — kol hedha manual w error-prone.

4. **No organizational intelligence**: questions cross-cutting kima "chnou 9a3ed ybloqui el sprint hedha?" wella "9addech khedhet les tasks similaires?" — lazem tfattech manuellement f barcha sources. Ma3andekch moyen tsaal natural language 3la data l'organisation.

5. **Data exposure**: data les projets (descriptions, discussions, workflow details) stockée chez GitHub — barra el contrôle direct mta3 l'organisation.

### 3lech lazem le changement?

Ki TDG tekber, les problèmes yezidou. Kol membre jdid yzid overhead de coordination. Kol projet jdid yferr9 el khedma 3la outils okhra. W sans données historiques, le planning yeb9a basé 3al intuition mech 3al evidence. L'étape logique hiya plateforme unifiée, self-hosted, li tjam3 les workflows w tzid couche intelligente fog data l'organisation.

---

## Étude des Solutions Existantes

3 outils représentatifs:

### 1. GitHub Projects
- **Points forts**: intégration tight m3a l'écosystème dev (issues, branches, PRs connectés directement). Gratuit.
- **Points faibles**: pas d'agile artifacts (epics, sprints gouvernés, analytics), pas d'attendance, pas de calendrier, pas de notifications multi-canal, pas de monitoring, pas d'AI. Data hébergée chez GitHub.

### 2. Jira
- **Points forts**: deep agile support (Scrum/Kanban boards, epics, sprints, reporting). Écosystème plugins énorme.
- **Points faibles**: pas d'attendance tracking intégré, pas de calendrier company-wide, pas de monitoring infra. AI features (Atlassian Intelligence) cloud-only w generic — mech basées 3la data l'organisation. Licensing cher pour les petites équipes. L'option on-premise (Data Center) telzem enterprise license.

### 3. ClickUp
- **Points forts**: all-in-one — project management, docs, goals, time tracking, views multiples (list, board, Gantt, calendar). Prix compétitif.
- **Points faibles**: pas d'attendance/check-in, pas de monitoring infra, pas de self-hosted. AI features generic. Notifications limitées (in-app + email barka). RBAC mech assez fine-grained pour ~31 rôles.

### Tableau comparatif (résumé)

| Critère | GitHub Projects | Jira | ClickUp | **Tawer Mgmt** |
|---------|:-:|:-:|:-:|:-:|
| Project management | Oui | Oui | Oui | **Oui** |
| Agile backlog complet | Non | Oui | Partiel | **Oui** |
| Kanban + WIP limits | Non | Oui | Oui | **Oui** |
| Attendance tracking | Non | Non | Partiel | **Oui** |
| Calendar & events | Non | Non | Partiel | **Oui** |
| Notifications multi-canal | Non | Non | Non | **Oui** |
| Monitoring infra | Non | Non | Non | **Oui** |
| AI copilot grounded in project data | Non | Non | Non | **Oui** |
| Estimation effort basée data | Non | Non | Non | **Oui** |
| Fine-grained RBAC (~31 rôles) | Non | Oui | Partiel | **Oui** |
| Self-hosted / data sovereignty | Non | Partiel | Non | **Oui** |
| Bilingue (en/fr) | Non | Oui | Non | **Oui** |

**Conclusion**: Mafamech outil wa7ed li ycouvri l scope lkol. Kol plateforme ta3mel juz minnou. L'intégration mta3 kol hedha f application wa7da self-hosted hiya li tmotivi la solution proposée.

---

## Solution Proposée — Tawer Management

### Objectifs principaux (4)

1. **Unifier les workflows opérationnels**: application web wa7da tcouvri project management, agile backlog, task tracking, to-dos personnels, attendance, calendar, reminders, notifications multi-canal, w monitoring infrastructure.

2. **Gouverner l'accès**: modèle RBAC assez expressif pour ~31 rôles, entre les 2 unités. Kol user yara w ygéri ghir chnou rôle-ou ysam7lou bih.

3. **Ajouter une couche intelligente basée sur de vraies données**: copilot RAG (Retrieval-Augmented Generation) li yjaweb questions strict mel contenu mta3 les projets, avec citations. W estimateur effort basé 3al historical outcomes, mech guessing.

4. **Maintenir un codebase uniforme et extensible**: architecture layered stricte par feature — kol module nafs la structure. Ki tet3alem le pattern, any module facile ta9raah.

### Workflow général

Système à **2 applications**:
- **Backend**: NestJS REST API (stateless)
- **Frontend**: Next.js web client

Communication via HTTP/JSON + JWT-based authentication.

**Flux**: user ydkhol (login) → ykhtarek projet wella fonctionnalités personnelles (to-dos, attendance, calendrier) → f da5el projet: Kanban board, sprints, analytics, wella ysaal el AI copilot → notifications automatiques 3al canaux configurés → monitoring infra ydour f le background w yalerte en cas d'outage.

> Figure 1.2 — System context diagram, youri le high-level architecture (client → API → base de données + services externes)

### Les 10 domaines opérationnels (features principales)

1. **Auth & access control** — JWT login, token refresh, password reset, RBAC catalogue centralisé
2. **User & team admin** — provisioning comptes, annuaire, groupes teams
3. **Projects & membership** — lifecycle projet, scoping par unité, membership, invitations email
4. **Agile backlog** — epics, sprints (lifecycle gouverné), milestones, burndown/velocity/Gantt analytics
5. **Tasks & Kanban** — board custom columns, WIP limits, dependencies, time logging, comments, labels
6. **Personal to-dos** — checklist privée, sub-tasks, priorités, notifications rappel
7. **Attendance** — check-in/check-out (remote/on-site), calcul heures, stats par équipe
8. **Calendar & events** — réunions partagées, events perso, rappels escalating multi-canal
9. **Notifications & monitoring infra** — inbox in-app, FCM push, email, Telegram, ntfy; health checks ICMP/HTTP + alertes outage
10. **AI copilot & estimation** — RAG permission-scoped + citations, reference-class task estimation

### Améliorations attendues

Par rapport à GitHub Projects:
- Suppression fragmentation outils
- Automatisation processus manuels (attendance, notifications, monitoring)
- Visibilité globale à travers une seule application gouvernée par rôles
- Couche intelligente li t7awwel data accumulée f réponses concrètes w estimations

---

## Résultats Attendus

- **Source unique de vérité**: application wa7da authentifiée, bilingue, remplace les outils déconnectés.
- **Workflows plus rapides**: plus de switching entre outils, attendance automatisée, analytics real-time.
- **Meilleure UX**: interface adaptée à la structure TDG (2 unités, 2 types workflow, rôles fins).
- **Support décisionnel AI**: copilot grounded + estimateur data-driven.
- **Monitoring automatisé**: health checks + alertes multi-canal → temps de détection réduit.
- **Accès gouverné**: ~31 rôles partagent un API en toute sécurité.
- **Codebase maintenable**: architecture 4-couches par feature → onboarding facile, ajout nouveaux domaines facile.

---

## Conclusion du Chapitre

Chapitre 1 7at el projet f contexte-ou organisationnel w métier. TDG — agence digitale hybride — kenet t7taj tebdel un ensemble fragmenté d'outils (centré 3la GitHub Projects) b plateforme unifiée self-hosted adaptée lel besoins spécifiques mte3ha. L'étude des solutions existantes confirmat que mafamech outil wa7ed f le marché li ycouvri le scope lkol. La solution proposée, Tawer Management, tcomble hedhi l lacune.

Les chapitres li jaw ye7kiw kifech bnenaaha:
- Chapitre 2 → méthodologie, architecture, stack technologique
- Chapitre 3 → les 5 sprints de développement
- Chapitre 4 → le sprint AI (contribution technique principale)

---

---

# Chnou lazem tetfaker mel Chapitre 1

1. **Organisme d'accueil**: TDG = agence hybride (dev + creative), petite équipe ~7, basée Sfax. 3 co-fondateurs. Internship 5 mois (Feb–Jul 2026). Enta le seul développeur (full-stack).

2. **Le problème central**: fragmentation des outils + pas d'intelligence sur les données. GitHub Projects kanet la base — mais limitée.

3. **Les 5 limitations**: fragmentation, limited project modeling, no attendance, no organizational intelligence, data exposure. Lazem ta3rafhom bel coeur.

4. **L'étude comparative**: 3 outils (GitHub Projects, Jira, ClickUp). Mafamech li ycouvri le scope lkol. El argument mech "a7sen mel Jira f kol chay" — el argument houa **l'intégration mta3 kol hedha f blasa wa7da self-hosted**.

5. **Les 4 objectifs**: unifier workflows, gouverner accès (31 rôles), couche AI grounded, codebase uniforme. Ta3rafhom bien.

6. **Architecture high-level**: NestJS API + Next.js client + JWT. Stateless. 10 domaines opérationnels.

7. **Chiffres clés à retenir**: ~31 rôles, 10 domaines, 5 sprints + 1 sprint AI, 2 unités (Dev + Creative), bilingue (en/fr), self-hosted.

---

# Questions li ynajem el jury ysalek — w kif tjaweb

### Q1: "3lech ma3meltch fork 3la outil existant open-source au lieu ma tabni from scratch?"
**Jaweb**: Les outils open-source (kima Plane, Focalboard, Taiga) ycouvriw project management barka. Les besoins spécifiques mta3 TDG — attendance, monitoring infra, AI copilot grounded f data locale, ~31 rôles, intégration 10 domaines f codebase uniforme — kenet ta5li adaptation mel basis tedkhol f rewrite 7ajet almost. Plus, l'objectif pédagogique mta3 PFE houa démontrer la capacité de conception et développement full-stack.

### Q2: "3lech self-hosted? Mech cloud more practical pour equipe sghira?"
**Jaweb**: La contrainte jeat mel organisation nfisha — data sovereignty. TDG ma7abetch data interne mta3 les projets (discussions, task descriptions, workflow details) tkoun stockée chez tiers. Plus, self-hosting ya3ti control total 3al customization w intégration.

### Q3: "31 rôle mech barcha? Mech over-engineering pour equipe mta3 7 membres?"
**Jaweb**: Les 31 rôles mech 31 user — homa modélisation des responsabilités: admin, CEO, CTO, project manager, scrum master, dev, designer, HR... à travers les 2 unités w à des niveaux différents (org-level, project-level, team-level). L'idée houa que la plateforme tetscale m3a TDG ki tekber sans lazem t3awed l'architecture.

### Q4: "El AI copilot — chnou yfarr9ou 3la ChatGPT li l'user yista3mlou directement?"
**Jaweb**: ChatGPT ma3andouch accès l data TDG. L'user ynajem copy-paste context manuellement mais hedha mech scalable, mech sécurisé, w mech accurate. El copilot mte3na y retrievi automatiquement mel data interne (tasks, comments, sprints) — permission-scoped ya3ni user yara ghir data li rôle-ou ysam7lou biha — w yjaweb b citations li l'user ye9der yverifi. Ki mafamech data pertinente, le système yrefuse au lieu ma yinventi.

### Q5: "Quel est l'apport de ce projet par rapport à l'état de l'art?"
**Jaweb**: L'apport mech feature individuelle — howa l'intégration verticale mta3 10 domaines + couche AI grounded f application wa7da self-hosted. Plus, el aspect RAG grounded in the org's own data avec permission-scoping houa un apport technique spécifique — les outils existants li fihom AI yzidou features generics mch grounded f data locale.

### Q6: "Kont wa7dek f le développement — kif gérit la charge?"
**Jaweb**: Architecture modulaire + Scrum + encadrement bi-hebdomadaire. Kol sprint indépendant (domain isolé). La layered architecture uniforme khallatni efficace — ki tet3alem el pattern, kol module jdid yekhdhem nafsou. Plus, les 2 encadrants (CEO frontend, CTO backend) débloquiw les obstacles techniques.

### Q7: "GitHub Projects — est-ce que c'est vraiment insuffisant pour une équipe de 7?"
**Jaweb**: Pour 7 membres, kol outil suffisant temporairement. El mushkla hiya la trajectoire: TDG 9a3da tekber, w les workflows li 9a3din — attendance, monitoring, AI — simply mafamech f GitHub Projects w ma tnajjemch tzidhomlou. El projet howa investissement f infrastructure li tetscale, mech juste correction situation actuelle.
