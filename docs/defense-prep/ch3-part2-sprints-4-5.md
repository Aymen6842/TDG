# Chapter 3 (Part 2): Development Sprints — Sprints 4–5

---

---

# SPRINT 4: Productivity Suite

## Chnou n7abou na3mliw?

El 3 sprints el owlin bniw el backbone mta3 la plateforme: identity (Sprint 1), projects (Sprint 2), w el agile/task engine (Sprint 3). Hedhou kolhom **project-scoped** — ya3ni yet3alou b projets, teams, tasks mta3 el khedma.

Sprint 4 ybaddel el direction. Hna nebniw el **7ajat el personnelles li kol employé yesta3melhom kol youm**:
- **To-do list privée** — checklist mte3ek wa7dek, mfar9a mel project tasks
- **Attendance** — check-in / check-out kol youm, tracking heures travaillées
- **Calendar** — calendrier partagé lel réunions w événements
- **Reminders** — système mta3 rappels li yconnecti kol chay ba3dhou

**3lech el 4 modules f sprint wa7ed?** Parce que kolhom y partajiw 7aja wa7da: **cron-driven, multi-channel notification backbone**. Ya3ni kol wa7ed men el 4 modules y-rouli scheduled job li yfann out notifications 3la 4 delivery channels (in-app push, email, Telegram, ntfy) 7asseb settings mta3 el user. W kol el per-minute cron jobs guarded b **single PostgreSQL-backed distributed lock**.

**El difference kbira bin Sprint 4 w el sprints 9blou**: el sprints 9blou kenouw **project-scoped w role-tiered** (achkoun 3andou aya role f aya project). Sprint 4 primarily **personal** — el to-do, calendar, w attendance data hiya **`.own`-scoped** w enforced f el data layer. Ya3ni kol user ychouf ghir data mte3ou.

**44 story points 3la 4 weeks** — sprint **broad** (4 modules) ama mch deep (kol module sghir wa7dou, unified bel notification backbone).

---

## El Backlog — 44 SP, 4 weeks

9 user stories. El akther heavy:
- **US-S4-03** (8 SP, Must): check-in/check-out — el core mta3 attendance
- **US-S4-06** (8 SP): calendar events w meetings m3a participants

---

## Module A — Personal To-Dos

### Chnou bnineha w 3lech?

Bnina **checklist privée** li kol user ygéri fiha el 7ajat mte3ou wa7dou — **deliberately mfar9a mel project tasks mta3 Sprint 3**. 

**3lech mfar9a w mch integrated m3a el project tasks?** Parce que personal tasks w project tasks **natures mkhtalfin**:
- Project task = visible lel team, assigned l member, m3a story points w sprint w dependencies
- Personal to-do = **privée**, ghir enta tchoufha, m3a priorities w sub-tasks w rappels

Ki tedmejhom → complexity: achkoun ychoufha? tcontist f el burndown? tassignaha l sprint? Separation = clean, independent evolution. Personal to-dos **tables mte3hom wa7dhom**, **status w priority enums mte3hom** (`Pending`/`InProgress`/`Completed`, `Low`/`Medium`/`High`) — mch el nafs enums mta3 project tasks.

### Chnou fiha el to-do?

- Sub-tasks via **self-relation** (`parentTaskId`) — ya3ni to-do ta7t to-do. Ki t-supprimi el parent → **cascade-delete** el children (atomiquement, ma tkhallich orphans)
- Favourites, archive flag
- Due date, optional reminder date
- Manual drag-ordering (`displayOrder`)
- Attachments w comments
- **i18n content**: `UserTaskContent` keyed by language — nafs el pattern li 3malna f projects w sprints

### Kifech el isolation tekhdhem?

**Kol read w write scoped b `userId` f el repository layer**. Mch el guard li yenforci hedha — el **data query nfisha**.

Concretement: ki t-requesti to-do b ID, el repository ya3mel `findUniqueOrThrow({ id, userId })`. Ki el userId ma ymatchich → **404**. Ya3ni 7atta ki ta3ref el ID mta3 to-do mta3 wa7ed ekher, ma tnajem t-fetchiha — el query nfisha trfoudhek. Hedha **strict read isolation**.

### El Reminder Cron — kifech el rappels yekhidhmou?

Hedha awwel cron job bnineha, w houa el pattern li kol el Sprint 4 yesta3mlou:

**Kol minute**, el cron:
1. **Y-acquiri distributed lock** (Postgres-based, 55-second TTL) — bech instance wa7da barka trouli-h 7atta ki 3andna multiple API replicas
2. **Y-fetchi to-dos li `reminderDate` fatthat w mazéliw mch notified**
3. **Y-fann out** lel owner 3al enabled channels mte3ou (email, push, Telegram, ntfy — 7asseb settings mta3 el user)
4. **Y-marki `notified = true`** — bech el reminder **yet-firi exactly once**

**3lech distributed lock?** T5ayel 3andek 3 API instances (horizontally scaled). Bla lock, kol instance trouli el cron → **3 notifications identical lel nafs user**. El lock y-guarantii li instance **wa7da barka** t-processi el cron.

**3lech Postgres-based lock w mch Redis?** Redis mch wired yet (included f docker-compose ama mch connected). W `SELECT ... FOR UPDATE SKIP LOCKED` f Postgres ya3mel el khedma: row lock m3a TTL mta3 55 seconds. Ki process y-crashi → el lock yet-relachi ba3d 55 secondes automatiquement (no deadlock). W hedha yesta3mel el DB li deja 3andna — mafamech dependency jdida.

**Hedha el "lock-then-scan" pattern** — w kol el 4 modules mta3 Sprint 4 yesta3mliwh:
1. Acquire lock
2. Query pending items
3. Fan out to channels
4. Mark processed

> Figure 3.24 — Personal-task reminder cron sequence
> Figure 3.25 — Personal To-Dos class diagram: UserTask (root), UserTaskContent (i18n), comments, attachments

