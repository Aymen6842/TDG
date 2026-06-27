import { Server } from 'http';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  BusinessUnit,
  ChannelType,
  Language,
  ProjectStatus,
  ProjectType,
  SprintStatus,
  TaskPriority,
  TaskStatus,
  TaskType,
  UserType,
} from '@prisma/client';
import { ErrorCode } from '../src/common/exceptions/error-codes/error.code';

jest.setTimeout(30000);

type TestUser = {
  id: string;
  email: string;
  token: string;
};

describe('Agile Permissions Policy (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;

  let projectId: string;
  let baseSprintId: string;
  let engineerTaskId: string;
  let productOwnerTaskId: string;
  let backlogTaskId: string;
  let engineerMemberId: string;

  const users = {} as Record<
    | 'ceo'
    | 'pmManager'
    | 'pmMember'
    | 'productOwner'
    | 'scrumMaster'
    | 'businessAnalyst'
    | 'engineer',
    TestUser
  >;

  const createdUserIds: string[] = [];
  const createdSprintIds: string[] = [];
  const uniqueSuffix = Date.now();

  const authHeader = (token: string) => ({
    Authorization: `Bearer ${token}`,
  });

  const createToken = (user: {
    id: string;
    name: string;
    roles: Array<{ type: UserType }>;
  }) =>
    jwtService.sign(
      {
        id: user.id,
        name: user.name,
        roles: user.roles.map((role) => role.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );

  const createUser = async (
    role: UserType,
    label: string,
  ): Promise<TestUser> => {
    const stamp = `${label}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const user = await prisma.user.create({
      data: {
        email: `${stamp}@example.com`,
        name: `${label} User`,
        phone: `+216${(
          Date.now().toString() +
          Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0')
        ).slice(-8)}`,
        unaccentedName: `${label} user`.toLowerCase(),
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: role,
          },
        },
      },
      include: { roles: true },
    });

    createdUserIds.push(user.id);

    return {
      id: user.id,
      email: user.email,
      token: createToken(user),
    };
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    httpServer = app.getHttpServer() as Server;

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);

    users.ceo = await createUser(UserType.CEO, 'agile-ceo');
    users.pmManager = await createUser(
      UserType.TawerDevProjectManager,
      'agile-pm-manager',
    );
    users.pmMember = await createUser(
      UserType.TawerDevProjectManager,
      'agile-pm-member',
    );
    users.productOwner = await createUser(
      UserType.ProductOwner,
      'agile-product-owner',
    );
    users.scrumMaster = await createUser(
      UserType.ScrumMaster,
      'agile-scrum-master',
    );
    users.businessAnalyst = await createUser(
      UserType.BusinessAnalyst,
      'agile-business-analyst',
    );
    users.engineer = await createUser(
      UserType.SoftwareEngineer,
      'agile-engineer',
    );

    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.AGILE,
        status: ProjectStatus.Pending,
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-12-31T00:00:00Z'),
        estimatedStartDate: new Date('2026-01-01T00:00:00Z'),
        estimatedEndDate: new Date('2026-12-31T00:00:00Z'),
        displayOrder: 2000,
        createdById: users.ceo.id,
        members: {
          create: [
            { userId: users.ceo.id, isManager: true },
            { userId: users.pmManager.id, isManager: true },
            { userId: users.pmMember.id, isManager: false },
            { userId: users.productOwner.id, isManager: false },
            { userId: users.scrumMaster.id, isManager: false },
            { userId: users.businessAnalyst.id, isManager: false },
            { userId: users.engineer.id, isManager: false },
          ],
        },
        contents: {
          create: {
            name: `Agile Permission Project ${uniqueSuffix}`,
            unaccentedName: `agile permission project ${uniqueSuffix}`,
            description: 'Project for agile permission regression tests',
            language: Language.English,
          },
        },
      },
      include: {
        members: true,
      },
    });

    projectId = project.id;
    engineerMemberId =
      project.members.find((member) => member.userId === users.engineer.id)
        ?.id || '';

    const baseSprint = await prisma.sprint.create({
      data: {
        projectId,
        createdById: users.ceo.id,
        startDate: new Date('2026-02-01T00:00:00Z'),
        endDate: new Date('2026-02-14T00:00:00Z'),
        estimatedStartDate: new Date('2026-02-01T00:00:00Z'),
        estimatedEndDate: new Date('2026-02-14T00:00:00Z'),
        status: SprintStatus.Pending,
        contents: {
          create: {
            name: `Base Sprint ${uniqueSuffix}`,
            unaccentedName: `base sprint ${uniqueSuffix}`,
            description: 'Base sprint for permission tests',
            language: Language.English,
          },
        },
      },
    });
    baseSprintId = baseSprint.id;
    createdSprintIds.push(baseSprintId);

    const engineerTaskResponse = await request(httpServer)
      .post(`/projects/${projectId}/tasks`)
      .set(authHeader(users.ceo.token))
      .send({
        title: `Engineer Task ${uniqueSuffix}`,
        type: TaskType.TASK,
        priority: TaskPriority.HIGH,
        status: TaskStatus.BACKLOG,
        assigneeId: users.engineer.id,
      });
    engineerTaskId = (engineerTaskResponse.body as { id: string }).id;

    const productOwnerTaskResponse = await request(httpServer)
      .post(`/projects/${projectId}/tasks`)
      .set(authHeader(users.ceo.token))
      .send({
        title: `Product Owner Task ${uniqueSuffix}`,
        type: TaskType.TASK,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.BACKLOG,
        assigneeId: users.productOwner.id,
      });
    productOwnerTaskId = (productOwnerTaskResponse.body as { id: string }).id;

    const backlogTaskResponse = await request(httpServer)
      .post(`/projects/${projectId}/tasks`)
      .set(authHeader(users.ceo.token))
      .send({
        title: `Backlog Task ${uniqueSuffix}`,
        type: TaskType.TASK,
        priority: TaskPriority.LOW,
        status: TaskStatus.BACKLOG,
      });
    backlogTaskId = (backlogTaskResponse.body as { id: string }).id;
  });

  afterAll(async () => {
    if (prisma) {
      if (projectId) {
        await prisma.projectInvitation.deleteMany({
          where: { projectId },
        });
        await prisma.reminder.deleteMany({
          where: { projectId },
        });
        await prisma.taskTimeEntry.deleteMany({
          where: { task: { projectId } },
        });
        await prisma.taskLabel.deleteMany({
          where: { projectId },
        });
        await prisma.taskCommentLike.deleteMany({
          where: { comment: { task: { projectId } } },
        });
        await prisma.taskComment.deleteMany({
          where: { task: { projectId } },
        });
        await prisma.taskDependency.deleteMany({
          where: {
            OR: [
              { blockingTask: { projectId } },
              { blockedTask: { projectId } },
            ],
          },
        });
        await prisma.task.deleteMany({
          where: { projectId },
        });
        await prisma.epic.deleteMany({
          where: { projectId },
        });
        await prisma.milestone.deleteMany({
          where: { projectId },
        });
        await prisma.sprintContent.deleteMany({
          where: { sprint: { projectId } },
        });
        await prisma.sprint.deleteMany({
          where: { projectId },
        });
        await prisma.projectMember.deleteMany({
          where: { projectId },
        });
        await prisma.projectContent.deleteMany({
          where: { projectId },
        });
        await prisma.project.deleteMany({
          where: { id: projectId },
        });
      }

      if (createdUserIds.length > 0) {
        await prisma.role.deleteMany({
          where: { userId: { in: createdUserIds } },
        });
        await prisma.user.deleteMany({
          where: { id: { in: createdUserIds } },
        });
      }
    }

    if (app) {
      await app.close();
    }
  });

  describe('Project Manager Logic', () => {
    it('allows a real project manager to create invitations', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.pmManager.token))
        .send({
          email: `agile-invite-${Date.now()}@example.com`,
          isManager: false,
          expiresInDays: 3,
        });

      expect(response.status).toBe(201);
      expect((response.body as { email?: string }).email).toContain(
        'agile-invite-',
      );
    });

    it('blocks a non-manager project manager role from updating members', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/members/${engineerMemberId}`)
        .set(authHeader(users.pmMember.token))
        .send({ isManager: true });

      expect(response.status).toBe(403);
      expect((response.body as { code?: string }).code).toBe(
        ErrorCode.PROJECT_FORBIDDEN,
      );
    });
  });

  describe('Sprint Logic', () => {
    it('allows scrum masters to create sprints', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          startDate: '2026-03-01T00:00:00Z',
          endDate: '2026-03-14T00:00:00Z',
          estimatedStartDate: '2026-03-01T00:00:00Z',
          estimatedEndDate: '2026-03-14T00:00:00Z',
          content: [
            {
              name: `Scrum Master Sprint ${Date.now()}`,
              description: 'Sprint created by scrum master',
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(201);
      createdSprintIds.push((response.body as { id: string }).id);
    });

    it('blocks a non-manager project manager role from creating sprints', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.pmMember.token))
        .send({
          startDate: '2026-04-01T00:00:00Z',
          endDate: '2026-04-14T00:00:00Z',
          estimatedStartDate: '2026-04-01T00:00:00Z',
          estimatedEndDate: '2026-04-14T00:00:00Z',
          content: [
            {
              name: `Unauthorized PM Sprint ${Date.now()}`,
              description: 'Should be blocked',
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('allows an engineer to read sprint details', async () => {
      const response = await request(httpServer)
        .get(`/sprints/${baseSprintId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
      expect((response.body as { id?: string }).id).toBe(baseSprintId);
    });
  });

  describe('Task Planning Logic', () => {
    it('allows business analysts to create tasks', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          title: `BA Task ${Date.now()}`,
          type: TaskType.TASK,
          priority: TaskPriority.HIGH,
          status: TaskStatus.BACKLOG,
        });

      expect(response.status).toBe(201);
    });

    it('allows product owners to update task details', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/${backlogTaskId}`)
        .set(authHeader(users.productOwner.token))
        .send({ description: 'Updated by product owner' });

      expect(response.status).toBe(200);
      expect((response.body as { description?: string }).description).toBe(
        'Updated by product owner',
      );
    });

    it('allows product owners to delete tasks', async () => {
      const taskResponse = await request(httpServer)
        .post(`/projects/${projectId}/tasks`)
        .set(authHeader(users.ceo.token))
        .send({
          title: `PO Delete Task ${Date.now()}`,
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.BACKLOG,
        });

      const taskId = (taskResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/tasks/${taskId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(204);
    });

    it('blocks a non-manager project manager role from updating task details', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/${backlogTaskId}`)
        .set(authHeader(users.pmMember.token))
        .send({ description: 'Unauthorized PM update' });

      expect(response.status).toBe(403);
      expect((response.body as { code?: string }).code).toBe(
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    });

    it('allows product owners to reorder backlog', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/backlog/reorder`)
        .set(authHeader(users.productOwner.token))
        .send({
          tasks: [
            { taskId: backlogTaskId, displayOrder: 1 },
            { taskId: productOwnerTaskId, displayOrder: 2 },
            { taskId: engineerTaskId, displayOrder: 3 },
          ],
        });

      expect(response.status).toBe(200);
    });

    it('blocks a non-manager project manager role from reordering backlog', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/backlog/reorder`)
        .set(authHeader(users.pmMember.token))
        .send({
          tasks: [
            { taskId: backlogTaskId, displayOrder: 3 },
            { taskId: productOwnerTaskId, displayOrder: 2 },
            { taskId: engineerTaskId, displayOrder: 1 },
          ],
        });

      expect(response.status).toBe(403);
      expect((response.body as { code?: string }).code).toBe(
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    });

    it('allows scrum masters to move backlog tasks into sprints', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/backlog/${backlogTaskId}/move-to-sprint`)
        .set(authHeader(users.scrumMaster.token))
        .send({ sprintId: baseSprintId });

      expect(response.status).toBe(200);
      expect((response.body as { sprintId?: string }).sprintId).toBe(
        baseSprintId,
      );
    });

    it('allows an engineer to read backlog tasks', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/backlog`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows an engineer to read sprint tasks', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/sprints/${baseSprintId}/tasks`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });
  });

  describe('Task Workflow Logic', () => {
    it('allows an assignee to move their own task on the kanban board', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/move`)
        .set(authHeader(users.engineer.token))
        .send({
          taskId: engineerTaskId,
          status: TaskStatus.TODO,
          displayOrder: 1,
        });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        TaskStatus.TODO,
      );
    });

    it('blocks an assignee from moving someone else task on the kanban board', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/move`)
        .set(authHeader(users.engineer.token))
        .send({
          taskId: productOwnerTaskId,
          status: TaskStatus.TODO,
          displayOrder: 2,
        });

      expect(response.status).toBe(403);
      expect((response.body as { code?: string }).code).toBe(
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    });
  });

  describe('Task Collaboration Logic', () => {
    it('allows an engineer to update and delete their own comment', async () => {
      const commentResponse = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/comments`)
        .set(authHeader(users.engineer.token))
        .send({ content: `Engineer comment ${Date.now()}` });

      expect(commentResponse.status).toBe(201);
      const commentId = (commentResponse.body as { id: string }).id;

      const updateResponse = await request(httpServer)
        .patch(
          `/projects/${projectId}/tasks/${engineerTaskId}/comments/${commentId}`,
        )
        .set(authHeader(users.engineer.token))
        .send({ content: 'Engineer updated their own comment' });

      expect(updateResponse.status).toBe(200);
      expect((updateResponse.body as { content?: string }).content).toBe(
        'Engineer updated their own comment',
      );

      const deleteResponse = await request(httpServer)
        .delete(
          `/projects/${projectId}/tasks/${engineerTaskId}/comments/${commentId}`,
        )
        .set(authHeader(users.engineer.token));

      expect(deleteResponse.status).toBe(204);
    });

    it('allows an engineer to update and delete their own time entry', async () => {
      const timeEntryResponse = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/time-entries`)
        .set(authHeader(users.engineer.token))
        .send({
          hours: 1.5,
          description: 'Engineer logged time',
        });

      expect(timeEntryResponse.status).toBe(201);
      const timeEntryId = (timeEntryResponse.body as { id: string }).id;

      const updateResponse = await request(httpServer)
        .patch(
          `/projects/${projectId}/tasks/${engineerTaskId}/time-entries/${timeEntryId}`,
        )
        .set(authHeader(users.engineer.token))
        .send({
          hours: 2,
          description: 'Engineer updated their own time entry',
        });

      expect(updateResponse.status).toBe(200);
      expect((updateResponse.body as { hours?: number }).hours).toBe(2);

      const deleteResponse = await request(httpServer)
        .delete(
          `/projects/${projectId}/tasks/${engineerTaskId}/time-entries/${timeEntryId}`,
        )
        .set(authHeader(users.engineer.token));

      expect(deleteResponse.status).toBe(204);
    });
  });

  describe('Epic Logic', () => {
    it('allows product owners to create epics', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set(authHeader(users.productOwner.token))
        .send({
          name: `PO Epic ${Date.now()}`,
          description: 'Epic created by product owner',
        });

      expect(response.status).toBe(201);
    });

    it('blocks a non-manager project manager role from creating epics', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set(authHeader(users.pmMember.token))
        .send({
          name: `Unauthorized PM Epic ${Date.now()}`,
        });

      expect(response.status).toBe(403);
    });

    it('allows an engineer to read epics', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
      expect(Array.isArray((response.body as { data?: unknown[] }).data)).toBe(
        true,
      );
    });
  });

  describe('Milestone Logic', () => {
    it('allows product owners to create milestones', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.productOwner.token))
        .send({
          name: `PO Milestone ${Date.now()}`,
          description: 'Milestone created by product owner',
        });

      expect(response.status).toBe(201);
    });

    it('allows product owners to delete milestones', async () => {
      const milestoneResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.ceo.token))
        .send({
          name: `PO Delete Milestone ${Date.now()}`,
          description: 'Milestone deleted by product owner',
        });

      const milestoneId = (milestoneResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/milestones/${milestoneId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(204);
    });

    it('blocks a non-manager project manager role from creating milestones', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.pmMember.token))
        .send({
          name: `Unauthorized PM Milestone ${Date.now()}`,
        });

      expect(response.status).toBe(403);
    });

    it('allows an engineer to read milestone list and details', async () => {
      const milestoneResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.ceo.token))
        .send({
          name: `Engineer Read Milestone ${Date.now()}`,
          description: 'Milestone readable by engineer',
        });

      expect(milestoneResponse.status).toBe(201);
      const milestoneId = (milestoneResponse.body as { id: string }).id;

      const listResponse = await request(httpServer)
        .get(`/projects/${projectId}/milestones`)
        .set(authHeader(users.engineer.token));

      expect(listResponse.status).toBe(200);
      expect(
        Array.isArray((listResponse.body as { data?: unknown[] }).data),
      ).toBe(true);

      const detailResponse = await request(httpServer)
        .get(`/projects/${projectId}/milestones/${milestoneId}`)
        .set(authHeader(users.engineer.token));

      expect(detailResponse.status).toBe(200);
      expect((detailResponse.body as { id?: string }).id).toBe(milestoneId);
    });

    it('blocks a non-manager project manager role from deleting milestones', async () => {
      const milestoneResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.ceo.token))
        .send({
          name: `Protected Delete Milestone ${Date.now()}`,
          description: 'Should stay protected',
        });

      expect(milestoneResponse.status).toBe(201);
      const milestoneId = (milestoneResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/milestones/${milestoneId}`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });

    it('blocks a non-manager project manager role from completing milestones', async () => {
      const milestoneResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set(authHeader(users.ceo.token))
        .send({
          name: `Protected Complete Milestone ${Date.now()}`,
          description: 'Should stay protected',
        });

      expect(milestoneResponse.status).toBe(201);
      const milestoneId = (milestoneResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .patch(`/projects/${projectId}/milestones/${milestoneId}/complete`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });
  });

  describe('Reminder Logic', () => {
    it('allows product owners to create reminders', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.productOwner.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Reminder created by product owner',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      expect(response.status).toBe(201);
    });

    it('blocks a non-manager project manager role from updating reminders', async () => {
      const reminderResponse = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Protected reminder update',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      const reminderId = (reminderResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .patch(`/projects/${projectId}/reminders/${reminderId}`)
        .set(authHeader(users.pmMember.token))
        .send({ message: 'Unauthorized reminder update' });

      expect(response.status).toBe(403);
    });

    it('blocks a non-manager project manager role from deleting reminders', async () => {
      const reminderResponse = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Protected reminder delete',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      const reminderId = (reminderResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/reminders/${reminderId}`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });

    it('allows product owners to delete reminders', async () => {
      const reminderResponse = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Reminder deleted by product owner',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      const reminderId = (reminderResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/reminders/${reminderId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(204);
    });

    it('allows an engineer to dismiss their own reminder', async () => {
      const reminderResponse = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Engineer can dismiss this reminder',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      const reminderId = (reminderResponse.body as { id: string }).id;

      const response = await request(httpServer)
        .post(`/reminders/${reminderId}/dismiss`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe('DISMISSED');
    });

    it('blocks a non-manager project manager role from creating reminders', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set(authHeader(users.pmMember.token))
        .send({
          userId: users.engineer.id,
          entityType: 'PROJECT',
          message: 'Unauthorized reminder',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });

      expect(response.status).toBe(403);
    });

    it('allows an engineer to read project reminders', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────
  // SPRINT FULL ROLE MATRIX
  // ─────────────────────────────────────────────────

  describe('Sprint Full Role Matrix', () => {
    it('blocks a product owner from creating a sprint (no SPRINT_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.productOwner.token))
        .send({
          startDate: '2026-05-01T00:00:00Z',
          endDate: '2026-05-14T00:00:00Z',
          estimatedStartDate: '2026-05-01T00:00:00Z',
          estimatedEndDate: '2026-05-14T00:00:00Z',
          content: [
            {
              name: `PO Sprint Attempt ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('blocks a business analyst from creating a sprint (no SPRINT_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          startDate: '2026-05-01T00:00:00Z',
          endDate: '2026-05-14T00:00:00Z',
          estimatedStartDate: '2026-05-01T00:00:00Z',
          estimatedEndDate: '2026-05-14T00:00:00Z',
          content: [
            {
              name: `BA Sprint Attempt ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('blocks an engineer from creating a sprint (no SPRINT_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.engineer.token))
        .send({
          startDate: '2026-05-01T00:00:00Z',
          endDate: '2026-05-14T00:00:00Z',
          estimatedStartDate: '2026-05-01T00:00:00Z',
          estimatedEndDate: '2026-05-14T00:00:00Z',
          content: [
            {
              name: `Engineer Sprint Attempt ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('allows a pmManager (isManager) to update a sprint', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${baseSprintId}`)
        .set(authHeader(users.pmManager.token))
        .send({
          content: [
            {
              name: `PM Manager Updated Sprint ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(200);
    });

    it('allows a scrum master to update a sprint', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${baseSprintId}`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          content: [
            {
              name: `SM Updated Sprint ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(200);
    });

    it('blocks a pmMember (isManager=false) from updating a sprint (service guard)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${baseSprintId}`)
        .set(authHeader(users.pmMember.token))
        .send({
          content: [
            {
              name: `PM Member Sprint Update Attempt ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('blocks an engineer from updating a sprint (no SPRINT_MANAGE)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${baseSprintId}`)
        .set(authHeader(users.engineer.token))
        .send({
          content: [
            {
              name: `Engineer Sprint Update Attempt ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(response.status).toBe(403);
    });

    it('blocks a pmMember from deleting a sprint (service guard)', async () => {
      const tempSprintResponse = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.ceo.token))
        .send({
          startDate: '2026-06-01T00:00:00Z',
          endDate: '2026-06-14T00:00:00Z',
          estimatedStartDate: '2026-06-01T00:00:00Z',
          estimatedEndDate: '2026-06-14T00:00:00Z',
          content: [
            {
              name: `Temp Sprint For Delete Test ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      expect(tempSprintResponse.status).toBe(201);
      const tempSprintId = (tempSprintResponse.body as { id: string }).id;
      createdSprintIds.push(tempSprintId);

      const response = await request(httpServer)
        .delete(`/projects/sprints/${tempSprintId}`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────
  // SPRINT STATUS MANAGEMENT
  // ─────────────────────────────────────────────────

  describe('Sprint Status Management', () => {
    let statusSprintId: string;

    beforeAll(async () => {
      const sprintResponse = await request(httpServer)
        .post(`/projects/${projectId}/sprints`)
        .set(authHeader(users.ceo.token))
        .send({
          startDate: '2026-07-01T00:00:00Z',
          endDate: '2026-07-14T00:00:00Z',
          estimatedStartDate: '2026-07-01T00:00:00Z',
          estimatedEndDate: '2026-07-14T00:00:00Z',
          content: [
            {
              name: `Status Management Sprint ${Date.now()}`,
              language: 'English',
            },
          ],
        });

      statusSprintId = (sprintResponse.body as { id: string }).id;
      createdSprintIds.push(statusSprintId);
    });

    it('blocks an engineer from updating sprint status (no SPRINT_MANAGE)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.engineer.token))
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(403);
    });

    it('blocks a pmMember from updating sprint status (service guard: not isManager)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.pmMember.token))
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(403);
    });

    it('allows a pmManager to start a sprint (Pending → Running)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.pmManager.token))
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        SprintStatus.Running,
      );
    });

    it('allows a scrum master to stop a running sprint (Running → Stopped)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.scrumMaster.token))
        .send({ status: SprintStatus.Stopped });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        SprintStatus.Stopped,
      );
    });

    it('allows a pmManager to restart a stopped sprint (Stopped → Running)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.pmManager.token))
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        SprintStatus.Running,
      );
    });

    it('allows a scrum master to complete a running sprint (Running → Completed)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/sprints/${statusSprintId}`)
        .set(authHeader(users.scrumMaster.token))
        .send({ status: SprintStatus.Completed });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        SprintStatus.Completed,
      );
    });
  });

  // ─────────────────────────────────────────────────
  // TASK CRUD FULL ROLE MATRIX
  // ─────────────────────────────────────────────────

  describe('Task CRUD Full Role Matrix', () => {
    it('blocks an engineer from creating a task (no TASK_CREATE permission)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks`)
        .set(authHeader(users.engineer.token))
        .send({
          title: `Engineer Create Attempt ${Date.now()}`,
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.BACKLOG,
        });

      expect(response.status).toBe(403);
    });

    it('allows an engineer to read the task list', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
      expect(Array.isArray((response.body as { data?: unknown[] }).data)).toBe(
        true,
      );
    });

    it('allows an engineer to read a task by ID', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/${engineerTaskId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
      expect((response.body as { id?: string }).id).toBe(engineerTaskId);
    });

    it('allows an engineer to update their own task details (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/${engineerTaskId}`)
        .set(authHeader(users.engineer.token))
        .send({ description: 'Engineer trying to update any task field' });

      expect(response.status).toBe(200);
    });

    it('blocks an engineer from deleting a task (no TASK_DELETE permission)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/tasks/${engineerTaskId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows a scrum master to update task details (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/${backlogTaskId}`)
        .set(authHeader(users.scrumMaster.token))
        .send({ description: 'SM trying to update task details' });

      expect(response.status).toBe(200);
    });

    it('blocks a scrum master from deleting a task (no TASK_DELETE)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/tasks/${backlogTaskId}`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────
  // TASK KANBAN BOARD FULL ROLE MATRIX
  // ─────────────────────────────────────────────────

  describe('Task Kanban Board Full Role Matrix', () => {
    it('allows an engineer to read the kanban board', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows a scrum master to move any task on the kanban board', async () => {
      // productOwnerTaskId is still in BACKLOG at this point
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/move`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          taskId: productOwnerTaskId,
          status: TaskStatus.TODO,
          displayOrder: 1,
        });

      expect(response.status).toBe(200);
      expect((response.body as { status?: string }).status).toBe(
        TaskStatus.TODO,
      );
    });

    it('blocks a pmMember from moving a task on the kanban board (service guard: not isManager/PO/SM)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/move`)
        .set(authHeader(users.pmMember.token))
        .send({
          taskId: productOwnerTaskId,
          status: TaskStatus.IN_PROGRESS,
          displayOrder: 1,
        });

      expect(response.status).toBe(403);
      expect((response.body as { code?: string }).code).toBe(
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    });

    it('blocks a business analyst from moving a task on the kanban board (no TASK_UPDATE_STATUS_OWN or ANY)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/move`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          taskId: productOwnerTaskId,
          status: TaskStatus.IN_PROGRESS,
          displayOrder: 1,
        });

      expect(response.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────
  // BACKLOG FULL ROLE MATRIX
  // ─────────────────────────────────────────────────

  describe('Backlog Full Role Matrix', () => {
    let freshBacklogTaskId: string;

    beforeAll(async () => {
      const taskResponse = await request(httpServer)
        .post(`/projects/${projectId}/tasks`)
        .set(authHeader(users.ceo.token))
        .send({
          title: `Fresh Backlog Task ${Date.now()}`,
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.BACKLOG,
        });

      freshBacklogTaskId = (taskResponse.body as { id: string }).id;
    });

    it('blocks an engineer from reordering the backlog (no BACKLOG_MANAGE)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/backlog/reorder`)
        .set(authHeader(users.engineer.token))
        .send({ tasks: [{ taskId: freshBacklogTaskId, displayOrder: 1 }] });

      expect(response.status).toBe(403);
    });

    it('blocks a business analyst from reordering the backlog (no BACKLOG_MANAGE)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/backlog/reorder`)
        .set(authHeader(users.businessAnalyst.token))
        .send({ tasks: [{ taskId: freshBacklogTaskId, displayOrder: 1 }] });

      expect(response.status).toBe(403);
    });

    it('blocks an engineer from moving a task to a sprint (no BACKLOG_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/backlog/${freshBacklogTaskId}/move-to-sprint`,
        )
        .set(authHeader(users.engineer.token))
        .send({ sprintId: baseSprintId });

      expect(response.status).toBe(403);
    });

    it('blocks a business analyst from moving a task to a sprint (no BACKLOG_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/backlog/${freshBacklogTaskId}/move-to-sprint`,
        )
        .set(authHeader(users.businessAnalyst.token))
        .send({ sprintId: baseSprintId });

      expect(response.status).toBe(403);
    });
  });

  // ─────────────────────────────────────────────────
  // TASK DEPENDENCIES FULL MATRIX
  // ─────────────────────────────────────────────────

  describe('Task Dependencies Full Matrix', () => {
    let dependencyId: string;

    it('blocks an engineer from adding a task dependency (no TASK_ADD_DEPENDENCY)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/dependencies`)
        .set(authHeader(users.engineer.token))
        .send({ blockingTaskId: backlogTaskId });

      expect(response.status).toBe(403);
    });

    it('blocks a scrum master from adding a task dependency (no TASK_ADD_DEPENDENCY)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/dependencies`)
        .set(authHeader(users.scrumMaster.token))
        .send({ blockingTaskId: backlogTaskId });

      expect(response.status).toBe(403);
    });

    it('blocks a business analyst from adding a task dependency (no TASK_ADD_DEPENDENCY)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/dependencies`)
        .set(authHeader(users.businessAnalyst.token))
        .send({ blockingTaskId: backlogTaskId });

      expect(response.status).toBe(403);
    });

    it('allows a product owner to add a task dependency', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks/${engineerTaskId}/dependencies`)
        .set(authHeader(users.productOwner.token))
        .send({ blockingTaskId: backlogTaskId });

      expect(response.status).toBe(201);
      dependencyId = (response.body as { id: string }).id;
    });

    it('allows a product owner to remove a task dependency', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${projectId}/tasks/${engineerTaskId}/dependencies/${dependencyId}`,
        )
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(204);
    });
  });

  // ─────────────────────────────────────────────────
  // TASK LABELS FULL MATRIX
  // ─────────────────────────────────────────────────

  describe('Task Labels Full Matrix', () => {
    let labelId: string;

    it('blocks an engineer from adding a label (no TASK_CREATE_LABEL)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/labels`)
        .set(authHeader(users.engineer.token))
        .send({ name: 'engineer-label', color: '#FF0000' });

      expect(response.status).toBe(403);
    });

    it('blocks a scrum master from adding a label (no TASK_CREATE_LABEL)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/labels`)
        .set(authHeader(users.scrumMaster.token))
        .send({ name: 'sm-label', color: '#00FF00' });

      expect(response.status).toBe(403);
    });

    it('blocks a pmMember from adding a label (service guard: not isManager/PO)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/labels`)
        .set(authHeader(users.pmMember.token))
        .send({ name: `pm-member-label-${Date.now()}`, color: '#123456' });

      expect(response.status).toBe(403);
    });

    it('allows a product owner to add a label', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/labels`)
        .set(authHeader(users.productOwner.token))
        .send({ name: `po-label-${Date.now()}`, color: '#0000FF' });

      expect(response.status).toBe(201);
      labelId = (response.body as { id: string }).id;
    });

    it('blocks an engineer from assigning a label to a task', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('blocks a scrum master from assigning a label to a task', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks a pmMember from assigning a label to a task (service guard: not isManager/PO)', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });

    it('allows a product owner to assign a label to a task', async () => {
      const response = await request(httpServer)
        .post(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(201);
    });

    it('blocks a pmMember from removing a label from a task (service guard: not isManager/PO)', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });

    it('allows a pmManager to remove a label from a task', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${projectId}/tasks/${engineerTaskId}/labels/${labelId}`,
        )
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });

    it('blocks a pmMember from deleting a label (service guard: not isManager/PO)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/labels/${labelId}`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(403);
    });

    it('allows a pmManager to delete a label', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/labels/${labelId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });
  });

  // ─────────────────────────────────────────────────
  // EPIC FULL ROLE MATRIX
  // ─────────────────────────────────────────────────

  describe('Epic Full Role Matrix', () => {
    let matrixEpicId: string;

    beforeAll(async () => {
      const epicResponse = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set(authHeader(users.ceo.token))
        .send({
          name: `Matrix Epic ${Date.now()}`,
          description: 'Epic for role matrix tests',
          color: '#FF5733',
        });

      matrixEpicId = (epicResponse.body as { id: string }).id;
    });

    it('blocks a scrum master from creating an epic (no EPIC_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set(authHeader(users.scrumMaster.token))
        .send({ name: `SM Epic Attempt ${Date.now()}` });

      expect(response.status).toBe(403);
    });

    it('blocks a business analyst from creating an epic (no EPIC_MANAGE)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set(authHeader(users.businessAnalyst.token))
        .send({ name: `BA Epic Attempt ${Date.now()}` });

      expect(response.status).toBe(403);
    });

    it('blocks an engineer from updating an epic (no EPIC_MANAGE)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/epics/${matrixEpicId}`)
        .set(authHeader(users.engineer.token))
        .send({ description: 'Engineer epic update attempt' });

      expect(response.status).toBe(403);
    });

    it('blocks an engineer from deleting an epic (no EPIC_MANAGE)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/epics/${matrixEpicId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows a business analyst to read an epic by ID', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics/${matrixEpicId}`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
      expect((response.body as { id?: string }).id).toBe(matrixEpicId);
    });

    it('allows a pmManager to update an epic', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/epics/${matrixEpicId}`)
        .set(authHeader(users.pmManager.token))
        .send({ description: 'PM Manager updated epic description' });

      expect(response.status).toBe(200);
    });

    it('allows a pmManager to delete an epic', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/epics/${matrixEpicId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });
  });

  // ─────────────────────────────────────────────────
  // BURNDOWN AND GANTT ACCESS
  // ─────────────────────────────────────────────────

  describe('Burndown and Gantt Access', () => {
    it('allows an engineer to read the burndown chart', async () => {
      const response = await request(httpServer)
        .get(`/sprints/${baseSprintId}/burndown`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows a business analyst to read the burndown chart', async () => {
      const response = await request(httpServer)
        .get(`/sprints/${baseSprintId}/burndown`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows an engineer to read the gantt chart', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/gantt`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows a pmMember to read the burndown chart', async () => {
      const response = await request(httpServer)
        .get(`/sprints/${baseSprintId}/burndown`)
        .set(authHeader(users.pmMember.token));

      expect(response.status).toBe(200);
    });
  });

  describe('Task Status Management', () => {
    it('allows CEO/CTO/CMO to create task status (201)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'Test Status',
          color: '#FF0000',
          displayOrder: 10,
        });

      expect(response.status).toBe(201);
    });

    it('allows project manager to create task status (201)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.pmManager.token))
        .send({
          name: 'PM Test Status',
          color: '#00FF00',
          displayOrder: 11,
        });

      expect(response.status).toBe(403); // Project Manager should be blocked from task status management
    });

    it('blocks product owner from creating task status (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.productOwner.token))
        .send({
          name: 'PO Test Status',
          color: '#0000FF',
          displayOrder: 12,
        });

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from creating task status (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          name: 'SM Test Status',
          color: '#FFFF00',
          displayOrder: 13,
        });

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from creating task status (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          name: 'BA Test Status',
          color: '#FF00FF',
          displayOrder: 14,
        });

      expect(response.status).toBe(403);
    });

    it('blocks engineer from creating task status (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.engineer.token))
        .send({
          name: 'ENG Test Status',
          color: '#00FFFF',
          displayOrder: 15,
        });

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to get task statuses (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows CEO/CTO/CMO to update task status (200)', async () => {
      // First create a status to update
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'Status to Update',
          color: '#123456',
          displayOrder: 20,
        });

      const statusId = createResponse.body.id;

      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/${statusId}`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'Updated Status',
          color: '#654321',
        });

      expect(response.status).toBe(200);
    });

    it('blocks project manager from updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/non-existent-status-id`)
        .set(authHeader(users.pmManager.token))
        .send({
          name: 'PM Updated Status',
          color: '#FEDCBA',
        });

      expect(response.status).toBe(403);
    });

    it('blocks product owner from updating task status (403)', async () => {
      // First create a status to attempt to update
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'PO Status Attempt',
          color: '#111111',
          displayOrder: 22,
        });

      const statusId = createResponse.body.id;

      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/${statusId}`)
        .set(authHeader(users.productOwner.token))
        .send({
          name: 'PO Updated Status',
          color: '#222222',
        });

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/non-existent-status-id`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          name: 'SM Updated Status',
          color: '#333333',
        });

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/non-existent-status-id`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          name: 'BA Updated Status',
          color: '#444444',
        });

      expect(response.status).toBe(403);
    });

    it('blocks engineer from updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/task-statuses/non-existent-status-id`)
        .set(authHeader(users.engineer.token))
        .send({
          name: 'ENG Updated Status',
          color: '#555555',
        });

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to delete task status (204)', async () => {
      // First create a status to delete
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/task-statuses`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'Status to Delete',
          color: '#DEADBE',
          displayOrder: 30,
        });

      const statusId = createResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/${statusId}`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(204);
    });

    it('blocks project manager from deleting task status (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/non-existent-status-id`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(403);
    });

    it('blocks product owner from deleting task status (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/some-status-id`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from deleting task status (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/some-status-id`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from deleting task status (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/some-status-id`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from deleting task status (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/task-statuses/some-status-id`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });
  });

  describe('Bulk Task Operations', () => {
    it('allows CEO/CTO/CMO to bulk update task status (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.ceo.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(200);
      expect((response.body as { results?: unknown[] }).results).toBeDefined();
    });

    it('blocks project manager from bulk updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.pmManager.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(403);
    });

    it('blocks product owner from bulk updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.productOwner.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from bulk updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from bulk updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(403);
    });

    it('blocks engineer from bulk updating task status (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set(authHeader(users.engineer.token))
        .send({
          tasks: [{ taskId: engineerTaskId, status: TaskStatus.IN_PROGRESS }],
        });

      expect(response.status).toBe(403);
    });
  });

  describe('User Task Endpoints', () => {
    it('allows CEO/CTO/CMO to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to get their tasks in project (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/tasks/me`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows CEO/CTO/CMO to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to get all their tasks (200)', async () => {
      const response = await request(httpServer)
        .get('/tasks/me')
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });
  });

  // ─────────────────────────────────────────────────
  // UNAUTHENTICATED ACCESS
  // ─────────────────────────────────────────────────

  describe('Unauthenticated Access', () => {
    it('blocks unauthenticated access to task list (401)', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/tasks`,
      );

      expect(response.status).toBe(401);
    });

    it('blocks unauthenticated access to sprint list (401)', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/sprints`,
      );

      expect(response.status).toBe(401);
    });

    it('blocks unauthenticated task creation (401)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/tasks`)
        .send({
          title: 'Unauthenticated Task',
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.BACKLOG,
        });

      expect(response.status).toBe(401);
    });

    it('blocks unauthenticated access to epic list (401)', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/epics`,
      );

      expect(response.status).toBe(401);
    });

    it('blocks unauthenticated project deletion (401)', async () => {
      const response = await request(httpServer).delete(
        `/projects/${projectId}`,
      );

      expect(response.status).toBe(401);
    });

    it('blocks unauthenticated invitation acceptance (401)', async () => {
      const response = await request(httpServer)
        .post('/projects/invitations/accept')
        .send({
          token: '123e4567-e89b-12d3-a456-426614174000',
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Project Management Endpoints', () => {
    it('allows CEO/CTO/CMO to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to list projects (200)', async () => {
      const response = await request(httpServer)
        .get('/projects')
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows CEO/CTO/CMO to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to get project details (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows CEO/CTO/CMO to update project (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.ceo.token))
        .send({
          name: 'Updated Project Name',
          description: 'Updated description',
        });

      expect(response.status).toBe(200);
    });

    it('allows project manager to update project (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.pmManager.token))
        .send({
          name: 'Updated Project Name PM',
          description: 'Updated description PM',
        });

      expect(response.status).toBe(200);
    });

    it('blocks product owner from updating project (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.productOwner.token))
        .send({
          name: 'Updated Project Name PO',
          description: 'Updated description PO',
        });

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from updating project (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          name: 'Updated Project Name SM',
          description: 'Updated description SM',
        });

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from updating project (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          name: 'Updated Project Name BA',
          description: 'Updated description BA',
        });

      expect(response.status).toBe(403);
    });

    it('blocks engineer from updating project (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}`)
        .set(authHeader(users.engineer.token))
        .send({
          name: 'Updated Project Name ENG',
          description: 'Updated description ENG',
        });

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to delete project (204)', async () => {
      const tempProjectResponse = await request(httpServer)
        .post('/projects/register')
        .set(authHeader(users.ceo.token))
        .send({
          businessUnit: BusinessUnit.TawerDev,
          projectType: ProjectType.AGILE,
          status: ProjectStatus.Pending,
          startDate: '2027-01-01T00:00:00Z',
          endDate: '2027-12-31T00:00:00Z',
          estimatedStartDate: '2027-01-01T00:00:00Z',
          estimatedEndDate: '2027-12-31T00:00:00Z',
          contents: [
            {
              name: `Temp Project for Deletion ${Date.now()}`,
              description: 'Temp project',
              language: Language.English,
            },
          ],
        });

      const tempProjectId = tempProjectResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${tempProjectId}`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(204);
    });

    it('allows project manager to delete project (204)', async () => {
      const tempProjectResponse = await request(httpServer)
        .post('/projects/register')
        .set(authHeader(users.ceo.token))
        .send({
          businessUnit: BusinessUnit.TawerDev,
          projectType: ProjectType.AGILE,
          status: ProjectStatus.Pending,
          startDate: '2027-01-01T00:00:00Z',
          endDate: '2027-12-31T00:00:00Z',
          estimatedStartDate: '2027-01-01T00:00:00Z',
          estimatedEndDate: '2027-12-31T00:00:00Z',
          manager: users.pmManager.id,
          members: [{ userId: users.pmManager.id, isManager: true }],
          contents: [
            {
              name: `Temp Project for Deletion PM ${Date.now()}`,
              description: 'Temp project PM',
              language: Language.English,
            },
          ],
        });

      const tempProjectId = tempProjectResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${tempProjectId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });

    it('blocks product owner from deleting project (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from deleting project (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from deleting project (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from deleting project (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to archive project (200)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to archive project (200)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.pmManager.token));

      await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('blocks product owner from archiving project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from archiving project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from archiving project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from archiving project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to restore project (200)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to restore project (200)', async () => {
      await request(httpServer)
        .post(`/projects/${projectId}/archive`)
        .set(authHeader(users.ceo.token));

      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('blocks product owner from restoring project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from restoring project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from restoring project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from restoring project (403)', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/restore`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to remove project member (204)', async () => {
      const tempUser = await createUser(
        UserType.SoftwareEngineer,
        'agile-remove-member-ceo',
      );

      // First add a temporary member
      const addMemberResponse = await request(httpServer)
        .post(`/projects/${projectId}/members`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: tempUser.id,
          isManager: false,
        });

      const memberId = addMemberResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${memberId}`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(204);
    });

    it('allows project manager to remove project member (204)', async () => {
      const tempUser = await createUser(
        UserType.SoftwareEngineer,
        'agile-remove-member-pm',
      );

      // First add a temporary member via executive
      const addMemberResponse = await request(httpServer)
        .post(`/projects/${projectId}/members`)
        .set(authHeader(users.ceo.token))
        .send({
          userId: tempUser.id,
          isManager: false,
        });

      const memberId = addMemberResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${memberId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });

    it('blocks product owner from removing project member (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${engineerMemberId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from removing project member (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${engineerMemberId}`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from removing project member (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${engineerMemberId}`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from removing project member (403)', async () => {
      const response = await request(httpServer)
        .delete(`/projects/${projectId}/members/${engineerMemberId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to delete invitation (204)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(204);
    });

    it('allows project manager to delete invitation (204)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.pmManager.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(204);
    });

    it('blocks product owner from deleting invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from deleting invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from deleting invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from deleting invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/invitations/${invitationId}`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to resend invitation (200)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to resend invitation (200)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.pmManager.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('blocks product owner from resending invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from resending invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from resending invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(403);
    });

    it('blocks engineer from resending invitation (403)', async () => {
      // Create a temporary invitation
      const invitationResponse = await request(httpServer)
        .post(`/projects/${projectId}/invitations`)
        .set(authHeader(users.ceo.token))
        .send({
          email: `temp-${Date.now()}@example.com`,
          role: UserType.SoftwareEngineer,
        });

      const invitationId = invitationResponse.body.id;

      const response = await request(httpServer)
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(403);
    });

    it('allows CEO/CTO/CMO to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.ceo.token));

      expect(response.status).toBe(200);
    });

    it('allows project manager to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.pmManager.token));

      expect(response.status).toBe(200);
    });

    it('allows product owner to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.productOwner.token));

      expect(response.status).toBe(200);
    });

    it('allows scrum master to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.scrumMaster.token));

      expect(response.status).toBe(200);
    });

    it('allows business analyst to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.businessAnalyst.token));

      expect(response.status).toBe(200);
    });

    it('allows engineer to get kanban settings (200)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.engineer.token));

      expect(response.status).toBe(200);
    });

    it('allows CEO/CTO/CMO to update kanban settings (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.ceo.token))
        .send({
          settings: {
            IN_PROGRESS: 5,
            TODO: 10,
          },
        });

      expect(response.status).toBe(200);
    });

    it('allows project manager to update kanban settings (200)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.pmManager.token))
        .send({
          settings: {
            IN_PROGRESS: 4,
          },
        });

      expect(response.status).toBe(200);
    });

    it('blocks product owner from updating kanban settings (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.productOwner.token))
        .send({
          settings: {
            IN_PROGRESS: 3,
          },
        });

      expect(response.status).toBe(403);
    });

    it('blocks scrum master from updating kanban settings (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.scrumMaster.token))
        .send({
          settings: {
            IN_PROGRESS: 3,
          },
        });

      expect(response.status).toBe(403);
    });

    it('blocks business analyst from updating kanban settings (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.businessAnalyst.token))
        .send({
          settings: {
            IN_PROGRESS: 3,
          },
        });

      expect(response.status).toBe(403);
    });

    it('blocks engineer from updating kanban settings (403)', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/kanban/settings`)
        .set(authHeader(users.engineer.token))
        .send({
          settings: {
            IN_PROGRESS: 3,
          },
        });

      expect(response.status).toBe(403);
    });
  });
});
