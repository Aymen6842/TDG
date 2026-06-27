import { Injectable, OnModuleInit } from '@nestjs/common';
import { CustomRequest } from 'src/common/types/request.type';
import { CreatePersonalTasksRepository } from '../repositories/create-personal-tasks.repository';
import { UpdatePersonalTasksRepository } from '../repositories/update-personal-tasks.repository';
import { FetchPersonalTasksRepository } from '../repositories/fetch-personal-tasks.repository';
import { DeletePersonalTasksRepository } from '../repositories/delete-personal-tasks.repository';
import { CreatePersonalTaskDto } from '../dto/request/post/create-personal-task.dto';
import { UploadService } from 'src/common/upload/service/upload.service';
import { CreatePersonalTaskCommentDto } from '../dto/request/post/create-personal-task-comment.dto';
import { Prisma } from '@prisma/client';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { UpdatePersonalTaskDto } from '../dto/request/update/update-personal-task.dto';
import { FilterPersonalTasksParametersDto } from '../dto/request/fetch/filter-personal-tasks-parameters.dto';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { TimeService } from 'src/common/time/service/time.service';
import { MailService } from 'src/common/mail/service/mail.service';
import { TelegramService } from 'src/common/telegram/service/telegram.service';
import { LockManagementService } from 'src/lock-management/services/lock-management.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NtfyService } from 'src/common/ntfy/service/ntfy.service';

@Injectable()
export class PersonalTasksService implements OnModuleInit {
  private readonly notifyUserAboutPersonalTaskReminderLock =
    'notifyUserAboutPersonalTaskReminderLock';
  private readonly notifyUserAboutPersonalTaskReminderLockTTL = 55; // 55 Seconds

  constructor(
    private readonly createPersonalTaskRepository: CreatePersonalTasksRepository,
    private readonly updatePersonalTaskRepository: UpdatePersonalTasksRepository,
    private readonly fetchPersonalTaskRepository: FetchPersonalTasksRepository,
    private readonly deletePersonalTaskRepository: DeletePersonalTasksRepository,
    private readonly uploadService: UploadService,
    private readonly notificationService: NotificationsService,
    private readonly ntfyService: NtfyService,
    private readonly lockManagementService: LockManagementService,
    private readonly mailService: MailService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    this.lockManagementService.createOrUpdateLock(
      this.notifyUserAboutPersonalTaskReminderLock,
      'Unlocked',
      0,
    );
  }

  async createPersonalTask(
    req: CustomRequest,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    data: CreatePersonalTaskDto,
  ) {
    try {
      data.userId = req.user?.id;
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        data.attachments = uploadedFiles?.attachments?.map((file) =>
          this.uploadService.setAttachmentPathForPersonalTask(file.filename),
        );
      }
      return await this.createPersonalTaskRepository.createPersonalTask(data);
    } catch (error: unknown) {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      )
        uploadedFiles?.attachments?.map((file) =>
          this.uploadService.deleteImageByPath(file.path),
        );

