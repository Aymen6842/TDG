import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class UpdateNotificationRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  async markNotificationAsSeenForUser(
    userId: string,
    notificationIds: string[],
  ) {
    return this.prismaService.userNotification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: userId,
      },
      data: { isSeen: true },
    });
  }
}