---

## Module B — Time & Attendance

### Chnou bnineha w 3lech?

Bnina système mta3 **attendance** — daily check-in / check-out li y-tracki el présence w les heures travaillées. Hedha kanet **7aja ma existatch 5alas** 9bal la plateforme — el attendance kenet manual w error-prone (kima 9olna f Chapter 1).

### Kifech tekhdhem?

**El user experience**:

Ki user yod5ol f **any dashboard page**, écran fullscreen **ybloqui l'app** — ma ye9derch ya3mel chay 7atta y-checki in. Y5éhir: **Remote** wella **Onsite**. Wella ye9der ykhtar "join as viewer" (yod5ol ychouf bla ma y-pointi).

**3lech fullscreen gate?** Parce que attendance lazem tkoun **enforced**, mch optional. Ki el check-in juste bouton zghir f el corner → nas yenssiw wella yetsahmliw. Fullscreen gate = **la pyes moyen tensa**. El gate blocking = discipline.

**El flow technique**:
1. Check-in → y-open `WorkSession` m3a location (Remote/Onsite) w device (Desktop/Mobile/Tablet)
2. L5edma...
3. Check-out → y-fermi el `WorkSession`, y-compute worked minutes
4. Optionally: mood w journey note (el user ye9der ya3ti feedback 3la youmou)

**2 levels mta3 data**:
- **WorkSession** = session wa7da (check-in → check-out). Ye9der ykoun 3andek multiple sessions f youm wa7ed (matin, ba3d el ghda...)
- **WorkDay** = youm kamla. Yjam3a kol les sessions. Plus day-level attributes: mood, manager's performance rating, notes.

### Business Rules — el détails li lazem ta3rfhom

**Session wa7da open f el youm max**: ki t7awel t-checki in w deja 3andek session maftouh7a → **rejected**. Lazem t-checki out awwel.

**Late-start detection**: el système y-detecti el retards f **2 thresholds**:
- **Matin**: 08:45 UTC — ki ma t-checkitch in 9bal hedha → notification "late start"
- **Ba3d el ghda**: 12:30 UTC — nafs el 7aja

M3a **single-notification-per-half-day guard** — bech ma tji-kch notification 3la kol minute mta3 retard, marra wa7da per half-day barka.

**Auto-close cron (03:00 UTC)**: kol lila, cron y-fermi kol les sessions li mazéliw maftouh7in. Ama **mch b 03:00 ka endTime** — y-cappi kol session b **shift end** (16:15 UTC lel weekdays, 12:30 UTC lel samedi). 3lech? Bech worker ma yet-pénalisich 3la heures ba3d el khedma — ki tensa t-checki out, ma y7osboulkch 7atta 3 mta3 essb7. Y7osboulek 7atta l fin el shift barka.

**Workers ma ye9drouch y-modifiyéw endTime wella timeSpentInMinutes** 3la sessions mte3hom — el service y-strippi hedhou el fields 9bal el persist. 3lech? Bech ma 7adch yghallit f les heures mte3ou manually. Ghir el système y-compute-hom.

**Manager statistics**: el manager ye9der ychouf attendance mta3 el team mte3ou — ama el endpoint ychecky `canUserManageUsers` 9bal. Manager ychouf **ghir el users li houa actually manages** (business-unit-scoped).

### Seam m3a Sprint 3

Detail mhim: `WorkSession` **owns** el `TaskTimeEntry` rows mta3 Sprint 3. Ya3ni ki user ylogui time 3la task, el time entry linked to el work session li maftouh7a. Hedha y-ancri **task time f attendance session** — tnajem tchouf: f hedhi el session, 9addech khedhma 3la task X, 9addech 3la task Y.

> Figure 3.26 — Check-in sequence: resolve current business day (create one if none) → verify no open session → open WorkSession (location + device) → return updated work day
> Figure 3.27 — Class diagram: WorkDay → WorkSession (two-level split). WorkSession owns TaskTimeEntry from Sprint 3.

---

## Module C — Events & Calendar

### Chnou bnineha w 3lech?

Bnina **calendrier partagé mta3 el company**. 9bal, mafamech calendrier centralisé — les réunions kénow informelles (messages directs, "taw nji n7ki m3ak"...).

### 3 types mta3 events

| Type | Chnou ya3mel | Achkoun ychoufha |
|------|-------------|-----------------|
| **Meeting** | Réunion, m3a participants nommés wella `toAllUsers` | Creator + participants + (all users ki `toAllUsers`) |
| **Event** | Événement organisationnel | Nafs kima Meeting |
| **PersonalEvent** | Entrée privée, ghir enta | Creator wa7dou barka |

**Read visibility enforced f el query**: user ychouf **ghir** events li `toAllUsers = true`, wella houa créaha, wella houa participant. Query-scoped, nafs el approach mta3 Sprint 2.

### El Calendar Component

Custom month/week/day/agenda view built 3la **date-fns** (date manipulation) w **@dnd-kit** (drag-and-drop). Mch library calendar jahez — bnineha custom. 3lech? Parce que el calendar lazem y-show el 3 event types f views mkhtalfin (meetings page, events page, personal events page) w y-supporti drag-drop bech tbaddel dates.

### Escalating Notifications — el concept el mhim

Hedha concept jdid ma chefnehouch f el sprints 9blou. Ki event jey, el système ma ynotifik-ch **marra wa7da** — y-notifik **progressivement, 4 marat**:

| Threshold | Temps avant l'event |
|-----------|:---:|
| 1st notification | 24 heures 9bal |
| 2nd notification | 2.5 heures 9bal |
| 3rd notification | 30 minutes 9bal |
| 4th notification (dernière) | 15 minutes 9bal |

**Kifech technically?** El event 3andha field `nextNotificationTime`. El per-minute cron ychecky: events li `nextNotificationTime` fathet. Ki yla9a wa7da → y-fann out lel audience → y-computi el threshold el jey → y-updati `nextNotificationTime`. Ki remaining time < 25 min → `isNotified = true` → ma yji-kch notification ba3d.

