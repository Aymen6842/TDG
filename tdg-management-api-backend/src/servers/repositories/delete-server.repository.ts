import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteServerRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteServerById(id: string, managerId?: string) {
    return this.prismaService.server.delete({
      where: {
        id: id,
        ...(managerId && { managers: { some: { managerId: managerId } } }),
      },
    });
  }

  deleteServiceById(id: string, managerId?: string) {
    return this.prismaService.service.delete({
      where: {
        id: id,
        ...(managerId && { managers: { some: { managerId: managerId } } }),
      },
    });
  }
}
