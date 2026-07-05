/**
 * Shared bootstrap for the offline eval scripts (§6).
 *
 * Every eval script needs a live Nest DI container (for `EmbeddingService`,
 * `RetrievalService`, `PrismaService`, …) exactly like the `ai:backfill` script.
 * `withApp` spins one up, runs the body, and always tears it down. `resolveActor`
 * loads the user + roles the eval "runs as", so retrieval is permission-scoped
 * the same way a real request would be (§4.3).
 */
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { UserType } from '@prisma/client';
import { AppModule } from 'src/app.module';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

/** Default user the eval impersonates: the CEO sees every project (§4.3). */
export const DEFAULT_ACTOR_EMAIL = 'mohamed@tawer.tn';

export interface EvalActor {
  userId: string;
  roles: UserType[];
  email: string;
  name: string;
}

/** Boot the Nest application context, run `fn`, and always close it. */
export async function withApp<T>(
  fn: (app: INestApplicationContext) => Promise<T>,
): Promise<T> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    return await fn(app);
  } finally {
    await app.close();
  }
}

/** Resolve the eval actor (id + roles) by email, for permission-scoped runs. */
export async function resolveActor(
  app: INestApplicationContext,
  email: string,
): Promise<EvalActor> {
  const prisma = app.get(PrismaService);
  const user = await prisma.user.findFirst({
    where: { email },
    select: { id: true, name: true, roles: { select: { type: true } } },
  });
  if (!user) {
    throw new Error(
      `Eval actor "${email}" not found. Seed the database first (npm run prisma:seed).`,
    );
  }
  return {
    userId: user.id,
    roles: user.roles.map((role) => role.type),
    email,
    name: user.name,
  };
}

/** Tiny `--flag=value` / `--flag` argv parser (no dependency needed). */
export function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const body = arg.slice(2);
    const eq = body.indexOf('=');
    if (eq === -1) out[body] = true;
    else out[body.slice(0, eq)] = body.slice(eq + 1);
  }
  return out;
}
