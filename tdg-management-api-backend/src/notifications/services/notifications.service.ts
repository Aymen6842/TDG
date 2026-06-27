import { Injectable } from '@nestjs/common';
import { CreateNotificationRepository } from '../repositories/create-notification.repository';
import { CreateNotificationTokenDto } from '../dto/request/post/create-notification-token.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { DeleteNotificationRepository } from '../repositories/delete-notification.repository';
import { FetchNotificationsRepository } from '../repositories/fetch-notifications.repository';
import { FirebaseService } from 'src/common/firebase/service/firebase.service';
import { UpdateNotificationRepository } from '../repositories/update-notification.repositoty';
import {
  FilterNotificationsParameters,
  PaginationParameters,
} from '../types/request.type';
import { CreateNotificationDto } from '../dto/request/post/create-notification.dto';
import { CustomRequest } from 'src/common/types/request.type';
import { ConfigService } from '@nestjs/config';
import { UploadService } from 'src/common/upload/service/upload.service';
import { CreateNotificationContentDto } from '../dto/request/post/create-notification-content.dto';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly uploadService: UploadService,
    private readonly configService: ConfigService,
    private readonly createNotificationRepository: CreateNotificationRepository,
    private readonly deleteNotificationRepository: DeleteNotificationRepository,
    private readonly fetchNotificationsRepository: FetchNotificationsRepository,
    private readonly updateNotificationRepository: UpdateNotificationRepository,
    private readonly firebaseService: FirebaseService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async createOrUpdateNotificationToken(
    req: CustomRequest,
    data: CreateNotificationTokenDto,
  ) {
    try {
      data.userId = req.user?.id as string;
      const createdNotification =
        await this.createNotificationRepository.createOrUpdateNotificationToken(
          data,
        );

      return createdNotification;
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      throw error;
    }
  }

  async createNotification(
    req: CustomRequest,
    data: CreateNotificationDto,
    file?: Express.Multer.File,
  ) {
    try {
      const tokens = data.sendToAllUsers
        ? await this.fetchNotificationsRepository.getAllNotificationTokens()
        : await this.fetchNotificationsRepository.getNotificationTokenByusersIds(
            data.usersIds || [],
          );

      data.tokens = tokens.map((token) => token.token);
      data.usersIds = tokens.map((token) => token.userId as string);
      data.senderId = req.user?.id as string;

      // Setting the path of the image in the notification data
      if (file)
        data.image = this.uploadService.setImagePathForNotification(
          file.filename,
        );

      await this.firebaseService.sendNotificationsToUsers(
        data.tokens,
        data?.content?.title,
        data?.content?.body,
        data.image
          ? `${this.configService.get('API_ADDRESS')}${data.image}`
          : null,
      );

      // Save notifications in the database
      await this.createNotificationRepository.createManyNotifications(data);
    } catch (error: unknown) {
      if (file) this.uploadService.deleteImageByPath(file.path);
      throw error;
    }
  }

  async createNotificationFromSystem(
    userId: string,
    data: CreateNotificationContentDto,
  ) {
    try {
      const tokens =
        await this.fetchNotificationsRepository.getNotificationTokenByusersIds([
          userId,
        ]);

      await this.firebaseService.sendNotificationsToUsers(
        tokens.map((token) => token.token),
        data.title,
        data.body,
      );

      await this.createNotificationRepository.createManyNotifications({
        usersIds: [userId],
        sendToAllUsers: false,
        content: data,
        tokens: tokens.map((token) => token.token),
      });
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Error while creating notification for personal task reminder: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Background Activities For Personal Tasks Service',
          method:
            'Notify User About Personal Task Reminder - Create Notification',
        },
      );
    }
  }

  async updateNotificationForUser(
    req: CustomRequest,
    notificationIds: string[],
  ) {
    try {
      await this.updateNotificationRepository.markNotificationAsSeenForUser(
        req.user?.id as string,
        notificationIds,
      );
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundCustomException(
          `Notifications with ids ${notificationIds.join(', ')} not found!`,
          ErrorCode.NOTIFICATION_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  async filterNotificationsForSender(
    req: CustomRequest,
    query: PaginationParameters,
  ) {
    const { page, limit } = this.retrievePaginationParameters(query);

    const countedNotifications =
      await this.fetchNotificationsRepository.countFilteredNotificationsBySenderId(
        req?.user?.id as string,
      );
    const skip = (page - 1) * limit;
    const notifications =
      await this.fetchNotificationsRepository.filterNotificationsBySenderId(
        req?.user?.id as string,
        skip,
        limit,
      );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedNotifications,
      page,
      limit,
    );

    return { data: notifications, pagination: paginationParameters };
  }

  async filterNotificationsForUser(
    req: CustomRequest,
    query: FilterNotificationsParameters,
  ) {
    const { page, limit } = this.retrievePaginationParameters(query);

    const countedNotifications =
      await this.fetchNotificationsRepository.countFilteredNotificationsByUserId(
        req.user?.id as string,
        query,
      );
    const skip = (page - 1) * limit;
    const notifications =
      await this.fetchNotificationsRepository.filterNotificationsByUserId(
        req.user?.id as string,
        query,
        skip,
        limit,
      );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedNotifications,
      page,
      limit,
    );

    return { data: notifications, pagination: paginationParameters };
  }

  async deleteNotificationById(req: CustomRequest, notificationId: string) {
    try {
      const notification =
        await this.fetchNotificationsRepository.getNotificationImageByIdAndSenderId(
          notificationId,
          req?.user?.id as string,
        );

      // Deleting the image of the notification if exists
      if (notification.image)
        this.uploadService.deleteImageByPathInDb(notification.image);

      await this.deleteNotificationRepository.deleteNotificationByIdAndSenderId(
        notificationId,
        req?.user?.id as string,
      );
    } catch (error: unknown) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This notification is not found!',
          ErrorCode.NOTIFICATION_NOT_FOUND,
        );

      throw error;
    }
  }

  retrievePaginationParameters(query: PaginationParameters): {
    page: number;
    limit: number;
  } {
    const page =
      isNaN(Number(query.page)) || Number(query.page) < 1
        ? 1
        : Number(query.page);
    const limit =
      isNaN(Number(query.limit)) || Number(query.limit) > 30
        ? 30
        : Number(query.limit);

    return { page, limit };
  }

  setPaginationParametersInResponse(
    totalNotification: number,
    page: number,
    limit: number,
  ) {
    const totalPagesFloat = totalNotification / limit;
    const totalPages =
      totalPagesFloat - Math.trunc(totalPagesFloat) > 0
        ? Math.trunc(totalPagesFloat) + 1
        : totalPagesFloat;

    return {
      records: totalNotification,
      currentPage: page,
      totalPages: totalPages,
    };
  }
}
