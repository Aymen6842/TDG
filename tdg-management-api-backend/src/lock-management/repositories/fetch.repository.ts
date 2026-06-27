import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { TimeService } from 'src/common/time/service/time.service';

@Injectable()
export class FetchLockRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getLockByKey(key: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const [lock]: {
        id: string;
        key: string;
        value: string;
        expiresAt: Date;
      }[] =
        await prisma.$queryRaw`SELECT "id", "key", "value", "expiresAt" FROM "Locking" WHERE "key" = ${key} FOR UPDATE SKIP LOCKED`;

      if (lock && TimeService.isAfterCurrentUTCTime(lock.expiresAt)) {
        return lock;
      }

      return null;
    });
  }
}
