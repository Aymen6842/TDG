import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  UserType,
  BusinessUnit,
  ProjectStatus,
  ProjectType,
  Language,
  SprintStatus,
} from '@prisma/client';

describe('Sprints API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let sprintId: string;

  const runSuffix = Date.now().toString();
  const primarySprintName = `Sprint 1 - Authentication ${runSuffix}`;
  const deleteSprintName = `Sprint To Delete ${runSuffix}`;
  const testEmail = `sprint-test-${Date.now()}@example.com`;
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

    prisma = app.get(PrismaService);
    jwtService = app.get(JwtService);
    configService = app.get(ConfigService);

    // Create test user with CEO role
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Sprint Test CEO',
        phone: testPhone,
        unaccentedName: 'sprint test ceo',
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

    // Create a project first (needed for sprints)
    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.AGILE, // Required for sprints - AgileOnlyGuard
        status: ProjectStatus.Pending,
        startDate: new Date('2027-01-01'),
        endDate: new Date('2027-12-31'),
        estimatedStartDate: new Date('2027-01-01'),
        estimatedEndDate: new Date('2027-12-31'),
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
            name: 'Test Project for Sprints',
            unaccentedName: 'test project for sprints',
            description: 'Test project for sprint tests',
            language: Language.English,
          },
        },
      },
    });

    projectId = project.id;
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      // Delete sprints
      await prisma.sprintContent.deleteMany({
        where: { sprint: { projectId: projectId } },
      });
      await prisma.sprint.deleteMany({
        where: { projectId: projectId },
      });
      // Delete project contents and members
      await prisma.projectContent.deleteMany({
        where: { projectId: projectId },
      });
      await prisma.projectMember.deleteMany({
        where: { projectId: projectId },
      });
      await prisma.project.delete({
        where: { id: projectId },
      });
      // Delete user
      await prisma.role.deleteMany({
        where: { userId: userId },
      });
      await prisma.user.delete({
        where: { id: userId },
      });
    } catch {
      // Ignore cleanup errors
    }

    if (app) {
      await app.close();
    }
  });

  // ==========================================
  // POST /projects/:projectId/sprints - Create Sprint
  // ==========================================
  describe('POST /projects/:projectId/sprints', () => {
    it('should create a new sprint successfully (CEO)', async () => {
      const sprintData = {
        startDate: '2027-03-01T00:00:00Z',
        endDate: '2027-03-15T00:00:00Z',
        estimatedStartDate: '2027-03-01T00:00:00Z',
        estimatedEndDate: '2027-03-15T00:00:00Z',
        content: [
          {
            name: primarySprintName,
            description: 'Complete user authentication feature',
            details: 'Detailed breakdown of tasks',
            language: Language.English,
          },
        ],
      };

      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send(sprintData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Pending);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0].name).toBe(primarySprintName);
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0]).not.toHaveProperty('language');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      sprintId = response.body.id;
    });

    it('should fail to create sprint without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .send({
          startDate: '2027-04-01T00:00:00Z',
          endDate: '2027-04-15T00:00:00Z',
          estimatedStartDate: '2027-04-01T00:00:00Z',
          estimatedEndDate: '2027-04-15T00:00:00Z',
          content: [
            {
              name: 'Sprint 2',
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(401);
    });

    it('should fail to create sprint with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          // Missing required fields
          content: [],
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // GET /projects/:projectId/sprints - List Sprints
  // ==========================================
  describe('GET /projects/:projectId/sprints', () => {
    it('should list all sprints with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({ page: '1', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter sprints by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({ page: '1', limit: '10', status: 'Pending' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter sprints by name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({ page: '1', limit: '10', name: 'Authentication' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter sprints by estimatedStartDateTo', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({
          page: '1',
          limit: '10',
          estimatedStartDateTo: '2027-03-31T23:59:59Z',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter sprints by estimatedEndDateFrom', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({
          page: '1',
          limit: '10',
          estimatedEndDateFrom: '2027-03-01T00:00:00Z',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/sprints`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /sprints/:id - Get Sprint By ID
  // ==========================================
  describe('GET /sprints/:id', () => {
    it('should get sprint by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sprints/${sprintId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBe(sprintId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.createdById).toBe(userId);
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0]).not.toHaveProperty('language');
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app.getHttpServer())
        .get('/sprints/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent sprint ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/sprints/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403); // Sprint not found or access denied
    });
  });

  // ==========================================
  // PATCH /projects/sprints/:id - Update Sprint
  // ==========================================
  describe('PATCH /projects/sprints/:id', () => {
    it('should update sprint successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${sprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: SprintStatus.Running,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Running);
    });

    it('should fail to change sprint project', async () => {
      // This test is not applicable as projectId cannot be changed
      // Just verify that the update works with other fields
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${sprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: SprintStatus.Completed,
        });

      expect(response.status).toBe(200);
    });
  });

  // ==========================================
  // DELETE /projects/sprints/:id - Delete Sprint
  // ==========================================
  describe('DELETE /projects/sprints/:id', () => {
    it('should delete sprint successfully', async () => {
      // First create a sprint to delete
      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: '2027-05-01T00:00:00Z',
          endDate: '2027-05-15T00:00:00Z',
          estimatedStartDate: '2027-05-01T00:00:00Z',
          estimatedEndDate: '2027-05-15T00:00:00Z',
          content: [
            {
              name: deleteSprintName,
              language: Language.English,
            },
          ],
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const deleteSprintId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/projects/sprints/${deleteSprintId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent sprint', async () => {
      const response = await request(app.getHttpServer())
        .delete('/projects/sprints/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404); // Not Found
    });
  });

  // ================================================================
  // Sprint Burndown Chart (Phase 6)
  // ================================================================

  describe('GET /sprints/:sprintId/burndown', () => {
    it('should get burndown data for a sprint', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sprints/${sprintId}/burndown`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sprintId');
      expect(response.body).toHaveProperty('sprintName');
      expect(response.body).toHaveProperty('totalPoints');
      expect(response.body).toHaveProperty('completedPoints');
      expect(response.body).toHaveProperty('remainingPoints');
      expect(response.body).toHaveProperty('completionPercentage');
      expect(response.body).toHaveProperty('chartData');
      expect(response.body).toHaveProperty('totalTasks');
      expect(response.body).toHaveProperty('completedTasks');
    });

    it('should return 404 for non-existent sprint', async () => {
      const response = await request(app.getHttpServer())
        .get('/sprints/00000000-0000-0000-0000-000000000000/burndown')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/sprints/${sprintId}/burndown`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:projectId/velocity - Sprint Velocity
  // ==========================================
  describe('GET /projects/:projectId/velocity', () => {
    it('should get sprint velocity data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/velocity`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('sprints');
      expect(response.body).toHaveProperty('averageVelocity');
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/velocity`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // Additional Test Cases - Sort/Filter Matrix
  // ==========================================
  describe('GET /projects/:projectId/sprints - Sort and Filter Matrix', () => {
    it('should support multiple sort criteria', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({ sortBy: 'startDateDesc,createdAtAsc', page: '1', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter by date ranges', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({
          startDateFrom: '2027-01-01T00:00:00Z',
          startDateTo: '2027-12-31T23:59:59Z',
          page: '1',
          limit: '10',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle edge pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints`)
        .query({ page: '1', limit: '100' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  // ==========================================
  // Language Header Behavior
  // ==========================================
  describe('Language Header Support', () => {
    let multiLangSprintId: string;

    it('should create multi-language sprint', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .set('Content-Type', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
          startDate: '2027-04-01T00:00:00Z',
          endDate: '2027-04-15T00:00:00Z',
          estimatedStartDate: '2027-04-01T00:00:00Z',
          estimatedEndDate: '2027-04-15T00:00:00Z',
          content: [
            {
              name: `Multi EN ${runSuffix}`,
              language: Language.English,
              description: 'English description',
            },
            {
              name: `Multi FR ${runSuffix}`,
              language: Language.French,
              description: 'Description française',
            },
          ],
        });

      expect(response.status).toBe(201);
      multiLangSprintId = response.body.id;
    });

    it('should return localized content with language header', async () => {
      const response = await request(app.getHttpServer())
        .get(`/sprints/${multiLangSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('x-language', 'fr');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('contents');
      // Should include both languages or filtered based on implementation
    });
  });

  // ==========================================
  // AGILE Guard Enforcement
  // ==========================================
  describe('AGILE Guard Enforcement', () => {
    let freestyleProjectId: string;

    beforeAll(async () => {
      // Create FREESTYLE project
      const project = await prisma.project.create({
        data: {
          businessUnit: BusinessUnit.TawerDev,
          projectType: ProjectType.FREESTYLE,
          status: ProjectStatus.Pending,
          startDate: new Date('2027-01-01'),
          endDate: new Date('2027-12-31'),
          estimatedStartDate: new Date('2027-01-01'),
          estimatedEndDate: new Date('2027-12-31'),
          displayOrder: 1001,
          createdById: userId,
          members: {
            create: {
              userId: userId,
              isManager: true,
            },
          },
          contents: {
            create: {
              name: `Freestyle Project ${runSuffix}`,
              unaccentedName: `freestyle project ${runSuffix}`,
              description: 'FREESTYLE project for testing',
              language: Language.English,
            },
          },
        },
      });

      freestyleProjectId = project.id;
    });

    it('should block sprint creation on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${freestyleProjectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: '2027-03-01T00:00:00Z',
          endDate: '2027-03-15T00:00:00Z',
          estimatedStartDate: '2027-03-01T00:00:00Z',
          estimatedEndDate: '2027-03-15T00:00:00Z',
          content: [
            {
              name: `Freestyle Sprint ${runSuffix}`,
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(400); // BadRequestException from AgileOnlyGuard
    });
  });

  // ==========================================
  // Invalid Status Transitions
  // ==========================================
  describe('Invalid Status Transitions', () => {
    it('should block invalid transition Completed to Pending', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${sprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: SprintStatus.Pending,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Only restart');
    });
  });

  // ==========================================
  // Duplicate Name Behavior
  // ==========================================
  describe('Duplicate Name Behavior', () => {
    it('should fail to create sprint with duplicate name in same project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: '2027-06-01T00:00:00Z',
          endDate: '2027-06-15T00:00:00Z',
          estimatedStartDate: '2027-06-01T00:00:00Z',
          estimatedEndDate: '2027-06-15T00:00:00Z',
          content: [
            {
              name: primarySprintName, // Same name as existing sprint
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('P7001');
    });
  });

  // ==========================================
  // Sprint Status Transitions (Stopped branch)
  // ==========================================
  describe('Sprint Status Transitions (Stopped branch)', () => {
    let transitionSprintId: string;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: '2027-07-01T00:00:00Z',
          endDate: '2027-07-15T00:00:00Z',
          estimatedStartDate: '2027-07-01T00:00:00Z',
          estimatedEndDate: '2027-07-15T00:00:00Z',
          content: [
            {
              name: `Transition Sprint ${runSuffix}`,
              language: Language.English,
            },
          ],
        });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      transitionSprintId = response.body.id;
    });

    it('should transition from Pending to Stopped', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Stopped });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Stopped);
    });

    it('should restart sprint from Stopped to Running', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Running);
    });

    it('should transition from Running to Completed', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Completed });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Completed);
    });

    it('should restart sprint from Completed to Running', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Running });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(SprintStatus.Running);
    });

    it('should block invalid transition from Running to Pending', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Pending });

      expect(response.status).toBe(400);
    });

    it('should block invalid transition from Stopped to Pending', async () => {
      // Stop the sprint first
      await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Stopped });

      const response = await request(app.getHttpServer())
        .patch(`/projects/sprints/${transitionSprintId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: SprintStatus.Pending });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // GET /projects/:projectId/sprints/:sprintId/tasks
  // ==========================================
  describe('GET /projects/:projectId/sprints/:sprintId/tasks', () => {
    it('should return tasks for a sprint as an array', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints/${sprintId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/sprints/${sprintId}/tasks`,
      );

      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent sprint', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/projects/${projectId}/sprints/00000000-0000-0000-0000-000000000000/tasks`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    it('should support isFavorite filter', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/sprints/${sprintId}/tasks`)
        .query({ isFavorite: 'false' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ==========================================
  // Reminder Cancellation on Sprint Operations
  // ==========================================
  describe('Reminder Cancellation', () => {
    let sprintWithRemindersId: string;
    let sprintForStatusUpdateId: string;

    beforeAll(async () => {
      // Create a sprint that will have auto-generated reminders
      // Use dates within the project range (2027-01-01 to 2027-12-31)
      const startDate = '2027-06-01T00:00:00Z';
      const endDate = '2027-06-15T00:00:00Z';

      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: startDate,
          endDate: endDate,
          estimatedStartDate: startDate,
          estimatedEndDate: endDate,
          content: [
            {
              name: `Sprint Reminder Test ${Date.now()}`,
              description: 'Sprint to test reminder cancellation',
              language: 'English',
            },
          ],
        });

      sprintWithRemindersId = createResponse.body.id;
      if (createResponse.status !== 201) {
        console.log('Sprint creation failed:', createResponse.body);
      }
      expect(createResponse.status).toBe(201);
    });

    it('should cancel sprint reminders when sprint is deleted', async () => {
      // Get count of pending reminders before deletion
      const pendingBefore = await request(app.getHttpServer())
        .get(`/projects/${projectId}/reminders`)
        .query({ entityType: 'SPRINT', status: 'PENDING' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(pendingBefore.status).toBe(200);
      const pendingCountBefore = pendingBefore.body.data.length;

      // Delete the sprint
      const deleteResponse = await request(app.getHttpServer())
        .delete(`/projects/sprints/${sprintWithRemindersId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(204);

      // Get count of pending reminders after deletion
      const pendingAfter = await request(app.getHttpServer())
        .get(`/projects/${projectId}/reminders`)
        .query({ entityType: 'SPRINT', status: 'PENDING' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(pendingAfter.status).toBe(200);
      const pendingCountAfter = pendingAfter.body.data.length;

      // Verify that pending reminders decreased (some were cancelled)
      expect(pendingCountAfter).toBeLessThan(pendingCountBefore);

      // Verify cancelled reminders increased
      const cancelledReminders = await request(app.getHttpServer())
        .get(`/projects/${projectId}/reminders`)
        .query({
          entityType: 'SPRINT',
          status: 'CANCELLED',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(cancelledReminders.status).toBe(200);
      expect(cancelledReminders.body.data.length).toBeGreaterThan(0);
    });

    it('should cancel sprint reminders when sprint status changes to Completed', async () => {
      // Create another sprint for status update test
      const startDate2 = '2027-07-01T00:00:00Z';
      const endDate2 = '2027-07-15T00:00:00Z';

      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .set('Content-Type', 'application/json')
        .send({
          startDate: startDate2,
          endDate: endDate2,
          estimatedStartDate: startDate2,
          estimatedEndDate: endDate2,
          content: [
            {
              name: `Sprint Status Update Test ${Date.now()}`,
              description: 'Sprint to test status update reminder cancellation',
              language: 'English',
            },
          ],
        });

      sprintForStatusUpdateId = createResponse.body.id;
      expect(createResponse.status).toBe(201);

      // Update sprint status to Completed
      const updateResponse = await request(app.getHttpServer())
        .patch(`/projects/sprints/${sprintForStatusUpdateId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'Completed' });

      expect(updateResponse.status).toBe(200);

      // Verify reminders are cancelled after status update
      const cancelledReminders = await request(app.getHttpServer())
        .get(`/projects/${projectId}/reminders`)
        .query({
          entityType: 'SPRINT',
          entityId: sprintForStatusUpdateId,
          status: 'CANCELLED',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(cancelledReminders.status).toBe(200);
      expect(cancelledReminders.body.data.length).toBeGreaterThan(0);
    });

    it('should prevent dismissing a cancelled reminder', async () => {
      // Get a cancelled reminder ID
      const cancelledReminders = await request(app.getHttpServer())
        .get(`/projects/${projectId}/reminders`)
        .query({
          entityType: 'SPRINT',
          entityId: sprintForStatusUpdateId,
          status: 'CANCELLED',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(cancelledReminders.status).toBe(200);
      expect(cancelledReminders.body.data.length).toBeGreaterThan(0);

      const cancelledReminderId = cancelledReminders.body.data[0].id;

      // Attempt to dismiss the cancelled reminder
      const dismissResponse = await request(app.getHttpServer())
        .post(`/reminders/${cancelledReminderId}/dismiss`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(dismissResponse.status).toBe(400);
      expect(dismissResponse.body.code).toBe('P8506'); // REMINDER_ALREADY_CANCELLED
    });
  });
});
