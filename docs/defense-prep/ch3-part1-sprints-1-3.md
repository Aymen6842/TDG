# Chapter 3 (Part 1): Development Sprints — Sprints 1–3

## Intro — Chnou hedha el chapter?

Hedha el chapter houa 9alb el rapport. Hna nwariw kifech bninéha la plateforme sprint b sprint. Kol sprint yemshi bel nafs el structure: nebdew bel goal (chnou n7abou na3mliw), ba3dha el backlog (chnowa el user stories), ba3dha requirements analysis (chkoun el actors, chnou ya3mliw, chnou el business rules), ba3dha el UML design (sequence diagrams, class diagrams), ba3dha el implementation (chnou bnineha w screenshots), ba3dha validation w testing (kifech t2akkadna li yekhdhem), w nektmliw b review w retrospective (chnou mchéha mlihh, chnou s3ib, chnou nt3almna).

F akher kol sprint famma cumulative class diagram — ya3ni diagram youri kifech el domain model kberit sprint ba3d sprint.

El AI sprint (Sprint 6) mch hna — mfassar wa7dou f Chapter 4 parce que houa el main technical contribution mta3 el projet.

---

---

# SPRINT 1: Foundations & Authentication

## Chnou n7abou na3mliw?

Sprint 1 houa el **assas** — bla bih ma tnajem tebni 7atta chay. T5ayel bik t7ab tebni dar: lazem el fondations 9bal ma thott el 7itan. Nafs el 7aja hna.

N7abou nebniw **3 7ajat**:

1. **El backend structure nfisou** — NestJS layered architecture m3a Prisma multi-file schema. Ya3ni el skeleton mta3 el application li kol module ba3dou bech yemchi 3lih.

2. **Authentication** — login, token refresh, password reset. Ya3ni el user ye9der ydkhol lel plateforme w yet3arraf 3lih.

3. **RBAC (Role-Based Access Control)** — el système li y9arrer chkoun 3andou el 7a9 ya3mel chnou. Ma3naha: admin ye9der ya3mel 7ajat li developer 3adi ma ye9derch ya3melhom.

**3lech hedha yji awwel?** Parce que kol endpoint f kol el plateforme lazem y3arref: (1) achkoun 9a3ed ysayelni? (2) w 3andou el 7a9 ya3mel hedhi el 7aja? Bla authentication w authorization, ma3andekch plateforme — 3andek API maftouh7a lel kol, w hedhi mochkla kbira mta3 security.

---

## Chnou fih el sprint backlog?

3andna **41 story points** f **3 weeks**, m9asmin 3la **10 user stories**. El akther thé9lin:

**US-S1-01 (8 SP)** — el backend structure nfisou. Hedhi mch feature li el user ychoufha — hedhi el infrastructure li kol chay ba3dha yetbnéh fog-ha. Layered NestJS backend m3a Prisma multi-file schema w migrations. 8 story points parce que 3andha barcha decisions: kifech norganisiw el modules, kifech el layers yet9asmou, kifech el schema files yet9asmou by domain.

**US-S1-05 (8 SP)** — kol endpoint protected lazem ykoun gated b guard li ychecky permissions. Hedhi el story li bnéhna fiha el RBAC system lkol: el constant mta3 el permissions, el guard, el decorator. 8 SP parce que el design mta3 ~120 permissions across ~31 roles = real design effort.

El user stories lo5rin: login (3 SP), token refresh (3 SP), password reset (3 SP), user provisioning (5 SP), user search w filter (3 SP), soft delete (3 SP), profile self-service (2 SP), teams (3 SP).

---

## Requirements Analysis — Chkoun ya3mel chnou?

### El actors

F hedha el sprint 3andna **3 types mta3 users**:

**Visitor** — wa7ed mch connecté, ma3andouch compte wella nsa el password mte3ou. Ye9der y-register (ama ma yod5olch tool — ywalli f état `PendingApproval` 7atta admin y-approve-ih) wella ya3mel password reset.

**User** — ay employé connecté. Ye9der ybaddel el profile mte3ou (esm, photo, etc.) w ybaddel el password.

**Admin / HR** — 3andou el 7a9 ycréi comptes, yzid roles lel users, ygéri el teams. Houma li y-onboardiw les gens jdod.

### Module A — Authentication & RBAC

#### Chnou bnineha hna?

Bnina **el security layer li kol el plateforme t depends 3lih**. Hedha el module ya3mel 7ajtein:

**El 7aja el oula: Authentication (achkoun enti?)**

Ki user y7ab ydkhol, ya3mel **login b email + password**. El API aussi y9bal login b numéro téléphone, ama el client (el frontend) yesta3mel email barka currently. Ki el login yenja7, el server y-returni **pair mta3 tokens**: access token w refresh token.

**3lech pair mta3 tokens w mch token wa7ed?**

Hedhi 7aja fundamental f security. El **access token** 3omrou 9sir (minutes) — yetba3eth m3a kol request bech el server y3arref achkoun enti. El **refresh token** 3omrou twell (jours/semaines) — mosta3mlou GHIR bech t-jédded el access token ki yo93od.

El logique: access token 9sir = ki 7ad ysarr9ou, ma yenfa3ouch barcha wa9t. Refresh token twil ama ma yetba3ethch kol request — yetba3eth ghir ki lazem t-jédded.

**3lech mch sessions kima les sites lo5rin?**

Sessions = el server y7ott state f memory wella f database lel kol user connecté. M3a REST API, hedha mushkla: (1) kol request lazem tro7 tchecky f el session store = overhead, (2) ki 3andek multiple server instances lazem tsync el sessions bénathom = complexity. JWT = **stateless** — kol el ma3loumet li el server y7tajhom deja f el token nfisou. El server ma y7tajch y7ott chay f memory.

**Ama famma exception**: el refresh tokens, houma el **wa7idin server-side state** li 3andna. Na7fdhhoum f table `RefreshToken` f la base de données. 3lech? Parce que lazem na9drou **nrevokhiw session**: ki user ya3mel logout, nod5lou n-deletiw el refresh token mta3ou mel DB → ma ye9derch y-jédded el session mte3ou plus.

Detail zghir ama important: **el token string nfisou houa el primary key** mta3 el `RefreshToken` table. Ma3naha el refresh endpoint ye9der ychecky: "hedha el token, est-ce qu'il existe f la DB?" Ki ma ylou9ahech → rejected (token never-issued wella revoked).

**Password reset — flow mta3 3 steps:**
1. User ya3ti email → server y-géneri code mta3 5 chiffres → yeb3thou par email
2. User ya3ti el code → server yvérifih (valid + mch expired, 15 min max)
3. User ya3ti el password jdid → server ybaddlou

3lech 3 steps w mch link wa7ed? Parce que hedha ya3ti separation between verification w password change. W code mta3 5 chiffres ashel mel link — ye9der 7atta y9oulou b fomou lel support. W nafs el structure mta3 2FA flows ki n7abou nzidhom f el futur.

**Rule mhimma**: code wa7ed active per user barka. Ki user y-requesti code jdid, el 9dim yet-invalida.

#### El RBAC — Kifech y-governi achkoun ya3mel chnou?

Hedha el **9alb mta3 el security** mta3 la plateforme w lazem tefhmou behi:

El système 3andou **~31 types mta3 roles** (admin, CEO, CTO, CMO, project manager, scrum master, developer, designer, HR, etc.) w **~120 permissions** (user.create, user.delete, project.read, task.move, etc.).

**El mapping roles → permissions moujoud f constant wa7da**: `PERMISSIONS_FOR_ROLE`. Hedhi hiya el **single source of truth**. Ki tchouf el code, tel9a constant wa7da fiha kol role w kol permission li 3andou. Ma3andekch permission checks mferr9in f el code — kol chay yrej3a l hedhi el constant.

**El guard li yenforci hedha**: `HasPermissionGuard` — **guard wa7ed** applied 3la **139 routes across 18 controllers**. Ya3ni kol request protected yemshi 3la nafs el guard.

**Kifech el guard y9arrer?** Logique simple: **OR across permissions, OR across roles**. Ya3ni:
- User 3andou roles multiples (ye9der ykoun developer W project manager f nafs el wa9t)
- El guard ychouf: est-ce que **ay wa7ed** mel roles mta3 el user y-carry **ay wa7da** mel permissions required lel route?
- Ki yla9aha → pass. Ki ma yla9ahech → **403 Forbidden**.

