import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateServerDto } from '../dto/request/post/create-server';
import { CreateServiceDto } from '../dto/request/post/create-service.dto';

@Injectable()
export class CreateServerRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createServer(data: CreateServerDto) {
    return this.prismaService.server.create({
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
        nextNotificationAt: data.nextNotificationAt,
        managers: data.managersIds
          ? {
              create: data.managersIds.map((managerId) => ({
                managerId,
              })),
            }
          : undefined,
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

  createService(data: CreateServiceDto) {
    return this.prismaService.service.create({
      data: {
        serverId: data.serverId,
        name: data.name,
        domain: data.domain,
        description: data.description,
        sslCertificate: data.sslCertificate,
        sslCertificateByCloudProvider: data.sslCertificateByCloudProvider,
        backupDestination: data.backupDestination,
        hasBackup: data.hasBackup,
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

  createServerNotification(serverId: string, message: string) {
    return this.prismaService.serverNotification.create({
      data: {
        serverId,
        message,
      },
      select: {
        id: true,
        message: true,
      },
    });
  }

  createServiceNotification(serviceId: string, message: string) {
    return this.prismaService.serviceNotification.create({
      data: {
        serviceId,
        message,
      },
      select: {
        id: true,
        message: true,
      },
    });
  }
}
