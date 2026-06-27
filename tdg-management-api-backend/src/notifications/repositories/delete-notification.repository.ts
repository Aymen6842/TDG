import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteNotificationRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteNotificationByIdAndSenderId(id: string, senderId: string) {
    return this.prismaService.notification.delete({
      where: {
        id: id,
        sendBy: senderId,
      },
    });
  }
}
