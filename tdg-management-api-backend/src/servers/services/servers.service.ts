import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, UserType } from '@prisma/client';

import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

import { PaginationParametersRequestDto } from '../dto/request/fetch/pagination-parameters.dto';
import { CreateServerRepository } from '../repositories/create-server.repository';
import { DeleteServerRepository } from '../repositories/delete-server.repository';
import { UpdateServerRepository } from '../repositories/update-server.repository';
import { FetchServerRepository } from '../repositories/fetch-server.repository';
import { CreateServerDto } from '../dto/request/post/create-server';
import { CreateServiceDto } from '../dto/request/post/create-service.dto';
import { UpdateServiceDto } from '../dto/request/update/update-service.dto';
import { UpdateServerDto } from '../dto/request/update/update-server.dto';
import { CustomRequest } from 'src/common/types/request.type';
import { UnauthorizedCustomException } from 'src/common/exceptions/custom-exceptions/unauthorized.exception';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { TimeService } from 'src/common/time/service/time.service';
import axios from 'axios';
import * as ping from 'ping';
import { MailService } from 'src/common/mail/service/mail.service';
import { FilterServersParamsDto } from '../dto/request/fetch/filter-servers-params.dto';
import { FilterServicesParamsDto } from '../dto/request/fetch/filter-services-params.dto';
import { TelegramService } from 'src/common/telegram/service/telegram.service';
import { LockManagementService } from 'src/lock-management/services/lock-management.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { NtfyService } from 'src/common/ntfy/service/ntfy.service';

@Injectable()
export class ServersService implements OnModuleInit {
  private readonly updateServerNextNotificationDateLock =
    'updateServerNextNotificationDateLock';
  private readonly updateServerNextNotificationDateLockTTL = 55; // 55 Seconds
  private readonly updateServicesNextNotificationDateLock =
    'updateServicesNextNotificationDateLock';
  private readonly updateServicesNextNotificationDateLockTTL = 55; // 55 Seconds
  private readonly sendNotificationsForServersLock =
    'sendNotificationsForServersLock';
  private readonly sendNotificationsForServersLockTTL = 55; // 55 Seconds
  private readonly sendNotificationsForServicesLock =
    'sendNotificationsForServicesLock';
  private readonly sendNotificationsForServicesLockTTL = 55; // 55 Seconds
  private readonly checkServersStatusLock = 'checkServersStatusLock';
  private readonly checkServersStatusLockTTL = 55; // 55 Seconds
  private readonly checkServicesStatusLock = 'checkServicesStatusLock';
  private readonly checkServicesStatusLockTTL = 55; // 55 Seconds

  constructor(
    private readonly createServerRepository: CreateServerRepository,
    private readonly fetchServerRepository: FetchServerRepository,
    private readonly updateServerRepository: UpdateServerRepository,
    private readonly deleteServerRepository: DeleteServerRepository,
    private readonly ntfyService: NtfyService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
    private readonly lockManagementService: LockManagementService,
    private readonly notificationsService: NotificationsService,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    this.lockManagementService.createOrUpdateLock(
      this.updateServerNextNotificationDateLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.updateServicesNextNotificationDateLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.sendNotificationsForServersLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.sendNotificationsForServicesLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.checkServersStatusLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.checkServicesStatusLock,
      'Unlocked',
      0,
    );
  }

  async createServer(data: CreateServerDto) {
    if (data.expiredAt)
      data.nextNotificationAt = TimeService.getPastDateByDaysFromDate(
        data.expiredAt,
        14,
      );

    return this.createServerRepository.createServer(data);
  }

