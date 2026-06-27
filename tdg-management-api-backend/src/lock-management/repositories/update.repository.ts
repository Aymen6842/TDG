import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { TimeService } from 'src/common/time/service/time.service';

@Injectable()
export class UpdateLockRepository {
  constructor(private readonly prismaService: PrismaService) {}

  lock(key: string, value: string, expiresAt: Date) {
    try {
      return this.prismaService.$transaction(async (prisma) => {
        const [lock]: {
          id: string;
          key: string;
          value: string;
          expiresAt: Date;
        }[] =
          await prisma.$queryRaw`SELECT "id", "key", "value", "expiresAt" FROM "Locking" WHERE "key" = ${key} FOR UPDATE SKIP LOCKED`;

        if (lock && TimeService.isAfterCurrentUTCTime(lock.expiresAt)) {
          return null;
        }

        if (lock)
          return await prisma.locking.update({
            where: { key: key },
            data: {
              value: value,
              expiresAt: expiresAt,
            },
            select: {
              id: true,
              key: true,
              value: true,
              expiresAt: true,
            },
          });

        return null;
      });
    } catch {
      return null;
    }
  }
}
