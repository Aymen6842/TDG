import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class CreateLockRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createOrUpdateLock(key: string, value: string, expiresAt: Date) {
    return this.prismaService.locking.upsert({
      where: { key: key },
      update: {
        value: value,
        expiresAt: expiresAt,
      },
      create: {
        key: key,
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
  }
}