**3lech escalating w mch reminder wa7ed barka?** Parce que reminder 24h 9bal — tensa. Reminder wa7ed 15 min 9bal — trop tard lel preparation. El escalation ta3ti **progressive awareness**: ta3ref belli 3andek réunion ghod (24h), teb9a conscious (2.5h), tab9a t7adher (30min), toul yjik el wa9t (15min). Hedha UX pattern standard f les calendar apps professionnelles.

**Performance optimization**: `nextNotificationTime` w `isNotified` denormalized 3la el event row directement (mch computed f real-time). Hedha y5alli el cron ya3mel **single indexed scan** bech yla9a events due to notify — au lieu de recomputing per event kol minute.

> Figure 3.28 — Event reminder cron m3a escalating thresholds
> Figure 3.29 — Class diagram: Event, EventContent (i18n), EventParticipant (composite PK `@@id([eventId, userId])` = no duplicate invitations)

---

## Module D — Reminders

### Chnou bnineha w 3lech?

El Reminders module houa **el connecteur** li yrabt el sprint lkol. Table mta3 **time-triggered, multi-channel reminders** li modules o5rin aussi ye9drou yektbou fiha.

### 2 types mta3 workflows:

**1. Manual reminders**: manager y-schedule reminder l user spécifique, linked to target: task, sprint, milestone, project, wella **CUSTOM** (free-form). Y5éhir el channels w el future time.

**2. Automatic reminders**: yet-créiw automatically mel Tasks, Sprints, w Milestones services:
- 1 jour 9bal task due date
- 1 jour 9bal sprint start, 2 jours 9bal sprint end
- 7 jours + 3 jours 9bal milestone due date
- Plus crons li y-scannéw: **overdue tasks** (due date fatthat) w **stuck tasks** (mafamech update l 5 jours)

### El delivery engine

Per-minute scheduler = el même "lock-then-scan" pattern:
1. Acquire distributed lock
2. Query `PENDING` reminders li `reminderAt` fathet
3. Fan out lel user's enabled channels
4. Mark `SENT`

### Business rules mhimmin

**Reminder status machine**: `PENDING → SENT → DISMISSED` (normal flow), wella `PENDING → CANCELLED` (manual cancellation). Dismiss reminder li deja dismissed wella cancelled → rejected.

**Polymorphic target**: `entityType` (TASK, SPRINT, MILESTONE, PROJECT, CUSTOM) + `entityId` — nafs el approach mta3 AI embeddings (Chapter 4). Reminder wa7da linked l ay entity type bla typed FK per entity.

**3lech polymorphic w mch 5 FKs (taskId, sprintId, milestoneId...)?**
- 5 FKs = 4 manhom always NULL (waste + confusing schema)
- Polymorphic = **extensible** — ki tzid entity type jdid, ma t7tajch schema change
- El trade-off: mafamech DB-level referential integrity. Ama el reminders = derived data (regenerable, not critical transactional) w el write-path lazem validates.

**Dual-user FK**: `userId` (achkoun yet-rappelé) mfar9a mel `createdById` (achkoun 3amlet el reminder). Important parce que manager ye9der y-schedule reminder l member ekher.

**Overdue/stuck detection idempotent**: el cron ychecky ki deja famma `PENDING`/`SENT` reminder m3a nafs el entity w message 9bal ma ycréi wa7da jdida → **no duplicates**.

**`reminderAt` lazem f el futur**: ki tab3eth value <= now() → rejected.

**Default reminders seeded automatically**: ki t-créi sprint → reminder 1 jour 9bal start + 2 jours 9bal end. Ki t-créi milestone → 7 jours + 3 jours 9bal due date. User ma ya3melch chay — les rappels deja f blashom.

> Figure 3.30 — Pending-reminder delivery sequence
> Figure 3.31 — Reminders class diagram: dual-user FKs (userId vs createdById), polymorphic target (entityType + entityId)

---

## Chnou implementina concretement?

### Backend
- **Personal to-dos**: endpoints 3la `PersonalTasksController` — CRUD, sub-tasks, reorder, favourites, archive, comments, attachments (kolhom scoped b userId)
- **Attendance**: endpoints 3la `WorkDaysController` — check-in, check-out, current work day, own + manager work-day lists, worker + manager updates, 4 statistics endpoints (overview/details, lel user nfisou w lel manager)
- **Calendar**: endpoints 3la `EventsController` — event CRUD, participant management, 3 event-type list queries
- **Reminders**: endpoints 3la 2 controllers — `RemindersController` (project-scoped CRUD) w `UserRemindersController` (`/reminders/me` list + dismiss action)

### Frontend
- To-do list: page b 2 tabs (Personal / Project)
- Attendance: **fullscreen gate** li twrapp kol el dashboard + header check-out button
- Calendar: 3 pages y partajiw custom calendar component wa7ed
- Reminders: embedded f el project-detail view

> Screenshots: P23 (To-do list + task detail), P24 (Check-in gate), P25 (Calendar month view), P26 (Reminders list)

---

## Testing

**Property-based testing** (nafs el approach mta3 Sprint 3): 2 suites (`fast-check` + `vitest`) lel reminder Zod schema invariants w caster round-trip.

**Acceptance scenarios**: 9 stories, 9 scenarios, kolhom verified.

---

## Retrospective — Chnou nt3almna?

### Chnou ken s3ib?

**El distributed lock design** bla Redis. El lock lazem:
1. Y-guarantii li **instance wa7da barka** t-processi el cron
2. Y-survivi process crashes (TTL 55 sec → auto-release)
3. Ykoun **reusable** across kol el 4 modules

`SELECT ... FOR UPDATE SKIP LOCKED` m3a 55-second TTL 7allet kol hedha — ama el design khedh iterations.

