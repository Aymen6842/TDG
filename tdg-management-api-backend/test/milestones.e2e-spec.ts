import { Server } from 'http';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/service/prisma.service';
import { ErrorCode } from '../src/common/exceptions/error-codes/error.code';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UserType,
  BusinessUnit,
  ProjectStatus,
  ProjectType,
  Language,
} from '@prisma/client';

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

type MilestoneResponse = {
  id: string;
  name: string;
  description?: string | null;
  completedAt?: string | null;
};

type GanttResponse = {
  milestones: unknown[];
  epics: unknown[];
  sprints: unknown[];
  tasks: unknown[];
};

type ErrorResponse = {
  message: string;
  code?: string;
  errorCode?: string;
};

function getResponseBody<T>(response: { body: unknown }): T {
  return response.body as T;
}

describe('Milestones API Endpoints (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let freestyleProjectId: string;
  let milestoneId: string;

  const testEmail = `milestone-test-${Date.now()}@example.com`;
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
        name: 'Milestone Test CEO',
        phone: testPhone,
        unaccentedName: 'milestone test ceo',
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

    // Create an AGILE project first
    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.AGILE,
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
        contents: {
          create: {
            name: 'Test Project for Milestones',
            unaccentedName: 'test project for milestones',
            description: 'Test project description',
            language: Language.English,
          },
        },
      },
      include: {
        members: true,
        contents: true,
      },
    });

    projectId = project.id;

    const freestyleProject = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.FREESTYLE,
        status: ProjectStatus.Pending,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        estimatedStartDate: new Date('2025-01-01'),
        estimatedEndDate: new Date('2025-12-31'),
        displayOrder: 1001,
        createdById: userId,
        members: {
          create: {
            userId,
            isManager: true,
          },
        },
        contents: {
          create: {
            name: 'Freestyle Project for Milestones',
            unaccentedName: 'freestyle project for milestones',
            description: 'Freestyle milestone project',
            language: Language.English,
          },
        },
      },
      include: {
        members: true,
        contents: true,
      },
    });

    freestyleProjectId = freestyleProject.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (prisma) {
      await prisma.task.deleteMany({
        where: { projectId: { in: [projectId, freestyleProjectId] } },
      });
      await prisma.milestone.deleteMany({
        where: { projectId: { in: [projectId, freestyleProjectId] } },
      });
      await prisma.projectMember.deleteMany({
        where: { projectId: { in: [projectId, freestyleProjectId] } },
      });
      await prisma.projectContent.deleteMany({
        where: { projectId: { in: [projectId, freestyleProjectId] } },
      });
      await prisma.project.deleteMany({
        where: { id: { in: [projectId, freestyleProjectId] } },
      });
      await prisma.role.deleteMany({
        where: { userId },
      });
      await prisma.user.delete({
        where: { id: userId },
      });
    }
    if (app) {
      await app.close();
    }
  });

  describe('Create Milestone', () => {
    it('should create a milestone successfully', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Milestone',
          description: 'Test Milestone Description',
          dueDate: '2025-06-30',
        });
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.name).toBe('Test Milestone');
      milestoneId = body.id;
    });

    it('should return 403 for unauthorized user', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .send({
          name: 'Test Milestone 2',
        });

      expect(response.status).toBe(401);
    });

    it('should return 409 for duplicate milestone name', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Milestone',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('Get Milestones', () => {
    it('should get all milestones for a project', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<MilestoneResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should get milestone by id', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(200);
      expect(body.id).toBe(milestoneId);
      expect(body.name).toBe('Test Milestone');
    });

    it('should return 404 for non-existent milestone', async () => {
      const response = await request(httpServer)
        .get(
          `/projects/${projectId}/milestones/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Update Milestone', () => {
    it('should update a milestone', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Milestone Name',
          description: 'Updated description',
        });
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(200);
      expect(body.name).toBe('Updated Milestone Name');
      expect(body.description).toBe('Updated description');
    });

    it('should return 409 for duplicate name on update', async () => {
      // Create another milestone first
      await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Milestone',
        });

      // Try to update first milestone to have duplicate name
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/milestones/${milestoneId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Milestone',
        });

      expect(response.status).toBe(409);
    });
  });

  describe('Complete Milestone', () => {
    it('should mark a milestone as complete', async () => {
      // Create a new milestone to complete
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Milestone To Complete',
        });
      const milestoneToCompleteId =
        getResponseBody<MilestoneResponse>(createResponse).id;

      const response = await request(httpServer)
        .patch(
          `/projects/${projectId}/milestones/${milestoneToCompleteId}/complete`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(200);
      expect(body.completedAt).toBeDefined();
    });
  });

  describe('Delete Milestone', () => {
    it('should delete a milestone', async () => {
      // Create a new milestone to delete
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Milestone To Delete',
        });
      const milestoneToDeleteId =
        getResponseBody<MilestoneResponse>(createResponse).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/milestones/${milestoneToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 400 when deleting a milestone with linked tasks', async () => {
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Milestone With Linked Task',
        });
      const protectedMilestoneId =
        getResponseBody<MilestoneResponse>(createResponse).id;

      await prisma.task.create({
        data: {
          projectId,
          key: `MILESTONE-LINK-${Date.now()}`,
          reporterId: userId,
          title: 'Task linked to milestone',
          milestoneId: protectedMilestoneId,
        },
      });

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/milestones/${protectedMilestoneId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should return 404 when deleting a milestone through a different project route', async () => {
      const createResponse = await request(httpServer)
        .post(`/projects/${freestyleProjectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Milestone In Other Project',
        });
      const otherMilestoneId =
        getResponseBody<MilestoneResponse>(createResponse).id;

      await prisma.task.create({
        data: {
          projectId: freestyleProjectId,
          key: `MILESTONE-OTHER-${Date.now()}`,
          reporterId: userId,
          title: 'Task linked to other project milestone',
          milestoneId: otherMilestoneId,
        },
      });

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/milestones/${otherMilestoneId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(404);
      expect(body.code).toBe(ErrorCode.MILESTONE_NOT_FOUND);
    });

    it('should return 404 for non-existent milestone', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${projectId}/milestones/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Freestyle Project Support', () => {
    let freestyleMilestoneId: string;

    it('should create a milestone on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .post(`/projects/${freestyleProjectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Freestyle Milestone',
          description: 'Freestyle milestone description',
        });
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(201);
      expect(body.id).toBeDefined();
      freestyleMilestoneId = body.id;
    });

    it('should list milestones on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .get(`/projects/${freestyleProjectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<MilestoneResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.data.some((item) => item.id === freestyleMilestoneId)).toBe(
        true,
      );
    });

    it('should get a milestone on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .get(
          `/projects/${freestyleProjectId}/milestones/${freestyleMilestoneId}`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<MilestoneResponse>(response);

      expect(response.status).toBe(200);
      expect(body.id).toBe(freestyleMilestoneId);
      expect(body.name).toBe('Freestyle Milestone');
    });
  });

  // ==========================================
  // GET /projects/:projectId/gantt - Gantt Chart
  // ==========================================
  describe('GET /projects/:projectId/gantt', () => {
    it('should get gantt chart data', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/gantt`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<GanttResponse>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.milestones)).toBe(true);
      expect(Array.isArray(body.epics)).toBe(true);
      expect(Array.isArray(body.sprints)).toBe(true);
      expect(Array.isArray(body.tasks)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/gantt`,
      );

      expect(response.status).toBe(401);
    });

    it('should return gantt items with expected shape', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/gantt`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<GanttResponse>(response);

      expect(response.status).toBe(200);
      // Milestones array items should have at minimum an id and name
      if (body.milestones.length > 0) {
        const milestone = body.milestones[0] as { id: string; name: string };
        expect(typeof milestone.id).toBe('string');
        expect(typeof milestone.name).toBe('string');
      }
    });
  });

  // ==========================================
  // Complete Milestone - Edge Cases
  // ==========================================
  describe('Complete Milestone - Edge Cases', () => {
    let alreadyCompletedId: string;

    beforeAll(async () => {
      // Create and complete a milestone for edge case testing
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/milestones`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Already Completed Milestone' });
      alreadyCompletedId =
        getResponseBody<MilestoneResponse>(createResponse).id;

      await request(httpServer)
        .patch(
          `/projects/${projectId}/milestones/${alreadyCompletedId}/complete`,
        )
        .set('Authorization', `Bearer ${authToken}`);
    });

    it('should return 200 when completing an already-completed milestone (idempotent)', async () => {
      const response = await request(httpServer)
        .patch(
          `/projects/${projectId}/milestones/${alreadyCompletedId}/complete`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<MilestoneResponse>(response);

      // Completing an already-completed milestone is idempotent
      expect(response.status).toBe(200);
      expect(body.completedAt).toBeDefined();
    });
  });

  // ==========================================
  // Milestone List - Pagination and Filtering
  // ==========================================
  describe('Milestone List - Pagination and Filtering', () => {
    it('should return correct pagination structure', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/milestones`)
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<MilestoneResponse>>(response);

      expect(response.status).toBe(200);
      expect(body.pagination).toBeDefined();
      expect(typeof body.pagination.currentPage).toBe('number');
      expect(typeof body.pagination.perPage).toBe('number');
      expect(typeof body.pagination.records).toBe('number');
      expect(typeof body.pagination.totalPages).toBe('number');
      expect(body.pagination.currentPage).toBe(1);
      expect(body.pagination.perPage).toBe(5);
    });

    it('should support name search filter', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/milestones`)
        .query({ search: 'Milestone' })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<MilestoneResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should support due date range filter (dueDateFrom)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/milestones`)
        .query({ dueDateFrom: '2030-01-01' })
        .set('Authorization', `Bearer ${authToken}`);
      const body =
        getResponseBody<PaginatedResponse<MilestoneResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/milestones`,
      );

      expect(response.status).toBe(401);
    });
  });
});
