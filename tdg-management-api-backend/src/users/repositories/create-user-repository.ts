import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateUserByAdminDto } from '../dto/request/post/create-user-by-admin';
import { DeviceType } from '@prisma/client';
import { v4 } from 'uuid';

@Injectable()
export class CreateUserRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createUserByAdmin(data: CreateUserByAdminDto) {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        image: data.image as string,
        unaccentedName: data.unaccentedName as string,
        password: data.hashedPassword as string,
        isActive: true,
        roles: {
          createMany: {
            data: data.roles.map((role) => ({ type: role })),
          },
        },
        notificationTokens: {
          create: {
            token: v4(),
            deviceType: DeviceType.Computer,
            device: 'Computer',
          },
        },
        notificationSettings: {
          create: {
            emailNotificationsEnabled: data.emailNotificationsEnabled,
            telegramNotificationsEnabled: data.telegramNotificationsEnabled,
            ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
          },
        },
        ntfyIntegration: {
          create: {
            topic: data.ntfyTopic as string,
          },
        },
        telegramBot: {
          create: {
            chatId: data.telegramChatId as string,
          },
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        image: true,
        roles: {
          select: { type: true },
        },
        teams: {
          select: { teamId: true },
        },
        notificationSettings: {
          select: {
            emailNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
        ntfyIntegration: {
          select: {
            topic: true,
          },
        },
        telegramBot: {
          select: {
            chatId: true,
          },
        },
      },
    });
  }
}
