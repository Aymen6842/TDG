import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateOwnDetailsDto } from '../dto/request/update/update-own-details.dto';
import { UpdateUserDetailsByAdminDto } from '../dto/request/update/update-user-details-by-admin.dto';

@Injectable()
export class UpdateUserRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateOwnDetails(id: string, data: UpdateOwnDetailsDto) {
    return this.prismaService.user.update({
      where: { id: id },
      data: {
        image: data?.image,
        name: data?.name,
        phone: data?.phone,
        email: data?.email,
        ...(data?.ntfyTopic && {
          ntfyIntegration: {
            upsert: {
              create: {
                topic: data.ntfyTopic,
              },
              update: {
                topic: data.ntfyTopic,
              },
            },
          },
        }),
        ...(data?.telegramChatId && {
          telegramBot: {
            upsert: {
              create: {
                chatId: data?.telegramChatId,
              },
              update: {
                ...(data?.telegramChatId && { chatId: data.telegramChatId }),
              },
            },
          },
        }),
        ...((data.emailNotificationsEnabled !== undefined ||
          data.telegramNotificationsEnabled !== undefined ||
          data.ntfyNotificationsEnabled !== undefined) && {
          notificationSettings: {
            upsert: {
              create: {
                ...(data.emailNotificationsEnabled !== undefined && {
                  emailNotificationsEnabled: data.emailNotificationsEnabled,
                }),
                ...(data.telegramNotificationsEnabled !== undefined && {
                  telegramNotificationsEnabled:
                    data.telegramNotificationsEnabled,
                }),
                ...(data.ntfyNotificationsEnabled !== undefined && {
                  ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
                }),
              },
              update: {
                ...(data.emailNotificationsEnabled !== undefined && {
                  emailNotificationsEnabled: data.emailNotificationsEnabled,
                }),
                ...(data.telegramNotificationsEnabled !== undefined && {
                  telegramNotificationsEnabled:
                    data.telegramNotificationsEnabled,
                }),
                ...(data.ntfyNotificationsEnabled !== undefined && {
                  ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
                }),
              },
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
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

  updateUserDetailsByAdmin(id: string, data: UpdateUserDetailsByAdminDto) {
    return this.prismaService.user.update({
      where: { id: id },
      data: {
        name: data?.name,
        email: data?.email,
        phone: data?.phone,
        image: data?.image,
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data?.teamsIds && {
          teams: {
            createMany: {
              data:
                data?.teamsIds?.map((teamId) => ({
                  teamId: teamId,
                })) || [],
              skipDuplicates: true,
            },
            deleteMany: data?.teamsIds
              ? {
                  teamId: {
                    notIn: data.teamsIds,
                  },
                }
              : undefined,
          },
        }),
        ...(data?.telegramChatId && {
          telegramBot: {
            upsert: {
              create: {
                chatId: data.telegramChatId,
              },
              update: {
                chatId: data.telegramChatId,
              },
            },
          },
        }),
        ...(data?.ntfyTopic && {
          ntfyIntegration: {
            upsert: {
              create: {
                topic: data.ntfyTopic,
              },
              update: {
                topic: data.ntfyTopic,
              },
            },
          },
        }),
        ...(data?.roles && {
          roles: {
            createMany: {
              data: data?.roles?.map((role) => ({ type: role })) || [],
              skipDuplicates: true,
            },
            deleteMany: {
              type: {
                notIn: data?.roles || [],
              },
            },
          },
        }),
        ...((data.emailNotificationsEnabled !== undefined ||
          data.telegramNotificationsEnabled !== undefined ||
          data.pushNotificationsEnabled !== undefined ||
          data.ntfyNotificationsEnabled !== undefined) && {
          notificationSettings: {
            upsert: {
              create: {
                ...(data.emailNotificationsEnabled !== undefined && {
                  emailNotificationsEnabled: data.emailNotificationsEnabled,
                }),
                ...(data.telegramNotificationsEnabled !== undefined && {
                  telegramNotificationsEnabled:
                    data.telegramNotificationsEnabled,
                }),
                ...(data.pushNotificationsEnabled !== undefined && {
                  pushNotificationsEnabled: data.pushNotificationsEnabled,
                }),
                ...(data.ntfyNotificationsEnabled !== undefined && {
                  ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
                }),
              },
              update: {
                ...(data.emailNotificationsEnabled !== undefined && {
                  emailNotificationsEnabled: data.emailNotificationsEnabled,
                }),
                ...(data.telegramNotificationsEnabled !== undefined && {
                  telegramNotificationsEnabled:
                    data.telegramNotificationsEnabled,
                }),
                ...(data.pushNotificationsEnabled !== undefined && {
                  pushNotificationsEnabled: data.pushNotificationsEnabled,
                }),
                ...(data.ntfyNotificationsEnabled !== undefined && {
                  ntfyNotificationsEnabled: data.ntfyNotificationsEnabled,
                }),
              },
            },
          },
        }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        image: true,
        isActive: true,
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

  updateUserPassword(id: string, password: string) {
    return this.prismaService.user.update({
      where: { id: id },
      data: { password: password },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
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
