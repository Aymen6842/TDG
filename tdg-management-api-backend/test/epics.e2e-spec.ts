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
  Language,
  ProjectType,
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

type EpicResponse = {
  id: string;
  name: string;
  description?: string | null;
};

type ErrorResponse = {
  message: string;
  code?: string;
  errorCode?: string;
};

function getResponseBody<T>(response: { body: unknown }): T {
  return response.body as T;
}

describe('Epics API Endpoints (e2e)', () => {
  let app: INestApplication;
  let httpServer: Server;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let epicId: string;
  let freestyleProjectId: string;

  const createdProjectIds: string[] = [];

  const testEmail = `epic-test-${Date.now()}@example.com`;
  const testPhone = `+216${(
    Date.now().toString() +
    Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')
  ).slice(-8)}`;

  const createProject = async ({
    projectType,
    displayOrder,
    name,
  }: {
    projectType: ProjectType;
    displayOrder: number;
    name: string;
  }) => {
    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType,
        status: ProjectStatus.Pending,
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        estimatedStartDate: new Date('2025-01-01'),
        estimatedEndDate: new Date('2025-12-31'),
        displayOrder,
        createdById: userId,
        members: {
          create: {
            userId,
            isManager: true,
          },
        },
        contents: {
          create: {
            name,
            unaccentedName: name.toLowerCase(),
            description: `${name} description`,
            language: Language.English,
          },
        },
      },
      include: {
        members: true,
        contents: true,
      },
    });

    createdProjectIds.push(project.id);

    return project;
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

    // Create test user with CEO role
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Epic Test CEO',
        phone: testPhone,
        unaccentedName: 'epic test ceo',
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

    const project = await createProject({
      projectType: ProjectType.AGILE,
      displayOrder: 1000,
      name: 'Test Project for Epics',
    });

    projectId = project.id;

    const freestyleProject = await createProject({
      projectType: ProjectType.FREESTYLE,
      displayOrder: 1001,
      name: 'Freestyle Project for Epics',
    });

    freestyleProjectId = freestyleProject.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (prisma) {
      if (createdProjectIds.length > 0) {
        await prisma.task.deleteMany({
          where: { projectId: { in: createdProjectIds } },
        });
        await prisma.epic.deleteMany({
          where: { projectId: { in: createdProjectIds } },
        });
        await prisma.projectMember.deleteMany({
          where: { projectId: { in: createdProjectIds } },
        });
        await prisma.projectContent.deleteMany({
          where: { projectId: { in: createdProjectIds } },
        });
        await prisma.project.deleteMany({
          where: { id: { in: createdProjectIds } },
        });
      }

      if (userId) {
        await prisma.role.deleteMany({
          where: { userId },
        });
        await prisma.user.delete({
          where: { id: userId },
        });
      }
    }
    if (app) {
      await app.close();
    }
  });

  describe('Create Epic', () => {
    it('should create an epic successfully', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Epic',
          description: 'Test Epic Description',
          color: '#FF5733',
          startDate: '2025-01-01',
          endDate: '2025-06-30',
        });
      const body = getResponseBody<EpicResponse>(response);

      expect(response.status).toBe(201);
      expect(body.id).toBeDefined();
      expect(body.name).toBe('Test Epic');
      epicId = body.id;
    });

    it('should return 403 for unauthorized user', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .send({
          name: 'Test Epic 2',
        });

      expect(response.status).toBe(401);
    });

    it('should return 409 for duplicate epic name', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Epic',
        });

      expect(response.status).toBe(409);
    });

    it('should return 400 for invalid epic date range', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Epic Invalid Date Range',
          startDate: '2025-06-30',
          endDate: '2025-01-01',
        });
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.code).toBe(ErrorCode.INVALID_DATA);
      expect(body.message).toBe('End date must be after start date');
    });

    it('should return 400 when epic dates are outside project dates', async () => {
      const response = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Epic Outside Project Dates',
          startDate: '2024-12-31',
          endDate: '2025-01-02',
        });
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.code).toBe(ErrorCode.INVALID_DATA);
      expect(body.message).toBe(
        'Epic dates must be within the project start and end dates',
      );
    });
  });

  describe('Get Epics', () => {
    it('should get all epics for a project', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<PaginatedResponse<EpicResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      expect(body.pagination).toBeDefined();
      expect(body.data.length).toBeGreaterThan(0);
    });

    it('should get epic by id', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics/${epicId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<EpicResponse>(response);

      expect(response.status).toBe(200);
      expect(body.id).toBe(epicId);
      expect(body.name).toBe('Test Epic');
    });

    it('should return 404 for non-existent epic', async () => {
      const response = await request(httpServer)
        .get(
          `/projects/${projectId}/epics/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('Update Epic', () => {
    it('should update an epic', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/epics/${epicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Epic Name',
          description: 'Updated description',
        });
      const body = getResponseBody<EpicResponse>(response);

      expect(response.status).toBe(200);
      expect(body.name).toBe('Updated Epic Name');
      expect(body.description).toBe('Updated description');
    });

    it('should return 409 for duplicate name on update', async () => {
      // Create another epic first
      await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Epic',
        });

      // Try to update first epic to have duplicate name
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/epics/${epicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Another Epic',
        });

      expect(response.status).toBe(409);
    });

    it('should return 400 when updating with an invalid date range', async () => {
      const response = await request(httpServer)
        .patch(`/projects/${projectId}/epics/${epicId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          startDate: '2025-07-01',
          endDate: '2025-01-01',
        });
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.code).toBe(ErrorCode.INVALID_DATA);
      expect(body.message).toBe('End date must be after start date');
    });
  });

  describe('Delete Epic', () => {
    it('should delete an epic', async () => {
      // Create a new epic to delete
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Epic To Delete',
        });
      const epicToDeleteId = getResponseBody<EpicResponse>(createResponse).id;

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/epics/${epicToDeleteId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 400 when deleting an epic with linked tasks', async () => {
      const createResponse = await request(httpServer)
        .post(`/projects/${projectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Epic With Linked Task',
        });
      const protectedEpicId = getResponseBody<EpicResponse>(createResponse).id;

      await prisma.task.create({
        data: {
          projectId,
          key: `EPIC-LINK-${Date.now()}`,
          reporterId: userId,
          title: 'Task linked to epic',
          epicId: protectedEpicId,
        },
      });

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/epics/${protectedEpicId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.code).toBe(ErrorCode.EPIC_HAS_LINKED_TASKS);
      expect(body.message).toContain('Cannot delete epic with 1 linked tasks');
    });

    it('should return 404 when deleting an epic through a different project route', async () => {
      const otherProject = await createProject({
        projectType: ProjectType.AGILE,
        displayOrder: 1002,
        name: 'Second Agile Project for Epics',
      });

      const createResponse = await request(httpServer)
        .post(`/projects/${otherProject.id}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Epic In Other Project',
        });
      const otherEpicId = getResponseBody<EpicResponse>(createResponse).id;

      await prisma.task.create({
        data: {
          projectId: otherProject.id,
          key: `EPIC-OTHER-${Date.now()}`,
          reporterId: userId,
          title: 'Task linked to other project epic',
          epicId: otherEpicId,
        },
      });

      const response = await request(httpServer)
        .delete(`/projects/${projectId}/epics/${otherEpicId}`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(404);
      expect(body.code).toBe(ErrorCode.EPIC_NOT_FOUND);
    });

    it('should return 404 for non-existent epic', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${projectId}/epics/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('AgileOnlyGuard enforcement', () => {
    it('should block creating epics on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .post(`/projects/${freestyleProjectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Freestyle Epic Attempt',
        });
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.errorCode).toBe(ErrorCode.PROJECT_NOT_AGILE);
      expect(body.message).toBe(
        'This operation is only available for AGILE projects',
      );
    });

    it('should block listing epics on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .get(`/projects/${freestyleProjectId}/epics`)
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.errorCode).toBe(ErrorCode.PROJECT_NOT_AGILE);
      expect(body.message).toBe(
        'This operation is only available for AGILE projects',
      );
    });

    it('should block getting an epic on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .get(
          `/projects/${freestyleProjectId}/epics/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.errorCode).toBe(ErrorCode.PROJECT_NOT_AGILE);
      expect(body.message).toBe(
        'This operation is only available for AGILE projects',
      );
    });

    it('should block updating an epic on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .patch(
          `/projects/${freestyleProjectId}/epics/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Epic' });
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.errorCode).toBe(ErrorCode.PROJECT_NOT_AGILE);
    });

    it('should block deleting an epic on a FREESTYLE project', async () => {
      const response = await request(httpServer)
        .delete(
          `/projects/${freestyleProjectId}/epics/550e8400-e29b-41d4-a716-446655440000`,
        )
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<ErrorResponse>(response);

      expect(response.status).toBe(400);
      expect(body.errorCode).toBe(ErrorCode.PROJECT_NOT_AGILE);
    });
  });

  // ==========================================
  // Epic List - Pagination and Filtering
  // ==========================================
  describe('Epic List - Pagination and Filtering', () => {
    it('should return correct pagination structure', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics`)
        .query({ page: 1, limit: 5 })
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<PaginatedResponse<EpicResponse>>(response);

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
        .get(`/projects/${projectId}/epics`)
        .query({ search: 'Epic' })
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<PaginatedResponse<EpicResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
    });

    it('should support date range filter (startDateFrom)', async () => {
      const response = await request(httpServer)
        .get(`/projects/${projectId}/epics`)
        .query({ startDateFrom: '2030-01-01' })
        .set('Authorization', `Bearer ${authToken}`);
      const body = getResponseBody<PaginatedResponse<EpicResponse>>(response);

      expect(response.status).toBe(200);
      expect(Array.isArray(body.data)).toBe(true);
      // Epics with startDate before 2030 should be excluded
      expect(body.data.every((e) => e.id !== undefined)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(httpServer).get(
        `/projects/${projectId}/epics`,
      );

      expect(response.status).toBe(401);
    });
  });
});