**El escalating event notifications** (24h / 2.5h / 30min / 15min) = **careful time arithmetic**. Lazem t7asseb el remaining time, t9arin m3a el thresholds, t-advanci `nextNotificationTime` correctly. Bug f hedha = notifications duplicates wella notifications li ma yjiw 7atta.

**Attendance business-day boundaries** = akther time complexity: weekday shift-end 16:15 UTC vs Saturday 12:30 UTC, morning late threshold 08:45 UTC, afternoon late threshold 12:30 UTC. Barcha edge cases m3a time zones w half-days.

**El coordination mta3 4 modules** li kolhom yprodiciw notifications ama y partajiw delivery backbone wa7ed → lazem el pattern yet-establishi **9bal ma ay module yetdelivra**. 

### Chnou fad el projet?

El **lock-then-scan cron pattern** = **highly reusable**. Ki t-establishi f el to-do reminder cron, nafs el structure (acquire lock, query pending, fan out, mark processed) t-adopta f event, reminder, w attendance crons b modifications minimales.

**Per-user channel gating independently** (mch single "notify me" flag, ama 4 flags séparés: email oui/la, push oui/la, Telegram oui/la, ntfy oui/la) = fine-grained control bla complication f el sender logic. User y5éhir exactly kifech y7ab yetcontacté.

**Polymorphic reminder target** = value proved. Table wa7da w delivery path wa7ed y-serviw tasks, sprints, milestones, projects, w custom reminders — bla code extra per entity type.

> Figure 3.32 — Cumulative class diagram ba3d Sprint 4: 4 new aggregates (UserTask, WorkDay/WorkSession, Event, Reminder), kolhom attached to User. WorkSession owns TaskTimeEntry mel Sprint 3. Reminder linked to Project/Task/Milestone mel Sprints 2-3.

---

---

# SPRINT 5: Communication & Operations

## Chnou n7abou na3mliw?

Sprint 4 prouva el multi-channel delivery pattern — 4 modules kol wa7ed yeb3eth notifications 3la 4 channels. Ama el pattern ken **implicit** — duplicated f kol module.

Sprint 5 ya3mel 2 7ajat:
1. **Y7awwel el delivery pattern l module explicit** — el notifications module li y-own el delivery layer lkol
2. **Yzid el consumer el akther demanding** — infrastructure monitoring, li houa la plateforme t-surveilli rououhha

**3lech el zouz f sprint wa7ed?** Parce que houma **2 faces mta3 concern wa7ed: reaching people**. El notifications module = el HOW (kifech nwossliw lel nes). El monitoring module = el most convincing WHY (3lech lazem nwossliw lel nes: server ta7 → lazem manager ya3ref TOUT DE SUITE).

Monitoring = **el proof end-to-end el akther clear** mta3 el notification backbone: alert y-travel mel cron li detecta dead ping → through el outbox → through el fan-out → 7atta message Telegram mta3 el manager. El WHOLE pipeline f action.

**35 story points 3la 3 weeks** — sprint focused: module wa7ed broad ama shallow (notifications — barcha channels, thin logic kol wa7ed), w module wa7ed operationally deep (monitoring — 6 crons, outbox, escalating expiry bands).

---

## El Backlog — 35 SP, 3 weeks

8 user stories. El akther heavy:
- **US-S5-06** (8 SP, Must): health-check servers (ICMP) w services (HTTP) kol minute — el core mta3 monitoring
- **US-S5-01** (5 SP, Must): in-app notification inbox (bell + list)
- **US-S5-02** (5 SP): FCM push notifications

---

## Module A — Notifications

### Chnou bnineha w 3lech?

Hedha el **delivery layer li kol el plateforme t depends 3lih**. 9blou, kol module ken y-handle notifications b nafsou (duplicated logic). Twah 3andna **module dédié**.

### Chnou y-owni hedha el module?

1. **In-app inbox**: notification rows persisted f DB. Bell icon f el header youri count mta3 unseen. List page lel inbox complète.

2. **FCM web push**: push notifications 3la devices mta3 el user (browser notifications). Per-device token registration — ki user youvri la plateforme, header hook y-requesti browser permission, y-obtieni FCM token, w y-registri el device automatically.

3. **Per-user channel configuration**: `UserNotificationSettings` — el single row li y-stocki el 4 flags:
   - Email → **opt-out** (default: on, user y-désactivi ki y7ab)
   - Push → **opt-out** (default: on)
   - Telegram → **opt-in** (default: off, lazem setup 9bal)
   - ntfy → **opt-in** (default: off, lazem setup 9bal)

   **3lech email w push opt-out ama Telegram w ntfy opt-in?** Parce que email w push yekhidhmou b defaults (kol wa7ed 3andou email, browser y-supporti push). Ama Telegram w ntfy **lazem extra per-user setup** (Telegram chatId, ntfy topic) — ma tnajemch t-activihom par défaut ki el user mazél ma 3amelhomch.

4. **Telegram integration**: per-user `chatId` over **single shared bot token**. Ya3ni bot Telegram wa7ed lel plateforme lkol, ama kol user y-linki el chat mte3ou. No per-user secret management.

5. **ntfy integration**: topic link per user.

### El 2 entry points

**1. Human-driven broadcast** (`POST /notifications`): user authorized yeb3eth notification b title w optional image l list mta3 users wella l everyone. Hedha lel announcements company-wide.

**2. System-driven** (per-user path): crons w services y-calléw `createNotificationFromSystem(userId, payload)` — method wa7da li 7 consumer modules yesta3mliwha (personal-tasks, reminders, work-days, events, servers, sprints, tasks).

### Kifech el fan-out yekhdhem?

Ki notification lazem tetba3eth l user:
1. El consumer y-loadi el target user's **settings w integrations**
2. Y-persisti **in-app row** (`UserNotification`) w y-pushi b **FCM** ki push enabled → hedha via `createNotificationFromSystem`
3. Y-dispatchi **email** via `MailService` ki email enabled
4. Y-dispatchi **Telegram** via `TelegramService` ki Telegram enabled w linked
5. Y-dispatchi **ntfy** via `NtfyService` ki ntfy enabled w linked

