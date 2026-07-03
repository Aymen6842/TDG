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
  TaskPriority,
  TaskType,
} from '@prisma/client';

// Task.status is now a free String column (Phase 5.2); the former enum's
// system values are kept here as literals so these tests read unchanged.
const TaskStatus = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  TESTING: 'TESTING',
  DONE: 'DONE',
} as const;

jest.setTimeout(30000);

describe('Tasks API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let secondAuthToken: string;
  let userId: string;
  let projectId: string;
  let taskId: string;
  let labelId: string;
  let secondUserId: string; // For mentions test
  let freestyleProjectId: string; // For AGILE guard tests
  let freestyleTaskId: string;

  const testEmail = `task-test-${Date.now()}@example.com`;
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
        name: 'Task Test CEO',
        phone: testPhone,
        unaccentedName: 'task test ceo',
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

    // Create a project first (needed for tasks)
    const project = await prisma.project.create({
      data: {
        businessUnit: BusinessUnit.TawerDev,
        projectType: ProjectType.AGILE, // Required for tasks - AgileOnlyGuard
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
            name: 'Test Project for Tasks',
            unaccentedName: 'test project for tasks',
            description: 'Project created for e2e testing',
            language: 'English',
          },
        },
      },
    });

    projectId = project.id;

    // Create a second user for mentions test
    const secondUser = await prisma.user.create({
      data: {
        email: `mentions-test-${Date.now()}@example.com`,
        name: 'Mentions Test User',
        phone: `+216${(
          Date.now().toString() +
          Math.floor(Math.random() * 1000000)
            .toString()
            .padStart(6, '0')
        ).slice(-8)}`,
        unaccentedName: 'mentions test user',
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

    secondUserId = secondUser.id;

    secondAuthToken = jwtService.sign(
      {
        id: secondUser.id,
        name: secondUser.name,
        roles: secondUser.roles.map((r) => r.type),
        teamsIds: [],
        type: 'access',
      },
      {
        secret: configService.get<string>('SECRET_KEY') || 'test-secret',
        expiresIn: '1h',
      },
    );

    // Add second user to the project
    await prisma.projectMember.create({
      data: {
        projectId: projectId,
        userId: secondUserId,
        isManager: false,
      },
    });
  });

  afterAll(async () => {
    // Cleanup test data
    if (!projectId) return; // Skip cleanup if project creation failed
    try {
      // Delete time entries
      await prisma.taskTimeEntry.deleteMany({
        where: { task: { projectId: projectId } },
      });
      // Delete task labels (project-scoped, cascade deletes assignments)
      await prisma.taskLabel.deleteMany({
        where: { projectId: projectId },
      });
      // Delete project task statuses
      await prisma.projectTaskStatus.deleteMany({
        where: { projectId: projectId },
      });
      // Delete comment likes
      await prisma.taskCommentLike.deleteMany({
        where: { comment: { task: { projectId: projectId } } },
      });
      // Delete task dependencies
      await prisma.taskDependency.deleteMany({
        where: {
          OR: [
            { blockingTask: { projectId: projectId } },
            { blockedTask: { projectId: projectId } },
          ],
        },
      });
      // Delete task comments
      await prisma.taskComment.deleteMany({
        where: { task: { projectId: projectId } },
      });
      // Delete tasks
      await prisma.task.deleteMany({
        where: { projectId: projectId },
      });
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
      // Delete project
      await prisma.project.delete({
        where: { id: projectId },
      });
      // Delete freestyle project if created
      if (freestyleProjectId) {
        await prisma.taskLabel.deleteMany({
          where: { projectId: freestyleProjectId },
        });
        await prisma.projectTaskStatus.deleteMany({
          where: { projectId: freestyleProjectId },
        });
        await prisma.task.deleteMany({
          where: { projectId: freestyleProjectId },
        });
        await prisma.projectContent.deleteMany({
          where: { projectId: freestyleProjectId },
        });
        await prisma.projectMember.deleteMany({
          where: { projectId: freestyleProjectId },
        });
        await prisma.project.delete({
          where: { id: freestyleProjectId },
        });
      }
      // Delete users
      await prisma.role.deleteMany({
        where: { userId: { in: [userId, secondUserId] } },
      });
      await prisma.user.deleteMany({
        where: { id: { in: [userId, secondUserId] } },
      });
    } catch {
      // Ignore cleanup errors.
    }

    await app.close();
  });

  // ==========================================
  // POST /projects/:projectId/tasks - Create Task
  // ==========================================
  describe('POST /projects/:projectId/tasks', () => {
    it('should create a task successfully', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          type: TaskType.TASK,
          priority: TaskPriority.HIGH,
          status: TaskStatus.BACKLOG,
        });

      expect(response.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.title).toBe('Test Task');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.type).toBe(TaskType.TASK);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.priority).toBe(TaskPriority.HIGH);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(TaskStatus.BACKLOG);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      taskId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .send({
          title: 'Test Task',
          type: TaskType.TASK,
          priority: TaskPriority.HIGH,
        });

      expect(response.status).toBe(401);
    });

    it('should fail to create task with invalid data', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing required fields (title is required but type and priority are also required)
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  // Project-Level Label Endpoints
  // ==========================================
  describe('POST /projects/:projectId/labels — create project label', () => {
    it('should create a label for the project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Frontend', color: '#FF5733' });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.name).toBe('Frontend');
      expect(response.body.color).toBe('#FF5733');
      expect(response.body.projectId).toBe(projectId);

      labelId = response.body.id as string;
    });

    it('should apply the default label color when color is omitted', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: `Backend-${Date.now()}` });

      expect(response.status).toBe(201);
      expect(response.body.color).toBe('#6B7280');
    });

    it('should reject duplicate label name in same project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Frontend', color: '#000000' });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('P8601');
    });

    it('should reject invalid hex color', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Bug', color: 'notacolor' });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .send({ name: 'Unauthorized', color: '#FFFFFF' });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /projects/:projectId/labels — list project labels', () => {
    it('should return all labels for the project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.some((l: { id: string }) => l.id === labelId)).toBe(
        true,
      );
    });
  });

  describe('PATCH /projects/:projectId/labels/:labelId — update project label', () => {
    it('should update label name successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Frontend Updated' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Frontend Updated');
      expect(response.body.color).toBe('#FF5733');
      expect(response.body.id).toBe(labelId);
      expect(response.body.updatedAt).toBeDefined();
    });

    it('should update label color successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: '#4CAF50' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Frontend Updated');
      expect(response.body.color).toBe('#4CAF50');
    });

    it('should update both name and color successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Backend', color: '#2196F3' });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Backend');
      expect(response.body.color).toBe('#2196F3');
    });

    it('should reject duplicate label name in same project', async () => {
      // First create another label to test against
      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Duplicate Test', color: '#000000' });

      expect(createResponse.status).toBe(201);

      // Now try to update existing label to same name
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Duplicate Test' });

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('P8601');
    });

    it('should return 404 for non-existent label', async () => {
      const response = await request(app.getHttpServer())
        .patch(
          `/projects/${projectId}/labels/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Ghost Label' });

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8600');
    });

    it('should reject invalid hex color format', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ color: 'invalid-color' });

      expect(response.status).toBe(400);
    });

    it('should reject unauthorized access', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/labels/${labelId}`)
        .send({ name: 'Unauthorized Update' });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /projects/:projectId/tasks/:taskId/labels/:labelId — assign label to task', () => {
    it('should assign a project label to a task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(201);
      expect(response.body.taskId).toBe(taskId);
      expect(response.body.labelId).toBe(labelId);
    });

    it('should reject assigning the same label twice', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(409);
      expect(response.body.code).toBe('P8602');
    });

    it('should return 404 for non-existent label', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/projects/${projectId}/tasks/${taskId}/labels/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8600');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).post(
        `/projects/${projectId}/tasks/${taskId}/labels/${labelId}`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:projectId/tasks - List Tasks
  // ==========================================
  describe('GET /projects/:projectId/tasks', () => {
    it('should list all tasks with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ page: '1', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination.perPage).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by status', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ page: '1', limit: '10', status: 'BACKLOG' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by priority', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ page: '1', limit: '10', priority: 'HIGH' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter tasks by label name', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ page: '1', limit: '10', labelName: 'Backend' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.data.some((task: { id: string }) => task.id === taskId),
      ).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/tasks`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:projectId/tasks/:taskId - Get Task By ID
  // ==========================================
  describe('GET /projects/:projectId/tasks/:taskId', () => {
    it('should get task by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBe(taskId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.title).toBe('Test Task');
    });

    it('should fail with invalid UUID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/invalid-uuid`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should fail with non-existent task ID', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });

    // NEW: Test that comments and subtasks are included in main response (Project Pattern)
    it('should include comments and subtasks in task response', async () => {
      // First add a comment to the task
      await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Test comment for verification' });

      // Now get the task and verify comments are included
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Comments should be included in the response (as per Project Pattern)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.comments).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(Array.isArray(response.body.comments)).toBe(true);
    });

    // NEW: Test that subtasks are included in main response (Project Pattern)
    it('should include subtasks in task response', async () => {
      // Now get the task and verify subtasks are included
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // Subtasks should be included in the response (as per Project Pattern)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.subtasks).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(Array.isArray(response.body.subtasks)).toBe(true);
    });

    it('should include labels in task response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.labels)).toBe(true);
      expect(
        response.body.labels.some(
          (label: { id: string; name: string }) =>
            label.id === labelId && label.name === 'Backend',
        ),
      ).toBe(true);
    });
  });

  // ==========================================
  // PATCH /projects/:projectId/tasks/:taskId - Update Task
  // ==========================================
  describe('PATCH /projects/:projectId/tasks/:taskId', () => {
    it('should update task successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Task Title',
          priority: TaskPriority.URGENT,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.title).toBe('Updated Task Title');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.priority).toBe(TaskPriority.URGENT);
    });

    it('should update task status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: TaskStatus.TODO,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.status).toBe(TaskStatus.TODO);
    });

    it('should update isFavorite field', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isFavorite: true,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.isFavorite).toBe(true);
    });

    it('should update archived field', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          archived: true,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.archived).toBe(true);
    });
  });

  // ==========================================
  // DELETE /projects/:projectId/tasks/:taskId - Delete Task
  // ==========================================
  describe('DELETE /projects/:projectId/tasks/:taskId', () => {
    it('should delete task successfully', async () => {
      // First create a task to delete
      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Task To Delete',
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.BACKLOG,
        });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const deleteTaskId = createResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/tasks/${deleteTaskId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should fail to delete non-existent task', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // POST /projects/:projectId/tasks/:taskId/comments - Add Comment
  // ==========================================
  describe('POST /projects/:projectId/tasks/:taskId/comments', () => {
    it('should add a comment to a task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test comment',
        });

      expect(response.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.content).toBe('This is a test comment');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.taskId).toBe(taskId);
      // Verify response includes required fields
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.authorId).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.createdAt).toBeDefined();
    });

    it('should add a comment with mentions', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: `Hey @user-${secondUserId}, please review this`,
          mentions: [
            {
              userId: secondUserId,
              startIndex: 4,
              endIndex: 4 + `user-${secondUserId}`.length,
            },
          ],
        });

      expect(response.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.content).toContain('user-' + secondUserId);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .send({
          content: 'This is a test comment',
        });

      expect(response.status).toBe(401);
    });

    it('should fail with invalid task ID', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/invalid-uuid/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          content: 'This is a test comment',
        });

      expect(response.status).toBe(400);
    });
  });

  // ==========================================
  describe('GET /projects/:projectId/backlog', () => {
    it('should get backlog tasks', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/backlog`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should filter backlog by isFavorite', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/backlog?isFavorite=true`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should filter backlog by archived', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/backlog?archived=false`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/backlog`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  describe('PATCH /projects/:projectId/backlog/reorder', () => {
    it('should reorder backlog tasks', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/backlog/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [{ taskId: taskId, displayOrder: 0 }] });

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/backlog/reorder`)
        .send({ tasks: [{ taskId: taskId, displayOrder: 0 }] });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  describe('POST /projects/:projectId/backlog/:taskId/move-to-sprint', () => {
    let sprintId: string;

    it('should move a task to a sprint', async () => {
      const sprintResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/sprints`)
        .set('Authorization', `Bearer ${authToken}`)
        .field('startDate', '2025-01-01T00:00:00Z')
        .field('endDate', '2025-01-15T00:00:00Z')
        .field('estimatedStartDate', '2025-01-01T00:00:00Z')
        .field('estimatedEndDate', '2025-01-15T00:00:00Z')
        .field('content[0][name]', 'Sprint 1')
        .field('content[0][language]', 'English');

      expect(sprintResponse.status).toBe(201);
      sprintId = sprintResponse.body.id;

      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/backlog/${taskId}/move-to-sprint`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sprintId });

      expect(response.status).toBe(200);
      expect(response.body.sprintId).toBe(sprintId);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/backlog/${taskId}/move-to-sprint`)
        .send({ sprintId });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:projectId/kanban - Get Kanban Board
  // ==========================================
  describe('GET /projects/:projectId/kanban', () => {
    it('should get kanban board for a project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('IN_PROGRESS');
      expect(response.body).toHaveProperty('wipLimits');
      expect(Array.isArray(response.body.IN_PROGRESS)).toBe(true);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/kanban`,
      );

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // PATCH /projects/:projectId/kanban/move - Move Task in Kanban
  // ==========================================
  describe('PATCH /projects/:projectId/kanban/move', () => {
    it('should move task in kanban', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/kanban/move`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          taskId: taskId,
          status: 'IN_PROGRESS',
          displayOrder: 0,
        });

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/kanban/move`)
        .send({
          taskId: taskId,
          status: 'TODO',
          displayOrder: 0,
        });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET /projects/:projectId/kanban?groupBy=assignee — Swimlanes
  // ==========================================
  describe('GET /projects/:projectId/kanban?groupBy=assignee — swimlane view', () => {
    it('should return swimlane grouped kanban', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban`)
        .query({ groupBy: 'assignee' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('swimlanes');
      expect(Array.isArray(response.body.swimlanes)).toBe(true);
    });

    it('should have wipLimits in swimlane response', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban`)
        .query({ groupBy: 'assignee' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('wipLimits');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban`)
        .query({ groupBy: 'assignee' });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // GET+PATCH /projects/:projectId/kanban/settings — WIP Limits
  // ==========================================
  describe('GET /projects/:projectId/kanban/settings — WIP limits', () => {
    it('should return kanban settings for the project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/kanban/settings`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('projectId', projectId);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/kanban/settings`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /projects/:projectId/kanban/settings — update WIP limits', () => {
    it('should update WIP limits for specific columns', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/kanban/settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settings: { IN_PROGRESS: 5, IN_REVIEW: 3 } });

      expect(response.status).toBe(200);
      expect(response.body.kanbanSettings).toBeDefined();
    });

    it('should clear WIP limits when sent as null', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/kanban/settings`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ settings: null });

      expect(response.status).toBe(200);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/kanban/settings`)
        .send({ settings: { IN_PROGRESS: 3 } });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // PATCH /projects/:projectId/tasks/bulk-status — Bulk Status Update
  // ==========================================
  describe('PATCH /projects/:projectId/tasks/bulk-status — bulk status update', () => {
    let bulkTaskId: string;

    beforeAll(async () => {
      // Create a fresh task specifically for bulk-status tests
      const res = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Bulk Status Test Task',
          type: 'TASK',
          priority: 'MEDIUM',
          status: 'TODO',
        });
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      bulkTaskId = res.body.id;
    });

    afterAll(async () => {
      if (bulkTaskId) {
        await prisma.task.deleteMany({ where: { id: bulkTaskId } });
      }
    });

    it('should bulk update task statuses', async () => {
      // task is TODO — valid transition: TODO → IN_PROGRESS
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [{ taskId: bulkTaskId, status: 'IN_PROGRESS' }] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('results');
      expect(Array.isArray(response.body.results)).toBe(true);
      const result = response.body.results.find(
        (r: { taskId: string }) => r.taskId === bulkTaskId,
      ) as { taskId: string; success: boolean } | undefined;
      expect(result?.success).toBe(true);
    });

    it('should report failure for invalid status transition', async () => {
      // task is now IN_PROGRESS; DONE is not directly reachable from IN_PROGRESS
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [{ taskId: bulkTaskId, status: 'DONE' }] });

      expect(response.status).toBe(200);
      const result = response.body.results.find(
        (r: { taskId: string }) => r.taskId === bulkTaskId,
      ) as { taskId: string; success: boolean; error?: string } | undefined;
      expect(result?.success).toBe(false);
    });

    it('should handle empty task array', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [] });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/bulk-status`)
        .send({ tasks: [{ taskId: bulkTaskId, status: 'DONE' }] });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // PATCH /projects/:projectId/tasks/:taskId/comments/:commentId - Update Comment
  // ==========================================
  describe('PATCH /projects/:projectId/tasks/:taskId/comments/:commentId', () => {
    let commentId: string;

    beforeAll(async () => {
      // Create a comment to update
      const commentResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Comment to update' });

      commentId = commentResponse.body.id;
    });

    it('should update a comment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Updated comment content' });

      expect(response.status).toBe(200);
      expect(response.body.content).toBe('Updated comment content');
    });

    it('should forbid a non-manager project member from updating another user comment', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .send({ content: 'Unauthorized update attempt' });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('P4001');
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .send({ content: 'Should fail' });

      expect(response.status).toBe(401);
    });
  });

  // ==========================================
  // POST /projects/:projectId/tasks/:taskId/comments/:commentId/like - Toggle Like
  // ==========================================
  describe('POST /projects/:projectId/tasks/:taskId/comments/:commentId/like', () => {
    let commentId: string;

    beforeAll(async () => {
      const commentResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Comment for like test' });

      commentId = commentResponse.body.id;
    });

    it('should toggle like on a comment', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/projects/${projectId}/tasks/${taskId}/comments/${commentId}/like`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should toggle like off (second call)', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/projects/${projectId}/tasks/${taskId}/comments/${commentId}/like`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  // ==========================================
  // DELETE /projects/:projectId/tasks/:taskId/comments/:commentId - Delete Comment
  // ==========================================
  describe('DELETE /projects/:projectId/tasks/:taskId/comments/:commentId', () => {
    it('should delete a comment', async () => {
      // Create a comment to delete
      const commentResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Comment to delete' });

      const commentId = commentResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should forbid a non-manager project member from deleting another user comment', async () => {
      const commentResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ content: 'Comment protected from other members' });

      const commentId = commentResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/tasks/${taskId}/comments/${commentId}`)
        .set('Authorization', `Bearer ${secondAuthToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('P4001');
    });

    it('should return 404 for non-existent comment', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/comments/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // Dependencies
  // ==========================================
  describe('POST /projects/:projectId/tasks/:taskId/dependencies', () => {
    let blockingTaskId: string;

    beforeAll(async () => {
      // Create a task to use as blocking task
      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Blocking Task',
          type: TaskType.TASK,
          priority: TaskPriority.HIGH,
          status: TaskStatus.TODO,
        });

      blockingTaskId = createResponse.body.id;
    });

    it('should add a dependency to a task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/dependencies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ blockingTaskId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // Verify dependency response fields
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.blockingTaskId).toBe(blockingTaskId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.blockedTaskId).toBe(taskId);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.dependencyType).toBe('blocks');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.createdAt).toBeDefined();
    });

    it('should reject circular dependency', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${blockingTaskId}/dependencies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ blockingTaskId: taskId });

      expect(response.status).toBe(400);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/dependencies`)
        .send({ blockingTaskId });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /projects/:projectId/tasks/:taskId/dependencies/:dependencyId', () => {
    it('should remove a dependency', async () => {
      // First, create a new dependency pair
      const task2Response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Another Blocking Task',
          type: TaskType.TASK,
          priority: TaskPriority.LOW,
          status: TaskStatus.TODO,
        });

      const task2Id = task2Response.body.id;

      const depResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/dependencies`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ blockingTaskId: task2Id });

      const dependencyId = depResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/dependencies/${dependencyId}`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent dependency', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/dependencies/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // Time Entries
  // ==========================================
  describe('POST /projects/:projectId/tasks/:taskId/time-entries', () => {
    it('should log time on a task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          hours: 2.5,
          description: 'Worked on API integration',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.hours).toBe(2.5);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .send({ hours: 1 });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /projects/:projectId/tasks/:taskId/time-entries', () => {
    it('should get all time entries for a task', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/tasks/${taskId}/time-entries`,
      );

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /projects/:projectId/tasks/:taskId/time-entries/:timeEntryId', () => {
    let timeEntryId: string;

    beforeAll(async () => {
      // Get time entries to find one
      const entriesResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .set('Authorization', `Bearer ${authToken}`);

      timeEntryId = entriesResponse.body[0]?.id;
    });

    it('should update a time entry', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .patch(
          `/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hours: 3.0, description: 'Updated time entry' });

      expect(response.status).toBe(200);
    });

    it('should forbid a non-manager project member from updating another user time entry', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .patch(
          `/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        )
        .set('Authorization', `Bearer ${secondAuthToken}`)
        .send({ hours: 9 });

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('P4001');
    });

    it('should fail without authentication', async () => {
      if (!timeEntryId) return;

      const response = await request(app.getHttpServer())
        .patch(
          `/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        )
        .send({ hours: 1 });

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /projects/:projectId/tasks/:taskId/time-entries/:timeEntryId', () => {
    it('should delete a time entry', async () => {
      // Log a new time entry to delete
      const logResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hours: 0.5, description: 'To be deleted' });

      const timeEntryId = logResponse.body.id;

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should forbid a non-manager project member from deleting another user time entry', async () => {
      const logResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks/${taskId}/time-entries`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ hours: 1.25, description: 'Protected entry' });

      const timeEntryId = logResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/time-entries/${timeEntryId}`,
        )
        .set('Authorization', `Bearer ${secondAuthToken}`);

      expect(response.status).toBe(403);
      expect(response.body.code).toBe('P4001');
    });

    it('should return 404 for non-existent time entry', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/time-entries/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /projects/:projectId/tasks/:taskId/labels/:labelId — remove label assignment from task', () => {
    it('should remove the label assignment from the task', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 when the label is no longer assigned to the task', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/tasks/${taskId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8600');
    });

    it('should return 404 when the label does not exist in the project', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/tasks/${taskId}/labels/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8600');
    });
  });

  describe('DELETE /projects/:projectId/labels/:labelId — delete project label', () => {
    it('should delete a project label (and all its assignments)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/labels/${labelId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent label', async () => {
      const response = await request(app.getHttpServer())
        .delete(
          `/projects/${projectId}/labels/00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8600');
    });
  });

  // ==========================================
  // Additional Test Cases - Sort/Filter Matrix
  // ==========================================
  describe('GET /projects/:projectId/tasks - Sort and Filter Matrix', () => {
    it('should support sortBy parameter', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ sortBy: 'createdAtDesc', page: '1', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter by date ranges', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({
          dueDateFrom: '2025-01-01T00:00:00Z',
          dueDateTo: '2026-12-31T23:59:59Z',
          page: '1',
          limit: '10',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should handle edge pagination', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ page: '1', limit: '100' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should filter by type', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ type: TaskType.TASK, page: '1', limit: '10' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter by milestone ID', async () => {
      const milestone = await prisma.milestone.create({
        data: {
          projectId,
          name: `Task Milestone ${Date.now()}`,
        },
      });

      const createResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Milestone Filter Task',
          type: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
          milestoneId: milestone.id,
        });

      expect(createResponse.status).toBe(201);

      const milestoneTaskId = createResponse.body.id as string;

      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({ milestoneId: milestone.id, page: '1', limit: '50' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      const filteredTasks = response.body.data as Array<{
        id: string;
        milestoneId: string | null;
      }>;

      expect(filteredTasks.some((task) => task.id === milestoneTaskId)).toBe(
        true,
      );
      expect(
        filteredTasks.every((task) => task.milestoneId === milestone.id),
      ).toBe(true);
    });

    it('should combine status and priority filters', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks`)
        .query({
          status: TaskStatus.IN_PROGRESS,
          priority: TaskPriority.URGENT,
          page: '1',
          limit: '10',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  // ==========================================
  // AGILE Guard Enforcement
  // ==========================================
  describe('AGILE Guard Enforcement', () => {
    beforeAll(async () => {
      // Create FREESTYLE project
      const project = await prisma.project.create({
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
              userId: userId,
              isManager: true,
            },
          },
          contents: {
            create: {
              name: `Freestyle Project ${Date.now()}`,
              unaccentedName: `freestyle project ${Date.now()}`,
              description: 'FREESTYLE project for testing',
              language: 'English',
            },
          },
        },
      });

      freestyleProjectId = project.id;
    });

    it('should block backlog endpoint on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${freestyleProjectId}/backlog`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400); // BadRequestException from AgileOnlyGuard
    });

    it('should block reorder-backlog on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${freestyleProjectId}/backlog/reorder`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ tasks: [] });

      expect(response.status).toBe(400);
    });

    it('should block tasks-by-sprint on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/projects/${freestyleProjectId}/sprints/00000000-0000-0000-0000-000000000000/tasks`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should block move-to-sprint on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .post(
          `/projects/${freestyleProjectId}/backlog/00000000-0000-0000-0000-000000000000/move-to-sprint`,
        )
        .set('Authorization', `Bearer ${authToken}`)
        .send({ sprintId: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(400);
    });

    it('should allow task creation on FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${freestyleProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Freestyle Task',
          type: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.TODO,
        });

      expect(response.status).toBe(201);

      freestyleTaskId = response.body.id as string;
    });

    it('should reject assigning a label to a task from another project', async () => {
      const labelResponse = await request(app.getHttpServer())
        .post(`/projects/${projectId}/labels`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: `Cross Project Label ${Date.now()}`,
          color: '#445566',
        });

      expect(labelResponse.status).toBe(201);

      const response = await request(app.getHttpServer())
        .post(
          `/projects/${projectId}/tasks/${freestyleTaskId}/labels/${labelResponse.body.id as string}`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.code).toBe('P8000');
    });

    it('should reject AGILE-only fields when creating a FREESTYLE task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${freestyleProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Invalid Freestyle Task',
          type: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
          storyPoints: 5,
        });

      expect(response.status).toBe(400);
    });

    it('should reject AGILE-only status when creating a FREESTYLE task', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${freestyleProjectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Freestyle Backlog Task',
          type: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.BACKLOG,
        });

      expect(response.status).toBe(400);
    });

    it('should reject AGILE-only fields when updating a FREESTYLE task', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${freestyleProjectId}/tasks/${freestyleTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sprintId: '00000000-0000-0000-0000-000000000000',
        });

      expect(response.status).toBe(400);
    });

    it('should reject sprint filtering in FREESTYLE kanban', async () => {
      const response = await request(app.getHttpServer())
        .get(
          `/projects/${freestyleProjectId}/kanban?sprintId=00000000-0000-0000-0000-000000000000`,
        )
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject cross-project epic assignment on create', async () => {
      const foreignEpic = await prisma.epic.create({
        data: {
          projectId: freestyleProjectId,
          name: `Foreign Epic ${Date.now()}`,
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Cross Project Epic Task',
          type: TaskType.TASK,
          priority: TaskPriority.HIGH,
          epicId: foreignEpic.id,
        });

      expect(response.status).toBe(404);
    });

    it('should reject cross-project milestone assignment on update', async () => {
      const foreignMilestone = await prisma.milestone.create({
        data: {
          projectId: freestyleProjectId,
          name: `Foreign Milestone ${Date.now()}`,
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          milestoneId: foreignMilestone.id,
        });

      expect(response.status).toBe(404);
    });

    it('should return 3-column kanban for FREESTYLE project', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${freestyleProjectId}/kanban`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // FREESTYLE kanban should have TODO, IN_PROGRESS, DONE (3 columns)
      expect(response.body).toHaveProperty('TODO');
      expect(response.body).toHaveProperty('IN_PROGRESS');
      expect(response.body).toHaveProperty('DONE');
      // Should NOT have AGILE-only columns
      expect(response.body).not.toHaveProperty('BACKLOG');
      expect(response.body).not.toHaveProperty('IN_REVIEW');
      expect(response.body).not.toHaveProperty('TESTING');
    });
  });

  describe('GET /projects/:projectId/tasks/me and GET /project-tasks/assigned', () => {
    let assignedTaskId: string;

    beforeAll(async () => {
      // Create a task explicitly assigned to the primary (CEO) user
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'My Assigned Task',
          type: TaskType.TASK,
          priority: TaskPriority.MEDIUM,
          assigneeId: userId,
        });

      expect(response.status).toBe(201);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      assignedTaskId = response.body.id;
    });

    afterAll(async () => {
      if (assignedTaskId) {
        await prisma.taskLabelAssignment.deleteMany({
          where: { taskId: assignedTaskId },
        });
        await prisma.task.deleteMany({ where: { id: assignedTaskId } });
      }
    });

    it('GET /projects/:projectId/tasks/me – returns only tasks assigned to the caller', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/me`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toBeDefined();
      // Every returned task must be assigned to the caller
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (response.body.data as Array<{ assigneeId: string }>).forEach((t) => {
        expect(t.assigneeId).toBe(userId);
      });
      // The newly created task must appear
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ids = (response.body.data as Array<{ id: string }>).map(
        (t) => t.id,
      );
      expect(ids).toContain(assignedTaskId);
    });

    it('GET /projects/:projectId/tasks/me – pagination shape is correct', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/me?page=1&limit=5`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        perPage: 5,
      });
    });

    it('GET /projects/:projectId/tasks/me – second member sees only their own tasks', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/tasks/me`)
        .set('Authorization', `Bearer ${secondAuthToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (response.body.data as Array<{ assigneeId: string | null }>).forEach(
        (t) => {
          expect(t.assigneeId).toBe(secondUserId);
        },
      );
      // The CEO's assigned task must NOT appear for the second member
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ids = (response.body.data as Array<{ id: string }>).map(
        (t) => t.id,
      );
      expect(ids).not.toContain(assignedTaskId);
    });

    it('GET /projects/:projectId/tasks/me – rejects unauthenticated request', async () => {
      const response = await request(app.getHttpServer()).get(
        `/projects/${projectId}/tasks/me`,
      );
      expect(response.status).toBe(401);
    });

    it('GET /project-tasks/assigned – returns tasks assigned to the caller across all projects', async () => {
      const response = await request(app.getHttpServer())
        .get('/project-tasks/assigned')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.data).toBeDefined();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toBeDefined();
      // Every task must be assigned to the caller
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (response.body.data as Array<{ assigneeId: string }>).forEach((t) => {
        expect(t.assigneeId).toBe(userId);
      });
      // The assigned task must appear in the cross-project result
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const ids = (response.body.data as Array<{ id: string }>).map(
        (t) => t.id,
      );
      expect(ids).toContain(assignedTaskId);
    });

    it('GET /project-tasks/assigned – pagination shape is correct', async () => {
      const response = await request(app.getHttpServer())
        .get('/project-tasks/assigned?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.pagination).toMatchObject({
        currentPage: 1,
        perPage: 5,
      });
    });

    it('GET /project-tasks/assigned – rejects unauthenticated request', async () => {
      const response = await request(app.getHttpServer()).get(
        '/project-tasks/assigned',
      );
      expect(response.status).toBe(401);
    });
  });

  describe('Task Status Management (e2e)', () => {
    let statusId: string;

    it('POST /projects/:projectId/task-statuses – should create a custom task status', async () => {
      const response = await request(app.getHttpServer())
        .post(`/projects/${projectId}/task-statuses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Code Review',
          color: '#FF6B6B',
          displayOrder: 10,
          allowedTransitions: ['TODO', 'IN_PROGRESS'],
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Code Review');
      expect(response.body.color).toBe('#FF6B6B');
      expect(response.body.allowedTransitions).toEqual(['TODO', 'IN_PROGRESS']);
      statusId = response.body.id;
    });

    it('GET /projects/:projectId/task-statuses – should list all task statuses', async () => {
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/task-statuses`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);

      // Should include both system and custom statuses
      const customStatus = response.body.find(
        (s: any) => s.name === 'Code Review',
      );
      expect(customStatus).toBeDefined();
      expect(customStatus.isSystem).toBe(false);
    });

    it('PATCH /projects/:projectId/task-statuses/:statusId – should update custom status', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/task-statuses/${statusId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Peer Review',
          color: '#4ECDC4',
          allowedTransitions: ['TODO', 'IN_PROGRESS', 'DONE'],
        });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Peer Review');
      expect(response.body.color).toBe('#4ECDC4');
      expect(response.body.allowedTransitions).toEqual([
        'TODO',
        'IN_PROGRESS',
        'DONE',
      ]);
    });

    it('should reject updating system status', async () => {
      // Get a system status ID (TODO)
      const listResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}/task-statuses`)
        .set('Authorization', `Bearer ${authToken}`);

      const todoStatus = listResponse.body.find(
        (s: any) => s.name === 'TODO' && s.isSystem,
      );

      const response = await request(app.getHttpServer())
        .patch(`/projects/${projectId}/task-statuses/${todoStatus.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Cannot Change System Status',
        });

      expect(response.status).toBe(403);
    });

    it('DELETE /projects/:projectId/task-statuses/:statusId – should delete custom status', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/task-statuses/${statusId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });

    it('should reject deleting system status', async () => {
      // Get a system status ID (DONE)
      const listResponse = await request(app.getHttpServer())
        .get(`/projects/${projectId}/task-statuses`)
        .set('Authorization', `Bearer ${authToken}`);

      const doneStatus = listResponse.body.find(
        (s: any) => s.name === 'DONE' && s.isSystem,
      );

      const response = await request(app.getHttpServer())
        .delete(`/projects/${projectId}/task-statuses/${doneStatus.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(403);
    });

    it('should reject access for non-project members', async () => {
      // Create another user directly in database (like main test setup)
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${Date.now()}@example.com`,
          name: 'Other User',
          phone: `+216${Date.now().toString().slice(-8)}`,
          unaccentedName: 'other user',
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

      // Create JWT token for other user
      const otherToken = jwtService.sign(
        {
          id: otherUser.id,
          name: otherUser.name,
          roles: otherUser.roles?.map((r: any) => r.type || r) || [
            'SoftwareEngineer',
          ],
          teamsIds: [],
          type: 'access',
        },
        {
          secret: configService.get<string>('SECRET_KEY') || 'test-secret',
          expiresIn: '1h',
        },
      );

      // Try to access task statuses from project they're not a member of
      const response = await request(app.getHttpServer())
        .get(`/projects/${projectId}/task-statuses`)
        .set('Authorization', `Bearer ${otherToken}`);

      // Should be 403 Forbidden for non-project members
      expect(response.status).toBe(403);

      // Clean up the other user
      if (otherUser.id) {
        await prisma.role.deleteMany({
          where: { userId: otherUser.id },
        });
        await prisma.user.delete({
          where: { id: otherUser.id },
        });
      }
    });
  });
});
