import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterNotificationsParameters } from '../types/request.type';
import { Language, UserType } from '@prisma/client';

@Injectable()
export class FetchNotificationsRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  getNotificationTokenByusersIds(usersIds: string[]) {
    return this.prismaService.notificationToken.findMany({
      where: {
        userId: { in: usersIds },
      },
      select: { token: true, id: true, userId: true },
    });
  }

  getAllNotificationTokensByUserRoles(roles: UserType[]) {
    return this.prismaService.notificationToken.findMany({
      where: {
        user: { roles: { some: { type: { in: roles } } } },
      },
      select: {
        token: true,
        userId: true,
        id: true,
      },
    });
  }

  getAllNotificationTokens() {
    return this.prismaService.notificationToken.findMany({
      select: { id: true, token: true, userId: true },
    });
  }

  filterNotificationsBySenderId(senderId: string, skip: number, take: number) {
    return this.prismaService.notification.findMany({
      where: {
        sendBy: senderId,
      },
      select: {
        id: true,
        image: true,
        content: {
          where: { language: Language.English },
          select: {
            title: true,
            body: true,
            url: true,
          },
        },
        _count: {
          select: { usersNotifications: true },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  filterNotificationsByUserId(
    userId: string,
    query: FilterNotificationsParameters,
    skip: number,
    take: number,
  ) {
    return this.prismaService.userNotification.findMany({
      where: {
        userId: userId,
        ...(query.isSeen === 'true' && { isSeen: true }),
        ...(query.isSeen === 'false' && { isSeen: false }),
      },
      select: {
        id: true,
        isSeen: true,
        notification: {
          select: {
            image: true,
            content: {
              where: { language: Language.English },
              select: {
                title: true,
                body: true,
                url: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    });
  }

  getNotificationImageByIdAndSenderId(id: string, senderId: string) {
    return this.prismaService.notification.findUniqueOrThrow({
      where: {
        id: id,
        sendBy: senderId,
      },
      select: {
        image: true,
      },
    });
  }

  countFilteredNotificationsBySenderId(senderId: string) {
    return this.prismaService.notification.count({
      where: {
        sendBy: senderId,
      },
    });
  }

  countFilteredNotificationsByUserId(
    userId: string,
    query: FilterNotificationsParameters,
  ) {
    return this.prismaService.userNotification.count({
      where: {
        userId: userId,
        ...(query.isSeen === 'true' && { isSeen: true }),
        ...(query.isSeen === 'false' && { isSeen: false }),
      },
    });
  }
}
