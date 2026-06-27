import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateUserAccountDto } from '../dto/request/post/create-user-account.dto';

@Injectable()
export class AccountRegistrationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  public createUserAccount(data: CreateUserAccountDto) {
    return this.prismaService.user.create({
      data: {
        email: data.email,
        phone: data.phone,
        name: data.name,
        image: data.image as string,
        unaccentedName: data.unaccentedName as string,
        password: data.hashedPassword as string,
        isActive: true,
        telegramBot: {
          create: {
            chatId: data.telegramChatId as string,
          },
        },
        ntfyIntegration: {
          create: {
            topic: data.ntfyTopic as string,
          },
        },
        notificationSettings: {
          create: {
            emailNotificationsEnabled: data.emailNotificationsEnabled,
            telegramNotificationsEnabled: data.telegramNotificationsEnabled,
            ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
          },
        },
        roles: {
          createMany: {
            data: [{ type: UserType.PendingApproval }],
          },
        },
      },
      select: {
        id: true,
        email: true,
        phone: true,
        image: true,
        name: true,
        roles: {
          select: { type: true },
        },
        teams: { select: { teamId: true } },
        notificationSettings: {
          select: {
            emailNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
        telegramBot: {
          select: {
            chatId: true,
          },
        },
        ntfyIntegration: {
          select: {
            topic: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
