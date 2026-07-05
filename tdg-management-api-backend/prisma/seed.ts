/**
 * Demo-ready seed for the Tawer management platform.
 *
 * Tawer is a Tunisian digital agency with two business units:
 *   - Tawer Dev      → AGILE software projects
 *   - Tawer Creative → FREESTYLE design/marketing projects
 *
 * This seed WIPES the database and recreates a coherent, realistic dataset:
 * Tunisian users across every role, projects with sprints/epics/milestones,
 * ~50 tasks with realistic varied actual-vs-estimated hours (real signal for the
 * AI estimation feature), decision-bearing comments (retrieval targets for the
 * RAG copilot), dependencies, labels, time entries, work sessions, personal
 * tasks, events, notifications, servers, and a rich reminder set.
 *
 * Run with:  npm run prisma:seed
 * All accounts share the password:  password123
 */
import {
  PrismaClient,
  UserType,
  EventType,
  EventColor,
  UserTaskStatus,
  UserTaskPriority,
  WorkSessionLocation,
  WorkSessionDevice,
  ServerServiceStatus,
  Language,
  ProjectStatus,
  BusinessUnit,
  ProjectType,
  SprintStatus,
  TaskType,
  TaskPriority,
  ReminderEntityType,
  ReminderStatus,
  ChannelType,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

// ─── Utilities ────────────────────────────────────────────────────────────────

function hash(password: string) {
  return bcrypt.hash(password, 10);
}

/** Deterministic PRNG (mulberry32) so the dataset is stable across re-seeds. */
function makeRng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = makeRng(20260705);
const randInt = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const round1 = (n: number) => Math.round(n * 10) / 10;

const NOW = new Date('2026-07-05T09:00:00Z');
const day = 86400000;
const daysAgo = (n: number) => new Date(NOW.getTime() - n * day);
const daysFromNow = (n: number) => new Date(NOW.getTime() + n * day);
const at = (base: Date, h: number, m = 0) => {
  const d = new Date(base);
  d.setUTCHours(h, m, 0, 0);
  return d;
};

// ─── Wipe (FK-safe: children → parents) ─────────────────────────────────────────

async function wipe() {
  console.log('🧹 Clearing database...');
  // Agile / task graph
  await prisma.taskCommentLike.deleteMany();
  await prisma.taskCommentMention.deleteMany();
  await prisma.taskComment.deleteMany();
  await prisma.taskTimeEntry.deleteMany();
  await prisma.taskLabelAssignment.deleteMany();
  await prisma.taskDependency.deleteMany();
  await prisma.taskAttachment.deleteMany();
  await prisma.taskContent.deleteMany();
  await prisma.reminderChannel.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.task.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.sprintAttachment.deleteMany();
  await prisma.sprintContent.deleteMany();
  await prisma.sprint.deleteMany();
  await prisma.epic.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectTaskStatus.deleteMany();
  await prisma.projectInvitation.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectContent.deleteMany();
  await prisma.project.deleteMany();
  // Personal tasks
  await prisma.userTaskComment.deleteMany();
  await prisma.userTaskAttachment.deleteMany();
  await prisma.userTaskContent.deleteMany();
  await prisma.userTask.deleteMany();
  // Work tracking
  await prisma.workSession.deleteMany();
  await prisma.workDay.deleteMany();
  // Events
  await prisma.eventParticipant.deleteMany();
  await prisma.eventContent.deleteMany();
  await prisma.event.deleteMany();
  // Notifications
  await prisma.userNotification.deleteMany();
  await prisma.notificationContent.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationToken.deleteMany();
  // Infrastructure
  await prisma.serviceNotification.deleteMany();
  await prisma.service.deleteMany();
  await prisma.serverNotification.deleteMany();
  await prisma.userServerManagement.deleteMany();
  await prisma.server.deleteMany();
  // Org
  await prisma.userTeam.deleteMany();
  await prisma.team.deleteMany();
  await prisma.userManager.deleteMany();
  // Auth-adjacent
  await prisma.refreshToken.deleteMany();
  await prisma.resetPasswordCode.deleteMany();
  await prisma.role.deleteMany();
  await prisma.userTelegramBot.deleteMany();
  await prisma.userNtfyIntegration.deleteMany();
  await prisma.userNotificationSettings.deleteMany();
  await prisma.locking.deleteMany();
  await prisma.user.deleteMany();
}

// ─── Users ──────────────────────────────────────────────────────────────────────

interface UserSpec {
  key: string;
  email: string;
  name: string;
  phone: string;
  role: UserType;
}

const USER_SPECS: UserSpec[] = [
  { key: 'ceo',        email: 'mohamed@tawer.tn',  name: 'Mohamed Trabelsi',   phone: '+21620000001', role: UserType.CEO },
  { key: 'cto',        email: 'sami@tawer.tn',     name: 'Sami Bouazizi',      phone: '+21620000002', role: UserType.CTO },
  { key: 'cmo',        email: 'leila@tawer.tn',    name: 'Leila Haddad',       phone: '+21620000003', role: UserType.CMO },
  { key: 'devpm',      email: 'nadia@tawer.tn',    name: 'Nadia Jelassi',      phone: '+21620000004', role: UserType.TawerDevProjectManager },
  { key: 'backend',    email: 'youssef@tawer.tn',  name: 'Youssef Hamdi',      phone: '+21620000005', role: UserType.BackendDeveloper },
  { key: 'frontend',   email: 'emna@tawer.tn',     name: 'Emna Chaabane',      phone: '+21620000006', role: UserType.FrontendDeveloper },
  { key: 'fullstack',  email: 'wassim@tawer.tn',   name: 'Wassim Gharbi',      phone: '+21620000007', role: UserType.FullStackDeveloper },
  { key: 'devops',     email: 'khaled@tawer.tn',   name: 'Khaled Mansour',     phone: '+21620000008', role: UserType.DevopsEngineer },
  { key: 'qa',         email: 'amine@tawer.tn',    name: 'Amine Bouraoui',     phone: '+21620000009', role: UserType.QualityAssuranceEngineer },
  { key: 'mobile',     email: 'firas@tawer.tn',    name: 'Firas Zaidi',        phone: '+21620000010', role: UserType.MobileAppDeveloper },
  { key: 'intern',     email: 'bilel@tawer.tn',    name: 'Bilel Saidi',        phone: '+21620000011', role: UserType.TawerDevIntern },
  { key: 'creativepm', email: 'salma@tawer.tn',    name: 'Salma Karray',       phone: '+21620000012', role: UserType.TawerCreativeProjectManager },
  { key: 'designer',   email: 'rania@tawer.tn',    name: 'Rania Ben Youssef',  phone: '+21620000013', role: UserType.UiUxDesigner },
  { key: 'graphic',    email: 'oussama@tawer.tn',  name: 'Oussama Dridi',      phone: '+21620000014', role: UserType.GraphicDesigner },
  { key: 'content',    email: 'ines@tawer.tn',     name: 'Ines Louati',        phone: '+21620000015', role: UserType.ContentWriter },
  { key: 'hr',         email: 'maha@tawer.tn',     name: 'Maha Ferjani',       phone: '+21620000016', role: UserType.HRManager },
];

const SYSTEM_STATUSES = [
  { name: 'BACKLOG', color: '#6B7280', order: 0, isSystem: true },
  { name: 'TODO', color: '#3B82F6', order: 1, isSystem: true, isDefault: true },
  { name: 'IN_PROGRESS', color: '#F59E0B', order: 2, isSystem: true },
  { name: 'IN_REVIEW', color: '#8B5CF6', order: 3, isSystem: true },
  { name: 'TESTING', color: '#EC4899', order: 4, isSystem: true },
  { name: 'DONE', color: '#10B981', order: 5, isSystem: true },
];

async function main() {
  console.log('🌱 Seeding Tawer demo database...\n');
  await wipe();

  // ─── Users ────────────────────────────────────────────────────────────────
  const U: Record<string, { id: string }> = {};
  for (const spec of USER_SPECS) {
    const u = await prisma.user.create({
      data: {
        email: spec.email,
        phone: spec.phone,
        name: spec.name,
        unaccentedName: spec.name,
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: spec.role } },
        notificationSettings: {
          create: {
            emailNotificationsEnabled: true,
            pushNotificationsEnabled: true,
            telegramNotificationsEnabled: rng() > 0.5,
            ntfyNotificationsEnabled: rng() > 0.7,
          },
        },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    });
    U[spec.key] = u;
  }
  console.log(`✅ ${USER_SPECS.length} users`);

  // ─── Manager relationships ──────────────────────────────────────────────────
  await prisma.userManager.createMany({
    skipDuplicates: true,
    data: [
      { userId: U.cto.id, managerId: U.ceo.id },
      { userId: U.cmo.id, managerId: U.ceo.id },
      { userId: U.devpm.id, managerId: U.cto.id },
      { userId: U.backend.id, managerId: U.devpm.id },
      { userId: U.frontend.id, managerId: U.devpm.id },
      { userId: U.fullstack.id, managerId: U.devpm.id },
      { userId: U.devops.id, managerId: U.cto.id },
      { userId: U.qa.id, managerId: U.devpm.id },
      { userId: U.mobile.id, managerId: U.devpm.id },
      { userId: U.intern.id, managerId: U.devpm.id },
      { userId: U.creativepm.id, managerId: U.cmo.id },
      { userId: U.designer.id, managerId: U.creativepm.id },
      { userId: U.graphic.id, managerId: U.creativepm.id },
      { userId: U.content.id, managerId: U.creativepm.id },
      { userId: U.hr.id, managerId: U.ceo.id },
    ],
  });
  console.log('✅ Manager relationships');

  // ─── Teams ──────────────────────────────────────────────────────────────────
  await prisma.team.create({
    data: {
      name: 'Tawer Dev',
      unaccentedName: 'Tawer Dev',
      members: {
        createMany: {
          skipDuplicates: true,
          data: [
            { userId: U.devpm.id, isManager: true },
            { userId: U.backend.id },
            { userId: U.frontend.id },
            { userId: U.fullstack.id },
            { userId: U.devops.id },
            { userId: U.qa.id },
            { userId: U.mobile.id },
            { userId: U.intern.id },
          ],
        },
      },
    },
  });
  await prisma.team.create({
    data: {
      name: 'Tawer Creative',
      unaccentedName: 'Tawer Creative',
      members: {
        createMany: {
          skipDuplicates: true,
          data: [
            { userId: U.creativepm.id, isManager: true },
            { userId: U.designer.id },
            { userId: U.graphic.id },
            { userId: U.content.id },
          ],
        },
      },
    },
  });
  console.log('✅ Teams');

  // ─── Servers & Services ──────────────────────────────────────────────────────
  await prisma.server.create({
    data: {
      name: 'Tawer Production (Tunis DC)',
      ip: '41.226.11.100',
      domain: 'api.tawer.tn',
      description: 'Primary production server hosted in the Tunis data center.',
      cpus: '8 vCPU',
      ram: '32 GB',
      storage: '500 GB NVMe',
      bandwidth: '1 Gbps',
      status: ServerServiceStatus.Running,
      paid: true,
      paidAt: daysAgo(120),
      expiredAt: daysFromNow(245),
      managers: { create: { managerId: U.devops.id } },
      services: {
        create: [
          { name: 'NestJS API', domain: 'api.tawer.tn', description: 'Main backend API', status: ServerServiceStatus.Running, sslCertificate: true, hasBackup: true, backupDestination: 's3://tawer-backups/api' },
          { name: 'PostgreSQL 16', description: 'Primary database', status: ServerServiceStatus.Running, hasBackup: true, backupDestination: 's3://tawer-backups/db' },
          { name: 'Redis', description: 'Cache & queues', status: ServerServiceStatus.Running },
          { name: 'MinIO', description: 'Object storage for attachments', status: ServerServiceStatus.Running, hasBackup: true },
        ],
      },
    },
  });
  await prisma.server.create({
    data: {
      name: 'Tawer Staging',
      ip: '41.226.11.101',
      domain: 'staging.tawer.tn',
      description: 'Pre-production staging environment.',
      cpus: '4 vCPU',
      ram: '8 GB',
      storage: '120 GB SSD',
      status: ServerServiceStatus.Maintenance,
      managers: { create: { managerId: U.devops.id } },
      services: {
        create: [
          { name: 'NestJS API (Staging)', domain: 'staging.tawer.tn', status: ServerServiceStatus.Running, sslCertificate: true },
          { name: 'PostgreSQL (Staging)', status: ServerServiceStatus.Running },
        ],
      },
    },
  });
  console.log('✅ Servers & services');

  // ─── Events ───────────────────────────────────────────────────────────────────
  await prisma.event.create({
    data: {
      type: EventType.Meeting,
      color: EventColor.Sky,
      startTime: at(daysFromNow(1), 9, 30),
      endTime: at(daysFromNow(1), 10, 30),
      nextNotificationTime: at(daysFromNow(1), 9, 0),
      location: 'Tawer HQ — Lac 2, Tunis',
      createdById: U.devpm.id,
      content: { createMany: { data: [{ title: 'Sprint Review — Nadhif', description: 'Demo of the completed sprint and planning for the next.', language: Language.English }] } },
      participants: { createMany: { data: [{ userId: U.cto.id }, { userId: U.backend.id }, { userId: U.frontend.id }, { userId: U.qa.id }, { userId: U.devops.id }] } },
    },
  });
  await prisma.event.create({
    data: {
      type: EventType.Meeting,
      color: EventColor.Amber,
      startTime: at(daysFromNow(0), 9, 0),
      endTime: at(daysFromNow(0), 9, 15),
      nextNotificationTime: at(daysFromNow(0), 8, 55),
      location: 'Google Meet',
      createdById: U.devpm.id,
      content: { createMany: { data: [{ title: 'Daily Standup', description: 'Tawer Dev daily sync.', language: Language.English }] } },
      participants: { createMany: { data: [{ userId: U.backend.id }, { userId: U.frontend.id }, { userId: U.fullstack.id }, { userId: U.mobile.id }, { userId: U.intern.id }] } },
    },
  });
  await prisma.event.create({
    data: {
      type: EventType.Event,
      color: EventColor.Emerald,
      startTime: at(daysFromNow(9), 15),
      endTime: at(daysFromNow(9), 17),
      nextNotificationTime: at(daysFromNow(9), 14),
      location: 'Tawer HQ — Rooftop',
      toAllUsers: true,
      createdById: U.ceo.id,
      content: { createMany: { data: [{ title: 'Company All-Hands — Q3', description: 'Quarterly results, roadmap and open Q&A.', language: Language.English }] } },
    },
  });
  await prisma.event.create({
    data: {
      type: EventType.Meeting,
      color: EventColor.Violet,
      startTime: at(daysFromNow(2), 11),
      endTime: at(daysFromNow(2), 12),
      nextNotificationTime: at(daysFromNow(2), 10, 45),
      location: 'Creative Studio',
      createdById: U.creativepm.id,
      content: { createMany: { data: [{ title: 'Délice Rebrand — Concept Review', description: 'Review of the first logo and palette directions with the client.', language: Language.English }] } },
      participants: { createMany: { data: [{ userId: U.designer.id }, { userId: U.graphic.id }, { userId: U.cmo.id }] } },
    },
  });
  console.log('✅ Events');

  // ─── Notifications ──────────────────────────────────────────────────────────
  const welcome = await prisma.notification.create({
    data: {
      sendBy: U.ceo.id,
      content: { createMany: { data: [{ title: 'Welcome to Tawer Management', body: 'The platform is live. Track your work, tasks and projects here.', language: Language.English }] } },
    },
  });
  await prisma.userNotification.createMany({
    skipDuplicates: true,
    data: USER_SPECS.map((s) => ({ userId: U[s.key].id, notificationId: welcome.id, isSeen: rng() > 0.5 })),
  });
  const deployNotif = await prisma.notification.create({
    data: {
      sendBy: U.devops.id,
      content: { createMany: { data: [{ title: 'Production deploy successful', body: 'Nadhif v0.9 is live on api.tawer.tn.', language: Language.English, url: 'https://api.tawer.tn' }] } },
    },
  });
  await prisma.userNotification.createMany({
    skipDuplicates: true,
    data: [U.cto, U.devpm, U.backend, U.frontend].map((u) => ({ userId: u.id, notificationId: deployNotif.id })),
  });
  console.log('✅ Notifications');

  // ─── Projects ─────────────────────────────────────────────────────────────────
  // Flagship AGILE project — richly populated.
  const nadhif = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerDev,
      projectType: ProjectType.AGILE,
      paid: true,
      startDate: daysAgo(150),
      endDate: daysFromNow(120),
      estimatedStartDate: daysAgo(150),
      estimatedEndDate: daysFromNow(90),
      estimatedBudget: 180000,
      hourlyRate: 90,
      displayOrder: 1,
      createdById: U.devpm.id,
      contents: { create: { name: 'Nadhif — Smart Waste Management Platform', unaccentedName: 'Nadhif - Smart Waste Management Platform', description: 'IoT-driven waste collection platform for Tunisian municipalities: sensor-equipped bins, route optimization, and a citizen reporting app.', details: 'Client: Municipality of Tunis. Stack: NestJS, Next.js, Flutter, PostgreSQL, MQTT.', language: Language.English } },
      members: { createMany: { data: [
        { userId: U.devpm.id, isManager: true },
        { userId: U.backend.id },
        { userId: U.frontend.id },
        { userId: U.fullstack.id },
        { userId: U.devops.id },
        { userId: U.qa.id },
        { userId: U.mobile.id },
        { userId: U.intern.id },
      ] } },
      labels: { createMany: { data: [
        { name: 'frontend', color: '#3B82F6' },
        { name: 'backend', color: '#10B981' },
        { name: 'mobile', color: '#06B6D4' },
        { name: 'devops', color: '#F59E0B' },
        { name: 'iot', color: '#14B8A6' },
        { name: 'bug', color: '#EF4444' },
        { name: 'tech-debt', color: '#8B5CF6' },
      ] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });

  const baladeya = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerDev,
      projectType: ProjectType.AGILE,
      paid: true,
      startDate: daysAgo(60),
      endDate: daysFromNow(180),
      estimatedStartDate: daysAgo(60),
      estimatedEndDate: daysFromNow(180),
      estimatedBudget: 120000,
      hourlyRate: 85,
      displayOrder: 2,
      createdById: U.devpm.id,
      contents: { create: { name: 'Baladeya — e-Government Citizen Portal', unaccentedName: 'Baladeya - e-Government Citizen Portal', description: 'Online portal for municipal services: permits, civil records, complaints and online payments.', language: Language.English } },
      members: { createMany: { data: [
        { userId: U.devpm.id, isManager: true },
        { userId: U.fullstack.id },
        { userId: U.frontend.id },
        { userId: U.qa.id },
      ] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });

  const sahtek = await prisma.project.create({
    data: {
      status: ProjectStatus.Pending,
      businessUnit: BusinessUnit.TawerDev,
      projectType: ProjectType.AGILE,
      startDate: daysFromNow(14),
      endDate: daysFromNow(200),
      estimatedStartDate: daysFromNow(14),
      estimatedEndDate: daysFromNow(200),
      estimatedBudget: 95000,
      hourlyRate: 85,
      displayOrder: 3,
      createdById: U.cto.id,
      contents: { create: { name: 'Sahtek — Telemedicine Mobile App', unaccentedName: 'Sahtek - Telemedicine Mobile App', description: 'Mobile app connecting patients with Tunisian doctors for video consultations and e-prescriptions.', language: Language.English } },
      members: { createMany: { data: [
        { userId: U.devpm.id, isManager: true },
        { userId: U.mobile.id },
        { userId: U.backend.id },
      ] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });

  // Tawer Creative — FREESTYLE projects.
  const delice = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerCreative,
      projectType: ProjectType.FREESTYLE,
      paid: true,
      startDate: daysAgo(40),
      endDate: daysFromNow(50),
      estimatedStartDate: daysAgo(40),
      estimatedEndDate: daysFromNow(50),
      estimatedBudget: 45000,
      displayOrder: 4,
      createdById: U.creativepm.id,
      contents: { create: { name: 'Délice Danone — Brand Refresh 2026', unaccentedName: 'Delice Danone - Brand Refresh 2026', description: 'Visual identity refresh and packaging system for the Délice yogurt line.', language: Language.English } },
      members: { createMany: { data: [
        { userId: U.creativepm.id, isManager: true },
        { userId: U.designer.id },
        { userId: U.graphic.id },
      ] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });

  const ooredoo = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerCreative,
      projectType: ProjectType.FREESTYLE,
      paid: true,
      startDate: daysAgo(20),
      endDate: daysFromNow(25),
      estimatedStartDate: daysAgo(20),
      estimatedEndDate: daysFromNow(25),
      estimatedBudget: 30000,
      displayOrder: 5,
      createdById: U.creativepm.id,
      contents: { create: { name: 'Ooredoo — Summer Social Campaign', unaccentedName: 'Ooredoo - Summer Social Campaign', description: 'Social media campaign and motion assets for the summer data-bundle promotion.', language: Language.English } },
      members: { createMany: { data: [
        { userId: U.creativepm.id, isManager: true },
        { userId: U.graphic.id },
        { userId: U.content.id },
      ] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });

  await prisma.project.create({
    data: {
      status: ProjectStatus.Completed,
      businessUnit: BusinessUnit.TawerCreative,
      projectType: ProjectType.FREESTYLE,
      paid: true,
      isArchived: true,
      archivedAt: daysAgo(10),
      startDate: daysAgo(120),
      endDate: daysAgo(15),
      estimatedStartDate: daysAgo(120),
      estimatedEndDate: daysAgo(20),
      estimatedBudget: 60000,
      displayOrder: 6,
      createdById: U.creativepm.id,
      contents: { create: { name: 'Tunisie Telecom — Website Redesign', unaccentedName: 'Tunisie Telecom - Website Redesign', description: 'Completed redesign of the corporate website and design system.', language: Language.English } },
      members: { createMany: { data: [{ userId: U.creativepm.id, isManager: true }, { userId: U.designer.id }] } },
      taskStatuses: { createMany: { data: SYSTEM_STATUSES } },
    },
  });
  console.log('✅ 6 projects');

  // ─── Epics (Nadhif) ─────────────────────────────────────────────────────────
  const epics = {
    platform: await prisma.epic.create({ data: { projectId: nadhif.id, name: 'Core Platform & Auth', description: 'Authentication, roles, tenants and the API foundation.', color: '#3B82F6', startDate: daysAgo(150), endDate: daysAgo(90) } }),
    iot: await prisma.epic.create({ data: { projectId: nadhif.id, name: 'IoT Bin Telemetry', description: 'MQTT ingestion of bin fill-level sensors and time-series storage.', color: '#14B8A6', startDate: daysAgo(120), endDate: daysAgo(40) } }),
    routing: await prisma.epic.create({ data: { projectId: nadhif.id, name: 'Route Optimization', description: 'Collection-route optimization engine and driver dispatch.', color: '#F59E0B', startDate: daysAgo(90), endDate: daysFromNow(10) } }),
    citizen: await prisma.epic.create({ data: { projectId: nadhif.id, name: 'Citizen Reporting App', description: 'Flutter app for citizens to report overflowing or damaged bins.', color: '#06B6D4', startDate: daysAgo(70), endDate: daysFromNow(30) } }),
  };
  console.log('✅ Epics');

  // ─── Milestones (Nadhif) ────────────────────────────────────────────────────
  const milestones = {
    mvp: await prisma.milestone.create({ data: { projectId: nadhif.id, name: 'MVP — Pilot District', description: 'Working pilot for one Tunis district: auth, telemetry, basic dashboard.', dueDate: daysAgo(30), completedAt: daysAgo(32) } }),
    beta: await prisma.milestone.create({ data: { projectId: nadhif.id, name: 'Beta — Route Optimization', description: 'Route engine live and citizen app in closed beta.', dueDate: daysFromNow(20) } }),
    ga: await prisma.milestone.create({ data: { projectId: nadhif.id, name: 'GA — City-wide Rollout', description: 'General availability across all Tunis districts.', dueDate: daysFromNow(100) } }),
  };
  console.log('✅ Milestones');

  // ─── Sprints (Nadhif) ────────────────────────────────────────────────────────
  const sprints = {
    s1: await prisma.sprint.create({ data: { projectId: nadhif.id, createdById: U.devpm.id, status: SprintStatus.Completed, capacity: 34, startDate: daysAgo(140), endDate: daysAgo(126), estimatedStartDate: daysAgo(140), estimatedEndDate: daysAgo(126), contents: { create: { name: 'NDF Sprint 1 — Platform Foundation', unaccentedName: 'NDF Sprint 1 - Platform Foundation', description: 'Auth, tenancy and API skeleton.', language: Language.English } } } }),
    s2: await prisma.sprint.create({ data: { projectId: nadhif.id, createdById: U.devpm.id, status: SprintStatus.Completed, capacity: 40, startDate: daysAgo(125), endDate: daysAgo(111), estimatedStartDate: daysAgo(125), estimatedEndDate: daysAgo(111), contents: { create: { name: 'NDF Sprint 2 — Telemetry Ingestion', unaccentedName: 'NDF Sprint 2 - Telemetry Ingestion', description: 'MQTT ingestion pipeline and time-series storage.', language: Language.English } } } }),
    s3: await prisma.sprint.create({ data: { projectId: nadhif.id, createdById: U.devpm.id, status: SprintStatus.Completed, capacity: 42, startDate: daysAgo(96), endDate: daysAgo(82), estimatedStartDate: daysAgo(96), estimatedEndDate: daysAgo(82), contents: { create: { name: 'NDF Sprint 3 — Dashboard & MVP', unaccentedName: 'NDF Sprint 3 - Dashboard & MVP', description: 'Operations dashboard and pilot MVP hardening.', language: Language.English } } } }),
    s4: await prisma.sprint.create({ data: { projectId: nadhif.id, createdById: U.devpm.id, status: SprintStatus.Running, capacity: 40, startDate: daysAgo(6), endDate: daysFromNow(8), estimatedStartDate: daysAgo(6), estimatedEndDate: daysFromNow(8), contents: { create: { name: 'NDF Sprint 4 — Route Engine & Citizen App', unaccentedName: 'NDF Sprint 4 - Route Engine & Citizen App', description: 'Route optimization engine and citizen reporting app beta.', language: Language.English } } } }),
    s5: await prisma.sprint.create({ data: { projectId: nadhif.id, createdById: U.devpm.id, status: SprintStatus.Pending, capacity: 40, startDate: daysFromNow(9), endDate: daysFromNow(23), estimatedStartDate: daysFromNow(9), estimatedEndDate: daysFromNow(23), contents: { create: { name: 'NDF Sprint 5 — Hardening & GA Prep', unaccentedName: 'NDF Sprint 5 - Hardening & GA Prep', description: 'Performance, security and GA preparation.', language: Language.English } } } }),
  };
  console.log('✅ Sprints');

  // ─── Tasks (Nadhif) ─────────────────────────────────────────────────────────
  const devMembers = [U.backend.id, U.frontend.id, U.fullstack.id, U.devops.id, U.mobile.id, U.qa.id, U.intern.id];
  let keyCounter = 0;
  const nextKey = () => `NDF-${++keyCounter}`;

  // Curated, decision-bearing tasks with rich descriptions (RAG retrieval targets).
  // Each: create task + optionally comments/dependencies below.
  const t_auth = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Implement JWT auth with refresh-token rotation',
    description: 'Set up JWT access + refresh tokens with rotation on every refresh. Access tokens are short-lived (15 min); refresh tokens are stored hashed and revoked on logout.',
    type: TaskType.STORY, priority: TaskPriority.HIGH, status: 'DONE', reporterId: U.devpm.id, assigneeId: U.backend.id,
    sprintId: sprints.s1.id, epicId: epics.platform.id, storyPoints: 8, estimatedHours: 12, actualHours: 13.5, progressPercent: 100, completedAt: daysAgo(130), displayOrder: 1,
  } });
  const t_rbac = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Role-based access control for municipal tenants',
    description: 'Multi-tenant RBAC: each municipality is a tenant; roles are Admin, Dispatcher, Driver, Auditor. Permissions enforced by a guard reading the JWT tenant claim.',
    type: TaskType.STORY, priority: TaskPriority.HIGH, status: 'DONE', reporterId: U.devpm.id, assigneeId: U.backend.id,
    sprintId: sprints.s1.id, epicId: epics.platform.id, storyPoints: 8, estimatedHours: 14, actualHours: 11, progressPercent: 100, completedAt: daysAgo(128), displayOrder: 2,
  } });
  const t_mqtt = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'MQTT ingestion pipeline for bin sensors',
    description: 'Ingest fill-level readings from bin sensors over MQTT, validate payloads, and buffer through Redis before persisting. Target 5k messages/min.',
    type: TaskType.STORY, priority: TaskPriority.URGENT, status: 'DONE', reporterId: U.cto.id, assigneeId: U.backend.id,
    sprintId: sprints.s2.id, epicId: epics.iot.id, storyPoints: 13, estimatedHours: 24, actualHours: 29, progressPercent: 100, completedAt: daysAgo(114), displayOrder: 1,
  } });
  const t_tsdb = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Time-series storage for fill-level readings',
    description: 'Store high-frequency sensor readings separately from the transactional DB to keep operational queries fast.',
    type: TaskType.TASK, priority: TaskPriority.HIGH, status: 'DONE', reporterId: U.backend.id, assigneeId: U.devops.id,
    sprintId: sprints.s2.id, epicId: epics.iot.id, storyPoints: 5, estimatedHours: 10, actualHours: 8.5, progressPercent: 100, completedAt: daysAgo(112), displayOrder: 2,
  } });
  const t_dash = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Operations dashboard with live bin map',
    description: 'Next.js dashboard showing bins on a Mapbox map, color-coded by fill level, with real-time updates over WebSocket.',
    type: TaskType.STORY, priority: TaskPriority.HIGH, status: 'DONE', reporterId: U.devpm.id, assigneeId: U.frontend.id,
    sprintId: sprints.s3.id, epicId: epics.iot.id, milestoneId: milestones.mvp.id, storyPoints: 13, estimatedHours: 22, actualHours: 25, progressPercent: 100, completedAt: daysAgo(84), displayOrder: 1,
  } });
  const t_route = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Route optimization engine (VRP solver)',
    description: 'Compute near-optimal collection routes from the set of bins above the fill threshold, respecting truck capacity and shift windows. Vehicle Routing Problem solved with OR-Tools.',
    type: TaskType.STORY, priority: TaskPriority.URGENT, status: 'IN_PROGRESS', reporterId: U.cto.id, assigneeId: U.fullstack.id,
    sprintId: sprints.s4.id, epicId: epics.routing.id, milestoneId: milestones.beta.id, storyPoints: 21, estimatedHours: 40, actualHours: 22, progressPercent: 55, displayOrder: 1,
  } });
  const t_dispatch = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Driver dispatch & mobile route view',
    description: 'Send optimized routes to drivers and show turn-by-turn stops in the mobile app. Blocked until the route engine outputs a stable schema.',
    type: TaskType.STORY, priority: TaskPriority.HIGH, status: 'TODO', reporterId: U.devpm.id, assigneeId: U.mobile.id,
    sprintId: sprints.s4.id, epicId: epics.routing.id, milestoneId: milestones.beta.id, storyPoints: 8, estimatedHours: 16, actualHours: 0, progressPercent: 0, displayOrder: 2,
  } });
  const t_citizen = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Citizen report submission (photo + geo)',
    description: 'Flutter screen for citizens to photograph an overflowing bin, auto-attach GPS, and submit a report that lands in the dispatcher queue.',
    type: TaskType.STORY, priority: TaskPriority.MEDIUM, status: 'IN_REVIEW', reporterId: U.devpm.id, assigneeId: U.mobile.id,
    sprintId: sprints.s4.id, epicId: epics.citizen.id, storyPoints: 8, estimatedHours: 14, actualHours: 15.5, progressPercent: 90, displayOrder: 3,
  } });
  const t_bug = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Fix: WebSocket disconnects drop bin updates',
    description: 'Dashboard stops receiving live updates after ~10 minutes; the socket drops and does not reconnect, so bins show stale fill levels.',
    type: TaskType.BUG, priority: TaskPriority.URGENT, status: 'IN_PROGRESS', reporterId: U.qa.id, assigneeId: U.frontend.id,
    sprintId: sprints.s4.id, epicId: epics.iot.id, storyPoints: 3, estimatedHours: 4, actualHours: 2, progressPercent: 40, displayOrder: 4,
  } });
  const t_spike = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Spike: evaluate LoRaWAN vs NB-IoT for sensors',
    description: 'Compare connectivity options for bin sensors on coverage, battery life and per-device cost in the Tunisian context.',
    type: TaskType.SPIKE, priority: TaskPriority.LOW, status: 'DONE', reporterId: U.cto.id, assigneeId: U.devops.id,
    sprintId: sprints.s2.id, epicId: epics.iot.id, storyPoints: 3, estimatedHours: 6, actualHours: 7, progressPercent: 100, completedAt: daysAgo(118), displayOrder: 5,
  } });
  const t_backlog1 = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Predictive fill-level forecasting per bin',
    description: 'Forecast when each bin will reach the collection threshold from its historical fill curve, to schedule proactively.',
    type: TaskType.STORY, priority: TaskPriority.MEDIUM, status: 'BACKLOG', reporterId: U.cto.id, epicId: epics.routing.id,
    storyPoints: 13, estimatedHours: 30, actualHours: 0, progressPercent: 0, displayOrder: 10,
  } });
  const t_backlog2 = await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Arabic (RTL) localization of the dashboard',
    description: 'Add Arabic localization with full right-to-left layout support for the operations dashboard.',
    type: TaskType.STORY, priority: TaskPriority.MEDIUM, status: 'BACKLOG', reporterId: U.devpm.id, epicId: epics.platform.id,
    storyPoints: 8, estimatedHours: 18, actualHours: 0, progressPercent: 0, displayOrder: 11,
  } });
  // Subtask under the route engine.
  await prisma.task.create({ data: {
    projectId: nadhif.id, key: nextKey(), title: 'Unit tests for the VRP solver constraints',
    description: 'Cover capacity, time-window and max-stops constraints of the route optimization engine.',
    type: TaskType.TASK, priority: TaskPriority.MEDIUM, status: 'TODO', reporterId: U.devpm.id, assigneeId: U.intern.id,
    sprintId: sprints.s4.id, epicId: epics.routing.id, parentTaskId: t_route.id, storyPoints: 3, estimatedHours: 5, actualHours: 0, progressPercent: 0, displayOrder: 1,
  } });

  // Decision-bearing comments (prime RAG retrieval).
  await prisma.taskComment.create({ data: { taskId: t_mqtt.id, authorId: U.backend.id, content: 'Decision: we buffer readings through Redis Streams before writing, because direct writes couldn\'t keep up past ~3k msg/min. This gets us comfortably over the 5k target.' } });
  await prisma.taskComment.create({ data: { taskId: t_mqtt.id, authorId: U.cto.id, content: 'Agreed. Also confirmed we use QoS 1 (at-least-once) and dedupe on (deviceId, timestamp) — QoS 2 was too heavy for the sensor firmware.' } });
  await prisma.taskComment.create({ data: { taskId: t_tsdb.id, authorId: U.devops.id, content: 'Decision: fill-level readings go into a dedicated TimescaleDB hypertable, not the main Postgres, so operational queries stay fast. Retention set to 90 days of raw + continuous aggregates for older data.' } });
  await prisma.taskComment.create({ data: { taskId: t_route.id, authorId: U.fullstack.id, content: 'Decision: using Google OR-Tools for the VRP. We cap route recompute to every 15 minutes to keep Mapbox Matrix API costs under ~300 TND/month.' } });
  await prisma.taskComment.create({ data: { taskId: t_spike.id, authorId: U.devops.id, content: 'Conclusion: going with NB-IoT over LoRaWAN — Ooredoo/TT coverage in Tunis is good, battery life is acceptable (~3 years), and we avoid running our own gateways. LoRaWAN was cheaper per message but the gateway ops overhead killed it.' } });
  await prisma.taskComment.create({ data: { taskId: t_citizen.id, authorId: U.mobile.id, content: 'Decision: photos are compressed to max 1280px and uploaded to MinIO with a pre-signed URL, so citizen uploads on 3G don\'t time out.' } });
  await prisma.taskComment.create({ data: { taskId: t_bug.id, authorId: U.qa.id, content: 'Reproduced reliably: leave the dashboard open ~10 min on staging and bins freeze. Network tab shows the socket closes with code 1006 and never reconnects.' } });
  await prisma.taskComment.create({ data: { taskId: t_rbac.id, authorId: U.backend.id, content: 'Decision: tenant is a claim in the JWT, and every query is scoped by tenantId in a Prisma middleware — no cross-tenant read is possible even if a controller forgets to filter.' } });

  // Dependencies: dispatch blocked by route engine; citizen tests blocked by route engine.
  await prisma.taskDependency.create({ data: { blockingTaskId: t_route.id, blockedTaskId: t_dispatch.id, dependencyType: 'blocks' } });

  // Label assignments (a few).
  const nadhifLabels = await prisma.taskLabel.findMany({ where: { projectId: nadhif.id } });
  const labelByName = Object.fromEntries(nadhifLabels.map((l) => [l.name, l.id]));
  await prisma.taskLabelAssignment.createMany({ skipDuplicates: true, data: [
    { taskId: t_mqtt.id, labelId: labelByName['backend'] },
    { taskId: t_mqtt.id, labelId: labelByName['iot'] },
    { taskId: t_dash.id, labelId: labelByName['frontend'] },
    { taskId: t_bug.id, labelId: labelByName['bug'] },
    { taskId: t_citizen.id, labelId: labelByName['mobile'] },
    { taskId: t_tsdb.id, labelId: labelByName['devops'] },
  ] });

  // Bulk completed tasks — realistic VARIED actual-vs-estimated (signal for AI estimation).
  const completedTemplates: { title: string; description: string; type: TaskType; points: number; est: number }[] = [
    { title: 'Bin sensor device registration API', description: 'CRUD endpoints to register and provision bin sensors, generate device credentials, and map devices to physical bins.', type: TaskType.STORY, points: 5, est: 10 },
    { title: 'Fill-level threshold alerting service', description: 'Emit alerts when a bin crosses its collection threshold, with per-district thresholds and quiet hours.', type: TaskType.STORY, points: 5, est: 9 },
    { title: 'Dispatcher queue management screen', description: 'Screen for dispatchers to triage incoming alerts and citizen reports into collection jobs.', type: TaskType.STORY, points: 8, est: 16 },
    { title: 'Truck & fleet management CRUD', description: 'Manage collection trucks, their capacity, and driver assignments.', type: TaskType.TASK, points: 5, est: 8 },
    { title: 'Driver mobile login & shift start', description: 'Driver app authentication and start-of-shift check-in flow.', type: TaskType.STORY, points: 3, est: 6 },
    { title: 'District & zone configuration', description: 'Model districts and collection zones; assign bins and trucks to zones.', type: TaskType.TASK, points: 5, est: 9 },
    { title: 'Historical collections report export', description: 'Export collection history to CSV/PDF with per-zone and per-truck breakdowns.', type: TaskType.TASK, points: 3, est: 7 },
    { title: 'Real-time bin status WebSocket gateway', description: 'WebSocket gateway pushing live bin status changes to connected dashboards.', type: TaskType.STORY, points: 8, est: 14 },
    { title: 'Sensor battery-health monitoring', description: 'Track sensor battery levels and flag devices needing maintenance.', type: TaskType.TASK, points: 3, est: 6 },
    { title: 'Admin audit log', description: 'Immutable audit log of admin actions per tenant for compliance.', type: TaskType.TASK, points: 5, est: 10 },
    { title: 'Fix: duplicate alerts on sensor flapping', description: 'Sensors near the threshold flap and spam duplicate alerts; add hysteresis and debouncing.', type: TaskType.BUG, points: 3, est: 5 },
    { title: 'Fix: map markers not clustering at city zoom', description: 'At city-wide zoom the map renders thousands of markers and lags; enable clustering.', type: TaskType.BUG, points: 2, est: 4 },
    { title: 'Rate limiting on the public report API', description: 'Protect the citizen report endpoint from abuse with per-IP and per-device rate limits.', type: TaskType.TASK, points: 3, est: 6 },
    { title: 'Docker Compose for local dev stack', description: 'One-command local stack: API, Postgres, Redis, MQTT broker, MinIO.', type: TaskType.TASK, points: 3, est: 5 },
    { title: 'CI pipeline with tests & lint gates', description: 'GitHub Actions pipeline running tests, lint and type-check on every PR.', type: TaskType.TASK, points: 5, est: 8 },
    { title: 'Staging auto-deploy on merge to main', description: 'Auto-deploy the API and dashboard to staging on merge to main.', type: TaskType.TASK, points: 5, est: 9 },
    { title: 'Bin QR code generation for field crews', description: 'Generate printable QR codes per bin so field crews can scan to view/report status.', type: TaskType.STORY, points: 5, est: 8 },
    { title: 'Email digest of daily collection summary', description: 'Nightly email to municipal admins summarizing collections, misses and alerts.', type: TaskType.TASK, points: 3, est: 7 },
    { title: 'Tenant onboarding wizard', description: 'Guided flow to onboard a new municipality: districts, zones, first sensors, first admin.', type: TaskType.STORY, points: 8, est: 15 },
    { title: 'Performance: paginate & index bin queries', description: 'Add pagination and composite indexes so the bins list stays fast at 50k+ bins.', type: TaskType.TASK, points: 5, est: 8 },
    { title: 'Sensor firmware OTA update trigger', description: 'Backend endpoint and job to trigger over-the-air firmware updates for a fleet of sensors.', type: TaskType.STORY, points: 8, est: 16 },
    { title: 'Data retention & GDPR-style deletion job', description: 'Scheduled job to purge citizen report photos and personal data past retention.', type: TaskType.TASK, points: 5, est: 9 },
    { title: 'Dashboard KPI header (collections, misses, SLA)', description: 'Top-of-dashboard KPI cards for collections today, missed pickups and SLA compliance.', type: TaskType.STORY, points: 5, est: 9 },
    { title: 'Role management admin UI', description: 'UI for tenant admins to invite users and assign roles.', type: TaskType.STORY, points: 5, est: 10 },
    { title: 'SLA compliance analytics page', description: 'Analytics page charting collection SLA compliance per district over time.', type: TaskType.STORY, points: 8, est: 14 },
    { title: 'Push notifications for missed pickups', description: 'Notify dispatchers when a scheduled pickup is missed past its window.', type: TaskType.TASK, points: 3, est: 6 },
    { title: 'Bin heatmap of overflow hotspots', description: 'Heatmap layer highlighting districts with recurring overflow to guide bin placement.', type: TaskType.STORY, points: 5, est: 11 },
    { title: 'Sensor calibration workflow', description: 'Workflow for field crews to calibrate a sensor and record the offset.', type: TaskType.TASK, points: 3, est: 7 },
    { title: 'Secrets management with Vault', description: 'Move API secrets and DB credentials into HashiCorp Vault.', type: TaskType.TASK, points: 5, est: 9 },
    { title: 'Structured logging & request tracing', description: 'Add structured JSON logs and correlation IDs across the API.', type: TaskType.TASK, points: 3, est: 6 },
    { title: 'Citizen report status push to reporter', description: 'Notify the citizen when their reported bin has been collected.', type: TaskType.STORY, points: 5, est: 9 },
    { title: 'Offline mode for driver app', description: 'Cache the assigned route so drivers keep working through dead zones.', type: TaskType.STORY, points: 8, est: 17 },
    { title: 'Bulk sensor import from CSV', description: 'Import a fleet of sensors from a CSV with validation and a dry-run.', type: TaskType.TASK, points: 3, est: 6 },
    { title: 'Multi-language email templates', description: 'French and Arabic templates for the notification emails.', type: TaskType.TASK, points: 3, est: 8 },
    { title: 'Dashboard dark mode', description: 'Dark theme for the operations dashboard with persisted preference.', type: TaskType.TASK, points: 2, est: 5 },
    { title: 'Truck live-location tracking', description: 'Show collection trucks moving live on the dispatcher map via GPS pings.', type: TaskType.STORY, points: 8, est: 15 },
  ];

  const bulkSprints = [sprints.s1, sprints.s2, sprints.s3];
  const bulkEpics = [epics.platform, epics.iot, epics.routing, epics.citizen];
  for (let i = 0; i < completedTemplates.length; i++) {
    const tpl = completedTemplates[i];
    const sprint = bulkSprints[i % bulkSprints.length];
    // Realistic estimation error: ratio centered near 1 but with real spread (0.7–1.7).
    const ratio = round1(0.7 + rng() * 1.0);
    const actual = round1(Math.max(0.5, tpl.est * ratio));
    const assignee = pick(devMembers);
    const completedAt = new Date(sprint.endDate.getTime() - randInt(0, 6) * day);
    await prisma.task.create({ data: {
      projectId: nadhif.id, key: nextKey(), title: tpl.title, description: tpl.description,
      type: tpl.type, priority: pick([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH]),
      status: 'DONE', reporterId: U.devpm.id, assigneeId: assignee, sprintId: sprint.id, epicId: pick(bulkEpics).id,
      storyPoints: tpl.points, estimatedHours: tpl.est, actualHours: actual, progressPercent: 100,
      completedAt, displayOrder: 20 + i,
    } });
  }
  console.log(`✅ Nadhif tasks (${keyCounter} total, incl. ${completedTemplates.length} bulk completed)`);

  // ─── A few tasks in the other AGILE projects ───────────────────────────────────
  let bKey = 0;
  const nextBKey = () => `BLD-${++bKey}`;
  const baladeyaTasks = [
    { title: 'Citizen SSO via national e-ID', desc: 'Integrate login with the national digital identity provider.', status: 'IN_PROGRESS', pts: 13, est: 26, act: 12, prog: 45, assignee: U.fullstack.id },
    { title: 'Online permit application form', desc: 'Multi-step form to apply for construction permits with document upload.', status: 'TODO', pts: 8, est: 16, act: 0, prog: 0, assignee: U.frontend.id },
    { title: 'Complaint tracking with status timeline', desc: 'Citizens submit complaints and follow their resolution status.', status: 'DONE', pts: 8, est: 15, act: 17, prog: 100, assignee: U.fullstack.id },
    { title: 'Online payment via e-Dinar', desc: 'Integrate the e-Dinar / bank payment gateway for municipal fees.', status: 'TODO', pts: 8, est: 18, act: 0, prog: 0, assignee: U.fullstack.id },
  ];
  for (let i = 0; i < baladeyaTasks.length; i++) {
    const t = baladeyaTasks[i];
    await prisma.task.create({ data: {
      projectId: baladeya.id, key: nextBKey(), title: t.title, description: t.desc,
      type: TaskType.STORY, priority: TaskPriority.HIGH, status: t.status, reporterId: U.devpm.id, assigneeId: t.assignee,
      storyPoints: t.pts, estimatedHours: t.est, actualHours: t.act, progressPercent: t.prog,
      completedAt: t.status === 'DONE' ? daysAgo(10) : null, displayOrder: i + 1,
    } });
  }
  console.log('✅ Baladeya tasks');

  // ─── Time entries (link work to tasks; consistent with actualHours) ────────────
  await prisma.taskTimeEntry.createMany({ data: [
    { taskId: t_auth.id, userId: U.backend.id, hours: 6, description: 'Access/refresh token flow' },
    { taskId: t_auth.id, userId: U.backend.id, hours: 7.5, description: 'Rotation + revocation + tests' },
    { taskId: t_mqtt.id, userId: U.backend.id, hours: 12, description: 'MQTT broker + subscriber' },
    { taskId: t_mqtt.id, userId: U.backend.id, hours: 10, description: 'Redis Streams buffering' },
    { taskId: t_mqtt.id, userId: U.backend.id, hours: 7, description: 'Load testing to 5k msg/min' },
    { taskId: t_dash.id, userId: U.frontend.id, hours: 14, description: 'Mapbox map + live layer' },
    { taskId: t_dash.id, userId: U.frontend.id, hours: 11, description: 'WebSocket wiring + polish' },
    { taskId: t_route.id, userId: U.fullstack.id, hours: 12, description: 'OR-Tools VRP model' },
    { taskId: t_route.id, userId: U.fullstack.id, hours: 10, description: 'Capacity + time windows' },
    { taskId: t_citizen.id, userId: U.mobile.id, hours: 15.5, description: 'Report screen + upload' },
  ] });
  console.log('✅ Task time entries');

  // ─── Work days & sessions (recent, for tracking module) ─────────────────────────
  const trackedUsers = [U.backend, U.frontend, U.fullstack, U.devops, U.mobile, U.qa];
  const moods = ['Focused day, good flow.', 'Lots of meetings but shipped a PR.', 'Blocked for a bit, resolved by EOD.', 'Great progress on the route engine.', 'Onsite today, paired with the team.'];
  for (let d = 1; d <= 12; d++) {
    const base = daysAgo(d);
    if (base.getUTCDay() === 0 || base.getUTCDay() === 6) continue; // skip weekends
    for (const user of trackedUsers) {
      if (rng() > 0.85) continue; // occasional day off
      const onsite = rng() > 0.6;
      const workDay = await prisma.workDay.create({ data: {
        userId: user.id, performanceRating: randInt(3, 5), dailyMood: randInt(3, 5), workerNotes: pick(moods),
      } });
      await prisma.workSession.create({ data: {
        workDayId: workDay.id, device: WorkSessionDevice.DESKTOP,
        location: onsite ? WorkSessionLocation.ONSITE : WorkSessionLocation.REMOTE,
        startTime: at(base, 9), endTime: at(base, 13), timeSpentInMinutes: 240,
      } });
      await prisma.workSession.create({ data: {
        workDayId: workDay.id, device: WorkSessionDevice.DESKTOP,
        location: onsite ? WorkSessionLocation.ONSITE : WorkSessionLocation.REMOTE,
        startTime: at(base, 14), endTime: at(base, 18, 30), timeSpentInMinutes: 270,
      } });
    }
  }
  console.log('✅ Work days & sessions');

  // ─── Personal tasks ─────────────────────────────────────────────────────────
  const personal: { user: { id: string }; title: string; desc: string; status: UserTaskStatus; prio: UserTaskPriority; due: number; remind?: number }[] = [
    { user: U.backend, title: 'Review Youssef\'s MR on token rotation', desc: 'Code review for the refresh-token PR.', status: UserTaskStatus.InProgress, prio: UserTaskPriority.High, due: 1, remind: 0 },
    { user: U.backend, title: 'Upgrade Prisma to latest 7.x', desc: 'Check breaking changes and migrate.', status: UserTaskStatus.Pending, prio: UserTaskPriority.Medium, due: 4 },
    { user: U.frontend, title: 'Investigate WebSocket reconnect', desc: 'Pair with QA to reproduce the dashboard freeze.', status: UserTaskStatus.InProgress, prio: UserTaskPriority.High, due: 2, remind: 1 },
    { user: U.devops, title: 'Renew SSL cert for staging', desc: 'Cert expires soon; renew and automate.', status: UserTaskStatus.Pending, prio: UserTaskPriority.High, due: 3, remind: 2 },
    { user: U.mobile, title: 'Test citizen app on low-end Android', desc: 'Verify photo upload on a 3G budget device.', status: UserTaskStatus.Pending, prio: UserTaskPriority.Medium, due: 5 },
    { user: U.qa, title: 'Write regression suite for alerts', desc: 'Cover the sensor-flapping dedupe fix.', status: UserTaskStatus.Pending, prio: UserTaskPriority.Medium, due: 6 },
    { user: U.designer, title: 'Prepare 3 logo directions for Délice', desc: 'Concepts for the client review meeting.', status: UserTaskStatus.InProgress, prio: UserTaskPriority.High, due: 2, remind: 1 },
    { user: U.intern, title: 'Finish VRP solver unit tests', desc: 'Reach coverage on capacity & time-window constraints.', status: UserTaskStatus.Pending, prio: UserTaskPriority.Low, due: 7 },
  ];
  for (let i = 0; i < personal.length; i++) {
    const p = personal[i];
    await prisma.userTask.create({ data: {
      userId: p.user.id, status: p.status, priority: p.prio,
      dueDate: daysFromNow(p.due), reminderDate: p.remind !== undefined ? daysFromNow(p.remind) : null,
      displayOrder: i + 1,
      content: { create: { title: p.title, description: p.desc, language: Language.English } },
    } });
  }
  console.log('✅ Personal tasks');

  // ─── Reminders (rich: every entity type, channel mix, status mix, recurring) ────
  await prisma.reminder.create({ data: { userId: U.devpm.id, createdById: U.devpm.id, entityType: ReminderEntityType.MILESTONE, milestoneId: milestones.beta.id, projectId: nadhif.id, message: 'Beta milestone (route optimization) is due soon — check the burndown.', reminderAt: daysFromNow(17), status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.EMAIL }, { channel: ChannelType.PUSH }] } } });
  await prisma.reminder.create({ data: { userId: U.fullstack.id, createdById: U.devpm.id, entityType: ReminderEntityType.TASK, taskId: t_route.id, projectId: nadhif.id, message: 'Route engine: aim to hit 70% by end of sprint.', reminderAt: daysFromNow(3), status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.PUSH }, { channel: ChannelType.TELEGRAM }] } } });
  await prisma.reminder.create({ data: { userId: U.frontend.id, createdById: U.qa.id, entityType: ReminderEntityType.TASK, taskId: t_bug.id, projectId: nadhif.id, message: 'WebSocket disconnect bug is blocking the demo — priority.', reminderAt: daysFromNow(1), status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.PUSH }] } } });
  await prisma.reminder.create({ data: { userId: U.devpm.id, createdById: U.devpm.id, entityType: ReminderEntityType.SPRINT, projectId: nadhif.id, entityId: sprints.s4.id, message: 'Sprint 4 review meeting — prepare the demo.', reminderAt: daysFromNow(8), isRecurring: false, status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.EMAIL }] } } });
  await prisma.reminder.create({ data: { userId: U.devops.id, createdById: U.devops.id, entityType: ReminderEntityType.CUSTOM, message: 'Rotate production database credentials.', reminderAt: daysFromNow(5), isRecurring: true, recurrenceRule: 'FREQ=MONTHLY;BYMONTHDAY=1', status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.NTFY }] } } });
  await prisma.reminder.create({ data: { userId: U.backend.id, createdById: U.backend.id, entityType: ReminderEntityType.CUSTOM, message: 'Weekly dependency & security audit.', reminderAt: daysFromNow(2), isRecurring: true, recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO', status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.EMAIL }, { channel: ChannelType.PUSH }] } } });
  await prisma.reminder.create({ data: { userId: U.creativepm.id, createdById: U.creativepm.id, entityType: ReminderEntityType.PROJECT, projectId: delice.id, message: 'Délice concept review with the client tomorrow.', reminderAt: daysFromNow(1), status: ReminderStatus.PENDING, channels: { create: [{ channel: ChannelType.EMAIL }, { channel: ChannelType.TELEGRAM }] } } });
  // Past / delivered reminders for realism.
  await prisma.reminder.create({ data: { userId: U.devpm.id, createdById: U.devpm.id, entityType: ReminderEntityType.MILESTONE, milestoneId: milestones.mvp.id, projectId: nadhif.id, message: 'MVP pilot demo day.', reminderAt: daysAgo(31), status: ReminderStatus.SENT, sentAt: daysAgo(31), channels: { create: [{ channel: ChannelType.EMAIL }] } } });
  await prisma.reminder.create({ data: { userId: U.frontend.id, createdById: U.devpm.id, entityType: ReminderEntityType.TASK, taskId: t_dash.id, projectId: nadhif.id, message: 'Dashboard due for review.', reminderAt: daysAgo(86), status: ReminderStatus.SENT, sentAt: daysAgo(86), channels: { create: [{ channel: ChannelType.PUSH }] } } });
  await prisma.reminder.create({ data: { userId: U.intern.id, createdById: U.devpm.id, entityType: ReminderEntityType.CUSTOM, message: 'Submit weekly timesheet.', reminderAt: daysAgo(3), status: ReminderStatus.DISMISSED, dismissedAt: daysAgo(3), channels: { create: [{ channel: ChannelType.PUSH }] } } });
  console.log('✅ Reminders');

  // ─── Summary ──────────────────────────────────────────────────────────────────
  const counts = {
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    tasks: await prisma.task.count(),
    doneTasks: await prisma.task.count({ where: { status: 'DONE', actualHours: { gt: 0 } } }),
    comments: await prisma.taskComment.count(),
    sprints: await prisma.sprint.count(),
    reminders: await prisma.reminder.count(),
    workSessions: await prisma.workSession.count(),
    personalTasks: await prisma.userTask.count(),
  };

  console.log('\n🎉 Seed complete!\n');
  console.table(counts);
  console.log('\nLogin — all accounts use password: password123');
  console.log('  CEO             → mohamed@tawer.tn');
  console.log('  CTO             → sami@tawer.tn');
  console.log('  CMO             → leila@tawer.tn');
  console.log('  Dev PM          → nadia@tawer.tn');
  console.log('  Backend Dev     → youssef@tawer.tn');
  console.log('  Frontend Dev    → emna@tawer.tn');
  console.log('  Full-stack Dev  → wassim@tawer.tn');
  console.log('  DevOps          → khaled@tawer.tn');
  console.log('  QA              → amine@tawer.tn');
  console.log('  Mobile Dev      → firas@tawer.tn');
  console.log('  Dev Intern      → bilel@tawer.tn');
  console.log('  Creative PM     → salma@tawer.tn');
  console.log('  UI/UX Designer  → rania@tawer.tn');
  console.log('  Graphic Design  → oussama@tawer.tn');
  console.log('  Content Writer  → ines@tawer.tn');
  console.log('  HR Manager      → maha@tawer.tn');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
