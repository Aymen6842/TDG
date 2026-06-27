import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteReminderRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Delete a reminder by ID within a project
   * Prisma throws P2025 if not found
   */
  deleteReminder(data: {
    reminderId: string;
    projectId: string;
  }): Promise<void> {
    return this.prismaService.reminder
      .delete({
        where: { id: data.reminderId, projectId: data.projectId },
      })
      .then(() => undefined);
  }
}