**Ama famma nuance mhimma**: el guard ya3mel check **coarse** (3andek permission wella la). El checks el **fine** — kima "est-ce que hedha el user owner mta3 hedhi el resource?" — yetwassliw f el **service layer**, parce que hnayek el data available. Hedha y-appella **two-tier authorization** w houa **pattern li yet-reuse f kol el plateforme**.

Exemple: guard ychecky "3andek permission `task.update`?" → pass. Ba3dha el service ychecky "ama est-ce que hedhi el task f projet li enta member fih?" → ki la → reject. El guard ma ye9derch ya3mel hedha el check el thani parce que ma3andouch access lel project membership data.

**User ye9der ykoun 3andou multiple roles simultaneously** — roles modeled ka rows f `Role` table (mch single enum column). Ki user ya3mel login, el server y-flatten kol el roles w permissions mte3ou w y7otthom f el JWT payload. W hekka el guard ye9ra el permissions directly mel token, bla ma yrou7 lel DB.

**Business rules lo5rin:**
- Self-registration → `PendingApproval` state. Hedha **least-privilege default**: 7atta ki 7ad y-register, ma ye9derch ya3mel chay 7atta admin y-promotih. 3lech? Parce que el registration maftouh7a — anyone m3a email ye9der y-register. Ki account active on registration directly → risk mta3 unauthorized access.
- Anti-privilege-escalation: admin ye9der GHIR ya3ti roles li houa nfisou authorized y-manage-hom (`canRolesManageRoles`). Ya3ni HR manager ma ye9derch ycréi CEO account — parce que HR role ma 3andouch el 7a9 y-manage CEO role.

> Figure 3.2 — Login sequence: service yjib el user by email/phone (active accounts only) → y9arin el password b **bcrypt** (hashing algorithm deliberately slow = resistant lel brute force) → ki yenja7 → ycréi el token pair → ystocki el refresh row f DB

> Figure 3.3 — Protected-request RBAC sequence: guard y9ra `@Permissions` decorator mel route → yvérifié JWT signature + expiry → yattachi el decoded payload 3al request → ychecky intersection permissions → 403 ki mafamech match

> Figure 3.4 — Class diagram: User (credentials + isActive flag), Role (y-attachi UserType values lel user), RefreshToken (live sessions), ResetPasswordCode (el code el outstanding)

### Module B — Users & Teams

#### Chnou bnineha?

Fog el authentication, bnina el **admin side** li ygéri el users nfishom:
- Créer comptes, modifier, **soft-delete** (désactiver — mch supprimer)
- Profile self-service (el user ybaddel l7ajet mte3ou b nafsou)
- Password change
- Bulk email (yeb3eth email l barcha users f marra)
- **Teams** — regrouper les users f équipes

#### 3lech "soft delete" w mch delete 3adi?

Hedhi question mhimma. **Soft delete** ya3ni ki admin y7ab y-supprimé user, ma n-suppriméwch el row mel DB — n-settiw `isActive: false` barka.

**3lech?** Parce que user li 3andou tasks, comments, time entries, project memberships — ki t-suppriméh physically, twa77ed: wella el FK constraints ykassrou (el DB trfodhek), wella t-cascadi el delete w tkhalli tasks w comments orphaned bla owner. Soft delete y7afdh **kol el data integrity** w y5alli el user exists lel historical records. W ki admin y7ab y-reactivatih? Y-setti `isActive: true` w yraj3a.

User li `isActive: false` ma ye9derch y-logini, ma ye9derch ya3mel 7atta action — effectively "deleted" mel perspective mta3 el user ama el data preserved.

#### El anti-privilege-escalation — kifech yekhdhem?

Hedhi security feature mhimma. Ki admin ycréi compte jdid, lazem ya3tih roles. Ama mch ay admin ye9der ya3ti ay role:

El système ychecky `canRolesManageRoles` — mapping li y9oul: "role X ye9der y-manage roles Y w Z." Ki admin (li 3andou role HR par exemple) y7awel ya3ti role CEO l user jdid → el système ychecky: "HR role ye9der y-manage CEO role?" → La → **403**. 

Hedha y-preventi privilege escalation — ya3ni 7ad b access limité ma ye9derch ycréi 7ad b access akther mennou.

#### Accent-insensitive search — 3lech w kifech?

F Tunisie, 3andna esmet kima "Hédi", "Hedi", "Hédi"... nafs el wa7ed ama b accents mkhtalfin. Ki admin yfattech 3la user, lazem yla9ah regardless mta3 el accents.

**Kifech 7allineha?** Na7fdhiw kol user esm **marten**: el `name` original (b accents) w `unaccentedName` denormalized (bla accents). El search ya3mel 3la `unaccentedName`. Simple, effective, ma y7tajch search engine barra.

#### Teams — chnou w 3lech?

Teams ya3ni nregropiw users f groupes — "frontend team", "design team", etc. Implemented b `UserTeam` join table (many-to-many entre User w Team). 3la hedha el join famma flag `isManager` — li y9oul achkoun manager mta3 hedhi el team. Hedha important: f Sprint 4 ki nebniw attendance w team statistics, lazem na3rfou achkoun manager bech nchoufou stats mta3 el team mte3ou.

> Figure 3.5 — Create user by admin sequence: service yvérifié li el caller ye9der ya3ti el requested roles → ycréi el account active → y-attachy el roles

> Figure 3.6 — Class diagram: User m3a champs admin w search fields, Team, UserTeam (join m3a isManager flag)

---

## Chnou implementina concretement?

### Backend
- **8 auth endpoints**: register, login, logout, el 3 steps mta3 password reset, token verify, token refresh
- **14 admin endpoints** (guarded) 3la `/users` w `/teams`: provisioning, `GET /users/me`, user list b search w filters w CSV export, profile updates, password change, soft delete, bulk email, team CRUD

### Frontend
- **Guest pages** (mch connecté): login screen, registration screen, password reset screens
- **Admin section** (connecté): table mta3 users (search by esm, email, wella téléphone, filter by role, tri, pagination), dialog bech tcréi/t-editi user, w teams view

> Screenshots: P07 (Login), P08 (Registration), P09 (Users list m3a search w filters), P10 (Create/edit user dialog), P11 (Teams view)

---

## Kifech t2akkadna li kol chay yekhdhem?

Bnina **2 testing strategies**:

**Strategy 1: E2E RBAC suite** — test li y-rouli el **full permission matrix**. Ya3ni: khdhina 5 roles (CEO, PM, PO, Scrum Master, Engineer) w jarrabna kol route: est-ce que kol role ye9der yousel GHIR lel routes li lazem? Hedha **validates el core authorization contract** — ya3ni ki n9oulou "engineer ma ye9derch y-créi user", el test yprouvi hedha concretement.

**Strategy 2: Acceptance scenarios** — Given/When/Then conditions. Kol user story 3andha scenario li lazem yen7all bech el story te7tsseb "verified." 10 stories, 10 scenarios, kolhom verified.

---

## Sprint Review — Chnou 7a99a9na?

**Kol el goals met**: 3andna backend li yekhdhem b layered architecture, authentication stateless-JWT m3a server-side refresh state, full user/team administration governed b single declarative RBAC catalogue (139 routes, 18 controllers).

**El akther important**: el **two-tier authorization pattern** li bdinaah hna — coarse guard + fine-grained service check — walla **template li kol module ba3dou yesta3mlou**. Ya3ni el investment f hedha el sprint ywalli y pays off kol sprint ba3dou.

**7ajat b9éw**: shorter token TTLs (currently trop long lel production), request throttling (bech n-preventiw brute force 3la login w password reset), w stricter check 3la user deletion. Mlogged f Annex A.

## Sprint Retrospective — Chnou nt3almna?

**Chnou ken s3ib?**

Hedha ken awwel marra nesta3mel NestJS w Prisma — learning curve significant. Fehm kifech NestJS ya3mel dependency injection, kifech el guards yet-composiw, kifech el modules yet-wiriw — khedh wa9t 9bal ma nebda nproduci effectively. Prisma aussi: multi-file schema, migration workflow, query API — kolhom jdod.

Ama el akther s3ib ken **design mta3 el RBAC catalogue**. ~120 permissions across ~31 roles → lazem tel9a el balance el s7i7: trop fine-grained → un-maintainable, trop coarse → ma tenforci-ch assez. T3adlet barcha marat 9bal ma tousel lel design final.