Kol channel **independently gated** 3la el preference flag mte3ou. User ye9der y-désactivi email w ykhalli Telegram barka — el système y-respecti.

### Business rules mhimmin

- Inbox read/mark-seen/delete = **ownership-scoped** f el query. User ma ye9derch y9ra wella y-supprimé notification mta3 wa7ed ekher.
- `UserNotification` 3andha `@@unique([notificationId, userId])` — ya3ni fan-out re-sends **idempotent per user** (ma tzidch duplicate row ki t-resendi).
- Notification envelope (`Notification`) mfar9a mel translatable content (`NotificationContent`) — nafs el i18n content-table pattern.
- FCM delivery = **best-effort**: ki device token expired wella mort → el send survives, ma ykassarch el write path. 3lech? Parce que device tokens yexpériw w ykounou invalides frequently — normal behavior, mch error.

> Figure 3.34 — Multi-channel delivery pipeline component view
> Figure 3.35 — Single system notification across all channels: consumer loads settings → in-app + FCM → email → Telegram → ntfy
> Figure 3.36 — Notifications class diagram: 7 tables. 3-way split (Notification envelope / NotificationContent / UserNotification per-recipient). 3 settings/integration tables linked one-to-one to User.

---

## Module B — Infrastructure Monitoring

### Chnou bnineha w 3lech?

Hedha **la plateforme t-surveilli infrastructure mta3 el company nfisha** — el servers w services li TDG t-rouli-hom. 9bal, mafamech monitoring — ki server ya7 → 7ad ma ya3ref 7atta client ycheki wella incident report yji.

### Chnou ysajjel?

**Servers** — VPS wella bare-metal host. 3andou:
- IP address (lel ICMP ping)
- Capacity fields (RAM, CPU, storage)
- Status: `Running` / `Stopped` / `Maintenance` (operator-set, mch automatic)
- `expiredAt` — ki el subscription mta3 el server approaching expiry
- **Managers** responsible — via `UserServerManagement` join table

**Services** — 7aja li tdour 3la server (el API, PostgreSQL, Redis, MinIO...). 3andha:
- Domain / URL (lel HTTP probe)
- SSL settings, backup settings
- Status (nafs kima server)
- `expiredAt`
- **Ma 3andha-ch managers mte3ha** — el managers inherited mel parent server. Ki teb3eth alert 3la service → trou7 lel managers mta3 el server li mte3ha.

### El 6 Cron Jobs — el core mta3 el module

Hedha el module li 3andou el akther mta3 cron jobs f kol la plateforme. **6 crons**, kolhom per-minute, kolhom ta7t el distributed lock:

**2 Detectors:**
1. **ICMP ping** — kol server li status `Running` → ping el IP. Ki ma yejawbech → outage detected
2. **HTTP probe** — kol service li status `Running` → HTTP request 3la el domain. Ki response mch 200 → outage detected

**2 Expiry watchers:**
3. **Server expiry** — ki server approaching `expiredAt` → escalating notifications (nafs el concept mta3 event reminders: advancing `nextNotificationAt` through fixed thresholds)
4. **Service expiry** — nafs el 7aja lel services

**2 Senders:**
5. **Server notification sender** — y-delivri les alerts
6. **Service notification sender** — y-delivri les alerts

### El Outbox Pattern — el concept el akther important

Hedha design pattern li y-decouple **detection mel delivery**. 

**Bla outbox (naive approach)**: detector yla9a server ta7 → **directly** yeb3eth notification lel managers. Problems:
- Ki channel lent (email server slow) → el detector **yet-blocki** → el per-minute probe loop yet-3attel
- Ki notification fails → el detection lost (ma tetsajjelch li server ta7)
- Ki multiple instances → same detection, same direct send → **duplicate alerts**

**M3a outbox**: detector yla9a server ta7 → **y-inserti row** f `ServerNotification` table b `isSent: false`. 5alas, el detector kmel. **Sender cron séparé** y-picki el unsent rows, y-fann out lel managers' channels, w y-marki `isSent: true`.

**El 3 benefits mta3 el outbox:**

1. **Detection never blocked**: detector ya3mel INSERT barka (microseconds) — channel speed ma t2aththarech fih
2. **Free deduplication**: el detector query y-**skippi** servers li deja 3andhom unsent alert. Ya3ni server ta7 w mazél alert mch delivered → ma yzidch alert jdid kol minute. Alert wa7da barka 7atta tetdelivra.
3. **Multi-instance safe**: distributed lock + outbox = instance wa7da t-detecti, instance wa7da t-delivri, no duplicates

### Authorization

- **CTO** = global write 3la kol el infrastructure
- **CEO** = global read (ychouf ama ma ygérich)
- **DevOps engineer** = scoped 3la servers li houa manager fihom (via `UserServerManagement`)
- Check done **f el service** (mch f el guard barka)

### Public health endpoint

`GET /health` — endpoint wa7id **bla authentication**. Y-returni `{ status: 'ok', timestamp }`. 3lech bla auth? Parce que external monitoring tools (Uptime Robot, Pingdom...) lazem ye9drou ycheckiw li el API 7ay bla ma yloguiw.

> Figure 3.37 — Server health-check cycle m3a outbox pattern: detector → INSERT outbox → sender → fan-out to channels
> Figure 3.38 — Alert fan-out: detector w expiry crons y-insertéw unsent rows → sender crons y-polléw → deliver → mark sent
> Figure 3.39 — Class diagram: Server, Service (mirror each other), 2 *Notification outbox tables, UserServerManagement join

---

## Chnou implementina?

