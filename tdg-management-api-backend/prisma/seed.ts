import { PrismaClient, UserType, EventType, EventColor, UserTaskStatus, UserTaskPriority, WorkSessionLocation, WorkSessionDevice, ServerServiceStatus, Language, ProjectStatus, BusinessUnit, ProjectType, SprintStatus, TaskType, TaskPriority, ReminderEntityType, ReminderStatus, ChannelType } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

async function hash(password: string) {
  return bcrypt.hash(password, 10);
}

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ───────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'ceo@tdg.com' },
      update: {},
      create: {
        email: 'ceo@tdg.com',
        phone: '+39300000001',
        name: 'Marco Rossi',
        unaccentedName: 'Marco Rossi',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.CEO } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'cto@tdg.com' },
      update: {},
      create: {
        email: 'cto@tdg.com',
        phone: '+39300000002',
        name: 'Luca Ferrari',
        unaccentedName: 'Luca Ferrari',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.CTO } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'devpm@tdg.com' },
      update: {},
      create: {
        email: 'devpm@tdg.com',
        phone: '+39300000003',
        name: 'Sofia Bianchi',
        unaccentedName: 'Sofia Bianchi',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.TawerDevProjectManager } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'backend@tdg.com' },
      update: {},
      create: {
        email: 'backend@tdg.com',
        phone: '+39300000004',
        name: 'Alessandro Conti',
        unaccentedName: 'Alessandro Conti',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.BackendDeveloper } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'frontend@tdg.com' },
      update: {},
      create: {
        email: 'frontend@tdg.com',
        phone: '+39300000005',
        name: 'Giulia Ricci',
        unaccentedName: 'Giulia Ricci',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.FrontendDeveloper } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'devops@tdg.com' },
      update: {},
      create: {
        email: 'devops@tdg.com',
        phone: '+39300000006',
        name: 'Matteo Marino',
        unaccentedName: 'Matteo Marino',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.DevopsEngineer } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'designer@tdg.com' },
      update: {},
      create: {
        email: 'designer@tdg.com',
        phone: '+39300000007',
        name: 'Chiara Esposito',
        unaccentedName: 'Chiara Esposito',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.UiUxDesigner } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
    prisma.user.upsert({
      where: { email: 'intern@tdg.com' },
      update: {},
      create: {
        email: 'intern@tdg.com',
        phone: '+39300000008',
        name: 'Davide Romano',
        unaccentedName: 'Davide Romano',
        password: await hash('password123'),
        isActive: true,
        roles: { create: { type: UserType.TawerDevIntern } },
        notificationSettings: { create: {} },
        telegramBot: { create: {} },
        ntfyIntegration: { create: {} },
      },
    }),
  ]);

  const [ceo, cto, devPm, backend, frontend, devops, designer, intern] = users;
  console.log(`✅ Created ${users.length} users`);

  // ─── Manager relationships ────────────────────────────────────────────────────
  await prisma.userManager.createMany({
    skipDuplicates: true,
    data: [
      { userId: devPm.id, managerId: cto.id },
      { userId: backend.id, managerId: devPm.id },
      { userId: frontend.id, managerId: devPm.id },
      { userId: devops.id, managerId: cto.id },
      { userId: designer.id, managerId: devPm.id },
      { userId: intern.id, managerId: devPm.id },
    ],
  });
  console.log('✅ Created manager relationships');

  // ─── Teams ────────────────────────────────────────────────────────────────────
  const devTeam = await prisma.team.upsert({
    where: { name: 'Tawer Dev' },
    update: {},
    create: {
      name: 'Tawer Dev',
      unaccentedName: 'Tawer Dev',
      members: {
        createMany: {
          skipDuplicates: true,
          data: [
            { userId: devPm.id, isManager: true },
            { userId: backend.id },
            { userId: frontend.id },
            { userId: devops.id },
            { userId: intern.id },
          ],
        },
      },
    },
  });

  const designTeam = await prisma.team.upsert({
    where: { name: 'Tawer Creative' },
    update: {},
    create: {
      name: 'Tawer Creative',
      unaccentedName: 'Tawer Creative',
      members: {
        createMany: {
          skipDuplicates: true,
          data: [{ userId: designer.id, isManager: true }],
        },
      },
    },
  });
  console.log('✅ Created teams');

  // ─── Servers & Services ───────────────────────────────────────────────────────
  const prodServer = await prisma.server.create({
    data: {
      name: 'Production Server',
      ip: '192.168.1.100',
      domain: 'api.tdg.com',
      description: 'Main production server',
      cpus: '8 vCPU',
      ram: '16 GB',
      storage: '200 GB SSD',
      bandwidth: '1 Gbps',
      status: ServerServiceStatus.Running,
      paid: true,
      paidAt: new Date('2026-01-01'),
      expiredAt: new Date('2027-01-01'),
      managers: {
        create: { managerId: devops.id },
      },
      services: {
        create: [
          {
            name: 'NestJS API',
            domain: 'api.tdg.com',
            description: 'Main backend API',
            status: ServerServiceStatus.Running,
            sslCertificate: true,
            hasBackup: true,
            backupDestination: 's3://tdg-backups/api',
          },
          {
            name: 'PostgreSQL',
            description: 'Main database service',
            status: ServerServiceStatus.Running,
            hasBackup: true,
            backupDestination: 's3://tdg-backups/db',
          },
          {
            name: 'Redis Cache',
            description: 'Caching and session store',
            status: ServerServiceStatus.Running,
          },
        ],
      },
    },
  });

  await prisma.server.create({
    data: {
      name: 'Staging Server',
      ip: '192.168.1.101',
      domain: 'staging.tdg.com',
      description: 'Pre-production staging environment',
      cpus: '4 vCPU',
      ram: '8 GB',
      storage: '100 GB SSD',
      status: ServerServiceStatus.Running,
      managers: { create: { managerId: devops.id } },
      services: {
        create: [
          {
            name: 'NestJS API (Staging)',
            domain: 'staging.tdg.com',
            status: ServerServiceStatus.Running,
            sslCertificate: true,
          },
        ],
      },
    },
  });
  console.log('✅ Created servers & services');

  // ─── Events ───────────────────────────────────────────────────────────────────
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 86400000);
  const nextWeek = new Date(now.getTime() + 7 * 86400000);

  const sprintEvent = await prisma.event.create({
    data: {
      type: EventType.Meeting,
      color: EventColor.Sky,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 3600000),
      nextNotificationTime: tomorrow,
      toAllUsers: false,
      createdById: devPm.id,
      content: {
        createMany: {
          data: [
            { title: 'Sprint Planning', description: 'Q3 sprint kickoff meeting', language: Language.English },
          ],
        },
      },
      participants: {
        createMany: {
          data: [
            { userId: cto.id },
            { userId: backend.id },
            { userId: frontend.id },
            { userId: intern.id },
          ],
        },
      },
    },
  });

  await prisma.event.create({
    data: {
      type: EventType.Event,
      color: EventColor.Emerald,
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 7200000),
      nextNotificationTime: nextWeek,
      toAllUsers: true,
      createdById: ceo.id,
      content: {
        createMany: {
          data: [
            { title: 'Company All-Hands', description: 'Monthly company update and Q&A', language: Language.English },
          ],
        },
      },
    },
  });
  console.log('✅ Created events');

  // ─── Personal Tasks ───────────────────────────────────────────────────────────
  const dueDate = new Date(now.getTime() + 3 * 86400000);

  await prisma.userTask.create({
    data: {
      userId: backend.id,
      status: UserTaskStatus.InProgress,
      priority: UserTaskPriority.High,
      dueDate,
      displayOrder: 1,
      content: {
        create: {
          title: 'Implement JWT refresh token rotation',
          description: 'Update the auth module to rotate refresh tokens on each use',
          language: Language.English,
        },
      },
    },
  });

  await prisma.userTask.create({
    data: {
      userId: frontend.id,
      status: UserTaskStatus.Pending,
      priority: UserTaskPriority.Medium,
      dueDate: new Date(now.getTime() + 5 * 86400000),
      displayOrder: 1,
      content: {
        create: {
          title: 'Build dashboard analytics page',
          description: 'Create charts and KPI widgets for the main dashboard',
          language: Language.English,
        },
      },
    },
  });

  await prisma.userTask.create({
    data: {
      userId: devops.id,
      status: UserTaskStatus.Pending,
      priority: UserTaskPriority.High,
      dueDate: new Date(now.getTime() + 2 * 86400000),
      displayOrder: 1,
      content: {
        create: {
          title: 'Set up CI/CD pipeline for staging',
          description: 'Configure Jenkins pipeline for automatic deploys to staging',
          language: Language.English,
        },
      },
    },
  });

  await prisma.userTask.create({
    data: {
      userId: intern.id,
      status: UserTaskStatus.Pending,
      priority: UserTaskPriority.Low,
      dueDate: new Date(now.getTime() + 7 * 86400000),
      displayOrder: 1,
      content: {
        create: {
          title: 'Write unit tests for auth module',
          description: 'Achieve 80% code coverage on the auths module',
          language: Language.English,
        },
      },
    },
  });
  console.log('✅ Created personal tasks');

  // ─── Work Days & Sessions ─────────────────────────────────────────────────────
  const yesterday = new Date(now.getTime() - 86400000);

  for (const user of [backend, frontend, devops, designer]) {
    const workDay = await prisma.workDay.create({
      data: {
        userId: user.id,
        performanceRating: Math.floor(Math.random() * 3) + 3, // 3–5
        dailyMood: Math.floor(Math.random() * 3) + 3,
        workerNotes: 'Solid day, good progress on current tasks.',
      },
    });

    await prisma.workSession.create({
      data: {
        workDayId: workDay.id,
        device: WorkSessionDevice.DESKTOP,
        location: WorkSessionLocation.REMOTE,
        startTime: new Date(yesterday.setHours(9, 0, 0, 0)),
        endTime: new Date(yesterday.setHours(13, 0, 0, 0)),
        timeSpentInMinutes: 240,
      },
    });

    await prisma.workSession.create({
      data: {
        workDayId: workDay.id,
        device: WorkSessionDevice.DESKTOP,
        location: WorkSessionLocation.REMOTE,
        startTime: new Date(yesterday.setHours(14, 0, 0, 0)),
        endTime: new Date(yesterday.setHours(18, 0, 0, 0)),
        timeSpentInMinutes: 240,
      },
    });
  }
  console.log('✅ Created work days & sessions');

  // ─── Notifications ────────────────────────────────────────────────────────────
  const notification = await prisma.notification.create({
    data: {
      sendBy: ceo.id,
      content: {
        createMany: {
          data: [
            {
              title: 'Welcome to TDG Management',
              body: 'The platform is live. Start tracking your work sessions and tasks.',
              language: Language.English,
            },
          ],
        },
      },
    },
  });

  await prisma.userNotification.createMany({
    skipDuplicates: true,
    data: users.map((u) => ({
      userId: u.id,
      notificationId: notification.id,
    })),
  });
  console.log('✅ Created notifications');

  // ─── Projects ─────────────────────────────────────────────────────────────────
  const now2 = new Date();
  const projectStart = new Date('2026-01-01');
  const projectEnd = new Date('2026-12-31');

  const devProject = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerDev,
      projectType: ProjectType.AGILE,
      paid: true,
      startDate: projectStart,
      endDate: projectEnd,
      estimatedStartDate: new Date('2025-12-01'),
      estimatedEndDate: new Date('2026-12-31'),
      displayOrder: 1,
      createdById: devPm.id,
      contents: {
        create: {
          name: 'TDG Management Platform',
          unaccentedName: 'TDG Management Platform',
          description: 'Internal management platform for teams, projects and infrastructure.',
          language: Language.English,
        },
      },
      members: {
        createMany: {
          data: [
            { userId: devPm.id, isManager: true },
            { userId: backend.id },
            { userId: frontend.id },
            { userId: devops.id },
            { userId: intern.id },
          ],
        },
      },
      labels: {
        createMany: {
          data: [
            { name: 'frontend', color: '#3B82F6' },
            { name: 'backend', color: '#10B981' },
            { name: 'devops', color: '#F59E0B' },
            { name: 'bug', color: '#EF4444' },
            { name: 'enhancement', color: '#8B5CF6' },
          ],
        },
      },
      taskStatuses: {
        createMany: {
          data: [
            { name: 'BACKLOG', color: '#6B7280', order: 0, isSystem: true },
            { name: 'TODO', color: '#3B82F6', order: 1, isSystem: true, isDefault: true },
            { name: 'IN_PROGRESS', color: '#F59E0B', order: 2, isSystem: true },
            { name: 'IN_REVIEW', color: '#8B5CF6', order: 3, isSystem: true },
            { name: 'TESTING', color: '#EC4899', order: 4, isSystem: true },
            { name: 'DONE', color: '#10B981', order: 5, isSystem: true },
          ],
        },
      },
    },
  });

  const creativeProject = await prisma.project.create({
    data: {
      status: ProjectStatus.Running,
      businessUnit: BusinessUnit.TawerCreative,
      projectType: ProjectType.FREESTYLE,
      startDate: projectStart,
      endDate: projectEnd,
      estimatedStartDate: new Date('2026-01-15'),
      estimatedEndDate: new Date('2026-09-30'),
      displayOrder: 2,
      createdById: ceo.id,
      contents: {
        create: {
          name: 'Brand Redesign 2026',
          unaccentedName: 'Brand Redesign 2026',
          description: 'Full rebrand of company visual identity and design system.',
          language: Language.English,
        },
      },
      members: {
        createMany: {
          data: [
            { userId: designer.id, isManager: true },
            { userId: ceo.id },
          ],
        },
      },
    },
  });
  console.log('✅ Created projects');

  // ─── Epics ────────────────────────────────────────────────────────────────────
  const epicAuth = await prisma.epic.create({
    data: {
      projectId: devProject.id,
      name: 'Authentication & Authorization',
      description: 'JWT auth, roles, permissions, OAuth integrations.',
      color: '#3B82F6',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
    },
  });

  const epicInfra = await prisma.epic.create({
    data: {
      projectId: devProject.id,
      name: 'Infrastructure & DevOps',
      description: 'CI/CD pipelines, server monitoring, deployments.',
      color: '#F59E0B',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-06-30'),
    },
  });

  const epicProjects = await prisma.epic.create({
    data: {
      projectId: devProject.id,
      name: 'Project Management Module',
      description: 'Full agile project management with sprints, tasks, epics.',
      color: '#10B981',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-08-31'),
    },
  });
  console.log('✅ Created epics');

  // ─── Milestones ───────────────────────────────────────────────────────────────
  const milestoneMvp = await prisma.milestone.create({
    data: {
      projectId: devProject.id,
      name: 'MVP Release',
      description: 'Minimum viable product with auth, users, and projects.',
      dueDate: new Date('2026-03-31'),
    },
  });

  const milestoneBeta = await prisma.milestone.create({
    data: {
      projectId: devProject.id,
      name: 'Beta Launch',
      description: 'Full agile module, notifications, and reporting.',
      dueDate: new Date('2026-07-01'),
    },
  });
  console.log('✅ Created milestones');

  // ─── Sprints ──────────────────────────────────────────────────────────────────
  const sprint1 = await prisma.sprint.create({
    data: {
      projectId: devProject.id,
      createdById: devPm.id,
      status: SprintStatus.Completed,
      capacity: 40,
      startDate: new Date('2026-01-06'),
      endDate: new Date('2026-01-17'),
      estimatedStartDate: new Date('2026-01-06'),
      estimatedEndDate: new Date('2026-01-17'),
      contents: {
        create: {
          name: 'Sprint 1 - Auth Foundation',
          unaccentedName: 'Sprint 1 - Auth Foundation',
          description: 'Set up auth, users, roles and basic API structure.',
          language: Language.English,
        },
      },
    },
  });

  const sprint2 = await prisma.sprint.create({
    data: {
      projectId: devProject.id,
      createdById: devPm.id,
      status: SprintStatus.Running,
      capacity: 45,
      startDate: new Date('2026-06-16'),
      endDate: new Date('2026-06-27'),
      estimatedStartDate: new Date('2026-06-16'),
      estimatedEndDate: new Date('2026-06-27'),
      contents: {
        create: {
          name: 'Sprint 2 - Project Module',
          unaccentedName: 'Sprint 2 - Project Module',
          description: 'Implement project CRUD, members, sprints and tasks.',
          language: Language.English,
        },
      },
    },
  });
  console.log('✅ Created sprints');

  // ─── Tasks ────────────────────────────────────────────────────────────────────
  const task1 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-1',
      title: 'Implement JWT authentication',
      type: TaskType.STORY,
      priority: TaskPriority.HIGH,
      status: 'DONE',
      reporterId: devPm.id,
      assigneeId: backend.id,
      sprintId: sprint1.id,
      epicId: epicAuth.id,
      storyPoints: 8,
      estimatedHours: 12,
      actualHours: 10,
      progressPercent: 100,
      completedAt: new Date('2026-01-14'),
      displayOrder: 1,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-2',
      title: 'Build role & permission system',
      type: TaskType.STORY,
      priority: TaskPriority.HIGH,
      status: 'DONE',
      reporterId: devPm.id,
      assigneeId: backend.id,
      sprintId: sprint1.id,
      epicId: epicAuth.id,
      storyPoints: 5,
      estimatedHours: 8,
      actualHours: 9,
      progressPercent: 100,
      completedAt: new Date('2026-01-16'),
      displayOrder: 2,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-3',
      title: 'Project CRUD endpoints',
      type: TaskType.STORY,
      priority: TaskPriority.HIGH,
      status: 'IN_PROGRESS',
      reporterId: devPm.id,
      assigneeId: backend.id,
      sprintId: sprint2.id,
      epicId: epicProjects.id,
      milestoneId: milestoneMvp.id,
      storyPoints: 8,
      estimatedHours: 14,
      actualHours: 6,
      progressPercent: 50,
      displayOrder: 1,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-4',
      title: 'Sprint management API',
      type: TaskType.TASK,
      priority: TaskPriority.MEDIUM,
      status: 'TODO',
      reporterId: devPm.id,
      assigneeId: backend.id,
      sprintId: sprint2.id,
      epicId: epicProjects.id,
      storyPoints: 5,
      estimatedHours: 8,
      actualHours: 0,
      progressPercent: 0,
      displayOrder: 2,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-5',
      title: 'Projects dashboard UI',
      type: TaskType.STORY,
      priority: TaskPriority.HIGH,
      status: 'IN_PROGRESS',
      reporterId: devPm.id,
      assigneeId: frontend.id,
      sprintId: sprint2.id,
      epicId: epicProjects.id,
      storyPoints: 13,
      estimatedHours: 20,
      actualHours: 8,
      progressPercent: 40,
      displayOrder: 3,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-6',
      title: 'Set up CI/CD pipeline',
      type: TaskType.TASK,
      priority: TaskPriority.URGENT,
      status: 'IN_REVIEW',
      reporterId: cto.id,
      assigneeId: devops.id,
      sprintId: sprint2.id,
      epicId: epicInfra.id,
      storyPoints: 8,
      estimatedHours: 16,
      actualHours: 14,
      progressPercent: 90,
      displayOrder: 4,
    },
  });

  const task7 = await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-7',
      title: 'Fix login redirect bug',
      type: TaskType.BUG,
      priority: TaskPriority.URGENT,
      status: 'TODO',
      reporterId: frontend.id,
      assigneeId: frontend.id,
      sprintId: sprint2.id,
      storyPoints: 2,
      estimatedHours: 2,
      actualHours: 0,
      displayOrder: 5,
    },
  });

  // Backlog task (no sprint)
  await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-8',
      title: 'Add Stripe payment integration',
      type: TaskType.EPIC,
      priority: TaskPriority.LOW,
      status: 'BACKLOG',
      reporterId: devPm.id,
      epicId: epicProjects.id,
      storyPoints: 21,
      estimatedHours: 40,
      actualHours: 0,
      displayOrder: 6,
    },
  });

  // Subtask
  await prisma.task.create({
    data: {
      projectId: devProject.id,
      key: 'TDG-9',
      title: 'Write unit tests for project endpoints',
      type: TaskType.TASK,
      priority: TaskPriority.MEDIUM,
      status: 'TODO',
      reporterId: devPm.id,
      assigneeId: intern.id,
      sprintId: sprint2.id,
      parentTaskId: task3.id,
      storyPoints: 3,
      estimatedHours: 4,
      actualHours: 0,
      displayOrder: 1,
    },
  });

  // Task comment
  await prisma.taskComment.create({
    data: {
      taskId: task3.id,
      authorId: backend.id,
      content: 'Started on the GET /projects endpoint, should be done by tomorrow.',
    },
  });

  await prisma.taskComment.create({
    data: {
      taskId: task6.id,
      authorId: devops.id,
      content: 'Jenkins pipeline is configured. Waiting for code review before merging.',
    },
  });

  // Task dependency: task4 is blocked by task3
  await prisma.taskDependency.create({
    data: {
      blockingTaskId: task3.id,
      blockedTaskId: task4.id,
      dependencyType: 'blocks',
    },
  });
  console.log('✅ Created tasks, comments & dependencies');

  // ─── Reminders ────────────────────────────────────────────────────────────────
  await prisma.reminder.create({
    data: {
      userId: devPm.id,
      createdById: devPm.id,
      entityType: ReminderEntityType.MILESTONE,
      milestoneId: milestoneMvp.id,
      projectId: devProject.id,
      message: 'MVP deadline is approaching — review outstanding tasks.',
      reminderAt: new Date('2026-03-25'),
      status: ReminderStatus.PENDING,
      channels: { create: [{ channel: ChannelType.EMAIL }, { channel: ChannelType.PUSH }] },
    },
  });

  await prisma.reminder.create({
    data: {
      userId: backend.id,
      createdById: devPm.id,
      entityType: ReminderEntityType.TASK,
      taskId: task3.id,
      projectId: devProject.id,
      message: 'Project CRUD task due for review.',
      reminderAt: new Date('2026-06-24'),
      status: ReminderStatus.PENDING,
      channels: { create: [{ channel: ChannelType.PUSH }] },
    },
  });
  console.log('✅ Created reminders');

  console.log('\n🎉 Seed complete!\n');
  console.log('Credentials (all use password: password123)');
  console.log('  CEO             → ceo@tdg.com');
  console.log('  CTO             → cto@tdg.com');
  console.log('  Dev PM          → devpm@tdg.com');
  console.log('  Backend Dev     → backend@tdg.com');
  console.log('  Frontend Dev    → frontend@tdg.com');
  console.log('  DevOps          → devops@tdg.com');
  console.log('  UI/UX Designer  → designer@tdg.com');
  console.log('  Dev Intern      → intern@tdg.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