**Chnou fad el projet?**

Investing f **strict uniform architecture mel awwel** — el 4-layer convention (controller → service → repository → DTO) — benet immediately. Ki el pattern established f hedha el sprint, kol module ba3dou ye9der yet-scaffolda b sor3a b copying el nafs el structure. Ma 3adch lazem t decide "kifech norganisi hedha el module" — el answer dima nafs.

El **table-driven RBAC** (constant wa7da + guard wa7ed) aussi proved fayda kbira early on: far easier to audit than scattered authorization checks f kol blasa f el code.

> Figure 3.7 — Cumulative class diagram ba3d Sprint 1. Parce que hedha awwel sprint, kol class hiya jdida. F les sprints li jaw ba3d, el diagram yekber w el classes el jdod yet-highlightiw.

---

---

# SPRINT 2: Projects & Membership

## Chnou n7abou na3mliw?

M3a authentication w access control f blashom, twah n7abou ndakhliw **el concept central li kol el plateforme tedour 3lih**: el **project**.

T5ayel la plateforme kima immeuble. Sprint 1 bnéh el fondations w el sécurité. Sprint 2 ybni **el structure portante** — el project. Kol chay li yji ba3d — tasks, sprints, epics, milestones, labels, kanban, AI copilot — kol chay y-**tatti f project**. Ya3ni `Project` hiya el **aggregate root** — kol entity 3andha foreign key li traje3 lel project.

Bla projects, ma 3andekch win t7ott tasks. Bla projects, ma 3andekch scope lel sprints. Bla projects, el AI copilot ma 3andouch chnou yindexer. Hedha 3lech Sprint 2 yji exactly hna.

**Chnou nbniwha f hedha el sprint:**
- Full project lifecycle: create, read, update, archive, hard-delete
- Per-project team membership m3a **single project manager**
- Email invitation flow bel token bech tji7 nas jdod lel project

---

## El Backlog — 26 SP, 2 weeks

Hedha el **lightest sprint** (26 SP f 2 weeks — comparé b 64 SP f Sprint 3). 7 user stories. El mhimmin:

**US-S2-01 (5 SP)** — create project ta7t business unit m3a type AGILE wella FREESTYLE. Hedhi el user story li t-introduci el concept mta3 el **2 project types** — w hedha decision kbira li t2aththar 3la kol chay ba3dha.

**3lech 2 types?** TDG 3andha 2 business units: **Tawer Dev** (software, web, mobile) w **Tawer Creative** (branding, marketing, design). El dev team ye9drou yesta3mliw Scrum: sprints, epics, story points, burndown charts. Ama el creative team? Marketing campaign ma t7tajch sprint planning — t7taj simple task board: TODO, IN_PROGRESS, DONE, w 5alas. Forcing agile artifacts 3la creative team = overhead bla fayda. Hedha 3lech 3malna AGILE w FREESTYLE — el choix yet3amel per project ki ycréih.

**US-S2-04 (5 SP)** — invite by email. Manager yeb3eth invitation par email, el invitee ye9balha, ywalli member. Hedhi 3andha security concerns mhimmin (token management, email verification).

**US-S2-07 (5 SP)** — user ychouf GHIR el projects li houa member fihom. CEO ychouf kol chay. CTO ychouf ghir TawerDev. CMO ychouf ghir TawerCreative. Hedhi el **data isolation** — critical bech user ma ychoufch data mch mte3ou.

---

## Requirements Analysis

### El actors — achkoun 3andou el 7a9 ya3mel chnou?

**Executive** (CEO, CTO, CMO) — ycréi projects w ygérihom. Ama kol wa7ed 3andou scope mkhtalef:
- **CEO**: ychouf w ygéri **kol** les projects (global)
- **CTO**: ychouf w ygéri GHIR les projects mta3 **TawerDev** (business unit mte3ou)
- **CMO**: ychouf w ygéri GHIR les projects mta3 **TawerCreative**

**Project Manager** — le member li marked `isManager` 3la el project. Ygéri el team, yeb3eth invitations, yconfiguri el board. Ama **GHIR 3la el projects li houa manager fihom** — mch 3la kol les projects.

**Member** — y9ra les projects li houa member fihom. Ma ygérich, ma y-invitich, ma y-configurich. Y9ra barka.

### El Project — kifech mbniya?

Project fi-ha barcha details mhimmin:

**Business unit**: kol project t-apparteni l wa7da mel 2 units (TawerDev wella TawerCreative). Ma tnajem tbaddilha ba3d el creation — **business unit immutable**. 3lech? Parce que el BU y-determini el access scoping (achkoun mel executives ychoof el project) w project type affects el available features. Ki tbaddel el BU ba3d ma users b déw yesta3mliw el project → chaos.

**Project type**: AGILE wella FREESTYLE, yet-choisi ki el project yet-créi. Y-determini chnou mel planning features available f Sprint 3 (sprints, epics, story points = AGILE only; milestones = both).

**i18n** (internationalization): el champs li y9rawhom el users — name, description, details — **mch stockés f el project table directement**. Stockés f **child table `ProjectContent`** keyed by language (en, fr). Ya3ni project wa7ed ye9der 3andou esm bel anglais w esm bel français. 

**3lech child table w mch JSON field?** JSON field ashel f el schema ama: (1) ma tnajem t query easily by language, (2) mafamech DB-level constraints 3la el content, (3) harder to index lel search, (4) ma tnajem t-joini fl queries. Child table slightly more complex ama: query by language = simple WHERE, DB constraints, indexable, w **el pattern reusable** — nesta3mliwhh lel sprints w tasks aussi. W ki tousel lel AI copilot, content f separate rows ashel bech tindexer.

**WIP limits**: stored ka JSON map 3la el project nfisou (`kanbanSettings`). Validated against el actual status names — ya3ni ma tnajem t-setti WIP limit 3la column li ma existich.

### Membership — kifech el team yet-managéha?

Kol project 3andou `ProjectMember` rows — wa7ed per member. F kol project **exactly ONE** member marked `isManager`. Hedha el **single-manager invariant**.

**3lech single manager w mch multiple?** Design decision. Manager wa7ed = **clear ownership**. Ki 3andek 2-3 managers 3la nafs el project → achkoun y9arrer? Conflicts mta3 priorities. Manager wa7ed = accountability clear. Ama el executives (CEO/CTO/CMO) 3andhom management-level access aussi, donc famma fallback. W ki TDG tekber w lazem multiple managers → el invariant ye9der yet-relaxa (nbaddlouh mel exactly-one l at-least-one). Currently = simplest correct model.

**El invariant enforced f 3 places**:
1. **On create**: lazem exactly one manager. Ma tnajem t-créi project bla manager.
2. **On demotion**: el last manager ma ye9derch yet-demotéh. Ya3ni ki 3andek manager wa7ed w t7awel tna77ih manager → rejected.
3. **On removal**: el last manager ma ye9derch yet-suppriméh mel project by non-executive.

3lech 3 places w mch wa7da? Parce que kol **mutation** li t-affecti el manager status lazem tet-checki b nafshe. Ki t-checki ghir f create ama tensa f removal → ye9der ywalli project bla manager → inconsistent state.

### 2 tro9at bech tzid member:

**Tari9a 1 — Direct add** (executives only): executive y5éhir user existing w yzidou directly ka member. Simple, immediate.

**Tari9a 2 — Email invitation**: manager wella executive yeb3eth invitation par email. El système ycréi `ProjectInvitation` b `randomUUID` token, expiry mta3 7 jours. El invitee y9bal → ywalli member.

**Security mta3 el invitation flow — barcha layers:**
1. **Token = randomUUID** — cryptographically random, impossible ta5mnou
2. **Single-use**: ki yet-accepta, status ywalli `ACCEPTED` → nafs el token ma yenfa3ch marra o5ra
3. **Expiry**: 7 jours. Ba3dha → expired, rejected
4. **Email match**: el user li y-accepta lazem email mte3ou = el email li t-invitéh biha. Ya3ni 7atta ki 7ad ysarr9ek el token, ma ye9derch ysta3mlou m3a compte e5er
5. **Upsert**: ki t-re-inviti nafs el email → token jdid yet-géneri (el 9dim yet-invalida)

Hedhi 5 layers mta3 protection — comprehensive.

