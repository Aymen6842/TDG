import { UserType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

/**
 * Creates a test user with CEO role and generates a JWT token
 * This is used for e2e tests that require authentication
 */
export async function getOrCreateTestUser(
  prisma: PrismaService,
  jwtService: JwtService,
  configService: ConfigService,
): Promise<string> {
  const testEmail = 'test-e2e@example.com';
  const testName = 'Test E2E User';
  const testPhone = '+21600000001';

  // Try to find existing test user
  let user = await prisma.user.findUnique({
    where: { email: testEmail },
    include: { roles: true },
  });

  if (!user) {
    // Create test user with CEO role
    user = await prisma.user.create({
      data: {
        email: testEmail,
        name: testName,
        phone: testPhone,
        unaccentedName: testName.toLowerCase(),
        password: 'hashed_password_not_used_for_tests',
        isActive: true,
        roles: {
          create: {
            type: UserType.CEO,
          },
        },
      },
      include: { roles: true },
    });
  }

  // Generate JWT token
  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles.map((r) => r.type),
    name: user.name,
  };

  const token = jwtService.sign(payload, {
    secret: configService.get<string>('SECRET_KEY') || 'test-secret',
    expiresIn: '1h',
  });

  return token;
}

/**
 * Creates a test user with specific roles and returns user ID and token
 */
export async function createUserWithRoles(
  prisma: PrismaService,
  jwtService: JwtService,
  configService: ConfigService,
  roles: UserType[],
  emailSuffix: string = '',
): Promise<{ userId: string; token: string }> {
  const suffix = emailSuffix || Date.now().toString();
  const testEmail = `test-${suffix}@example.com`;
  const testName = `Test User ${suffix}`;
  const testPhone = `+2160000${suffix.slice(-4)}`;

  const user = await prisma.user.create({
    data: {
      email: testEmail,
      name: testName,
      phone: testPhone,
      unaccentedName: testName.toLowerCase(),
      password: 'hashed_password_not_used_for_tests',
      isActive: true,
      roles: {
        create: roles.map((type) => ({ type })),
      },
    },
    include: { roles: true },
  });

  const payload = {
    sub: user.id,
    email: user.email,
    roles: user.roles.map((r) => r.type),
    name: user.name,
  };

  const token = jwtService.sign(payload, {
    secret: configService.get<string>('SECRET_KEY') || 'test-secret',
    expiresIn: '1h',
  });

  return { userId: user.id, token };
}

/**
 * Cleans up test users created during e2e tests
 */
export async function cleanupTestUsers(
  prisma: PrismaService,
  emailPattern: string = 'test-%',
): Promise<void> {
  await prisma.user.deleteMany({
    where: {
      email: {
        startsWith: 'test-',
      },
    },
  });
}