### Backend
- **Notifications**: 6 guarded routes 3la `NotificationsController` — broadcast, paginated sent/received (inbox), mark-seen, delete, device-token registration. Kolhom ownership-scoped. Channel flags + Telegram/ntfy links updated via profile endpoints mta3 users module.
- **Infrastructure**: 10 guarded routes 3la `ServersController` — create/list/read/update/delete, kol wa7da lel servers w lel services. + public `GET /health` (bla auth).

### Frontend
- Notifications **integrated across el whole app shell** (mch page wa7da):
  - Bell dropdown f el header (unseen count, mark all seen on open)
  - Full inbox list page
  - Settings page (toggle channels, Telegram chatId input, ntfy setup steps)
  - Push registration **automatic** — header hook requests browser permission + FCM token + device registration, once per session
- Infrastructure: 2 list pages ta7t `/infrastructure` (servers + services), kol wa7da table m3a add/edit dialog w status badge. Alerts via notification channels.

> Screenshots: P27 (Bell dropdown + inbox), P28 (Channel settings), P29 (Servers dashboard + dialog), P30 (Services list + status badges)

---

## Testing

**Unit testing mta3 mail channel** — `mail.service.spec.ts`: el template-rendering w send path li kol module's email delivery yemshi 3lih.

**Acceptance scenarios**: 8 stories, 8 scenarios, kolhom verified.

---

## Retrospective — Chnou nt3almna?

### Chnou ken s3ib?

El breadth ken f **integrations, mch domain logic**. 4 external delivery surfaces — **SMTP, FCM, Telegram Bot API, ntfy** — kol wa7da b:
- Credential model mte3ha
- Failure modes mte3ha
- Payload shape mte3ou

Plus **ICMP probing from Node.js** — hosts ma yejawbouch dima kima expected.

**El outbox design khedh iterations**: el first idea kenet li el detector y-sendi directly. Ama separating detection mel delivery **proved essential** — channel lent (email server m3a timeout) ma lazem-ch ybloqui el per-minute probe loop. El decoupling = resilience.

### Chnou fad el projet?

**El outbox pattern** = el clearest success mta3 el sprint:
- Detection w delivery decoupled b `isSent` flag persisted
- **Free deduplication** (unsent alert y-suppress re-detection)
- **Multi-instance safety** jét directement mel existing lock pattern

**Channel configuration centralisée** (settings row wa7da + 2 integration tables) ama channel **dispatch f el consumers** = kol module easy to read. Confirmed el value mta3 el planned dispatcher consolidation.

**Reusing Sprint 4's lock-then-scan** lel 6 monitoring crons = **no new concurrency design needed**. El pattern proven, nesta3mliwh w 5alas.

> Figure 3.40 — Cumulative class diagram ba3d Sprint 5: Notifications package (7 tables) + Infrastructure Monitoring package (5 tables). Channel configuration = single place kol consumer y9ra 9bal ma yeb3eth.

---

---

# Chnou lazem tetfaker mel Sprints 4–5

## Sprint 4 — El Personal Layer
1. **Lock-then-scan cron pattern**: acquire Postgres lock → query pending → fan out to channels → mark processed. Reused 3la kol el crons (to-dos, events, attendance, reminders, monitoring).
2. **Distributed lock bla Redis**: `SELECT ... FOR UPDATE SKIP LOCKED` + 55s TTL. Single instance processes cron even f multi-replica deployment.
3. **Attendance gate fullscreen**: blocking, mch optional. User ma ye9derch y-bypass.
4. **Auto-close**: capped b shift-end (mch b 03:00). Ma y-pénalisich el worker.
5. **Escalating event notifications**: 4 thresholds (24h / 2.5h / 30min / 15min), `nextNotificationTime` denormalized.
6. **Personal data = .own scoped**: data query nfisha tenforci isolation, mch el guard.
7. **Polymorphic reminder target**: entityType + entityId, extensible, single delivery path.
8. **WorkSession owns TaskTimeEntry**: task time anchored to attendance session.

## Sprint 5 — El Communication Layer
9. **Notifications = explicit delivery layer**: 7 consumer modules y-calliw `createNotificationFromSystem`.
10. **4 channels, independently gated**: email/push opt-out, Telegram/ntfy opt-in.
11. **Outbox pattern**: detection decoupled from delivery. 3 benefits: never blocked, free dedup, multi-instance safe.
12. **6 crons f monitoring**: 2 detectors + 2 expiry watchers + 2 senders.
13. **FCM best-effort**: dead tokens survive, write path never fails.
14. **Public /health endpoint**: bla auth, lel external monitoring.
15. **End-to-end proof**: dead ping → outbox → fan-out → manager's Telegram. El WHOLE pipeline.

---

---

# Questions li ynajem el jury ysalek — Sprints 4–5

## Sprint 4

### Q1: "El distributed lock b Postgres — w ki la DB nfisha ta7tha? El crons kolhom yetwaqfou?"
**Jaweb**: S7i7, ki Postgres down → el lock ma yemchich → el crons yetwaqfou. Ama ki Postgres down → **kol el plateforme wa9fa** (auth, projects, tasks, kol chay yesta3mel la DB). El lock failure = **least of our problems** f hedha el scenario. El real mitigation lel DB downtime = el infrastructure monitoring module nfisou (Sprint 5) li y-detecti li Postgres ta7 w yalert. W lel production, DB replication + failover houma el solution — mch lock design different.

### Q2: "Attendance gate fullscreen — mch trop aggressive? W ki user y7ab juste ychouf 7aja rapidement?"
**Jaweb**: Hedha 3lech 3malna **"join as viewer"** option. El user ye9der y5éhir viewer mode → yod5ol bla check-in, ychouf chnou y7ab. El gate mch "check in or go away" — hiya "check in, wella od5ol viewer." El enforcement = ki t7ab TEsta3mel la plateforme (tasks, projects, etc.) lazem tkoun checked in. Viewer mode = read-only access bla attendance requirement. Balance bin enforcement w flexibility.