**3lech UUID w mch JWT lel token mta3 invitation?** UUID = opaque, simple, stored f DB. Verification = DB lookup. JWT = self-contained ama: (1) harder to revoke (lazem blacklist), (2) el payload visible l 7ad li y-intercepti el email, (3) more complex lel use case simple. UUID = better fit hna.

### Authorization model — kifech el access isolation tekhdhem?

Hedhi el feature li faha el akther subtlety. El access check **pushed INTO el Prisma `where` clause** — ya3ni el permission check w el data fetch yetwassliw f **query wa7da atomique**. 

Chnou ya3ni hedha concretement? Ki user y-requesti list mta3 projects, el service ma y-fetchich kol les projects w y-filtri ba3d — la. Ybni el `where` clause ta3 Prisma **based 3la el role mta3 el user**:
- User 3adi → `where: { members: { some: { userId } } }` (ghir projects li houa member fihom)
- CTO → `where: { businessUnit: "TawerDev" }`
- CEO → `where: {}` (kol chay)

**3lech hedha a7san mel fetch-then-filter?** Parce que mafamech **gap** entre el access check w el data fetch. F fetch-then-filter, ki famma bug f el filter → data leaked. F query-scoped approach, el DB nfisha ma t-returni-ch data li el user ma3andouch access liha — **impossible** bech ychouf chay mch mte3ou unless el query nfisha fiha bug.

Hedha el pattern y-appella **defense in depth** aussi parce que el coarse guard deja checka 3al route level. Ki famma bug f el guard, el service layer still yenforci. 2 couches mta3 security.

**Security note mhimma**: el module yesta3mel Prisma query-builder exclusively — **mafamech raw SQL**. Ya3ni mafamech string interpolation → **mafamech SQL injection surface**. El queries kolhom parameterized automatically by Prisma.

> Figure 3.9 — Create-project sequence: re-check executive status (defense in depth) → normalize input → default manager to creator ki mafamech specified → validate single-manager invariant → write project + nested members + contents f **repository call wa7da**. Duplicate name → Prisma error P2002 → **409 Conflict**.

> Figure 3.10 — Add-member / invite sequence: **endpoint wa7ed "smart"** (`POST /:projectId/members`) li y-branchi based 3la chnou el caller ba3th: `userId` → direct add (executive-only). `email` → upsert invitation → send branded email → raise in-app notification ki el invitee deja 3andou compte.

> Figure 3.11 — Class diagram: Project (aggregate root), ProjectContent (i18n), ProjectMember (join + isManager + hourlyRate), ProjectInvitation (token lifecycle)

---

## Chnou implementina?

### Backend
**17 endpoints** 3la `ProjectsController`:
- Lifecycle: register, list, get, get capacity, update, delete, archive, restore
- Membership: smart add-member, update-member, remove-member
- Invitation: create, revoke, resend, accept
- Kanban settings: get, patch

### Frontend
- Project list b tabs mta3 status (active, archived) m3a search w filter panel w drag-reorder
- Project detail view b tabs
- Members tab: list members + pending invitations, direct-add, invite-by-email, role toggle, remove, resend/revoke

> Screenshots: P12 (Projects list), P13 (Create project sheet), P14 (Members tab), P15 (Invite dialog)

---

## Testing

**Strategy 1: Behavioral unit-test suite** — `projects.service.spec.ts`, **854 lines**. Hedhi el **awwel module li 3andou dedicated test suite**. Test ycovri kol el lifecycle: create (forbidden case, success case, duplicate name → P2002), executive vs non-executive list scoping, get-by-id (member, executive, not-found), capacity, update (BU immutable, success, conflict), delete (including CTO BU filter), archive/restore, add/update/remove member. + companion `projects.controller.spec.ts` (215 lines) lel controller wiring.

**3lech 854 lines?** Parce que hedha el aggregate root — ki famma bug hna, kol chay ba3dou affected. El investment f testing hna y-pays off.

**Strategy 2: Acceptance scenarios** — 7 stories, 7 scenarios, kolhom verified.

---

## Retrospective — Chnou nt3almna?

**El s3oubét:**

El main challenge ken el **project-scoped authorization model**. F Sprint 1, el RBAC global — permission check 3al route level barka. Hna, el permission w el DB query lazem ykounou **statement wa7da atomique**. Building el Prisma `where` clauses correctly (CEO global, CTO/CMO unit-limited, manager project-limited) — khedh wa9t w care.

El single-manager invariant aussi khedhit effort: enforcing it across create, demotion, w removal **without leaving inconsistency window** lazem validation f 3 points mkhtalfin f el service.

**Chnou fad el projet:**

El **query-scoped access pattern** — proved to be el strongest pattern f el module. Nesta3mlou f kol module ba3dou. W el **i18n content-table pattern** (ProjectContent keyed by language) aussi proved reusable — t-adopta directement f later sprints lel sprints w tasks.

> Figure 3.12 — Cumulative class diagram ba3d Sprint 2: Project family (Project, ProjectContent, ProjectMember, ProjectInvitation) tzédet, linked back to User mel Sprint 1.

---

---

# SPRINT 3: Agile Backlog & Tasks

## Chnou n7abou na3mliw?

M3a users, access, w projects f blashom — twah ndakhliw **el khedma nfisha**. Sprint 3 houa **el sprint el akther th9il w el akther complex** f el plan lkol: **64 story points 3la 5 weeks**.

N7abou nbniw **2 modules inseparable**:

**Module A — Agile Planning Layer**: epics, sprints (b governed lifecycle = state machine 7a9i9iya), milestones, w analytics (burndown, velocity, Gantt charts).

**Module B — Task Engine**: kanban board li mch hard-coded — **data-driven**, custom columns, WIP limits, dependency-blocking, story points, time logging, labels, w threaded comments.

**3lech inseparable?** Parce que sprint bla tasks ma3andouch sens — sprint meaningful ghir ki tasks ye9drou yet-assigned lih. W burndown chart y-9ra directement mel `storyPoints` w `completedAt` mta3 kol task. El zouz modules y-complétiw ba3dhhom.

---

## El Backlog — 64 SP, 5 weeks

12 user stories. El th9al (kol wa7da 8 SP):
- Sprint lifecycle state machine (start/stop/complete, one running max)
- Burndown, velocity, Gantt analytics
- Data-driven kanban (custom columns + WIP limits)
- Move task across columns (3 validations)

---

## Module A — Agile Backlog

### Chnou bnineha?

3 planning artifacts, kol wa7ed scoped l project wa7ed:

**Epics** — epic hiya feature kbira li tjam3a barcha tasks ta7tha. 3andha esm, couleur, optional dates. El progress mte3ha = percentage mta3 tasks li status-hom DONE ta7tha. Example: "User Management" epic tjam3a kol les tasks related lel user CRUD, roles, teams.

**Sprints** — sprint hiya iteration time-boxed. 3andha:
- Date windows (planned start/end + estimated start/end)
- Story-point `capacity` (9addech ye9drou yportéw)
- Multilingual content (nafs el i18n content-table pattern mta3 projects)
- File attachments (`SprintAttachment`)
- W el akther important: **real lifecycle** governed b state machine

**Milestones** — target date lel set mta3 tasks. Deadline. Simple concept ama important lel tracking.

### 3lech epics w sprints AGILE-only ama milestones lel kol?

Epics w sprints = agile concepts. FREESTYLE project ma y7tajhomch (marketing campaign mech sprint). Donc 3malna **`AgileOnlyGuard`** li ybloqui hedhou el endpoints 3la FREESTYLE projects.

Ama milestones? Deadline useful REGARDLESS mta3 el workflow type. 7atta marketing campaign 3andha deadline. Hedha 3lech milestones mafamech guard 3lihom — available lel AGILE w FREESTYLE.

### Sprint Lifecycle State Machine — el haja el akther complexe f hedha el module

Hedhi state machine 7a9i9iya, mch just status field:

**El états:**
- `Pending` — el sprint yet-créi f hedha el état. Jdid, ma bdéhch.
- `Running` — el sprint bda, el team 9a3da tekhdhem 3lih.
- `Stopped` — el sprint twa99ef 9bal ma yekmel (interruption, changement scope...).
- `Completed` — el sprint kmel 3adi, el khedma twasslet (wella el ba9i tet7awwel lel sprint el jey).

