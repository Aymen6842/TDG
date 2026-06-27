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
  Language,
} from '@prisma/client';

jest.setTimeout(30000);

describe('Projects API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let projectId: string;
  let managerUserId: string;
  let outsiderUserId: string;
  let creativeExecutiveUserId: string;
  let managerAuthToken: string;
  let outsiderAuthToken: string;
  let creativeExecutiveAuthToken: string;

  const testEmail = `project-test-${Date.now()}@example.com`;
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
        name: 'Project Test CEO',
        phone: testPhone,
        unaccentedName: 'project test ceo',
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

    const managerEmail = `project-member-${Date.now()}@example.com`;
    const managerPhone = `+216${(
      Date.now().toString() +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
    ).slice(-8)}`;
    const managerUser = await prisma.user.create({
      data: {
        email: managerEmail,
        name: 'Project Member User',
        phone: managerPhone,
        unaccentedName: 'project member user',
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: UserType.TawerDevProjectManager,
          },
        },
      },
      include: { roles: true },
    });

    managerUserId = managerUser.id;

    managerAuthToken = jwtService.sign(
      {
        id: managerUser.id,
        name: managerUser.name,
        roles: managerUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );

    const outsiderEmail = `project-outsider-${Date.now()}@example.com`;
    const outsiderPhone = `+216${(
      Date.now().toString() +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
    ).slice(-8)}`;
    const outsiderUser = await prisma.user.create({
      data: {
        email: outsiderEmail,
        name: 'Project Outsider User',
        phone: outsiderPhone,
        unaccentedName: 'project outsider user',
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: UserType.TawerDevProjectManager,
          },
        },
      },
      include: { roles: true },
    });

    outsiderUserId = outsiderUser.id;

    outsiderAuthToken = jwtService.sign(
      {
        id: outsiderUser.id,
        name: outsiderUser.name,
        roles: outsiderUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );

    const creativeExecutiveEmail = `project-cmo-${Date.now()}@example.com`;
    const creativeExecutivePhone = `+216${(
      Date.now().toString() +
      Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
    ).slice(-8)}`;
    const creativeExecutiveUser = await prisma.user.create({
      data: {
        email: creativeExecutiveEmail,
        name: 'Creative Executive User',
        phone: creativeExecutivePhone,
        unaccentedName: 'creative executive user',
        password: 'hashed_password_not_used',
        isActive: true,
        roles: {
          create: {
            type: UserType.CMO,
          },
        },
      },
      include: { roles: true },
    });

    creativeExecutiveUserId = creativeExecutiveUser.id;

    creativeExecutiveAuthToken = jwtService.sign(
      {
        id: creativeExecutiveUser.id,
        name: creativeExecutiveUser.name,
        roles: creativeExecutiveUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );

    await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: 'AGILE',
        status: ProjectStatus.Pending,
        startDate: new Date('2026-01-01T00:00:00Z'),
        endDate: new Date('2026-12-31T00:00:00Z'),
        estimatedStartDate: new Date('2026-01-01T00:00:00Z'),
        estimatedEndDate: new Date('2026-12-31T00:00:00Z'),
        displayOrder: 999,
        createdById: userId,
        members: {
          create: [
            {
              userId: managerUserId,
              isManager: true,
            },
          ],
        },
        contents: {
          create: [
            {
              name: `Test Project Member Filter ${Date.now()}`,
              unaccentedName: `test project member filter ${Date.now()}`,
              description: 'Project for userId filtering tests',
              language: Language.English,
            },
          ],
        },
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    try {
      await prisma.projectContent.deleteMany({
        where: { name: { contains: 'Test Project' } },
      });
      await prisma.projectMember.deleteMany({
        where: { userId: userId },
      });
      await prisma.projectMember.deleteMany({
        where: { userId: managerUserId },
      });
      await prisma.projectMember.deleteMany({
        where: { userId: outsiderUserId },
      });
      await prisma.project.deleteMany({
        where: { createdById: userId },
      });
      await prisma.role.deleteMany({
        where: {
          userId: {
            in: [
              userId,
              managerUserId,
              outsiderUserId,
              creativeExecutiveUserId,
            ],
          },
        },
      });
      await prisma.user.deleteMany({
        where: {
          id: {
            in: [
              userId,
              managerUserId,
              outsiderUserId,
              creativeExecutiveUserId,
            ],
          },
        },
      });
    } catch {
      // Ignore cleanup errors
    }
    await app.close();
  });

  // ==========================================
  // POST /projects/register - Create Project
  // ==========================================
  describe('POST /projects/register', () => {
    it('should create a new project successfully (CEO)', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          displayOrder: 1000,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Test Project Alpha',
              description: 'Test project description',
              details: 'Test project details',
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.businessUnit).toBe(BusinessUnit.TawerDev);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0].name).toBe('Test Project Alpha');
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0]).not.toHaveProperty('language');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      projectId = response.body.id;
    });

    it('should fail to create project with duplicate name (P2002)', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          displayOrder: 1001,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Test Project Alpha', // Same name as before
              description: 'Duplicate project',
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(409);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.code).toBe('P6001'); // PROJECT_ALREADY_EXISTS
    });

    it('should fail to create project without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          contents: [
            {
              name: 'Test Project Beta',
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(401);
    });

    it('should fail to create project with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: 'InvalidBusinessUnit',
          // Missing required fields
        });

      expect(response.status).toBe(400);
    });

    it('should default content language to English when omitted', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          displayOrder: 1005,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Test Project No Language',
              description: 'Language should default to English',
            },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0].name).toBe('Test Project No Language');
    });

    it('should default manager and estimated dates for frontend placeholder payload', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          projectType: 'AGILE',
          status: ProjectStatus.Pending,
          startDate: '2026-04-06T13:00:43.231Z',
          endDate: '2026-04-13T13:00:43.231Z',
          paid: false,
          displayOrder: 1000,
          contents: [
            {
              name: `test project from front3 ${Date.now()}`,
              description: '',
              details: '',
              language: Language.English,
            },
          ],
          members: [
            {
              userId: '',
              isManager: true,
            },
          ],
          manager: '',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.members[0].userId).toBe(userId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.members[0].isManager).toBe(true);
    });
  });

  // ==========================================
  // GET /projects - List Projects
  // ==========================================
  describe('GET /projects', () => {
    it('should list all projects with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (response.body.data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(response.body.data[0].contents[0]).not.toHaveProperty(
          'language',
        );
      }
    });

    it('should filter projects by business unit', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ businessUnit: BusinessUnit.TawerDev });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.body.data.forEach((project: { businessUnit: string }) => {
        expect(project.businessUnit).toBe(BusinessUnit.TawerDev);
      });
    });

    it('should filter projects by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ name: 'Test Project' });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should order by displayOrder ASC then createdAt DESC by default', async () => {
      const orderPrefix = `Order Check ${Date.now()}`;
      const sharedDisplayOrder = 77;
      const olderCreatedAt = new Date('2026-01-01T10:00:00.000Z');
      const newerCreatedAt = new Date('2026-01-01T10:00:01.000Z');

      await prisma.project.create({
        data: {
          businessUnit: BusinessUnit.TawerDev,
          projectType: 'AGILE',
          status: ProjectStatus.Pending,
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          estimatedStartDate: new Date('2026-01-01T00:00:00.000Z'),
          estimatedEndDate: new Date('2026-12-31T00:00:00.000Z'),
          displayOrder: sharedDisplayOrder,
          createdById: userId,
          createdAt: olderCreatedAt,
          members: {
            create: [
              {
                userId,
                isManager: true,
              },
            ],
          },
          contents: {
            create: [
              {
                name: `${orderPrefix} older`,
                unaccentedName: `${orderPrefix.toLowerCase()} older`,
                description: 'Ordering seed older',
                language: Language.English,
              },
            ],
          },
        },
      });

      await prisma.project.create({
        data: {
          businessUnit: BusinessUnit.TawerDev,
          projectType: 'AGILE',
          status: ProjectStatus.Pending,
          startDate: new Date('2026-01-01T00:00:00.000Z'),
          endDate: new Date('2026-12-31T00:00:00.000Z'),
          estimatedStartDate: new Date('2026-01-01T00:00:00.000Z'),
          estimatedEndDate: new Date('2026-12-31T00:00:00.000Z'),
          displayOrder: sharedDisplayOrder,
          createdById: userId,
          createdAt: newerCreatedAt,
          members: {
            create: [
              {
                userId,
                isManager: true,
              },
            ],
          },
          contents: {
            create: [
              {
                name: `${orderPrefix} newer`,
                unaccentedName: `${orderPrefix.toLowerCase()} newer`,
                description: 'Ordering seed newer',
                language: Language.English,
              },
            ],
          },
        },
      });

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ name: orderPrefix, page: 1, limit: 10 });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const firstName = response.body.data[0]?.contents?.[0]?.name as string;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const secondName = response.body.data[1]?.contents?.[0]?.name as string;

      expect(firstName).toContain('newer');
      expect(secondName).toContain('older');
    });

    it('should support combined date filters with date-only values', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          estimatedStartDateFrom: '2025-01-01',
          estimatedEndDateTo: '2025-12-31',
          createdAtFrom: '2025-01-01',
          createdAtTo: '2026-12-31',
          startDateFrom: '2025-01-01',
          startDateTo: '2025-12-31',
          paid: false,
          status: ProjectStatus.Pending,
          page: 1,
          limit: 10,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter projects by language', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ language: 'en' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    it('should allow executive to request own projects automatically with own=true', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ own: true });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.body.data.forEach(
        (project: { members: Array<{ userId: string }> }) => {
          const hasCurrentUser = project.members.some(
            (member) => member.userId === userId,
          );
          expect(hasCurrentUser).toBe(true);
        },
      );
    });

    it('should allow executive to filter projects by memberName', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ memberName: 'Project Member User' });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.body.data.forEach(
        (project: { members: Array<{ user: { name: string } }> }) => {
          const hasMatchingMember = project.members.some((member) =>
            member.user?.name?.includes('Project Member User'),
          );
          expect(hasMatchingMember).toBe(true);
        },
      );
    });

    it('should ignore memberName filter for non-executive and keep own scope', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${managerAuthToken}`)
        .query({ memberName: 'Project Creator 2' });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      response.body.data.forEach(
        (project: { members: Array<{ userId: string }> }) => {
          const hasManager = project.members.some(
            (member) => member.userId === managerUserId,
          );
          expect(hasManager).toBe(true);
        },
      );
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/projects');

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:id - Get Project by ID
  // ==========================================
  describe('GET /projects/:id', () => {
    it('should get project by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBe(projectId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0].name).toBe('Test Project Alpha');
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0]).not.toHaveProperty('language');
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent project ID', async () => {
      const response = await request(app.getHttpServer())
        .get('/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403); // Forbidden (P2025)
    });
  });

  describe('GET /projects/:id/capacity', () => {
    it('should return project capacity summary', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/capacity`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty('activeSprints');
      expect(response.body).toHaveProperty('totalCapacityPoints');
      expect(response.body).toHaveProperty('totalCommittedPoints');
      expect(response.body).toHaveProperty('totalRemainingPoints');
      expect(response.body).toHaveProperty('unassignedCommittedPoints');
      expect(Array.isArray(response.body.members)).toBe(true);
    });
  });

  // ==========================================
  // PATCH /projects/:id - Update Project
  // ==========================================
  describe('PATCH /projects/:id', () => {
    it('should update project successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ProjectStatus.Running,
          contents: [
            {
              name: 'Test Project Alpha Updated',
              description: 'Updated description',
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(ProjectStatus.Running);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0].name).toBe('Test Project Alpha Updated');
      // Verify language is NOT returned in the response
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.contents[0]).not.toHaveProperty('language');
    });

    it('should fail to change business unit', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerCreative,
        });

      expect(response.status).toBe(400);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.code).toBe('P6005'); // PROJECT_CANNOT_CHANGE_BUSINESS_UNIT
    });

    it('should fail to update with duplicate name', async () => {
      // First create another project
      await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          displayOrder: 1002,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Test Project Gamma',
              language: Language.English,
            },
          ],
        });

      // Try to update first project with same name
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          contents: [
            {
              name: 'Test Project Gamma', // Duplicate name
              language: Language.English,
            },
          ],
        });

      expect(response.status).toBe(409);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.code).toBe('P6001'); // PROJECT_ALREADY_EXISTS
    });

    it('should archive and restore via single update endpoint', async () => {
      // Archive using PATCH /projects/:id with isArchived=true
      const archiveResponse = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isArchived: true,
        });

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body).toHaveProperty('isArchived', true);

      // Restore using PATCH /projects/:id with isArchived=false
      const restoreResponse = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isArchived: false,
        });

      expect(restoreResponse.status).toBe(200);
      expect(restoreResponse.body).toHaveProperty('isArchived', false);
    });

    it('should update kanban settings through the main update endpoint', async () => {
      // First create some task statuses for the project
      await prisma.projectTaskStatus.createMany({
        data: [
          { projectId, name: 'IN_PROGRESS', order: 1, isArchived: false },
          { projectId, name: 'IN_REVIEW', order: 2, isArchived: false },
        ],
      });

      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          kanbanSettings: {
            IN_PROGRESS: 4,
            IN_REVIEW: 2,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('kanbanSettings');
      expect(response.body.kanbanSettings).toEqual({
        IN_PROGRESS: 4,
        IN_REVIEW: 2,
      });
    });
  });

  describe('GET /projects/:id/kanban/settings', () => {
    it('should return kanban settings for the project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban/settings`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        projectId,
        kanbanSettings: {
          IN_PROGRESS: 4,
          IN_REVIEW: 2,
        },
      });
    });

    it('should block out-of-scope executives from reading kanban settings', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban/settings`)
        .set('Authorization', `Bearer ${creativeExecutiveAuthToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ==========================================
  // DELETE /projects/:id - Delete Project
  // ==========================================
  describe('DELETE /projects/:id', () => {
    it('should delete project successfully', async () => {
      // Create a project to delete
      const createResponse = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          status: ProjectStatus.Pending,
          startDate: '2025-01-01T00:00:00Z',
          endDate: '2025-12-31T00:00:00Z',
          estimatedStartDate: '2025-01-01T00:00:00Z',
          estimatedEndDate: '2025-12-31T00:00:00Z',
          displayOrder: 1003,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Test Project To Delete',
              language: Language.English,
            },
          ],
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const deleteProjectId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/projects/${deleteProjectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail to delete project without authentication', async () => {
      const response = await request(app.getHttpServer()).delete(
        `/projects/${projectId}`,
      );

      expect(response.status).toBe(401);
    });

    it('should fail to delete non-existent project', async () => {
      const response = await request(app.getHttpServer())
        .delete('/projects/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403); // Forbidden
    });
  });

  // ================================================================
  // Project Archive (Phase 6)
  // ================================================================

  describe('POST /projects/:projectId/archive', () => {
    it('should archive a project', async () => {
      // Create a project first
      const createResponse = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-12-31T00:00:00Z',
          estimatedStartDate: '2026-01-01T00:00:00Z',
          estimatedEndDate: '2026-12-31T00:00:00Z',
          paid: false,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Project To Archive',
              language: Language.English,
            },
          ],
        });

      const archiveProjectId = createResponse.body.id;

      // Archive the project
      const archiveResponse = await request(app.getHttpServer())
        .post(`/projects/${archiveProjectId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(archiveResponse.status).toBe(200);
      expect(archiveResponse.body).toHaveProperty('isArchived', true);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/00000000-0000-0000-0000-000000000000/archive')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /projects/:projectId/restore', () => {
    it('should restore an archived project', async () => {
      // Create a project first
      const createResponse = await request(app.getHttpServer())
        .post('/projects/register')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          businessUnit: BusinessUnit.TawerDev,
          startDate: '2026-01-01T00:00:00Z',
          endDate: '2026-12-31T00:00:00Z',
          estimatedStartDate: '2026-01-01T00:00:00Z',
          estimatedEndDate: '2026-12-31T00:00:00Z',
          paid: false,
          manager: userId,
          createdById: userId,
          members: [
            {
              userId: userId,
              isManager: true,
            },
          ],
          contents: [
            {
              name: 'Project To Restore',
              language: Language.English,
            },
          ],
        });

      const restoreProjectId = createResponse.body.id;

      // Archive first
      await request(app.getHttpServer())
        .post(`/projects/${restoreProjectId}/archive`)
        .set('Authorization', `Bearer ${authToken}`);

      // Then restore
      const restoreResponse = await request(app.getHttpServer())
        .post(`/projects/${restoreProjectId}/restore`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(restoreResponse.status).toBe(200);
      expect(restoreResponse.body).toHaveProperty('isArchived', false);
    });

    it('should return 404 for non-existent project', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/00000000-0000-0000-0000-000000000000/restore')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==============================================================
  // Project Members Management
  // ==============================================================

  describe('POST /projects/:projectId/members', () => {
    it('should add a member to a project via invitation', async () => {
      const invitedEmail = `newmember-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: invitedEmail,
          isManager: false,
          expiresInDays: 7,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', invitedEmail);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should add an existing user directly by userId with a member response shape', async () => {
      const directMemberEmail = `direct-member-${Date.now()}@example.com`;
      const directMemberPhone = `+216${(
        Date.now().toString() +
        Math.floor(Math.random() * 1000000)
          .toString()
          .padStart(6, '0')
      ).slice(-8)}`;

      const directMember = await prisma.user.create({
        data: {
          email: directMemberEmail,
          name: 'Direct Project Member',
          phone: directMemberPhone,
          unaccentedName: 'direct project member',
          password: 'hashed_password_not_used',
          isActive: true,
          roles: {
            create: {
              type: UserType.SoftwareEngineer,
            },
          },
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/members`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          userId: directMember.id,
          isManager: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId', directMember.id);
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty(
        'memberName',
        'Direct Project Member',
      );
      expect(response.body).toHaveProperty('isManager', false);
      expect(response.body).toHaveProperty('createdAt');

      await prisma.projectMember.deleteMany({
        where: {
          projectId,
          userId: directMember.id,
        },
      });
      await prisma.role.deleteMany({ where: { userId: directMember.id } });
      await prisma.user.delete({ where: { id: directMember.id } });
    });

    it('should fail with invalid project ID', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/invalid-uuid/members')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'test@example.com',
          isManager: false,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /projects/:projectId/members/:memberId', () => {
    it('should update a member role', async () => {
      // First get project to find a member ID
      const projectResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const members = projectResponse.body.members as Array<{
        id: string;
        isManager: boolean;
      }>;
      const memberId = members[0]?.id;
      const managerCount = members.filter((member) => member.isManager).length;
      const targetMember = members.find((member) => member.id === memberId);

      if (memberId) {
        const shouldBeManager =
          targetMember?.isManager === true && managerCount <= 1;

        const response = await request(app.getHttpServer())
          .patch(`/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            isManager: shouldBeManager ? true : false,
          });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty(
          'isManager',
          shouldBeManager ? true : false,
        );
      }
    });
  });

  describe('DELETE /projects/:projectId/members/:memberId', () => {
    it('should remove a real project member', async () => {
      // Directly insert a project member into the DB to delete
      const member = await prisma.projectMember.create({
        data: {
          projectId,
          userId: outsiderUserId,
          isManager: false,
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/members/${member.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail when outsider tries to remove a member', async () => {
      // Get a real member from the project
      const projectResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${authToken}`);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const members = projectResponse.body.members as Array<{ id: string }>;
      const memberId = members[0]?.id;

      if (memberId) {
        const response = await request(app.getHttpServer())
          .delete(`/projects/${projectId}/members/${memberId}`)
          .set('Authorization', `Bearer ${outsiderAuthToken}`);

        expect(response.status).toBe(403);
      }
    });
  });

  // ==============================================================
  // Permission Tests — Outsider access
  // ==============================================================

  describe('Outsider permission tests', () => {
    it('outsider cannot GET a project they are not a member of', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsiderAuthToken}`);

      expect(response.status).toBe(403);
    });

    it('outsider cannot PATCH a project they are not a member of', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsiderAuthToken}`)
        .send({ status: ProjectStatus.Running });

      expect(response.status).toBe(403);
    });

    it('outsider cannot DELETE a project they are not a member of', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}`)
        .set('Authorization', `Bearer ${outsiderAuthToken}`);

      expect(response.status).toBe(403);
    });

    it('outsider cannot archive a project they are not a member of', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${outsiderAuthToken}`);

      expect(response.status).toBe(403);
    });
  });

  // ==============================================================
  // Project Invitations Management
  // ==============================================================

  describe('POST /projects/:projectId/invitations', () => {
    it('should create an invitation', async () => {
      const invitedEmail = `inviteduser-${Date.now()}@example.com`;
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: invitedEmail,
          isManager: false,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('email', invitedEmail);
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('createdAt');
    });

    it('should fail with invalid email', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'invalid-email',
          isManager: false,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /projects/:projectId/invitations/:invitationId/resend', () => {
    it('should resend an invitation', async () => {
      const invitedEmail = `resendtest-${Date.now()}@example.com`;
      // First create an invitation
      const inviteResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: invitedEmail,
          isManager: false,
        });

      expect(inviteResponse.status).toBe(201);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const invitationId = inviteResponse.body.id;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const originalToken = inviteResponse.body.token as string;

      // Resend the invitation
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/invitations/${invitationId}/resend`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', invitationId);
      expect(response.body).toHaveProperty('email', invitedEmail);
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty('status', 'PENDING');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body.token).not.toBe(originalToken);
    });
  });

  describe('POST /invitations/accept', () => {
    it('should fail to accept invitation without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/projects/invitations/accept')
        .send({
          token: '123e4567-e89b-12d3-a456-426614174000',
        });

      expect(response.status).toBe(401);
    });

    it('should accept an invitation', async () => {
      // First create an invitation with a different user
      const otherUser = await prisma.user.create({
        data: {
          email: `accept-test-${Date.now()}@example.com`,
          name: 'Accept Test User',
          phone: `+216${(
            Date.now().toString() +
            Math.floor(Math.random() * 1000000)
              .toString()
              .padStart(6, '0')
          ).slice(-8)}`,
          unaccentedName: 'accept test user',
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

      // Generate token for other user
      const payload = {
        id: otherUser.id,
        name: otherUser.name,
        roles: otherUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      };

      const otherUserToken = jwtService.sign(payload, {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      });

      // Create invitation for other user
      const inviteResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/invitations`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: otherUser.email,
          isManager: false,
        });

      expect(inviteResponse.status).toBe(201);

      const invitation = await prisma.projectInvitation.findUnique({
        where: {
          projectId_email: {
            projectId,
            email: otherUser.email,
          },
        },
        select: { token: true },
      });

      expect(invitation?.token).toBeDefined();

      // Accept the invitation with other user's token
      const response = await request(app.getHttpServer())
        .post('/projects/invitations/accept')
        .set('Authorization', `Bearer ${otherUserToken}`)
        .send({
          token: invitation!.token,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('userId');
      expect(response.body).toHaveProperty('projectId', projectId);
      expect(response.body).toHaveProperty('memberName', 'Accept Test User');

      // Cleanup
      await prisma.projectMember.deleteMany({
        where: { userId: otherUser.id, projectId: projectId },
      });
      await prisma.projectInvitation.deleteMany({
        where: { email: otherUser.email },
      });
      await prisma.role.deleteMany({ where: { userId: otherUser.id } });
      await prisma.user.delete({ where: { id: otherUser.id } });
    }, 15000);
  });
});
