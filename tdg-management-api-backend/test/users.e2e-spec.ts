import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserType } from '@prisma/client';

jest.setTimeout(30000);

describe('Users API Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let configService: ConfigService;
  let authToken: string;
  let userId: string;
  let createdUserId: string;

  const seed = `${Date.now()}${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')}`;

  const testEmail = `users-e2e-${seed}@example.com`;
  const testPhone = `+216${seed.slice(-8)}`;
  const buildTestPhone = (offset: number) => {
    const localNumber = ((Number(seed.slice(-7)) + offset) % 10000000)
      .toString()
      .padStart(7, '0');

    return `+2165${localNumber}`;
  };

  const pngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wn5VZ0AAAAASUVORK5CYII=',
    'base64',
  );

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

    const user = await prisma.user.create({
      data: {
        email: testEmail,
        name: 'Users E2E CEO',
        phone: testPhone,
        unaccentedName: 'users e2e ceo',
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

    authToken = jwtService.sign(
      {
        id: user.id,
        name: user.name,
        roles: user.roles.map((r) => r.type),
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
    try {
      if (createdUserId) {
        await prisma.user.deleteMany({ where: { id: createdUserId } });
      }

      await prisma.role.deleteMany({
        where: { userId },
      });
      await prisma.user.deleteMany({
        where: { id: userId },
      });
    } catch {
      // Ignore cleanup errors
    }

    await app.close();
  });

  describe('POST /users/register', () => {
    it('should create a user successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Authorization', `Bearer ${authToken}`)
        .field('email', `users-created-${seed}@example.com`)
        .field('phone', buildTestPhone(1))
        .field('name', 'Users Created By Admin')
        .field('password', 'Pass1234!')
        .field('roles', UserType.SoftwareEngineer)
        .attach('image', pngBuffer, 'avatar.png');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.email).toContain('users-created-');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      createdUserId = response.body.id;
    });

    it('should fail without authentication', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .field('email', `users-created-no-auth-${seed}@example.com`)
        .field('phone', buildTestPhone(2))
        .field('name', 'Users Created By Admin 2')
        .field('password', 'Pass1234!')
        .field('roles', UserType.SoftwareEngineer)
        .attach('image', pngBuffer, 'avatar2.png');

      expect(response.status).toBe(401);
    });

    it('should fail when image is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/users/register')
        .set('Authorization', `Bearer ${authToken}`)
        .field('email', `users-created-no-image-${seed}@example.com`)
        .field('phone', buildTestPhone(3))
        .field('name', 'Users Created By Admin 3')
        .field('password', 'Pass1234!')
        .field('roles', UserType.SoftwareEngineer);

      expect(response.status).toBe(400);
    });
  });

  describe('GET users endpoints', () => {
    it('should get current user details', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.id).toBe(userId);
    });

    it('should fetch manageable roles', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/roles')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should list users with pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      expect(response.body).toHaveProperty('data');

      expect(response.body).toHaveProperty('pagination');
    });

    it('should export users csv', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/csv?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toContain('text/csv');
    });

    it('should fail /users/me without authentication', async () => {
      const response = await request(app.getHttpServer()).get('/users/me');

      expect(response.status).toBe(401);
    });
  });

  describe('PATCH and DELETE users endpoints', () => {
    it('should update own profile', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/me')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Users E2E CEO Updated',
          emailNotificationsEnabled: true,
          telegramNotificationsEnabled: false,
          ntfyNotificationsEnabled: true,
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.name).toBe('Users E2E CEO Updated');
    });

    it('should update created user by admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          isActive: false,
          roles: [UserType.SoftwareEngineer],
        });

      expect(response.status).toBe(200);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(response.body.isActive).toBe(false);
    });

    it('should delete created user by admin (soft delete)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(204);
    });
  });
});
