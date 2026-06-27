import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteLockRepository {
  constructor(private readonly prismaService: PrismaService) {}

  deleteLock(key: string) {
    return this.prismaService.locking.delete({
      where: {
        key,
      },
    });
  }
}
