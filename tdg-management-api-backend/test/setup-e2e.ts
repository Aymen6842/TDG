import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as supertest from 'supertest';
import { SuperTestStatic } from 'supertest';
import { AppModule } from '../src/app.module';
import { Server } from 'http';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { getOrCreateTestUser } from './genererToken';

export let app: INestApplication;
export let request: SuperTestStatic;
export let server: Server;
export let fakeToken: string;
export let prisma: PrismaService;
export let jwtService: JwtService;

beforeAll(async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();
  const configService = app.get(ConfigService);
  const dbUrl = configService.get<string>('DATABASE_URL');
  dbUrl?.replace('laportadiroma_db', 'laportadiroma_db_test');
  prisma = app.get(PrismaService);
  jwtService = app.get(JwtService);

  fakeToken = await getOrCreateTestUser(prisma, jwtService, configService);

  server = app.getHttpServer() as Server;
  request = supertest as unknown as SuperTestStatic;
});

afterAll(async () => {
  await app.close();
});
