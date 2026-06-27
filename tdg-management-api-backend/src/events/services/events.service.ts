import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateEventRepository } from '../repositories/create.repository';
import { CreateEventDto } from '../dto/request/post/create-event.dto';
import { DeleteEventRepository } from '../repositories/delete.repository';
import { EventType, Prisma, UserType } from '@prisma/client';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { TimeService } from 'src/common/time/service/time.service';
import { CustomRequest } from 'src/common/types/request.type';
import { UpdateEventDto } from '../dto/request/update/update-event.dto';
import { UpdateEventRepository } from '../repositories/update.repository';
import { FetchEventRepository } from '../repositories/fetch.repository';
import { FilterEventsParamsDto } from '../dto/request/fetch/filter-events-params.dto';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { MailService } from 'src/common/mail/service/mail.service';
import { UsersService } from 'src/users/services/users.service';
import { UserDataInDb } from 'src/users/types/user.type';
import { TelegramService } from 'src/common/telegram/service/telegram.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { PermissionsService } from 'src/auths/services/permissions/permissions.service';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { LockManagementService } from 'src/lock-management/services/lock-management.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NtfyService } from 'src/common/ntfy/service/ntfy.service';

@Injectable()
export class EventsService implements OnModuleInit {
  private readonly notifyUsersAboutEventLock = 'notifyUsersAboutEventLock';
  private readonly notifyUsersAboutEventLockTTL = 55; // 55 seconds

  constructor(
    private readonly createEventRepository: CreateEventRepository,
    private readonly deleteEventRepository: DeleteEventRepository,
    private readonly updateEventRepository: UpdateEventRepository,
    private readonly fetchEventRepository: FetchEventRepository,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
    private readonly mailService: MailService,
    private readonly ntfyService: NtfyService,
    private readonly usersService: UsersService,
    private readonly telegramService: TelegramService,
    private readonly notificationsService: NotificationsService,
    private readonly permissionsService: PermissionsService,
    private readonly lockManagementService: LockManagementService,
  ) {}

  onModuleInit() {
    this.lockManagementService.createOrUpdateLock(
      this.notifyUsersAboutEventLock,
      'Unlocked',
      0,
    );
  }

  async createEvent(req: CustomRequest, data: CreateEventDto) {
    data.createdById = req.user?.id as string;
    const { nextNotificationTime } = this.getNextNotificationTime(
      data.startTime,
    );
    data.nextNotificationTime = nextNotificationTime;

    return this.createEventRepository.createEvent(data);
  }

  async updateEvent(req: CustomRequest, id: string, data: UpdateEventDto) {
    try {
      data.createdById = req.user?.id as string;

      const event = await this.fetchEventRepository.getEventById(id);
      if (
        event.type === EventType.PersonalEvent &&
        event.createdById !== data.createdById
      )
        throw new ForbiddenCustomException();

      const executiveRole = this.permissionsService.getExecutiveRoleFromRoles(
        req.user?.roles as UserType[],
      );
      if (
        event.type !== EventType.PersonalEvent &&
        event.createdById !== req.user?.id &&
        !executiveRole
      )
        throw new ForbiddenCustomException();

      if (data.startTime) {
        const { nextNotificationTime } = this.getNextNotificationTime(
          data.startTime,
        );
        data.nextNotificationTime = nextNotificationTime;
        data.isNotified = false;
      }

      return this.updateEventRepository.updateEvent(id, data);
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new BadRequestCustomException(
          'This event not found !',
          ErrorCode.EVENT_NOT_FOUND,
        );

      throw error;
    }
  }

  async fetchEventsByPeriod(req: CustomRequest, query: FilterEventsParamsDto) {
    const events = await this.fetchEventRepository.fetchEventsByPeriod({
      ...query,
      createdById: req.user?.id as string,
    });

    return { events: events, period: { from: query.from, to: query.to } };
  }

  async deleteEvent(req: CustomRequest, id: string) {
    try {
      const event = await this.fetchEventRepository.getEventById(id);

      if (
        event.type === EventType.PersonalEvent &&
        event.createdById !== req.user?.id
      )
        throw new ForbiddenCustomException();

      const executiveRole = this.permissionsService.getExecutiveRoleFromRoles(
        req.user?.roles as UserType[],
      );
      if (
        event.type !== EventType.PersonalEvent &&
        event.createdById !== req.user?.id &&
        !executiveRole
      )
        throw new ForbiddenCustomException();

      return this.deleteEventRepository.deleteEventById(
        id,
        req.user?.id as string,
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'This user is not found!',
          ErrorCode.USER_NOT_FOUND,
        );

      throw error;
    }
  }