### Q3: "Late-start detection 8:45 UTC — ama w ki user f timezone mkhtalef?"
**Jaweb**: Currently el thresholds fixed (UTC). TDG based f **Sfax, Tunisia** (UTC+1) — kol el team f nafs el timezone. Hedha 3lech fixed thresholds yekhidhmou. Ki la plateforme tetscale l teams f timezones mkhtalfin → lazem per-user timezone configuration + thresholds adapted per timezone. Logged ka **future work**, ama lel context mta3 TDG, fixed UTC = correct w sufficient.

### Q4: "Auto-close session — y-cappi b shift end. Ama 3lech ma y-notifich el user y-checki out normally?"
**Jaweb**: Actually, kol el modules f Sprint 4 y partajiw el notification backbone. El auto-close **ye9der yetza3d b notification** "forgotten check-out" 9bal el auto-close (par exemple 30 min 9bal shift end). Hedha identified ka **remaining work** (improvement planned). Currently el auto-close = safety net bla notification préalable. Ama el notification addition = straightforward (nafs el cron pattern, juste different trigger).

### Q5: "Personal to-dos — mch juste duplication mta3 project tasks b isolation?"
**Jaweb**: Architecturally mfar9in deliberately. Personal to-dos = **simpler model** (3 statuses vs 6+, no dependencies, no WIP limits, no sprints/epics, no data-driven board). El use case mkhtalef: "buy groceries", "review PR", "call dentist" — 7ajat li ma 3andhoum 7atta relation m3a project management. Ki t-forci el user yesta3mel project task system lel personal items → overhead (which project? which sprint? which column?). Separate = clean UX.

### Q6: "Escalating notifications — 4 thresholds fixed? Mch better ki user y-customizi-hom?"
**Jaweb**: Per-user customizable thresholds = **significant complexity** (settings UI, validation, per-user cron computation). El 4 thresholds (24h, 2.5h, 30min, 15min) = standard values li la majorité mta3 calendar apps yesta3mliwhom (Google Calendar, Outlook similar patterns). Lel PFE scope, fixed thresholds = correct trade-off. Ki l'app tekber w users y-requéstéw customization → el `nextNotificationTime` mechanism deja f blasu, lazem tzid user settings table barka.

### Q7: "Reminders — overdue w stuck task detection. Ama kifech t-differentié bin overdue w truly stuck?"
**Jaweb**: **Overdue** = task 3andha due date w el due date fathet w el task mazélet mch DONE. Factual, simple check: `dueDate < now() AND status != 'DONE'`. **Stuck** = task mafamech update 3liha l **5 jours**. Heuristic — 5 jours without activity = probably forgotten. El zouz different triggers ama nafs el delivery mechanism. El stuck detection particularly useful parce que task bla due date ma tetcatchich bel overdue check — ama 5 jours bla activity = signal li 7aja wrong.

### Q8: "WorkSession owns TaskTimeEntry — ama w ki user ylogui time 3la task w howa mch checked in?"
**Jaweb**: El time logging service ychecky ki el user 3andou **open work session** 9bal ma y-accepti el time entry. Ki mafamech open session → **rejected** — lazem t-checki in awwel. Hedha y-enforci li task time **always anchored** to attendance session. El benefit: manager ye9der ychouf: f hedhi el session, el employee 5dhem 3la task A l 2 heures w task B l 1 heure. Coherent data.

## Sprint 5

### Q9: "7 consumer modules y-calliw `createNotificationFromSystem` — mch tight coupling?"
**Jaweb**: `createNotificationFromSystem` = **single method call b userId + payload**. El consumers ma ya3rfouech chnou yesra da5el (in-app row, FCM push). Hedha mch tight coupling — hedha **clean interface**. El alternative: kol consumer y-handle in-app + push b nafsou = **code duplication** (li kenet el 7aja f Sprint 4 9bal el refactoring). El remaining channels (email, Telegram, ntfy) dispatched directly b kol consumer parce que lazem customize el content (email template mkhtalef per module). Future improvement: `NotificationDispatcherService` li y-centralizy kol el channels.

### Q10: "FCM best-effort — ya3ni push notifications mech guaranteed?"
**Jaweb**: Push notifications par nature **mch guaranteed** — hedha mch design choice mte3na, hedha reality mta3 el technology:
1. User ye9der y-blocki browser notifications
2. Browser ye9der ykoun fermé
3. Device token ye9der ykoun expired
4. FCM server ye9der ykoun temporarily unavailable

**Best-effort** ya3ni: neb3thou, ki toussel toussel, ki ma tousselch ma nkassrouch el flow. El mitigation: famma **in-app inbox dima** (persisted f DB) — 7atta ki push fails, el notification f el inbox. L'user ki yeftah la plateforme ylou9a-ha. Push = convenience, inbox = guarantee.

### Q11: "El outbox pattern f monitoring — 3lech ma 3melthouch lel notifications lo5rin (Sprint 4 crons)?"
**Jaweb**: Valid question. El Sprint 4 crons (reminders, events, attendance) yesta3mliw **fire-and-forget** — ki channel fails, el cron y-log el failure w ydouz. El monitoring outbox = **stronger guarantee** parce que downtime alert **more critical** — ki server ta7 w el notification ma tousselch → impact kbir.

El ideal = outbox pattern lel kol (kima chnou Sprint 4 retrospective identifiat: centralize into `NotificationDispatcherService`). Ama lel PFE timeline, el pragmatic choice ken: fire-and-forget lel Sprint 4 (sufficient lel personal features), outbox lel Sprint 5 (critical lel infrastructure alerts). Future work = unify kolhom ta7t outbox-based dispatcher.

