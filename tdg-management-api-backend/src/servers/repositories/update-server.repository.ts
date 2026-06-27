import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateServerDto } from '../dto/request/update/update-server.dto';
import { UpdateServiceDto } from '../dto/request/update/update-service.dto';

@Injectable()
export class UpdateServerRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateServer(id: string, data: UpdateServerDto, managerId?: string) {
    return this.prismaService.server.update({
      where: {
        id: id,
        ...(managerId && { managers: { some: { managerId } } }),
      },
      data: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        ip: data.ip,
        ram: data.ram,
        cpus: data.cpus,
        storage: data.storage,
        bandwidth: data.bandwidth,
        backupCloudProvider: data.backupCloudProvider,
        paid: data.paid,
        status: data.status,
        paidAt: data.paidAt,
        expiredAt: data.expiredAt,
        ...(data.managersIds &&
          data.managersIds.length > 0 && {
            managers: {
              deleteMany: {
                managerId: { notIn: data.managersIds },
              },
              createMany: {
                data: data.managersIds.map((managerId) => ({
                  managerId,
                })),
                skipDuplicates: true,
              },
            },
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
            managerId: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  updateService(id: string, data: UpdateServiceDto, managerId?: string) {
    return this.prismaService.service.update({
      where: {
        id: id,
        ...(managerId && { managers: { some: { managerId } } }),
      },
      data: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        sslCertificate: data.sslCertificate,
        sslCertificateByCloudProvider: data.sslCertificateByCloudProvider,
        hasBackup: data.hasBackup,
        backupDestination: data.backupDestination,
        paid: data.paid,
        status: data.status,
        paidAt: data.paidAt,
        expiredAt: data.expiredAt,
      },
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
    });
  }

  updateServerNextNotificationDate(
    id: string,
    message: string,
    nextNotificationAt: string,
  ) {
    return this.prismaService.server.update({
      where: { id },
      data: {
        nextNotificationAt,
        notifications: {
          create: { message },
        },
      },
    });
  }

  updateServiceNextNotificationDate(
    id: string,
    message: string,
    nextNotificationAt: string,
  ) {
    return this.prismaService.service.update({
      where: { id },
      data: {
        nextNotificationAt,
        notifications: {
          create: { message },
        },
      },
    });
  }

  updateServerNotificationStatus(id: string) {
    return this.prismaService.serverNotification.update({
      where: { id },
      data: {
        isSent: true,
      },
    });
  }

  updateServiceNotificationStatus(id: string) {
    return this.prismaService.serviceNotification.update({
      where: { id },
      data: {
        isSent: true,
      },
    });
  }
}