  async createService(req: CustomRequest, data: CreateServiceDto) {
    try {
      const isCTO = this.isCTO(req);
      if (isCTO) return this.createServerRepository.createService(data);

      const server =
        await this.fetchServerRepository.checkManagerAccessToServer(
          data.serverId,
          req?.user?.id as string,
        );
      if (!server) throw new UnauthorizedCustomException();

      return this.createServerRepository.createService(data);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      )
        throw new NotFoundCustomException(
          'The serverId provided does not exist!',
          ErrorCode.SERVER_NOT_FOUND,
        );

      throw error;
    }
  }

  async updateServer(req: CustomRequest, id: string, data: UpdateServerDto) {
    try {
      const isCTO = this.isCTO(req);

      if (data.expiredAt)
        data.nextNotificationAt = TimeService.getPastDateByDaysFromDate(
          data.expiredAt,
          14,
        );

      return isCTO
        ? await this.updateServerRepository.updateServer(id, data)
        : await this.updateServerRepository.updateServer(
            id,
            data,
            req?.user?.id as string,
          );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This server is not found!',
          ErrorCode.SERVER_NOT_FOUND,
        );

      throw error;
    }
  }

  async updateService(req: CustomRequest, id: string, data: UpdateServiceDto) {
    try {
      const isCTO = this.isCTO(req);
      return isCTO
        ? await this.updateServerRepository.updateService(id, data)
        : await this.updateServerRepository.updateService(
            id,
            data,
            req?.user?.id as string,
          );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This service is not found!',
          ErrorCode.SERVICE_NOT_FOUND,
        );

      throw error;
    }
  }

  async deleteServer(req: CustomRequest, id: string) {
    try {
      const isCTO = this.isCTO(req);
      return isCTO
        ? this.deleteServerRepository.deleteServerById(id)
        : this.deleteServerRepository.deleteServerById(
            id,
            req?.user?.id as string,
          );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This server is not found!',
          ErrorCode.SERVER_NOT_FOUND,
        );

      throw error;
    }
  }

  async deleteService(req: CustomRequest, id: string) {
    try {
      const isCTO = this.isCTO(req);
      return isCTO
        ? await this.deleteServerRepository.deleteServiceById(id)
        : await this.deleteServerRepository.deleteServiceById(
            id,
            req?.user?.id as string,
          );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This service is not found!',
          ErrorCode.SERVICE_NOT_FOUND,
        );

      throw error;
    }
  }

  async getServiceById(req: CustomRequest, id: string) {
    try {
      const executiveRole = this.getCTOOrCEO(req);
      return executiveRole
        ? this.fetchServerRepository.getServiceById(id)
        : this.fetchServerRepository.getServiceById(
            id,
            req?.user?.id as string,
          );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This service is not found!',
          ErrorCode.SERVICE_NOT_FOUND,
        );

      throw error;
    }
  }

  async getServerById(req: CustomRequest, id: string) {
    try {
      const executiveRole = this.getCTOOrCEO(req);
      return executiveRole
        ? this.fetchServerRepository.getServerById(id)
        : this.fetchServerRepository.getServerById(id, req?.user?.id as string);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This server is not found!',
          ErrorCode.SERVER_NOT_FOUND,
        );

      throw error;
    }
  }

  async filterServices(req: CustomRequest, query: FilterServicesParamsDto) {
    const { page, limit } = this.retrievePaginationParameters(query);
    const skip = (page - 1) * limit;

    const executiveRole = this.getCTOOrCEO(req);

    const totalServices = executiveRole
      ? await this.fetchServerRepository.countFiltredServices(query)
      : await this.fetchServerRepository.countFiltredServices({
          ...query,
          managedById: req?.user?.id as string,
        });
    const services = executiveRole
      ? await this.fetchServerRepository.filterServices(query, skip, limit)
      : await this.fetchServerRepository.filterServices(
          { ...query, managedById: req?.user?.id as string },
          skip,
          limit,
        );

    return {
      data: services,
      pagination: this.setPaginationParametersInResponse(
        totalServices,
        page,
        limit,
      ),
    };
  }

  async filterServers(req: CustomRequest, query: FilterServersParamsDto) {
    const { page, limit } = this.retrievePaginationParameters(query);
    const skip = (page - 1) * limit;

    const executiveRole = this.getCTOOrCEO(req);
    const totalServers = executiveRole
      ? await this.fetchServerRepository.countFiltredServers(query)
      : await this.fetchServerRepository.countFiltredServers({
          ...query,
          managedById: req?.user?.id as string,
        });
    const servers = executiveRole
      ? await this.fetchServerRepository.filterServers(query, skip, limit)
      : await this.fetchServerRepository.filterServers(
          { ...query, managedById: req?.user?.id as string },
          skip,
          limit,
        );

    return {
      data: servers,
      pagination: this.setPaginationParametersInResponse(
        totalServers,
        page,
        limit,
      ),
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateServerNextNotificationDate() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.updateServerNextNotificationDateLock,
        'locked',
        this.updateServerNextNotificationDateLockTTL,
      );
      if (!isLockAcquired) return;

      const servers =
        await this.fetchServerRepository.getRunningServersExpiration();

      for (const server of servers) {
        const minutesDifferenceBetweenCurrentTimeAndNotification =
          TimeService.calculateTimeDifferenceInMinutes(
            TimeService.getCurrentTime(),
            server.nextNotificationAt as Date,
          );
        const daysDifferenceBetweenCurrentTimeAndExpiration =
          TimeService.calculateTimeDifferenceInDays(
            TimeService.getCurrentTime(),
            server.expiredAt as Date,
          );

        if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 14 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 7 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServerNextNotificationDate(
            server.id,
            `Reminder: The server "${server.name}" (IP address: ${server.ip}) will expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} days. Please plan the renewal in advance to avoid any service disruption.`,
            TimeService.getPastDateByDaysFromDate(server.expiredAt as Date, 6),
          );
        } else if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 7 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 4 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServerNextNotificationDate(
            server.id,
            `Attention required: The server "${server.name}" (IP address: ${server.ip}) is scheduled to expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} days. We recommend renewing it soon to ensure uninterrupted availability.`,
            TimeService.getPastDateByDaysFromDate(server.expiredAt as Date, 3),
          );
        } else if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 4 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 1 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServerNextNotificationDate(
            server.id,
            `Urgent notice: The server "${server.name}" (IP address: ${server.ip}) will expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} day(s). Immediate action is required to prevent potential downtime.`,
            TimeService.getPastDateByHoursFromDate(
              server.expiredAt as Date,
              12,
            ),
          );
        } else if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 1 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 0 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServerNextNotificationDate(
            server.id,
            `Server expired: The server "${server.name}" (IP address: ${server.ip}) has expired. The server may no longer be operational. Please take immediate corrective action.`,
            TimeService.getPastDateByHoursFromDate(server.expiredAt as Date, 2),
          );
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error updating servers next notification date: ' +
          (error as Error).message,
        {
          service: 'Background Activities For Servers Service',
          method: 'Updating Servers Next Notification Date',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async updateServicesNextNotificationDate() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.updateServicesNextNotificationDateLock,
        'locked',
        this.updateServicesNextNotificationDateLockTTL,
      );
      if (!isLockAcquired) return;

      const services =
        await this.fetchServerRepository.getRunningServicesExpiration();

      for (const service of services) {
        const minutesDifferenceBetweenCurrentTimeAndNotification =
          TimeService.calculateTimeDifferenceInMinutes(
            TimeService.getCurrentTime(),
            service.nextNotificationAt as Date,
          );
        const daysDifferenceBetweenCurrentTimeAndExpiration =
          TimeService.calculateTimeDifferenceInDays(
            TimeService.getCurrentTime(),
            service.expiredAt as Date,
          );

        if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 14 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 7 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServiceNextNotificationDate(
            service.id,
            `Reminder: The service "${service.name}", hosted on the server "${service.server.name}" (IP address: ${service.server.ip}), will expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} days. Please plan the renewal in advance to avoid any service disruption.`,
            TimeService.getPastDateByDaysFromDate(service.expiredAt as Date, 6),
          );
        } else if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 7 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 4 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServiceNextNotificationDate(
            service.id,
            `Attention required: The service "${service.name}", hosted on the server "${service.server.name}" (IP address: ${service.server.ip}), is scheduled to expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} days. We strongly recommend renewing it soon to ensure uninterrupted operation.`,
            TimeService.getPastDateByDaysFromDate(service.expiredAt as Date, 3),
          );
        } else if (
          daysDifferenceBetweenCurrentTimeAndExpiration < 4 &&
          daysDifferenceBetweenCurrentTimeAndExpiration >= 1 &&
          minutesDifferenceBetweenCurrentTimeAndNotification <= 0
        ) {
          await this.updateServerRepository.updateServiceNextNotificationDate(
            service.id,
            `Urgent notice: The service "${service.name}", hosted on the server "${service.server.name}" (IP address: ${service.server.ip}), will expire in ${daysDifferenceBetweenCurrentTimeAndExpiration} day(s). Immediate action is required to prevent service downtime.`,
            TimeService.getPastDateByHoursFromDate(
              service.expiredAt as Date,
              12,
            ),
          );
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error updating servers next notification date: ' +
          (error as Error).message,
        {
          service: 'Background Activities For Servers Service',
          method: 'Updating Servers Next Notification Date',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkServersStatus() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.checkServersStatusLock,
        'locked',
        this.checkServersStatusLockTTL,
      );
      if (!isLockAcquired) return;

      const servers = await this.fetchServerRepository.getRunningServersIps();
      for (const server of servers) {
        const res = await ping.promise.probe(server.ip, { timeout: 10 });
        if (!res.alive) {
          await this.createServerRepository.createServerNotification(
            server.id,
            `The server with IP address: ${server.ip} and name: ${server.name} is down.`,
          );
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error checking servers status: ' + (error as Error).message,
        {
          service: 'Background Activities For Servers Service',
          method: 'Checking Servers Status',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkServicesStatus() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.checkServicesStatusLock,
        'locked',
        this.checkServicesStatusLockTTL,
      );
      if (!isLockAcquired) return;

      const services =
        await this.fetchServerRepository.getRunningServicesDomains();

      for (const service of services) {
        const isAlive = await this.checkHttp(service.domain as string);

        if (!isAlive) {
          await this.createServerRepository.createServiceNotification(
            service.id,
            `The service with domain: ${service.domain} and name: ${service.name} is down.`,
          );
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error checking services status: ' + (error as Error).message,
        {
          service: 'Background Activities For Servers Service',
          method: 'Checking Services Status',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendNotificationsForServers() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.sendNotificationsForServersLock,
        'locked',
        this.sendNotificationsForServersLockTTL,
      );
      if (!isLockAcquired) return;

      const serverNotifications =
        await this.fetchServerRepository.getNotificationsMessagesForServers();

      for (const serverNotification of serverNotifications) {
        serverNotification?.server?.managers?.forEach((manager) => {
          if (
            manager?.manager?.notificationSettings
              ?.telegramNotificationsEnabled &&
            manager?.manager?.telegramBot?.chatId
          ) {
            this.telegramService.sendTelegramMessage(
              manager.manager.telegramBot.chatId,
              serverNotification.message,
            );
          }

          if (
            manager?.manager?.notificationSettings?.ntfyNotificationsEnabled &&
            manager?.manager?.ntfyIntegration?.topic
          ) {
            this.ntfyService.sendNtfyMessage(
              manager.manager.ntfyIntegration.topic,
              {
                title: 'TDG Infrastructure Notification',
                priority: 'high',
                message: serverNotification.message,
              },
            );
          }

          if (
            manager?.manager?.notificationSettings?.emailNotificationsEnabled
          ) {
            this.mailService.sendHtmlEmail({
              to: [manager.manager.email],
              subject: 'TDG Infrastructure Notification',
              toName: manager.manager.name,
              paragraphs: [serverNotification.message],
            });
          }

          if (
            manager?.manager?.notificationSettings?.pushNotificationsEnabled
          ) {
            this.notificationsService.createNotificationFromSystem(
              manager.manager.id,
              {
                title: 'TDG Infrastructure Notification',
                body: serverNotification.message,
              },
            );
          }
        });

        this.updateServerRepository
          .updateServerNotificationStatus(serverNotification.id)
          .catch((error: unknown) => {
            this.backgroundActivitiesLoggerService.log(
              'Error updating servers next notification date: ' +
                (error as Error).message,
              {
                service: 'Background Activities For Servers Service',
                method: 'Updating Servers Next Notification Date',
              },
            );
          });
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error updating servers next notification date: ' +
          (error as Error).message,
        {
          service: 'Background Activities For Servers Service',
          method: 'Updating Servers Next Notification Date',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async sendNotificationsForServices() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.sendNotificationsForServicesLock,
        'locked',
        this.sendNotificationsForServicesLockTTL,
      );
      if (!isLockAcquired) return;

      const servicesNotifications =
        await this.fetchServerRepository.getNotificationsMessagesForServices();

      for (const serviceNotification of servicesNotifications) {
        serviceNotification?.service?.server?.managers?.forEach((manager) => {
          if (
            manager?.manager?.notificationSettings
              ?.telegramNotificationsEnabled &&
            manager?.manager?.telegramBot?.chatId
          ) {
            this.telegramService.sendTelegramMessage(
              manager.manager.telegramBot.chatId,
              serviceNotification.message,
            );
          }

          if (
            manager?.manager?.notificationSettings?.ntfyNotificationsEnabled &&
            manager?.manager?.ntfyIntegration?.topic
          ) {
            this.ntfyService.sendNtfyMessage(
              manager.manager.ntfyIntegration.topic,
              {
                title: 'TDG Infrastructure Notification',
                priority: 'high',
                message: serviceNotification.message,
              },
            );
          }

          if (
            manager?.manager?.notificationSettings?.emailNotificationsEnabled
          ) {
            this.mailService.sendHtmlEmail({
              to: [manager.manager.email],
              subject: 'TDG Infrastructure Notification',
              toName: manager.manager.name,
              paragraphs: [serviceNotification.message],
            });
          }

          if (
            manager?.manager?.notificationSettings?.pushNotificationsEnabled
          ) {
            this.notificationsService.createNotificationFromSystem(
              manager.manager.id,
              {
                title: 'TDG Infrastructure Notification',
                body: serviceNotification.message,
              },
            );
          }
        });

        this.updateServerRepository
          .updateServiceNotificationStatus(serviceNotification.id)
          .catch((error: unknown) => {
            this.backgroundActivitiesLoggerService.log(
              'Error updating services next notification date: ' +
                (error as Error).message,
              {
                service: 'Background Activities For Services Service',
                method: 'Updating Services Next Notification Date',
              },
            );
          });
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error updating services next notification date: ' +
          (error as Error).message,
        {
          service: 'Background Activities For Services Service',
          method: 'Updating Services Next Notification Date',
        },
      );
    }
  }

  getCTOOrCEO(req: CustomRequest) {
    return req?.user?.roles?.find(
      (role) => role === UserType.CTO || role === UserType.CEO,
    );
  }

  isCTO(req: CustomRequest) {
    return req?.user?.roles?.find((role) => role === UserType.CTO)
      ? true
      : false;
  }

  setPaginationParametersInResponse(
    totalRecords: number,
    page: number,
    limit: number,
  ) {
    const totalPagesFloat = totalRecords / limit;
    const totalPages =
      totalPagesFloat - Math.trunc(totalPagesFloat) > 0
        ? Math.trunc(totalPagesFloat) + 1
        : totalPagesFloat;

    return {
      records: totalRecords,
      currentPage: page,
      totalPages: totalPages,
    };
  }

  retrievePaginationParameters(query: PaginationParametersRequestDto): {
    page: number;
    limit: number;
  } {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 500, 500);

    return { page, limit };
  }

  async checkHttp(url: string): Promise<boolean> {
    try {
      const res = await axios.get(url, {
        timeout: 20000,
        validateStatus: () => true,
      });
      return res.status <= 500;
    } catch {
      return false;
    }
  }
}