### Q12: "ICMP ping from Node.js — mch problematic? ICMP lazem raw sockets, w Node mch root."
**Jaweb**: S7i7, raw ICMP sockets normally t7taj root/admin privileges. Nesta3mliw **Node.js library** li t-handle hedha (par exemple `ping` module li y-spawni el système's ping command internally). El library y-abstrahi el platform differences (Windows vs Linux). El trade-off: spawning external process per ping = slightly heavier than raw socket, ama works without elevated privileges w cross-platform. Lel scale mte3na (few servers), el overhead negligible.

### Q13: "6 crons per minute — mch heavy 3la el system? 6 locks + 6 queries kol minute?"
**Jaweb**: 6 `SELECT ... FOR UPDATE SKIP LOCKED` queries per minute = **trivial** load 3la Postgres. Each query = few milliseconds. El actual work (ICMP ping, HTTP probe) = el heavier part, ama hedha IO-bound (waiting for network response), mch CPU-bound. W el distributed lock y-guarantii li instance **wa7da barka** trouli-hom — mch 6 × N instances. Lel scale mte3na (few servers, few services), 6 per-minute crons = barely noticeable. Ki el infrastructure tekber (100+ servers) → ye9der yet-optimisi b batching el pings.

### Q14: "Managers attached to servers only — w ki manager mte3ou service spécifique, mch el server lkol?"
**Jaweb**: Design simplification. F la pratique, achkoun responsable 3la service = achkoun responsable 3la el server li mte3ha (DBA responsible 3al PostgreSQL service = responsible 3al server li PostgreSQL ydour fih). Service-level management granularity = added complexity (extra join table, extra authorization logic) lel edge case sghir. Ki TDG tekber w t7aj per-service management → el `UserServerManagement` join ye9der yet-extendi l services aussi. Currently = simplest model li ycouvri el common case.

### Q15: "Telegram integration — bot token wa7ed shared. Mch security risk?"
**Jaweb**: El bot token = **server-side secret** (f environment variables, ma yetexposich lel client). El bot yeb3eth **messages l specific chatIds** — kol user y-linki el chat mte3ou. El bot ma ye9derch y9ra messages mta3 el users (send-only). W el chatId = **numeric ID** (mch username) — uniquely identifies el chat. Risk: ki 7ad ya3ref el chatId mta3 wa7ed ekher, ye9der y-configuri el système bech yeb3ethrou notifications 3la el wrong chat? La — el chatId linkage done f el user's **own profile settings** (ownership-scoped). User ma ye9derch y-linki chatId 3la compte mta3 wa7ed ekher.

### Q16: "El notification inbox — ma 3andha-ch read/unread? Just seen/unseen?"
**Jaweb**: `UserNotification` 3andha el **seen** status (mark-seen on open). Seen/unseen functionally = read/unread f hedha el context. Ki user yeftah el bell dropdown → kol el notifications yet-markéw seen. Ki y7ab y-supprimé → delete (ownership-scoped). El model simple deliberately — lel internal tool m3a ~7 users, sophisticated read/unread/archived/starred states = over-engineering. Ki TDG tekber → ye9der yet-zéd granularity.

### Q17: "ntfy — chnou hedha? 3lech mch juste email + push + Telegram yekfiw?"
**Jaweb**: **ntfy** = open-source, self-hosted push notification service. Ya3ti **push notifications bla FCM dependency** (no Google account required). 3lech zidinéh? 
1. **Self-hosted option** — consistent m3a el self-hosted philosophy mta3 la plateforme
2. **No vendor lock-in** — ki FCM quotas wella policies ytbaddliw, 3andna alternative
3. **Simple protocol** — HTTP POST l topic = notification. Lightweight.
4. **Privacy** — notifications ma yemshouch 3la Google's servers

Practically, email + push + Telegram yekfiw lel majorité mta3 users. ntfy = **option supplémentaire** lel users li y7abou self-hosted w privacy-first approach. "Could" priority f el backlog — nice to have.

### Q18: "El outbox — `isSent` flag. Ama w ki delivery fails ba3d ma flippit el flag? Notification lost?"
**Jaweb**: El sender cron y-flipi `isSent: true` **ba3d** successful delivery (fan-out kmel bla error). Ki delivery fails (exception) → el flag **yeb9a false** → el next cron run y-re-attempt. El flag y-flipi **ghir ki el delivery succeeded**.

Ama famma edge case: ki el fan-out **partially** succeeds (email toussel, Telegram fails). F el current implementation, ki ay channel fails → exception → el flag yeb9a false → **re-attempt kolhom** (y compris email li deja toussel → email duplicate possible). El mitigation lel future: per-channel delivery status au lieu de single `isSent` flag. Ama lel current scale, hedha acceptable — duplicate email ashel mel lost Telegram alert.

### Q19: "El /health endpoint — public bla auth. Mch attack surface?"
**Jaweb**: El endpoint y-returni **ghir** `{ status: 'ok', timestamp }`. Ma y-leaki 7atta sensitive information (no version, no internal state, no user count). El cost mta3 making it authenticated = external monitoring tools (Uptime Robot, etc.) ma ye9drouch yesta3mlih (lazem credentials). El benefit mta3 public = liveness check mta3 microseconds, trivial response. Attack surface = **effectively zero** — attacker y3arref ghir li el API 7ay, li deja obvious mel DNS record anyway.

### Q20: "Sprint 4 w Sprint 5 — el crons kolhom per-minute. Mch 5 minutes wella 10 minutes yekfiw?"
**Jaweb**: Depends 3la el use case:
- **Attendance late detection** — per-minute important parce que el threshold precise (08:45). Ki tchecky kol 10 min → user li y-checki in 08:46 ye9der ma yjihoumch "late" notification 7atta 08:55.
- **Health checks** — per-minute = standard f monitoring tools (Uptime Robot, Pingdom = per-minute). Server ta7 → lazem na3rfou f minute, mch f 10 minutes.
- **Reminders** — per-minute less critical, ama ki reminder mta3 15 min 9bal meeting w tchecky kol 10 min → el reminder ye9der yji 5 min 9bal au lieu de 15. Precision matters.

El distributed lock y-guarantii li el overhead = minimal (instance wa7da trouli-h). W el queries = lightweight. Donc per-minute = correct choice lel precision li n7ajouha.
