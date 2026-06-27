import { Server } from 'http';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ErrorCode } from '../src/common/exceptions/error-codes/error.code';
import {
  UserType,
  BusinessUnit,
  ProjectStatus,
  ProjectType,
  ReminderStatus,
  ChannelType,
} from '@prisma/client';

jest.setTimeout(30000);

type PaginationResponse = {
  records: number;
  currentPage: number;
  totalPages: number;
  perPage: number;
};

type PaginatedResponse<T> = {
  data: T[];
  pagination: PaginationResponse;
};

type ReminderResponse = {
  id: string;
  userId: string;
  entityType?: string;
  message?: string | null;
  reminderAt?: string;
  status?: ReminderStatus;
};

type MessageResponse = {
  message: string;
  code?: string;
};

function getResponseBody<T>(response: { body: unknown }): T {
  return response.body as T;
}

describe('Reminders API Endpoints (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let reminderId: string;
  let memberUserId: string;
  let memberAuthToken: string;

  const testEmail = `reminder-test-${Date.now()}@example.com`;
  const testPhone = `+216${(
    Date.now().toString() +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
  ).slice(-8)}`;

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

    // Create test user with CEO role
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Reminder Test CEO',
        phone: testPhone,
        unaccentedName: 'reminder test ceo',
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: UserType.CEO,
          },
        },
      },
      include: { roles: true },
    });

    userId = user.id;

    // Generate JWT token with correct payload format
    const payload = {
      id: user.id,
      name: user.name,
      roles: user.roles.map((r) => r.type),
      teamsIds: [],
      type: 'access',
    };

    authToken = jwtService.sign(payload, {
      secret: configService.get<string>('SECRET_KEY') || 'test-secret',
      expiresIn: '1h',
    });

    // Create a project first (needed for reminders)
    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.AGILE, // Recommended for agile features
        status: ProjectStatus.Pending,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        estimatedStartDate: new Date('2025-01-01'),
        estimatedEndDate: new Date('2025-12-31'),
        displayOrder: 1000,
        createdById: userId,
        members: {
          create: {
            userId: userId,
            isManager: true,
          },
        },
      },
    });

    projectId = project.id;

    const memberEmail = `reminder-member-${Date.now()}@example.com`;
    const memberPhone = `+216${(
      (Date.now() + 3333).toString() +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
    ).slice(-8)}`;

    const memberUser = await prisma.user.create({
      data: {
        email: memberEmail,
        name: 'Reminder Project Member',
        phone: memberPhone,
        unaccentedName: 'reminder project member',
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: UserType.SoftwareEngineer,
          },
        },
      },
      include: { roles: true },
    });

    memberUserId = memberUser.id;

    await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberUserId,
        isManager: false,
      },
    });

    memberAuthToken = jwtService.sign(
      {
        id: memberUser.id,
        name: memberUser.name,
        roles: memberUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );
  });

  afterAll(async () => {
    // Cleanup - delete test data
    if (prisma) {
      // Delete reminders first
      await prisma.reminder.deleteMany({
        where: { projectId },
      });
      // Delete project members
      await prisma.projectMember.deleteMany({
        where: { projectId },
      });
      // Delete project
      await prisma.project.delete({
        where: { id: projectId },
      });
      // Delete roles
      await prisma.role.deleteMany({
        where: { userId: { in: [userId, memberUserId] } },
      });
      // Delete users
      await prisma.user.deleteMany({
        where: { id: { in: [userId, memberUserId] } },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('POST /projects/:projectId/reminders', () => {
    it('should create a reminder successfully', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          entityType: 'PROJECT',
          message: 'Test reminder message',
          reminderAt: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        })
        .expect(201);
      const body = getResponseBody<ReminderResponse>(response);

      expect(body.id).toBeDefined();
      expect(body.userId).toBe(userId);
      expect(body.message).toBe('Test reminder message');
      expect(body.status).toBe(ReminderStatus.PENDING);

      reminderId = body.id;
    });

    it('should return 400 when creating a reminder with a past date', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          entityType: 'PROJECT',
          message: 'Past reminder message',
          reminderAt: new Date(Date.now() - 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        })
        .expect(400);
      const body = getResponseBody<MessageResponse>(response);

      expect(body.code).toBe(ErrorCode.REMINDER_INVALID_DATE);
      expect(body.message).toBe('Reminder date must be in the future');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          // Missing required fields
        })
        .expect(400);
      const body = getResponseBody<MessageResponse>(response);

      expect(body.message).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .send({
          userId: userId,
          entityType: 'PROJECT',
          message: 'Test reminder',
          reminderAt: new Date().toISOString(),
        })
        .expect(401);
    });
  });

  describe('GET /projects/:projectId/reminders', () => {
    it('should get all reminders for a project', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination.records).toBeDefined();
      expect(body.pagination.currentPage).toBeDefined();
      expect(body.pagination.totalPages).toBeDefined();
      expect(body.pagination.perPage).toBeDefined();
    });

    it('should filter reminders by status', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders?status=PENDING`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .expect(401);
    });

    it('should allow a non-manager project member to list reminders', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(200);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.some((reminder) => reminder.id === reminderId)).toBe(
        true,
      );
    });
  });

  describe('GET /projects/:projectId/reminders/:reminderId', () => {
    it('should get a reminder by ID', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      const body = getResponseBody<ReminderResponse>(response);

      expect(body.id).toBe(reminderId);
    });

    it('should return 404 for non-existent reminder', async () => {
      await request(httpServer)
        .get(
          `/projects/${projectId}/reminders/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should allow a non-manager project member to get a reminder by ID', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .expect(200);
      const body = getResponseBody<ReminderResponse>(response);

      expect(body.id).toBe(reminderId);
    });
  });

  describe('PATCH /projects/:projectId/reminders/:reminderId', () => {
    it('should update a reminder', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Updated reminder message',
        })
        .expect(200);
      const body = getResponseBody<ReminderResponse>(response);

      expect(body.id).toBe(reminderId);
      expect(body.message).toBe('Updated reminder message');
    });

    it('should return 400 when updating with a past reminder date', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reminderAt: new Date(Date.now() - 86400000).toISOString(),
        })
        .expect(400);
      const body = getResponseBody<MessageResponse>(response);

      expect(body.code).toBe(ErrorCode.REMINDER_INVALID_DATE);
      expect(body.message).toBe('Reminder date must be in the future');
    });

    it('should return 404 for non-existent reminder', async () => {
      await request(httpServer)
        .patch(
          `/projects/${projectId}/reminders/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Updated',
        })
        .expect(404);
    });
  });

  describe('Reminder manage permissions for non-manager members', () => {
    it('should forbid a non-manager project member from creating reminders', async () => {
      await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${memberAuthToken}`)
        .send({
          userId: memberUserId,
          entityType: 'PROJECT',
          message: 'Member cannot create reminders',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        })
        .expect(403);
    });
  });

  describe('DELETE /projects/:projectId/reminders/:reminderId', () => {
    it('should delete a reminder', async () => {
      await request(httpServer)
        .delete(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify it's deleted
      await request(httpServer)
        .get(`/projects/${projectId}/reminders/${reminderId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 404 for non-existent reminder', async () => {
      await request(httpServer)
        .delete(
          `/projects/${projectId}/reminders/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without auth token', async () => {
      await request(httpServer)
        .delete(`/projects/${projectId}/reminders/${reminderId}`)
        .expect(401);
    });
  });

  // ==========================================
  // User Reminders (GET /reminders/me, POST /reminders/:id/dismiss)
  // ==========================================
  describe('GET /reminders/me', () => {
    let userReminderId: string;

    beforeAll(async () => {
      // Create a reminder for the user to query
      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          entityType: 'PROJECT',
          message: 'User reminder test',
          reminderAt: new Date(Date.now() + 86400000).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });
      userReminderId = getResponseBody<ReminderResponse>(response).id;
    });

    it('should get all reminders for the current user', async () => {
      const response = await request(httpServer)
        .get('/reminders/me')
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
    });

    it('should filter user reminders by status', async () => {
      const response = await request(httpServer)
        .get('/reminders/me?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      await request(httpServer).get('/reminders/me').expect(401);
    });

    // Dismiss endpoint uses the reminder created above
    describe('POST /reminders/:reminderId/dismiss', () => {
      it('should dismiss a reminder', async () => {
        if (!userReminderId) return;

        const response = await request(httpServer)
          .post(`/reminders/${userReminderId}/dismiss`)
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(200);
      });

      it('should return error for already dismissed reminder', async () => {
        if (!userReminderId) return;

        const response = await request(httpServer)
          .post(`/reminders/${userReminderId}/dismiss`)
          .set('Authorization', `Bearer ${authToken}`);

        // Already dismissed, should return error
        expect([400, 409]).toContain(response.status);
      });

      it('should return 404 for non-existent reminder', async () => {
        const response = await request(httpServer)
          .post('/reminders/00000000-0000-0000-0000-000000000000/dismiss')
          .set('Authorization', `Bearer ${authToken}`);

        expect(response.status).toBe(404);
      });

      it('should return 401 without auth token', async () => {
        await request(httpServer)
          .post(`/reminders/${userReminderId}/dismiss`)
          .expect(401);
      });
    });
  });

  // ==========================================
  // Reminder Entity Type Filtering
  // ==========================================
  describe('Reminder Entity Type Filtering', () => {
    let taskReminderIdLocal: string;
    let customReminderAt: string;

    beforeAll(async () => {
      // Create a CUSTOM type reminder
      customReminderAt = new Date(Date.now() + 86400000 * 3).toISOString();

      const response = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          entityType: 'CUSTOM',
          message: 'Custom entity type reminder',
          reminderAt: customReminderAt,
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });
      taskReminderIdLocal = getResponseBody<ReminderResponse>(response).id;
    });

    it('should filter project reminders by entityType=PROJECT', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .query({ entityType: 'PROJECT' })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.every((r) => r.entityType === 'PROJECT')).toBe(true);
    });

    it('should filter project reminders by entityType=CUSTOM', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .query({ entityType: 'CUSTOM' })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      const found = body.data.some((r) => r.id === taskReminderIdLocal);
      expect(found).toBe(true);
      expect(body.data.every((r) => r.entityType === 'CUSTOM')).toBe(true);
    });

    it('should filter user reminders by entityType', async () => {
      const response = await request(httpServer)
        .get('/reminders/me')
        .query({ entityType: 'CUSTOM' })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.every((r) => r.entityType === 'CUSTOM')).toBe(true);
    });

    it('should filter reminders by reminderAt range', async () => {
      const reminderAtFrom = new Date(
        new Date(customReminderAt).getTime() - 60 * 60 * 1000,
      ).toISOString();
      const reminderAtTo = new Date(
        new Date(customReminderAt).getTime() + 60 * 60 * 1000,
      ).toISOString();

      const response = await request(httpServer)
        .get(`/projects/${projectId}/reminders`)
        .query({ reminderAtFrom, reminderAtTo })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<ReminderResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.some((r) => r.id === taskReminderIdLocal)).toBe(true);
      expect(
        body.data.every((r) => {
          if (!r.reminderAt) return false;
          const reminderAt = new Date(r.reminderAt).getTime();
          return (
            reminderAt >= new Date(reminderAtFrom).getTime() &&
            reminderAt <= new Date(reminderAtTo).getTime()
          );
        }),
      ).toBe(true);
    });
  });

  // ==========================================
  // Cross-User Reminder Access Control
  // ==========================================
  describe('Cross-User Reminder Access', () => {
    let secondUserId: string;
    let secondUserToken: string;
    let privateReminderId: string;

    beforeAll(async () => {
      const secondEmail = `reminder-second-${Date.now()}@example.com`;
      const secondPhone = `+216${(
        (Date.now() + 7777).toString() +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, '0')
      ).slice(-8)}`;

      const secondUser = await prisma.user.create({
        data: {
          email: secondEmail,
          name: 'Second Reminder User',
          phone: secondPhone,
          unaccentedName: 'second reminder user',
          password: 'hashed_password_not_used',
          isActive: true,
          roles: {
            create: {
              type: UserType.CEO,
            },
          },
        },
        include: { roles: true },
      });

      secondUserId = secondUser.id;

      const secondPayload = {
        id: secondUser.id,
        name: secondUser.name,
        roles: secondUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      };

      secondUserToken = jwtService.sign(secondPayload, {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      });

      // Create a reminder that belongs to userId
      const reminderResponse = await request(httpServer)
        .post(`/projects/${projectId}/reminders`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: userId,
          entityType: 'PROJECT',
          message: 'Private reminder for cross-user test',
          reminderAt: new Date(Date.now() + 86400000 * 2).toISOString(),
          isRecurring: false,
          channels: [ChannelType.EMAIL],
        });
      privateReminderId =
        getResponseBody<ReminderResponse>(reminderResponse).id;
    });

    afterAll(async () => {
      if (secondUserId) {
        await prisma.role.deleteMany({ where: { userId: secondUserId } });
        await prisma.user.delete({ where: { id: secondUserId } });
      }
    });

    it('should block a different user from dismissing another user reminder', async () => {
      const response = await request(httpServer)
        .post(`/reminders/${privateReminderId}/dismiss`)
        .set('Authorization', `Bearer ${secondUserToken}`);

      // Should be 403 (forbidden) or 404 (not found for this user)
      expect([403, 404]).toContain(response.status);
    });

    it('should allow the owner to dismiss their own reminder', async () => {
      const response = await request(httpServer)
        .post(`/reminders/${privateReminderId}/dismiss`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });
});
