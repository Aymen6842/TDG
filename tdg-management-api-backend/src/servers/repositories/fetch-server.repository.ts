import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterServersParamsDto } from '../dto/request/fetch/filter-servers-params.dto';
import { FilterServicesParamsDto } from '../dto/request/fetch/filter-services-params.dto';
import { ServerServiceStatus } from '@prisma/client';

@Injectable()
export class FetchServerRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  filterServices(query: FilterServicesParamsDto, skip: number, take: number) {
    return this.prismaService.service.findMany({
      where: {
        ...(query?.managedById && {
          server: { managers: { some: { managerId: query?.managedById } } },
        }),
        ...(query?.serversIds && {
          serverId: { in: query?.serversIds },
        }),
        ...(query?.name && {
          OR: [
            { name: { startsWith: query?.name, mode: 'insensitive' } },
            { name: { contains: query?.name, mode: 'insensitive' } },
            { name: { endsWith: query?.name, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        server: {
          select: {
            id: true,
            name: true,
            domain: true,
            ip: true,
          },
        },
        name: true,
        domain: true,
        description: true,
        sslCertificate: true,
        sslCertificateByCloudProvider: true,
        backupDestination: true,
        hasBackup: true,
        paid: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getServiceById(id: string, managerId?: string) {
    return this.prismaService.service.findUniqueOrThrow({
      where: {
        id,
        ...(managerId && {
          server: {
            managers: {
              some: {
                managerId,
              },
            },
          },
        }),
      },
      select: {
        id: true,
        server: {
          select: {
            id: true,
            name: true,
            domain: true,
            ip: true,
          },
        },
        name: true,
        domain: true,
        description: true,
        sslCertificate: true,
        sslCertificateByCloudProvider: true,
        backupDestination: true,
        hasBackup: true,
        paid: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  countFiltredServers(query: FilterServersParamsDto) {
    return this.prismaService.server.count({
      where: {
        ...(query?.managedById && {
          managers: { some: { managerId: query?.managedById } },
        }),
        ...(query?.name && {
          OR: [
            { name: { startsWith: query?.name, mode: 'insensitive' } },
            { name: { contains: query?.name, mode: 'insensitive' } },
            { name: { endsWith: query?.name, mode: 'insensitive' } },
          ],
        }),
      },
    });
  }

  countFiltredServices(query: FilterServicesParamsDto) {
    return this.prismaService.service.count({
      where: {
        ...(query?.managedById && {
          server: { managers: { some: { managerId: query?.managedById } } },
        }),
        ...(query?.serversIds && {
          serverId: { in: query?.serversIds },
        }),
        ...(query?.name && {
          OR: [
            { name: { startsWith: query?.name, mode: 'insensitive' } },
            { name: { contains: query?.name, mode: 'insensitive' } },
            { name: { endsWith: query?.name, mode: 'insensitive' } },
          ],
        }),
      },
    });
  }

  filterServers(query: FilterServersParamsDto, skip: number, limit: number) {
    return this.prismaService.server.findMany({
      where: {
        ...(query?.managedById && {
          managers: { some: { managerId: query?.managedById } },
        }),
        ...(query?.name && {
          OR: [
            { name: { startsWith: query?.name, mode: 'insensitive' } },
            { name: { contains: query?.name, mode: 'insensitive' } },
            { name: { endsWith: query?.name, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        domain: true,
        description: true,
        ip: true,
        ram: true,
        cpus: true,
        storage: true,
        bandwidth: true,
        backupCloudProvider: true,
        paid: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        managers: {
          select: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  getServerById(id: string, managerId?: string) {
    return this.prismaService.server.findUniqueOrThrow({
      where: { id, ...(managerId && { managers: { some: { managerId } } }) },
      select: {
        id: true,
        name: true,
        domain: true,
        description: true,
        ip: true,
        ram: true,
        cpus: true,
        storage: true,
        bandwidth: true,
        backupCloudProvider: true,
        paid: true,
        status: true,
        paidAt: true,
        expiredAt: true,
        createdAt: true,
        updatedAt: true,
        services: {
          select: {
            id: true,
            name: true,
            domain: true,
            description: true,
            sslCertificate: true,
            sslCertificateByCloudProvider: true,
            backupDestination: true,
            hasBackup: true,
            paid: true,
            status: true,
            paidAt: true,
            expiredAt: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        managers: {
          select: {
            manager: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
          },
        },
      },
    });
  }

  getRunningServersExpiration() {
    return this.prismaService.server.findMany({
      where: {
        expiredAt: { not: null },
        notifications: { none: { isSent: false } },
      },
      select: {
        id: true,
        name: true,
        ip: true,
        expiredAt: true,
        nextNotificationAt: true,
        managers: {
          select: { manager: { select: { email: true } } },
        },
      },
    });
  }

  getRunningServicesExpiration() {
    return this.prismaService.service.findMany({
      where: {
        expiredAt: { not: null },
        notifications: { none: { isSent: false } },
      },
      select: {
        id: true,
        name: true,
        expiredAt: true,
        nextNotificationAt: true,
        server: { select: { name: true, ip: true } },
      },
    });
  }

  getRunningServersIps() {
    return this.prismaService.server.findMany({
      where: {
        status: ServerServiceStatus.Running,
        notifications: { none: { isSent: false } },
      },
      select: {
        id: true,
        name: true,
        ip: true,
      },
    });
  }

  getRunningServicesDomains() {
    return this.prismaService.service.findMany({
      where: {
        domain: { not: null },
        status: ServerServiceStatus.Running,
        notifications: { none: { isSent: false } },
      },
      select: {
        id: true,
        name: true,
        domain: true,
      },
    });
  }

  getNotificationsMessagesForServers() {
    return this.prismaService.serverNotification.findMany({
      where: {
        isSent: false,
      },
      select: {
        id: true,
        message: true,
        server: {
          select: {
            name: true,
            managers: {
              select: {
                manager: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    telegramBot: { select: { chatId: true } },
                    ntfyIntegration: {
                      select: {
                        topic: true,
                      },
                    },
                    notificationSettings: {
                      select: {
                        telegramNotificationsEnabled: true,
                        emailNotificationsEnabled: true,
                        pushNotificationsEnabled: true,
                        ntfyNotificationsEnabled: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  getNotificationsMessagesForServices() {
    return this.prismaService.serviceNotification.findMany({
      where: {
        isSent: false,
      },
      select: {
        id: true,
        message: true,
        service: {
          select: {
            name: true,
            server: {
              select: {
                name: true,
                managers: {
                  select: {
                    manager: {
                      select: {
                        id: true,
                        email: true,
                        name: true,
                        telegramBot: { select: { chatId: true } },
                        ntfyIntegration: {
                          select: {
                            topic: true,
                          },
                        },
                        notificationSettings: {
                          select: {
                            telegramNotificationsEnabled: true,
                            emailNotificationsEnabled: true,
                            pushNotificationsEnabled: true,
                            ntfyNotificationsEnabled: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  checkManagerAccessToServer(serverId: string, managerId: string) {
    return this.prismaService.server.findFirst({
      where: { id: serverId, managers: { some: { managerId: managerId } } },
      select: { id: true },
    });
  }
}