**El transitions (achkoun yewsel l achkoun):**
```
Pending → Running (START)
Running → Stopped (STOP)
Running → Completed (COMPLETE)
Stopped → Running (RESTART)
Completed → Running (RESTART)
```

**El guard el akther critical**: ki t7awel tstarti sprint, el système ychecky: **3andek sprint ekher f nafs el project deja Running?** Ki oui → **rejected**. One running sprint max per project. 

**3lech one running max?** Hedha Scrum principle. Sprint = focused timebox. Ki 2 sprints running f nafs el wa9t → resources split, priorities unclear, burndown ywalli meaningless (points mta3 aya sprint ye7sbou?). Sequential, focused delivery.

**Side effects 3la el transitions:**
- Move to `Running` wella `Completed` → **notify every project member** (l'equipe lazem ta3ref li el sprint bda wella kmel)
- Move to `Stopped` wella `Completed` → **cancel still-pending reminders** (ma3adch lazem reminders 3la sprint li wa9ef wella kmel)

**Détail mhim**: el state machine = **shared contract**. Ya3ni el backend validator w el frontend sprint card action buttons (Start / Stop / Complete / Restart) lazem **ymirroréw ba3dhhom exactly**. Ki el backend y9oul "mel Running tnajem trou7 l Stopped wella Completed", el frontend youri GHIR button Stop w button Complete. Consistency bin el zouz.

### Sprint Date Validation

Kol sprint 3andou 4 dates: planned start, planned end, estimated start, estimated end. El validations:
- End lazem **ba3d** start
- Estimated end lazem **ba3d** estimated start
- **Kol el sprint window lazem tou9a3 da5el el project's date window** — ya3ni sprint ma ye9derch yebda 9bal el project nfisou

### AI Integration mel awwel

Détail li barcha nas ma yentbhouch lih: **kol write 3la agile artifacts** (create epic, create sprint, update milestone...) y-enqueue embedding job via `IndexOutboxService`. Ya3ni **mel Sprint 3**, el agile artifacts deja **first-class documents lel AI copilot** li bech yji f Sprint 6.

**Chnou ya3ni hedha practically?** Ya3ni ki tousel lel Sprint 6 w t7ab tebni el copilot, el content deja indexed w searchable. Ma3andekch t-backfilli chay — el pipeline deja mawjoud mel awwel. Hedha **forward-thinking design** — bnina el infrastructure lel AI 9bal ma nebniw el AI nfisou.

**Kifech yekhdhem el outbox?** Simple:
1. Ki tsavi sprint (wella task, wella comment) → INSERT el entity f table mte3ha + INSERT row f `IndexOutbox` (f nafs el transaction)
2. Background job y9ra `IndexOutbox` periodiquement → y-géneri embeddings → ystocki-hom
3. El write path ma yestannach el embedding generation — cost = **INSERT wa7da zayda** f nafs el DB (microseconds). El expensive part (Gemini API call) yesra async.

> Figure 3.14 — Create-sprint sequence (el akther involved write path f el module)
> Figure 3.15 — Burndown sequence: load tasks → sum committed points → day by day: ideal line (total minus even daily burn) vs actual remaining (total minus DONE points on/before that day)
> Figure 3.16 — Sprint lifecycle state machine diagram
> Figure 3.17 — Agile Backlog class diagram

### Sprint Analytics — Burndown, Velocity, Gantt

Hedhou **computed server-side** — ya3ni el server y7essbhom, mch el client.

**Burndown** — el akther clear: lel sprint li tekhtirou, el service yjib kol task b `storyPoints`, `status`, `completedAt`, `createdAt`. Y-sum el committed points. Ba3dha yemshi **day by day** 3la el sprint window:
- **Ideal line**: total minus even daily burn (line droite mel total l zéro)
- **Actual line**: total minus el points mta3 tasks DONE on or before that day

Ki el actual line fog el ideal → behind schedule. Ki ta7tha → ahead.

**Velocity** — y-aggregati completed-sprint points across el project. Ya3ni: Sprint 1 = 30 pts completed, Sprint 2 = 25 pts, Sprint 3 = 35 pts → velocity chart.

**Gantt** — y-combini 4 parallel queries (milestones, epics, sprints, tasks) f timeline wa7da.

**3lech server-side w mch client-side?**
1. **Source of truth wa7da**: kol el clients (web, potential mobile, API) y7asbou nafs el calculation
2. **Access to all data**: server 3andou kol el task dataset. Client lazem y-fetchi ALL tasks bech y7esb (expensive, security risk — t-exposi data mta3 members o5rin)
3. **Consistency**: ki el calculation logic tbaddel → server update wa7ed yekfi
4. **Security**: client-side = lazem t-exposi raw task data including mta3 members o5rin

---

## Module B — Tasks & Data-Driven Kanban

### Chnou bnineha?

Hedha **el module el akther complex f el codebase lkol**. `tasks.service.ts` wa7dha = **2,735 lines**. 3lech kbira hakka? Parce que el task hiya el central work unit w 3andha connections m3a practically kol chay: sprints, epics, milestones, dependencies, labels, time entries, comments, board columns, notifications, AI indexing...

### El Task — chnou fiha?

Task 3andha:
- Type (bug, feature, story, task), priority (low, medium, high, critical, urgent)
- Assignee (achkoun yekhdhem 3liha), reporter (achkoun créaha)
- Story points, estimated hours, actual hours, due date
- Free-string `status` (el column mta3 el board)
- `displayOrder` lel manual ordering (drag-drop)
- Level wa7ed mta3 **subtasks** (task ta7t task)
- Dependencies, labels, time entries, threaded comments m3a likes w mentions
- Generated key: `TASK-<n>` scoped lel project (kima Jira keys: PROJ-123)

### AGILE vs FREESTYLE — kifech el board yetbaddel?

| | AGILE project | FREESTYLE project |
|---|---|---|
| **Columns** | 6: BACKLOG → TODO → IN_PROGRESS → IN_REVIEW → TESTING → DONE | 3: TODO → IN_PROGRESS → DONE |
| **Sprints/epics/story points** | Available | **Rejected by service** — ki t7awel t-assigni sprint l FREESTYLE task → error |
| **Progress tracking** | Burndown + velocity | Percentage simple |

El service **enforci** hedha: ki t-créi task 3la FREESTYLE project w tab3eth `sprintId` wella `epicId` wella `storyPoints` → **rejected**. Ma yemchich.

### Data-Driven Board — el concept el akther important

Hedha el feature li yfarr9 el plateforme mte3na 3la board simple. **El board mch hard-coded!**

F board classique (Trello, GitHub Projects), el columns fixed f el code: TODO, IN_PROGRESS, DONE. Ki t7ab tzid column — lazem tbaddel el code, wella t-deploy version jdida.

F **data-driven board**:

1. Kol project 3andou `ProjectTaskStatus` **rows f el DB** = source of truth lel columns (esmhom, ordrhom, couleurhom, w **el transitions autorisées mel kol column**)
2. Task mte3ha `status` = **plain string** li te7ml esm el column (system enum name wella custom column name)
3. Team ye9der **yzid custom columns bla schema change, bla migration, bla developer** — just yzid row f el DB
4. El link bin `Task.status` (string) w `ProjectTaskStatus.name` (row name) = **application-enforced** — free string ma ye9derch y-carry foreign key, donc el service hiya li tenforci el consistency

**3lech free string w mch enum?** Parce que enum = hard-coded f el schema. Ki t7ab tzid column jdida → schema change → migration → deploy. M3a free string, team yzid column f el DB w taskha toul. El trade-off: mafamech DB-level constraint 3la el values → application lazem tenforci. Worth it lel flexibility.

**Statuses seeded lazily** — ya3ni mch ki project yet-créi: on first board read. 3lech? Ki project yet-créi, el user ma choisiech layout mta3 el board yet. Lazy seeding = defer 7atta effectively lazem, ba3dha nseedéw defaults based 3la project type (AGILE → 6 columns, FREESTYLE → 3). Plus ki nbaddliw defaults later, projects jdod y7awzou el defaults el jdod automatically.

### Column Move — El 3 Gates

Ki user y-draggi task mel column l column o5ra, el server y-rouli **3 validations f order**. Lazem el 3 yemchiw bech el move yesra:

**Gate 1 — Transition legal?**
El server ychecky `ProjectTaskStatus` rows: est-ce que hedhi el column t-autorisé el move lel column el o5ra? Exemple: f AGILE board, mel `IN_REVIEW` tnajem trou7 l `TESTING` wella traje3 l `IN_PROGRESS` — ama ma tnajem t9afzech l `BACKLOG` directement.

**Gate 2 — Mch blocked?**
El server ychecky kol el dependencies mta3 el task: est-ce que famma task li blocking hedhi w mazélet mch DONE? Ki oui → **rejected b error `TASK_BLOCKED`**. Ma tnajem t-avanci task ki dependencies mte3ha mazéliw mch completed.

**Gate 3 — WIP limit ok?**
El server ychecky el target column: 9addech tasks deja fiha? Est-ce que 3ala el WIP limit mta3 el project settings? Ki oui → **rejected b error `WIP_LIMIT_REACHED`**.

**Ba3d el 3 gates pass:**
- Status yet-updati
- Ki el task tousal `DONE` → `completedAt` yet-stampi (hedha ya3mel burndown chart yekhdhem)
- Assignee yet-notifié (fire-and-forget — el notification async, ma t-blockish el write path)

### Circular Dependency Guard

Ki t7ab tzid dependency (Task A blocks Task B), el système y-rouli **recursive DFS traversal** mta3 el blocking graph:

Mel Task B, yemchi following kol el blocking edges. Ki yousel l Task A → **cycle detected → rejected**.

Y-detecti 3 types mta3 cycles:
- **Self-reference**: task t-blocki ruouhha (A→A)
- **Bidirectional**: A blocks B AND B blocks A
- **Transitive**: A→B→C→A (chain li traje3 l nfisha)

**Complexity?** O(V+E) f el worst case (V = number of tasks, E = dependencies). Ama f la pratique, el dependency graph **sparse** (kol task 3andha few dependencies) → effectively instant.

### Comments System

Comments 3la tasks fi-hom barcha détails:
- **Threaded** — comment ta7t comment (level wa7ed)
- **@mentions** — t-mentionni user f comment, yet-notifié
- **Likes** — toggle, one per user max
- Created f **transaction** m3a el mentions (ya3ni wella kolhom yetcréiw wella 7atta wa7ed — no partial state)

### Authorization — 7 Tiered Capability Helpers

F hedha el module, el authorization plus complex mel modules lo5rin. 3andna **7 levels mta3 capabilities**, mel a9al lel akthar:

1. `canAccessProject` — any member ye9ra, ycommenti, yloggui time
2. `canCreateTaskForProject` — ye9der ycréi tasks
3. `canManageTaskStructure` — ygéri dependencies, labels
4. `canManageBacklog` — ygéri el backlog
5. `canManageSprintAssignment` — y-assigni tasks lel sprints
6. `canAdvanceTaskWorkflow` — **hedhi el mhimma**: el assignee ye9der y-mouvii el card mte3ou **7atta bla management role**. Ya3ni developer ye9der y-draggi card mte3ou mel TODO lel IN_PROGRESS bla ma ykoun PM wella SM.
7. Full management capabilities

**3lech 7 levels?** Parce que mch kol action nafs el gravity. Reading w commenting = low risk, anyone ye9der. Creating tasks = medium. Managing backlog = higher. El 7 levels ya3tiw **granularity** bla ma ykoun trop complex.

> Figure 3.18 — Create-task sequence: validate capability → project-type field rules → referential integrity (sprint/epic/milestone lazem mta3 hedha el project) → generate TASK-<n> key → insert + attachments → optional due-date reminders → assignment notification → enqueue AI index

> Figure 3.19 — Move-task Kanban sequence: load task → canAdvanceTaskWorkflow → 3 gates → update status → notify assignee

> Figure 3.20 — Task status transitions: FREESTYLE (3-column loop simple) w AGILE (6-column pipeline, forward + one-step-back. Custom status = permitted from anywhere)

> Figure 3.21 — Tasks & Kanban class diagram (el akbar f el rapport)

---

## Chnou implementina?

**API surface kbira barcha**:
- **19 agile endpoints**: epics, sprints, milestones controllers + burndown, velocity, Gantt analytics routes
- **35 task endpoints**: task CRUD, dynamic status board, Kanban move, backlog reorder, move-to-sprint, dependencies, time entries, comments, labels

**= 54 endpoints f sprint wa7ed** — akther men Sprint 1 w Sprint 2 combined.

**Frontend**: kol chay yod5ol f **project-detail page** (mch routes mfar9in):
- Tabs: Tasks, Kanban, Backlog, Sprints, Milestones
- Click 3la card → detail sheet (comments, attachments, dependencies, labels, subtasks, time entries)
- Analytics tab: burndown chart, velocity chart, Gantt chart

> Screenshots: P16 (Backlog), P17 (Kanban board), P18 (Task detail sheet), P19 (Sprint board), P20 (Burndown), P21 (Velocity), P22 (Gantt)

---

## Kifech t2akkadna li kol chay yekhdhem?

F hedha el sprint, d5alna approach jdid: **property-based testing**.

### Chnou property-based testing w 3lech?

El testing classique (unit testing) = ta3ti inputs specifiques w t-attendi outputs specifiques. Exemple: "given 5 tasks, board shows 5 tasks."

**Property-based testing** = ma ta3tich inputs specifiques. El testing framework **y-géneri HUNDREDS mta3 inputs random** w yassert li **invariant certain ALWAYS holds** regardless mta3 el inputs.

**Exemple concret**: el Kanban **no-task-loss** invariant. Ba3d ANY transformation mta3 el data (grouping by column, filtering, sorting), el nombre total mta3 tasks lazem **yeb9a nafsou**. Task ma tetna77ach mel board just parce que data mte3ha unusual (null fields, esmet b unicode, list ferrgha...). Property-based testing yjareb hundreds of random task configurations w y-assert li hedha el invariant holds kol marra.

**Résultat**: 9bed **edge cases li hand-written tests MECH bech yel9awhom** — empty task lists, null fields, unicode names, edge values... 

**11 property-based test suites** (`fast-check` + `vitest`):
- Kanban no-task-loss w swimlane membership
- Backlog casting
- Bulk-status transforms
- Time-entry w dependency normalization
- Comment casting
- Analytics transforms
- Epic, milestone, label casting
- Task-status validation

**Acceptance scenarios**: 12 stories, 12 scenarios, kolhom verified.

---

## Retrospective — Chnou nt3almna?

### Chnou ken s3ib?

Hedha ken el **sprint el akther demanding** — f complexity domain w f volume mta3 code.

**El data-driven Kanban** = el challenge el kbar. Board columns, transitions, w WIP limits kolhom stored **as data f el DB, mch as code**. Hedha ya3ni el invariants (transition legality, WIP limits, dependency blocking) lazem yet-enforcéw **application-level** — el DB schema wa7dha ma tenforci-homch. Ki famma bug f el application logic → inconsistent state possible. El design khedh effort kbir bech ykoun robust.

**El 7-tiered capability model** — lazem tel9a el balance: mech trop permissive (security risk) w mech trop restrictive (blocks legitimate moves). Surtout el `canAdvanceTaskWorkflow` — lazem assignee ye9der y-mouvii card mte3ou ama ma ymouvich card mta3 3bed o5rin.

**El sprint lifecycle state machine** m3a notification side effects w reminder cancellation 3la certain transitions = cross-subsystem coordination li yzid complexity.

### Chnou fad el projet?

**Property-based testing** = exceptionally valuable. El akther mta3 edge cases li 9bidhom ma kountech bech nel9ahom b hand-written tests.

**Fire-and-forget notification pattern** = el notification call async, unawaited. El critical write path ma yestannach. Ki notification fail → el task operation still succeeds, el failure logged. Trade-off: notification reliability vs write path latency. Lel internal tool, acceptable.

**AI embedding outbox** = easy to connect, w ensures el entire corpus searchable by time el copilot arrives f Sprint 6. Forward-thinking design li 3andou payoff kbir.

> Figure 3.22 — Cumulative class diagram ba3d Sprint 3: 18 new entities (Agile Planning + Tasks & Kanban). Anchors: User mel Sprint 1, Project mel Sprint 2.

---

---

# Chnou lazem tetfaker mel Sprints 1–3

## Sprint 1 — El Assas
- **Two-tier authorization** (guard coarse + service fine) = platform-wide pattern
- **RBAC declarative**: ~120 permissions, ~31 roles, constant wa7da, guard wa7ed, 139 routes, 18 controllers
- **JWT stateless + refresh token f DB** = el balance bin performance w revocability
- **Soft delete** = 7afdh el data, 7afdh el FKs, reversible
- **Anti-privilege-escalation** = admin can't grant roles li ma 3andouch el 7a9 y-manage-hom
- **Awwel sprint = learning curve** (NestJS + Prisma), RBAC redesigned barcha marat

## Sprint 2 — El Container
- **Project = aggregate root** (kol chay FK back to project)
- **AGILE vs FREESTYLE** = chosen at creation, determines available features
- **Single-manager invariant** = enforced f 3 points (create, demote, remove)
- **Query-scoped authorization** = access check f el Prisma WHERE clause (atomique, no gap)
- **i18n content-table pattern** = reusable (projects → sprints → tasks)
- **854-line test suite** = awwel dedicated test suite, 3la el aggregate root

## Sprint 3 — El Core
- **State machine** = Pending → Running (one max) → Stopped/Completed → (restart)
- **Data-driven board** = columns f DB, custom sans schema change
- **3 gates 3la column move** = transition legal → not blocked → WIP ok
- **Circular dependency guard** = recursive DFS, detects self-ref + bidirectional + transitive
- **7-tiered capabilities** = granular authorization per action type
- **AI outbox mel Sprint 3** = corpus deja ready lel copilot mta3 Sprint 6
- **Property-based testing** = hundreds random inputs, stronger guarantees
- **2,735-line service** = most complex module, 54 endpoints

---

---

# Questions li ynajem el jury ysalek — Sprints 1–3

## Sprint 1

### Q1: "JWT mch secure — ki 7ad ysarr9ou ma tnajem t-revokiih 7atta y-expiri. Kifech 7allit hedha?"
**Jaweb**: S7i7, JWT stateless → ma tnajem t-revokiih 9bal el expiry mte3ou. Ama 7allineha bel **dual-token approach**: access token **3omrou 9sir** (minutes) → 7atta ki yet-sarr9ou, valid l mudda 9sira. El revocation effective tji mel **refresh token** li f el DB — ki t-deletiih (logout, account deactivation), el user ma ye9derch y-jédded el session mte3ou. Ki el access token y-expiri → 5alas, dehort. Hedha el balance bin stateless performance w revocability.

### Q2: "Bcrypt — mch slow? W 3lech mch argon2 li akther modern?"
**Jaweb**: Bcrypt slow **deliberately** — hedha el point. Password hashing lazem ykoun slow bech brute force attack yekhidh wa9t astronomique. SHA-256 fast = brute-forceable. Argon2 technically akther modern (memory-hard, resistant l GPU attacks) ama bcrypt = **industry standard** m3a decades mta3 production use, widely supported f kol el frameworks (NestJS/Node.js ecosystem), w proven secure. Lel scale mte3na, bcrypt kefya. Ki n7abou n-upgradiw l argon2 f el futur → change el hashing function barka, el architecture ma tetbaddlech.

### Q3: "120 permissions across 31 roles — ma jarebtoumch kol el combinations?"
**Jaweb**: El RBAC validated b **2 approaches complementaires**: (1) E2E test suite li y-rouli el full permission matrix lel key roles (CEO, PM, PO, SM, Engineer) — ya3ni for each role, ychecky kol route: 200 wella 403. (2) El architectural mitigation: **guard wa7ed, constant wa7da**. Ma3andekch permission checks scattered f el code. Ki t-auditi el security, tchouf blasa WA7DA. W el guard applied uniformly → ma tnajem tzid endpoint jdid w tensa el authorization (el decorator required).

### Q4: "PendingApproval — 3lech ma 3maltech invitation-based registration barka?"
**Jaweb**: Trade-off design. Invitation-only = akther secure ama: (1) admin lazem y3arref esmet kol wa7ed 9bal ma y-registri (overhead), (2) ma ynajem 7ad y-discovers la plateforme w y-register wa7dou. PendingApproval = **open registration m3a admin gate** — user y-register wa7dou (bla admin effort) ama ma yod5olch la7atta admin y-review-ih. Best of both worlds lel context mta3 TDG (small company, known people, ama flexibility mhimma).

### Q5: "El guard 3la kol request — mch bottleneck?"
**Jaweb**: La. El guard ya3mel **in-memory comparison** barka. El permissions deja f el JWT payload (flattened ki el login sar). Guard y9ra el decoded JWT (deja extracted by middleware 9blou) w ychecky: est-ce que ay permission match? Pure CPU operation — **microseconds**. Ma yrou7ch lel DB, ma ya3melch network call. 7atta b 139 routes w thousands mta3 requests, el overhead negligible.

### Q6: "Ki t-revoki refresh token — el access token mazél valid 7atta y-expiri. Mch security hole?"
**Jaweb**: Theoretically oui — famma window sghira. Ama practically mitigated: access token TTL = **minutes** (mch hours wella days). Ya3ni el window sghira barcha. Plus, lel internal tool m3a ~7 users, el threat model mch el nafs kima public-facing app b millions mta3 users. Ki n-deployiw lel production, n-shortiniw el TTL akther. W ki n7abou zero-window revocation → lazem token blacklist (Redis-based) ama hedha yzid complexity li currently ma t7ajch.

## Sprint 2

### Q7: "Business unit immutable after creation — w ki manager ghlat w 7at el project f el wrong BU?"
**Jaweb**: Deliberate constraint. Baddel el BU = baddel access scoping (achkoun mel executives ychouf el project) w potentially baddel el available features. Mid-flight change → confusion lel users li deja yesta3mliw el project. El solution: ki manager ghlat → **archive el project w créi wa7ed jdid** f el correct BU. Data ma tetkhsar (archived, mch deleted). W bech nkhounou honest: f el report, logged ka **remaining work** — f el futur ye9der yet-implementi b safeguards (admin-only, avec notification lel members).

### Q8: "El smart endpoint li y-branchi 3la userId vs email — mch better to have 2 endpoints separés?"
**Jaweb**: Design choice. 2 endpoints separés = explicit ama: (1) el client lazem y3arref aya endpoint ysayelou based 3la chnou 3andou (userId wella email), (2) duplication mta3 authorization checks w shared logic. Smart endpoint = **client yeb3eth chnou 3andou** w el server y9arrer. Single endpoint = single authorization check, single documentation entry. El branching logic f el service clear w tested. Lel developer li y-consumi el API, ashel — endpoint wa7ed, y-handle el 2 cases.

### Q9: "854-line test suite — ama mocking el repos. Mch hedha ya3ni el tests ma y-catchiwch real DB bugs?"
**Jaweb**: S7i7, unit tests b mocked repos ma y-catchiwch DB-specific bugs (constraint violations, query performance, migration issues). Ama hedha el role mta3 el **E2E tests** (kima el RBAC suite f Sprint 1 li yesta3mel real DB over supertest). El zouz **complementaires**: unit tests y-catchiw business logic bugs b sor3a (fast, isolated, precise error location). E2E tests y-catchiw integration bugs (slower, broader). El 854-line suite = business logic coverage. El RBAC E2E suite = integration coverage. Lazem el zouz.

### Q10: "Project invitation — ki l'email yet-intercepti, el attacker ye9der ysarr9 el token w yod5ol?"
**Jaweb**: Hedha email security concern 3adi — valid lel kol système li yesta3mel email invitations (7atta Slack, Google Workspace, etc.). Mitigations mte3na: (1) **email match** — el accepting user lazem email mte3ou = el invited email (attacker lazem y-comprometti el email nfisou, mch just y-intercepti el token), (2) **single-use** — ki yet-accepta marra → token mort, (3) **7-day expiry** — window limited, (4) **token = randomUUID** — unguessable. El ultimate protection: ki el email compromised → kol chay compromised regardless. Ama hedhi mch vulnerability specifica lel système mte3na.

## Sprint 3

### Q11: "State machine f el code — 3lech ma sta3meltech library (XState, etc.)?"
**Jaweb**: El sprint state machine 3andha **5 états w ~5 transitions** — simple enough bech t-implementiha manually. XState (wella state machine library o5ra) ya3ti: visualization, formal verification, complex side effects. Ama lel 5 états, overhead mta3 library > el value. El implementation manuelle = switch/if f el service, clear w testable. Ki el state machine tekber (10+ états, parallel states, nested machines) → library justified. Currently = YAGNI (You Ain't Gonna Need It).

### Q12: "Data-driven board — kifech t-guarantee consistency ki Task.status = free string?"
**Jaweb**: **5 layers mta3 mitigation**: (1) status changes ALWAYS go through service logic (never direct DB update) → service validates against `ProjectTaskStatus` rows, (2) statuses seeded from known defaults, (3) move endpoint validates el 3 gates, (4) frontend gets status list from API → dropdown, mch free text input — user literally ma ye9derch y-type arbitrary string, (5) create-task endpoint validates status against existing project statuses. El free string f el DB = flexibility lel system. El enforcement = application layer. F practice, invalid status **impossible** through normal usage paths.

### Q13: "WIP limits — ama chnou yesra ki task deja f column w el WIP limit yet-reduced ba3dha?"
**Jaweb**: El WIP limit validated GHIR 3la **incoming moves** (ki task t7awel tji lel column). Tasks li deja f el column ma yet-ejectéwch ki el limit yet-reduced. Ya3ni column b 5 tasks w WIP limit 3 = **state valid ama temporarily over-limit**. El next move INTO hedhi el column yet-blocked 7atta el count yenzel ta7t el limit. Hedha standard WIP behavior (kima Jira, kima kanban 7a9i9i) — WIP limit = signal, mch hard ejection.

### Q14: "El circular dependency check — w ki famma 1000 tasks b complex dependency graph?"
**Jaweb**: El DFS traversal = O(V+E). Ama f la pratique: (1) dependency graph **sparse** — task 3andha 2-3 dependencies max, mch 100, (2) cycle checks **local** — traverse mel new dependency target only, mch el graph lkol, (3) el check yesra GHIR ki **tzid** dependency (mch 3la kol request) → infrequent operation. 7atta b 1000 tasks, el actual traversal depth = kol chain mta3 5-10 tasks max. **Effectively instant**. Ki truly massive graphs → ye9der yet-optimisi b caching el topological order, ama hedha premature optimization lel scale mte3na.

### Q15: "Fire-and-forget notifications — w ki barcha notifications failed? El user ma ya3ref 7atta chay?"
**Jaweb**: Trade-off explicit. El alternative: **awaited notifications** = ki notification service fail (email down, Telegram unreachable), el task operation nfisha fail. El user y7awel y-mouvii task → error "notification failed" — terrible UX lel unrelated failure. Fire-and-forget = el critical path (task save) **always succeeds**. Notification failure logged → ye9der yet-monitored. W el user ye9der yra el changes f la plateforme directement 7atta bla notification. Lel production system b strict SLAs → outbox pattern (kima el AI indexing outbox) better. Ama lel internal tool, fire-and-forget = pragmatic w correct.

### Q16: "2,735-line service file — hedhi code smell. 3lech ma 9assamtouch?"
**Jaweb**: Valid concern. El module complex parce que el task entity nfisha complex — connections m3a comments, dependencies, time entries, labels, status transitions, capability checks... **Where would you split?**
- `TaskCommentService`? Ye9der, ama comments need task context (assignee notification, capability check) → cross-service coupling
- `TaskDependencyService`? Dependency checks ya3mlouhom f el move validation → tight coupling m3a el column-move logic
- `TaskAnalyticsService`? Already partially separate (burndown/velocity f agile service)

El identified improvement: extract **`ProjectAccessService`** lel duplicated access-check helpers. Ama full split → complexity mta3 cross-service transactions w dependencies. Lel PFE scope m3a developer wa7ed → **shipping functional code > perfect code organization**. W el 4-layer convention y5alli el file internally organized 7atta ki kbira.

### Q17: "Property-based testing — ama mch slow? Hundreds mta3 random inputs per run?"
**Jaweb**: `fast-check` library = optimized lel performance. "Hundreds of inputs" = milliseconds, mch seconds. El inputs generated f memory (no I/O, no DB). W `fast-check` 3andou **shrinking** — ki yla9a failure, y-minimize el input lel smallest reproducing case. Plus, el tests deterministic (seeded random) → reproducible f CI. El overhead compared to hand-written tests = negligible. El value = catching edge cases li ma kountech t5amem fihom. W el 11 suites y-rouliw f seconds f CI.

### Q18: "El AI outbox — 3lech mch real-time indexing (index directly on write)?"
**Jaweb**: Real-time indexing ya3ni: ki tsavi task → t-call Gemini API bech t-géneri embedding → t-save el embedding → THEN traja3 el response lel client. Problems: (1) Gemini API call = **hundreds of milliseconds** → el user yestanna. (2) Ki Gemini down wella rate-limited → task save **fails** parce que indexing failed → terrible UX. (3) Ki barcha writes f nafs el wa9t → barcha concurrent API calls → rate limit.

Outbox pattern = **eventual consistency**: task saved immediately (milliseconds), embedding generated async (seconds later). El user ma yesta3refch el lag. W ki Gemini down → tasks still saveable, embeddings catch up ki Gemini yraje3. **Decoupling** = resilience.

### Q19: "El burndown ideal line — linear straight? Real projects mch linear!"
**Jaweb**: S7i7, el ideal line = **simplification**. Ama hedhi standard practice f Scrum tools (Jira nfisha ta3mel linear ideal line). El value mch f el ideal line nfisha — el value f el **comparison** bin el ideal w el actual. Ki el actual line fog el ideal → famma blocage wella scope creep. El ideal line = **baseline visual reference**, mch prediction. Ki t7ab more sophisticated prediction → ye9der yet-implementi velocity-weighted projection (ama hedha beyond el PFE scope).

### Q20: "El task key (TASK-<n>) — mch better kima Jira m3a project prefix (PROJ-123)?"
**Jaweb**: Actually, el key IS project-scoped — el `<n>` counter specific per project. Ama el prefix "TASK" universal (mch project-specific prefix). 3lech? Parce que: (1) project prefix lazem ykoun unique w short (ma3andnech UI bech el manager y-choisi prefix), (2) "TASK-42" clear w unambiguous f kol context, (3) complexity mta3 managing unique project prefixes (conflicts, renames) ma t7ajch lel scale mte3na. Ki TDG tekber → ye9der yet-implementi project-specific prefix. Currently = simple w functional.

### Q21: "AGILE → 6 columns, FREESTYLE → 3. Ama el user ye9der ybaddel el columns. Fih mch contradiction?"
**Jaweb**: La, complementaire. El 6 w 3 = **defaults seeded on first read**. Ba3d el seeding, el manager ye9der: (1) yzid custom columns, (2) ybaddel el transitions. El difference: AGILE project y-**starta** b 6 columns (pipeline complète), FREESTYLE y-starta b 3 (simple). Ba3dha kol wa7ed ye9der y-customizi. El customization mch f contradiction mel defaults — hiya extension fog-hom. W el service still enforci: FREESTYLE tasks ma ye9drouch y-referencéw sprints wella epics, regardless mta3 el board layout.

### Q22: "Kol write y-enqueue AI outbox — w ki el outbox table tekber barcha? Performance impact?"
**Jaweb**: El outbox table = **transient work queue**. Ba3d ma el background job y-processi el row (y-géneri el embedding w ystockih), el row ye9der yet-deletéh wella yet-marki processed. El table size = **pending items only**, mch historical. Ki el background job y-rouli regulièrement → el table sghira dima. W el INSERT f el outbox = simple INSERT f nafs el DB (nafs el transaction m3a el task save) → **microseconds** mta3 overhead. Negligible.

### Q23: "7 capability helpers — mch trop mta3 complexity? Mch 3 levels yekfiw (read, write, admin)?"
**Jaweb**: 3 levels (read, write, admin) = trop coarse. Exemples:
- Developer ye9der y-mouvii el card **mte3ou** (canAdvanceTaskWorkflow) ama ma ye9derch y-mouvii card mta3 wa7ed ekher → "write" permission trop broad
- PM ye9der y-managéi dependencies w labels (canManageTaskStructure) ama ma ye9derch y-starta/y-stoppi sprint (hedhi SM only) → "admin" trop broad
- 7 levels = el minimum lel granularity li el domain y7tajha. Less = security gaps (users get more access than they should) wella UX friction (users get less access than they need). El 7 levels specifically designed lel Scrum roles: PM, PO, SM, Developer chacun b capabilities précises.
