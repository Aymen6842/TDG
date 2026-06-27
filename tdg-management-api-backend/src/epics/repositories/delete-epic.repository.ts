import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteEpicRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Delete an epic
   */
  deleteEpic(data: { epicId: string; projectId: string }): Promise<void> {
    return this.prismaService.epic
      .delete({
        where: {
          id: data.epicId,
          projectId: data.projectId,
        },
      })
      .then(() => undefined);
  }
}
