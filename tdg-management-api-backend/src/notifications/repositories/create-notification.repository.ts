import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateNotificationTokenDto } from '../dto/request/post/create-notification-token.dto';
import { CreateNotificationDto } from '../dto/request/post/create-notification.dto';
import { Language } from '@prisma/client';

@Injectable()
export class CreateNotificationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createOrUpdateNotificationToken(data: CreateNotificationTokenDto) {
    return this.prismaService.notificationToken.upsert({
      where: { token: data.token },
      update: { userId: data.userId },
      create: {
        userId: data.userId,
        token: data.token,
        device: data.device,
        deviceType: data.deviceType,
        deviceHeight: data.deviceHeight,
        deviceWidth: data.deviceWidth,
      },
      select: {
        id: true,
        userId: true,
        token: true,
        device: true,
        deviceType: true,
        deviceHeight: true,
        deviceWidth: true,
      },
    });
  }

  createManyNotifications(data: CreateNotificationDto) {
    return this.prismaService.notification.create({
      data: {
        image: data.image,
        sendBy: data.senderId as string,
        content: {
          create: [
            {
              title: data.content.title,
              body: data.content.body,
              url: data.content.url as string,
              language: Language.English,
            },
          ],
        },

        usersNotifications: {
          createMany: {
            skipDuplicates: true,
            data:
              data.usersIds?.map((userId) => ({
                userId: userId,
              })) ?? [],
          },
        },
      },

      select: {
        id: true,
        image: true,
        content: {
          where: { language: Language.English },
          select: {
            id: true,
            title: true,
            body: true,
            url: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