      throw error;
    }
  }

  async createPersonalTaskComment(
    req: CustomRequest,
    data: CreatePersonalTaskCommentDto,
  ) {
    try {
      data.userId = req.user?.id;

      return await this.createPersonalTaskRepository.createPersonalTaskComment(
        data,
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      )
        throw new NotFoundCustomException(
          'The personal task you are trying to comment on does not exist.',
          ErrorCode.PERSONAL_TASK_NOT_FOUND,
        );

      throw error;
    }
  }

  async updatePersonalTask(
    req: CustomRequest,
    id: string,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    data: UpdatePersonalTaskDto,
  ) {
    try {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        data.attachments = uploadedFiles?.attachments?.map((file) =>
          this.uploadService.setAttachmentPathForPersonalTask(file.filename),
        );
      }

      return await this.updatePersonalTaskRepository.updatePersonalTask(
        id,
        req.user?.id as string,
        data,
      );
    } catch (error: unknown) {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      )
        uploadedFiles?.attachments?.map((file) =>
          this.uploadService.deleteImageByPath(file.path),
        );
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'The personal task you are trying to update does not exist.',
          ErrorCode.PERSONAL_TASK_NOT_FOUND,
        );

      throw error;
    }
  }

  async deletePersonalTask(req: CustomRequest, id: string) {
    try {
      const personalTask =
        await this.fetchPersonalTaskRepository.getPersonalTaskAttachmentsByPersonalTaskId(
          id,
          req.user?.id as string,
        );

      // Delete personal task
      await this.deletePersonalTaskRepository.deletePersonalTaskById(
        id,
        req.user?.id as string,
      );

      // Delete attachments from storage
      if (personalTask && personalTask.length > 0) {
        personalTask.forEach((attachment) => {
          this.uploadService.deleteImageByPath(attachment.file);
        });
      }
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'The personal task you are trying to delete does not exist.',
          ErrorCode.PERSONAL_TASK_NOT_FOUND,
        );

      throw error;
    }
  }

  async deletePersonalTaskComment(req: CustomRequest, id: string) {
    try {
      await this.deletePersonalTaskRepository.deletePersonalTaskCommentById(
        id,
        req.user?.id as string,
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'The personal task comment you are trying to delete does not exist.',
          ErrorCode.PERSONAL_TASK_COMMENT_NOT_FOUND,
        );

      throw error;
    }
  }

  async filterPersonalTasks(
    req: CustomRequest,
    query: FilterPersonalTasksParametersDto,
  ) {
    return await this.fetchPersonalTaskRepository.filterPersonalTasks(
      req.user?.id as string,
      query,
    );
  }

  async getPersonalTaskById(req: CustomRequest, id: string) {
    try {
      return await this.fetchPersonalTaskRepository.getPersonalTaskById(
        id,
        req.user?.id as string,
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'The personal task you are trying to fetch does not exist.',
          ErrorCode.PERSONAL_TASK_NOT_FOUND,
        );

      throw error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async notifyUserAboutPersonalTaskReminder() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.notifyUserAboutPersonalTaskReminderLock,
        'locked',
        this.notifyUserAboutPersonalTaskReminderLockTTL,
      );
      if (!isLockAcquired) return;

      const currentTime = TimeService.getCurrentTime();
      const personalTasks =
        await this.fetchPersonalTaskRepository.getPersonalTaskUsersStillNotNotified(
          currentTime,
        );

      for (const personalTask of personalTasks) {
        if (personalTask?.user?.notificationSettings?.pushNotificationsEnabled)
          this.notificationService.createNotificationFromSystem(
            personalTask?.user?.id,
            {
              title: 'Personal Task Reminder',
              body: `Hello ${personalTask?.user?.name}! You have a reminder for your personal task: ${personalTask?.content[0]?.title} scheduled on ${TimeService.getTimeByZoneFromUtcTime(
                personalTask.dueDate,
                'Africa/Tunis',
              )}.`,
            },
          );

        if (personalTask?.user?.notificationSettings?.emailNotificationsEnabled)
          this.mailService.sendHtmlEmail({
            to: [personalTask?.user?.email],
            subject: 'Personal Task Reminder',
            toName: personalTask?.user?.name,
            paragraphs: [
              `You have a reminder for your personal task: ${personalTask?.content[0]?.title}, scheduled on ${TimeService.getTimeByZoneFromUtcTime(
                personalTask.dueDate,
                'Africa/Tunis',
              )}. You can check your personal tasks dashboard for more details using the following link: https://management.tawer.tn/en/dashboard/todo-list`,
            ],
          });

        if (
          personalTask?.user?.notificationSettings
            ?.telegramNotificationsEnabled &&
          personalTask?.user?.telegramBot?.chatId
        )
          this.telegramService.sendTelegramMessage(
            personalTask?.user?.telegramBot?.chatId,
            `Hello ${personalTask?.user?.name}, You have a reminder for your personal task: ${personalTask?.content[0]?.title} scheduled on ${TimeService.getTimeByZoneFromUtcTime(
              personalTask.dueDate,
              'Africa/Tunis',
            )}. You can check your personal tasks dashboard for more details using the following link: https://management.tawer.tn/en/dashboard/todo-list`,
          );

        if (
          personalTask?.user?.notificationSettings?.ntfyNotificationsEnabled &&
          personalTask?.user?.ntfyIntegration?.topic
        )
          this.ntfyService.sendNtfyMessage(
            personalTask?.user?.ntfyIntegration?.topic,
            {
              title: 'Personal Task Reminder',
              message: `Hello ${personalTask?.user?.name}! You have a reminder for your personal task: ${personalTask?.content[0]?.title} scheduled on ${TimeService.getTimeByZoneFromUtcTime(
                personalTask.dueDate,
                'Africa/Tunis',
              )}.`,
              priority: 'default',
            },
          );

        this.updatePersonalTaskRepository
          .updatePersonalTaskNotificationStatus(
            personalTask.id,
            personalTask.user.id,
            true,
          )
          .catch((error: unknown) => {
            this.backgroundActivitiesLoggerService.log(
              `Error while updating personal task notification status: ${error instanceof Error ? error.message : String(error)}`,
              {
                service: 'Background Activities For Personal Tasks Service',
                method:
                  'Notify User About Personal Task Reminder - Update Notification Status',
              },
            );
          });
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Error while notifying users about personal task reminders: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Background Activities For Personal Tasks Service',
          method: 'Notify User About Personal Task Reminder',
        },
      );
    }
  }
}