  getNextNotificationTime(startTime: Date) {
    const diffInMinutes = TimeService.calculateTimeDifferenceInMinutes(
      TimeService.getCurrentTime(),
      startTime,
    );
    let nextNotificationTime: string;

    // Notify 24 hours before for events more than a day away
    if (diffInMinutes >= 1440)
      nextNotificationTime = TimeService.getPastDateByHoursFromDate(
        startTime,
        24,
      );
    else if (diffInMinutes >= 150)
      // Notify 2.5 hours before for events more than 2.5 hours away
      nextNotificationTime = TimeService.getPastDateByHoursFromDate(
        startTime,
        2.5,
      );
    else if (diffInMinutes >= 30)
      // Notify 30 minutes before for events more than 30 minutes away
      nextNotificationTime = TimeService.getPastDateByHoursFromDate(
        startTime,
        0.5,
      );
    // Notify 15 minutes before for events less than 30 minutes away
    else
      nextNotificationTime = TimeService.getPastDateByHoursFromDate(
        startTime,
        0.25,
      );

    return {
      nextNotificationTime: nextNotificationTime,
      timeDifferenceInMinutes: diffInMinutes,
    };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async notifyUsersAboutEvent() {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.notifyUsersAboutEventLock,
        'locked',
        this.notifyUsersAboutEventLockTTL,
      );
      if (!isLockAcquired) return;

      const events = await this.fetchEventRepository.fetchNextEventsToNotify(
        TimeService.getCurrentTime(),
      );
      let users: UserDataInDb[] = [];

      for (const event of events) {
        if (event.toAllUsers === true && users.length === 0)
          users =
            (await this.usersService.getUsersWithNotificationsSettings()) as UserDataInDb[];

        // Sending notifications to participants
        if (event.toAllUsers === true)
          this.sendNotificationsEvents({
            users,
            personalEvent: event.type === EventType.PersonalEvent,
            toAllUsers: event.toAllUsers,
            eventTitle: event.content[0]?.title,
            eventDescription: event.content[0]?.description,
            eventStartTime: event.startTime,
          });
        else if (event.participants && event.participants.length > 0)
          this.sendNotificationsEvents({
            users: event.participants.map((p) => p.user as UserDataInDb),
            personalEvent: event.type === EventType.PersonalEvent,
            toAllUsers: event.toAllUsers,
            eventTitle: event.content[0]?.title,
            eventDescription: event.content[0]?.description,
            eventStartTime: event.startTime,
          });
        else if (event.type === EventType.PersonalEvent)
          this.sendNotificationsEvents({
            users: [event.createdBy as UserDataInDb],
            personalEvent: event.type === EventType.PersonalEvent,
            toAllUsers: event.toAllUsers,
            eventTitle: event.content[0]?.title,
            eventDescription: event.content[0]?.description,
            eventStartTime: event.startTime,
          });

        const { nextNotificationTime, timeDifferenceInMinutes } =
          this.getNextNotificationTime(event.startTime);
        this.updateEventRepository
          .updateEvent(event.id, {
            nextNotificationTime: nextNotificationTime,
            isNotified: timeDifferenceInMinutes <= 25 ? true : false,
          })
          .catch((error: unknown) => {
            this.backgroundActivitiesLoggerService.log(
              'Error updating event notification status: ' +
                (error as Error).message,
              {
                service: 'Background Activities For Events Service',
                method: 'Updating Event Notification Status',
              },
            );
          });
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error updating update next notification date: ' +
          (error as Error).message,
        {
          service: 'Background Activities For update Service',
          method: 'Updating update Next Notification Date',
        },
      );
    }
  }

  sendNotificationsEvents(options: {
    users: UserDataInDb[];
    toAllUsers: boolean;
    personalEvent?: boolean;
    eventTitle: string;
    eventDescription: string | null;
    eventStartTime: Date;
  }) {
    const { users, eventTitle, eventStartTime } = options;

    for (const user of users) {
      if (user.notificationSettings?.emailNotificationsEnabled)
        this.mailService.sendHtmlEmail({
          to: [user.email as string],
          subject: `Reminder: Upcoming Event - ${eventTitle}`,
          toName: user.name ?? 'TDG Colaborator',
          paragraphs: [
            `We would like to remind you about the upcoming event titled <strong>${eventTitle}</strong> scheduled to start at <strong>${TimeService.getTimeByZoneFromUtcTime(
              eventStartTime,
              'Africa/Tunis',
            )}</strong>.<br/>Don't forget to mark your calendar!`,
          ],
        });

      if (
        user.notificationSettings?.telegramNotificationsEnabled &&
        user.telegramBot?.chatId
      )
        this.telegramService.sendTelegramMessage(
          user.telegramBot.chatId,
          `Hello ${user.name}, this is a reminder about the upcoming event titled ${eventTitle} scheduled to start at ${TimeService.getTimeByZoneFromUtcTime(
            eventStartTime,
            'Africa/Tunis',
          )}. Don't forget to mark your calendar!`,
        );

      if (user.notificationSettings?.pushNotificationsEnabled)
        this.notificationsService.createNotificationFromSystem(user.id, {
          title: `Reminder: Upcoming Event - ${eventTitle}`,
          body: `Hello ${user.name}, this is a reminder about the upcoming event titled ${eventTitle} scheduled to start at ${TimeService.getTimeByZoneFromUtcTime(
            eventStartTime,
            'Africa/Tunis',
          )}. Don't forget to mark your calendar!`,
        });

      if (
        user.notificationSettings?.ntfyNotificationsEnabled &&
        user.ntfyIntegration?.topic
      )
        this.ntfyService.sendNtfyMessage(user.ntfyIntegration.topic, {
          title: `Reminder: Upcoming Event - ${eventTitle}`,
          message: `Hello ${user.name}, this is a reminder about the upcoming event titled ${eventTitle} scheduled to start at ${TimeService.getTimeByZoneFromUtcTime(
            eventStartTime,
            'Africa/Tunis',
          )}. Don't forget to mark your calendar!`,
          priority: 'default',
        });
    }
  }
}
