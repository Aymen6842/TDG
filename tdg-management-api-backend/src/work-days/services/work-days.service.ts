import { Injectable } from '@nestjs/common';

import { Prisma } from '@prisma/client';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

import { UpdateWorkDayRepository } from '../repositories/update-work-day.repository';
import { CreateWorkDayRepository } from '../repositories/create-work-day.repository';
import { CreateWorkDayDto } from '../dto/request/post/create-work-day.dto';
import { CustomRequest } from 'src/common/types/request.type';
import { TimeService } from 'src/common/time/service/time.service';
import { FilterWorkSessionsRepository } from '../repositories/filter-work-day.repository';
import { UpdateWorkDayByManagerDto } from '../dto/request/update/update-work-day-by-manager.dto';
import { UpdateWorkDayByWorkerDto } from '../dto/request/update/update-work-day-by-worker.dto';
import { FilterWrokDaysParametersDto } from '../dto/request/fetch/filter-work-days-parameters.dto';
import { PaginationParametersRequestDto } from '../dto/request/fetch/pagination-parameters.dto';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { PermissionsService } from 'src/auths/services/permissions/permissions.service';
import { MailService } from 'src/common/mail/service/mail.service';
import { UsersService } from 'src/users/services/users.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { FilterWorkDaysStatisticsParametersDto } from '../dto/request/fetch/filter-work-days-statistics-parameters.dto';
import { TelegramService } from 'src/common/telegram/service/telegram.service';
import { NtfyService } from 'src/common/ntfy/service/ntfy.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class WorkDaysService {
  constructor(
    private readonly createWorkDayRepository: CreateWorkDayRepository,
    private readonly filterWorkSessionsRepository: FilterWorkSessionsRepository,
    private readonly updateWorkDayRepository: UpdateWorkDayRepository,
    private readonly telegramService: TelegramService,
    private readonly mailService: MailService,
    private readonly ntfyService: NtfyService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async createWorkSession(req: CustomRequest, data: CreateWorkDayDto) {
    data.startTime = TimeService.getCurrentTime();
    data.userId = req.user?.id as string;

    const workDay = await this.getOrCreateWorkDayForUser(
      req.user?.id as string,
      data,
    );

    // Creating the work session
    if (workDay?.workSessions?.find((ws) => !ws.endTime))
      throw new BadRequestCustomException(
        'There is already an open work session for today!',
        ErrorCode.WORK_SESSION_ALREADY_OPEN,
      );
    const workSession =
      await this.createWorkDayRepository.createWorkSessionForWorkDay(
        workDay.id,
        TimeService.getCurrentTime(),
        data.location,
        data.device,
      );

    // Retrieving the user to send notification and email if needed
    const user = await this.usersService.getUserWithNotificationsSettingsById(
      req.user?.id as string,
    );

    // Checking if the user is already notified for late start time
    const hasLateStartTimeNotificationInMorning = workDay.workSessions.some(
      (ws) =>
        TimeService.isAfterMorningMaxLateTime(ws.startTime) &&
        TimeService.isBeforeEndMorningTime(ws.startTime),
    );
    const hasLateStartTimeNotificationInAfternoon = workDay.workSessions.some(
      (ws) =>
        TimeService.isAfterAfternoonMaxLateTime(ws.startTime) &&
        TimeService.isBeforeEndAfternoonTime(ws.startTime),
    );

    // Adding the new work session to the work day
    workDay.workSessions.push(workSession);

    // Sending email and notification if the work session is started late
    if (
      user &&
      ((TimeService.isAfterAfternoonMaxLateTime(workSession.startTime) &&
        !hasLateStartTimeNotificationInAfternoon) ||
        (TimeService.isAfterMorningMaxLateTime(workSession.startTime) &&
          !hasLateStartTimeNotificationInMorning))
    ) {
      if (user?.notificationSettings?.emailNotificationsEnabled)
        this.mailService.sendHtmlEmail({
          to: [user.email],
          subject: `Late Work Session – Time Compliance Reminder`,
          toName: user.name,
          paragraphs: [
            `We noticed that your work session was started later than the allowed time.<br/>Please note that the maximum allowed start time is 08:45 in the morning and 13:30 in the afternoon.<br/> Being punctual helps ensure smooth team coordination and productivity.<br/>Kindly ensure timely start of your work sessions going forward.`,
            `Thank you for your understanding.`,
          ],
        });

      if (
        user?.notificationSettings?.telegramNotificationsEnabled &&
        user?.telegramBot?.chatId
      )
        this.telegramService.sendTelegramMessage(
          user.telegramBot.chatId,
          `Dear ${user.name},\n\nWe noticed that your work session was started later than the allowed time.\nPlease note that the maximum allowed start time is 08:45 in the morning and 13:30 in the afternoon.\nBeing punctual helps ensure smooth team coordination and productivity.\nKindly ensure timely start of your work sessions going forward.\n\nThank you for your understanding.\nTawer Digital Group Team`,
        );

      if (
        user?.notificationSettings?.ntfyNotificationsEnabled &&
        user?.ntfyIntegration?.topic
      )
        this.ntfyService.sendNtfyMessage(user?.ntfyIntegration?.topic, {
          title: 'Late Work Session – Time Compliance Reminder',
          message: `Dear ${user.name}, We noticed that your work session was started later than the allowed time. Please note that the maximum allowed start time is 08:45 in the morning and 13:30 in the afternoon. Being punctual helps ensure smooth team coordination and productivity. Kindly ensure timely start of your work sessions going forward. Thank you for your understanding. Tawer Digital Group Team`,
        });

      if (user?.notificationSettings?.pushNotificationsEnabled)
        this.notificationsService.createNotificationFromSystem(user.id, {
          title: 'Late Work Session – Time Compliance Reminder',
          body: `Dear ${user.name}, We noticed that your work session was started later than the allowed time. Please note that the maximum allowed start time is 08:45 in the morning and 13:30 in the afternoon. Being punctual helps ensure smooth team coordination and productivity. Kindly ensure timely start of your work sessions going forward. Thank you for your understanding. Tawer Digital Group Team`,
        });
    }

    return workDay;
  }

  async getCurrentWorkDayForUser(req: CustomRequest) {
    const workDay =
      await this.filterWorkSessionsRepository.getCurrentWorkDayByUserIdForUser(
        req.user?.id as string,
      );
    if (!workDay)
      throw new NotFoundCustomException(
        'Work day not found for today!',
        ErrorCode.WORK_DAY_NOT_FOUND,
      );

    return workDay;
  }

  async updateWorkDayByManager(
    req: CustomRequest,
    workDayId: string,
    data: UpdateWorkDayByManagerDto,
  ) {
    try {
      const workDay = await this.filterWorkSessionsRepository.getWorkDayById(
        req?.user?.id as string,
      );
      const permission = await this.permissionsService.canUserManageUsers(
        req.user?.id as string,
        [workDay?.user?.id],
      );
      if (!permission) throw new ForbiddenCustomException();

      return await this.updateWorkDayRepository.updateWorkDayByManager(
        workDayId,
        data,
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'Work session not found!',
          ErrorCode.WORK_SESSION_NOT_FOUND,
        );

      throw error;
    }
  }

  async updateWorkSessionByWorker(
    req: CustomRequest,
    workSessionId: string,
    data: UpdateWorkDayByWorkerDto,
  ) {
    try {
      return await this.updateWorkDayRepository.updateWorkDayByWorker(
        workSessionId,
        { ...data, endTime: undefined, timeSpentInMinutes: undefined },
      );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'Work session not found!',
          ErrorCode.WORK_SESSION_NOT_FOUND,
        );

      throw error;
    }
  }

  async closeWorkSession(req: CustomRequest, workDayId: string) {
    try {
      const workSessionToBeClosed =
        await this.filterWorkSessionsRepository.getLastWorkSessionForWorkerByWorkerDayId(
          workDayId,
          req.user?.id as string,
        );

      if (!workSessionToBeClosed.endTime)
        await this.updateWorkDayRepository.closeWorkSessionByWorkDayId(
          workSessionToBeClosed.id,
          TimeService.getCurrentTime(),
          TimeService.calculateTimeDifferenceInMinutes(
            workSessionToBeClosed.startTime,
            TimeService.getCurrentTime(),
          ),
        );
    } catch (error: unknown) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      )
        throw new NotFoundCustomException(
          'Work session not found!',
          ErrorCode.WORK_SESSION_NOT_FOUND,
        );

      throw error;
    }
  }

  async filterWorkDaysForUser(
    req: CustomRequest,
    query: FilterWrokDaysParametersDto,
  ) {
    const { page, limit } = this.retrievePaginationParameters(query);

    const countedWorkDays =
      await this.filterWorkSessionsRepository.countFilteredWorkDaysForUser(
        req.user?.id as string,
        query,
      );
    const skip = (page - 1) * limit;
    const workDays =
      await this.filterWorkSessionsRepository.filterWorkDaysForUser(
        req.user?.id as string,
        query,
        skip,
        limit,
      );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedWorkDays,
      page,
      limit,
    );

    return { data: workDays, pagination: paginationParameters };
  }

  async filterWorkDaysForManager(
    req: CustomRequest,
    query: FilterWrokDaysParametersDto,
  ) {
    const { page, limit } = this.retrievePaginationParameters(query);

    const countedWorkDays =
      await this.filterWorkSessionsRepository.countFilteredWorkDaysForManager(
        query,
      );
    const skip = (page - 1) * limit;
    const workDays =
      await this.filterWorkSessionsRepository.filterWorkDaysForManager(
        query,
        skip,
        limit,
      );

    const paginationParameters = this.setPaginationParametersInResponse(
      countedWorkDays,
      page,
      limit,
    );

    return { data: workDays, pagination: paginationParameters };
  }

  async filterWorkDaysStatisticsOverviewBetweenDatesForManager(
    req: CustomRequest,
    query: FilterWorkDaysStatisticsParametersDto,
  ) {
    if (query.usersIds && query.usersIds.length > 0) {
      const permission = await this.permissionsService.canUserManageUsers(
        req.user?.id as string,
        query.usersIds,
      );
      if (!permission) throw new ForbiddenCustomException();
    }
    if (query.teamIds && query.teamIds.length > 0) {
      const permission = await this.permissionsService.canUserManageTeams(
        req.user?.id as string,
        query.teamIds,
      );
      if (!permission) throw new ForbiddenCustomException();
    }

    const workDaysOverview =
      await this.filterWorkSessionsRepository.filterWorkDaysStatisticsOverviewBetweenDates(
        query,
      );
    const workSessionsOverview =
      await this.filterWorkSessionsRepository.filterWorkSessionsStatisticsOverviewBetweenDates(
        query,
      );

    return {
      avgDailyMood: workDaysOverview?._avg?.dailyMood?.toFixed(2) ?? '0.00',
      avgPerformanceRating:
        workDaysOverview?._avg?.performanceRating?.toFixed(2) ?? '0.00',
      totalWorkSessions: workSessionsOverview?._count?.id ?? 0,
      totalTimeSpentInMinutes:
        workSessionsOverview?._sum?.timeSpentInMinutes ?? 0,
      avgTimeSpentInMinutes:
        workSessionsOverview?._avg?.timeSpentInMinutes?.toFixed(2) ?? '0.00',
      earliestStartTime: workSessionsOverview?._min?.startTime ?? null,
      latestEndTime: workSessionsOverview?._max?.endTime ?? null,
    };
  }

  async filterWorkDaysStatisticsOverviewBetweenDatesForUser(
    req: CustomRequest,
    query: FilterWorkDaysStatisticsParametersDto,
  ) {
    const workDaysOverview =
      await this.filterWorkSessionsRepository.filterWorkDaysStatisticsOverviewBetweenDates(
        { ...query, usersIds: [req.user?.id as string], teamIds: undefined },
      );
    const workSessionsOverview =
      await this.filterWorkSessionsRepository.filterWorkSessionsStatisticsOverviewBetweenDates(
        { ...query, usersIds: [req.user?.id as string], teamIds: undefined },
      );

    return {
      avgDailyMood: workDaysOverview?._avg?.dailyMood?.toFixed(2) ?? '0.00',
      totalWorkSessions: workSessionsOverview?._count?.id ?? 0,
      totalTimeSpentInMinutes:
        workSessionsOverview?._sum?.timeSpentInMinutes ?? 0,
      avgTimeSpentInMinutes:
        workSessionsOverview?._avg?.timeSpentInMinutes?.toFixed(2) ?? '0.00',
      earliestStartTime: workSessionsOverview?._min?.startTime ?? null,
      latestEndTime: workSessionsOverview?._max?.endTime ?? null,
    };
  }

  async filterWorkDaysStatisticsDetailsBetweenDatesForUser(
    req: CustomRequest,
    query: FilterWorkDaysStatisticsParametersDto,
  ) {
    return await this.filterWorkSessionsRepository.filterWorkDaysStatisticsDetailsBetweenDates(
      { ...query, usersIds: [req.user?.id as string], teamIds: undefined },
    );
  }

  async filterWorkDaysStatisticsDetailsBetweenDatesForManager(
    req: CustomRequest,
    query: FilterWorkDaysStatisticsParametersDto,
  ) {
    if (query.usersIds && query.usersIds.length > 0) {
      const permission = await this.permissionsService.canUserManageUsers(
        req.user?.id as string,
        query.usersIds,
      );
      if (!permission) throw new ForbiddenCustomException();
    }
    if (query.teamIds && query.teamIds.length > 0) {
      const permission = await this.permissionsService.canUserManageTeams(
        req.user?.id as string,
        query.teamIds,
      );
      if (!permission) throw new ForbiddenCustomException();
    }

    return await this.filterWorkSessionsRepository.filterWorkDaysStatisticsDetailsBetweenDates(
      { ...query, usersIds: [req.user?.id as string], teamIds: undefined },
    );
  }

  async getOrCreateWorkDayForUser(userId: string, data: CreateWorkDayDto) {
    let currentWorkDay =
      await this.filterWorkSessionsRepository.getCurrentWorkDayByUserIdForUser(
        userId,
      );
    if (!currentWorkDay)
      currentWorkDay = await this.createWorkDayRepository.createWorkDay(data);

    return currentWorkDay;
  }

  retrievePaginationParameters(query: PaginationParametersRequestDto): {
    page: number;
    limit: number;
  } {
    const page =
      isNaN(Number(query.page)) || Number(query.page) < 1
        ? 1
        : Number(query.page);
    const limit =
      isNaN(Number(query.limit)) || Number(query.limit) > 500
        ? 500
        : Number(query.limit);

    return { page, limit };
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async closeOpenWorkSessions() {
    const openWorkSessions =
      await this.filterWorkSessionsRepository.getOpenWorkSessions();

    for (const workSession of openWorkSessions) {
      await this.updateWorkDayRepository.closeWorkSessionByWorkDayId(
        workSession.id,
        TimeService.getEndTimeOfShiftFromStartTime(workSession.startTime),
        TimeService.calculateTimeDifferenceInMinutes(
          workSession.startTime,
          TimeService.getEndTimeOfShiftFromStartTime(workSession.startTime), // in this case we make the session end at the time of the end of company working hours to avoid penalizing the user for the time after working hours, but it can be changed to the actual current time if needed
        ),
      );

      if (
        workSession?.workDay?.user?.notificationSettings
          ?.emailNotificationsEnabled
      )
        this.mailService.sendHtmlEmail({
          to: [workSession.workDay.user.email],
          subject: `Open Work Session Closed – Time Compliance Reminder`,
          toName: workSession.workDay.user.name,
          paragraphs: [
            `We noticed that you had an open work session that was not closed.<br/>We have automatically closed it for you at the end of the working hours.<br/>Please make sure to close your work sessions on time to ensure accurate tracking of your working hours.<br/>If you forgot to close your work session, please make sure to do it on time in the future to avoid any inconvenience.<br/>Thank you for your understanding.`,
          ],
        });

      if (
        workSession?.workDay?.user?.notificationSettings
          ?.telegramNotificationsEnabled &&
        workSession?.workDay?.user?.telegramBot?.chatId
      )
        this.telegramService.sendTelegramMessage(
          workSession.workDay.user.telegramBot.chatId,
          `Dear ${workSession.workDay.user.name},\n\nWe noticed that you had an open work session that was not closed.\nWe have automatically closed it for you at the end of the working hours.\nPlease make sure to close your work sessions on time to ensure accurate tracking of your working hours.\nIf you forgot to close your work session, please make sure to do it on time in the future to avoid any inconvenience.\nThank you for your understanding.\nTawer Digital Group Team`,
        );

      if (
        workSession?.workDay?.user?.notificationSettings
          ?.ntfyNotificationsEnabled &&
        workSession?.workDay?.user?.ntfyIntegration?.topic
      )
        this.ntfyService.sendNtfyMessage(
          workSession.workDay.user.ntfyIntegration.topic,
          {
            title: 'Open Work Session Closed – Time Compliance Reminder',
            message: `Dear ${workSession.workDay.user.name}, We noticed that you had an open work session that was not closed. We have automatically closed it for you at the end of the working hours. Please make sure to close your work sessions on time to ensure accurate tracking of your working hours. If you forgot to close your work session, please make sure to do it on time in the future to avoid any inconvenience. Thank you for your understanding. Tawer Digital Group Team`,
          },
        );

      if (
        workSession?.workDay?.user?.notificationSettings
          ?.pushNotificationsEnabled
      )
        this.notificationsService.createNotificationFromSystem(
          workSession.workDay.user.id,
          {
            title: 'Open Work Session Closed – Time Compliance Reminder',
            body: `Dear ${workSession.workDay.user.name}, We noticed that you had an open work session that was not closed. We have automatically closed it for you at the end of the working hours. Please make sure to close your work sessions on time to ensure accurate tracking of your working hours. If you forgot to close your work session, please make sure to do it on time in the future to avoid any inconvenience. Thank you for your understanding. Tawer Digital Group Team`,
          },
        );
    }
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
