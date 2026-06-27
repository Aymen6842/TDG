import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeletePersonalTasksRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deletePersonalTaskById(id: string, userId: string) {
    return this.prismaService.userTask.deleteMany({
      where: { id: id, userId: userId },
    });
  }

  deletePersonalTaskCommentById(id: string, userId: string) {
    return this.prismaService.userTaskComment.deleteMany({
      where: { id: id, userId: userId },
    });
  }
}
