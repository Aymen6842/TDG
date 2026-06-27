import { Injectable, Logger } from '@nestjs/common';
import { CreateReminderRepository } from '../repositories/create-reminder.repository';
import { ChannelType, ReminderEntityType } from '@prisma/client';
import { MailService } from 'src/common/mail/service/mail.service';
import { TelegramService } from 'src/common/telegram/service/telegram.service';
import { NtfyService } from 'src/common/ntfy/service/ntfy.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class AutoReminderService {
  private readonly logger = new Logger(AutoReminderService.name);

  constructor(
    private readonly createReminderRepository: CreateReminderRepository,
    private readonly mailService: MailService,
    private readonly telegramService: TelegramService,
    private readonly ntfyService: NtfyService,
    private readonly notificationsService: NotificationsService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Process a reminder that is ready to send
   * Accepts the full reminder data to avoid N+1 re-fetch
   */
  async sendReminder(reminder: {
    id: string;
    user: { id: string; email: string | null } | null;
    message: string | null;
    entityType: string | null;
    entityId: string | null;
    channels: { id: string; channel: string }[];
  }) {
    const { id, user, message, entityType, entityId, channels } = reminder;

    if (!user || !message) {
      this.logger.warn(`Reminder ${id} missing required data`);
      return;
    }

    for (const channel of channels) {
      try {
        await this.sendToChannel({
          userId: user.id,
          email: user.email,
          message,
          entityType,
          entityId,
          channel: channel.channel,
        });
      } catch (error) {
        this.logger.error(
          `Failed to send reminder ${id} via ${channel.channel}: `,
          error,
        );
      }
    }

    this.logger.log(`Reminder ${id} processed successfully`);
  }

  /**
   * Create default reminders for a new Sprint
   */
  async createDefaultRemindersForSprint(query: {
    sprintId: string;
    projectId: string;
    userId: string;
    sprintName: string;
    startDate: Date;
    endDate: Date;
  }) {
    const { sprintId, projectId, userId, sprintName, startDate, endDate } =
      query;

    // Remind 1 day before sprint starts
    const startReminderDate = new Date(startDate);
    startReminderDate.setDate(startReminderDate.getDate() - 1);

    if (startReminderDate > new Date()) {
      await this.createReminderRepository.createReminder({
        userId,
        entityType: ReminderEntityType.SPRINT,
        entityId: sprintId,
        projectId,
        message: `Sprint "${sprintName}" starts tomorrow`,
        reminderAt: startReminderDate,
        createdById: userId,
        channels: [ChannelType.PUSH],
      });

      this.logger.log(`Created start reminder for sprint ${sprintId}`);
    }

    // Remind 2 days before sprint ends
    const endReminderDate = new Date(endDate);
    endReminderDate.setDate(endReminderDate.getDate() - 2);

    if (endReminderDate > new Date()) {
      await this.createReminderRepository.createReminder({
        userId,
        entityType: ReminderEntityType.SPRINT,
        entityId: sprintId,
        projectId,
        message: `Sprint "${sprintName}" ends in 2 days`,
        reminderAt: endReminderDate,
        createdById: userId,
        channels: [ChannelType.PUSH],
      });

      this.logger.log(`Created end reminder for sprint ${sprintId}`);
    }
  }

  /**
   * Create default reminders for a new Task
   */
  async createDefaultRemindersForTask(query: {
    taskId: string;
    projectId: string;
    userId: string;
    taskTitle: string;
    dueDate?: Date;
  }) {
    const { taskId, projectId, userId, taskTitle, dueDate } = query;

    // If task has a due date, create reminder for 1 day before
    if (dueDate) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      // Only create if reminder date is in the future
      if (reminderDate > new Date()) {
        await this.createReminderRepository.createReminder({
          userId,
          entityType: ReminderEntityType.TASK,
          entityId: taskId,
          projectId,
          message: `Task "${taskTitle}" is due tomorrow`,
          reminderAt: reminderDate,
          createdById: userId,
          channels: [ChannelType.PUSH],
        });

        this.logger.log(`Created due-date reminder for task ${taskId}`);
      }
    }
  }

  /**
   * Create default reminders for a new Milestone
   */
  async createDefaultRemindersForMilestone(query: {
    milestoneId: string;
    projectId: string;
    userId: string;
    milestoneName: string;
    dueDate?: Date;
  }) {
    const { milestoneId, projectId, userId, milestoneName, dueDate } = query;

    // Default: Remind 3 days before milestone due date
    if (dueDate) {
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 3);

      // Only create if reminder date is in the future
      if (reminderDate > new Date()) {
        await this.createReminderRepository.createReminder({
          userId,
          entityType: ReminderEntityType.MILESTONE,
          entityId: milestoneId,
          projectId,
          message: `Milestone "${milestoneName}" is due in 3 days`,
          reminderAt: reminderDate,
          createdById: userId,
          channels: [ChannelType.PUSH],
        });

        this.logger.log(`Created 3-day reminder for milestone ${milestoneId}`);
      }

      // Also remind 7 days before milestone due date
      const weekReminderDate = new Date(dueDate);
      weekReminderDate.setDate(weekReminderDate.getDate() - 7);

      if (weekReminderDate > new Date()) {
        await this.createReminderRepository.createReminder({
          userId,
          entityType: ReminderEntityType.MILESTONE,
          entityId: milestoneId,
          projectId,
          message: `Milestone "${milestoneName}" is due in 1 week`,
          reminderAt: weekReminderDate,
          createdById: userId,
          channels: [ChannelType.PUSH],
        });

        this.logger.log(`Created 1-week reminder for milestone ${milestoneId}`);
      }
    }
  }

  /**
   * Cron: Find overdue tasks and create reminders
   * Tasks where dueDate < now && status != DONE && status != BACKLOG
   */
  async createRemindersForOverdueTasks() {
    const now = new Date();

    const overdueTasks = await this.prismaService.task.findMany({
      where: {
        dueDate: { lt: now },
        status: { notIn: ['DONE', 'BACKLOG'] },
        assigneeId: { not: null },
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        assigneeId: true,
      },
    });

    this.logger.log(`Found ${overdueTasks.length} overdue tasks`);

    for (const task of overdueTasks) {
      // Skip if an active overdue reminder already exists
      const existing = await this.prismaService.reminder.findFirst({
        where: {
          entityType: 'TASK',
          entityId: task.id,
          message: { contains: 'overdue' },
          status: { in: ['PENDING', 'SENT'] },
        },
      });
      if (existing) continue;

      await this.createReminderRepository.createReminder({
        userId: task.assigneeId!,
        entityType: ReminderEntityType.TASK,
        entityId: task.id,
        projectId: task.projectId,
        message: `Task "${task.title}" is overdue`,
        reminderAt: now,
        createdById: task.assigneeId!,
        channels: [ChannelType.PUSH],
      });

      this.logger.log(`Created overdue reminder for task ${task.id}`);
    }
  }

  /**
   * Cron: Find tasks stuck in same status >5 days
   * Uses updatedAt as proxy for last status change
   */
  async createRemindersForStuckTasks() {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const stuckTasks = await this.prismaService.task.findMany({
      where: {
        updatedAt: { lt: fiveDaysAgo },
        status: { notIn: ['DONE', 'BACKLOG'] },
        assigneeId: { not: null },
      },
      select: {
        id: true,
        title: true,
        projectId: true,
        assigneeId: true,
        status: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Found ${stuckTasks.length} stuck tasks`);

    for (const task of stuckTasks) {
      // Skip if an active stuck reminder already exists
      const existing = await this.prismaService.reminder.findFirst({
        where: {
          entityType: 'TASK',
          entityId: task.id,
          message: { contains: 'stuck' },
          status: { in: ['PENDING', 'SENT'] },
        },
      });
      if (existing) continue;

      const daysSinceUpdate = Math.floor(
        (Date.now() - task.updatedAt.getTime()) / (1000 * 60 * 60 * 24),
      );

      await this.createReminderRepository.createReminder({
        userId: task.assigneeId!,
        entityType: ReminderEntityType.TASK,
        entityId: task.id,
        projectId: task.projectId,
        message: `Task "${task.title}" has been stuck in ${task.status} for ${daysSinceUpdate} days`,
        reminderAt: new Date(),
        createdById: task.assigneeId!,
        channels: [ChannelType.PUSH],
      });

      this.logger.log(`Created stuck reminder for task ${task.id}`);
    }
  }

  /**
   * Dispatch to the appropriate channel using real notification services
   * Follows EventsService.sendNotificationsEvents() pattern
   */
  private async sendToChannel(params: {
    userId: string;
    email: string | null;
    message: string;
    entityType: string | null;
    entityId: string | null;
    channel: string;
  }): Promise<void> {
    const { userId, email, message, entityType, channel } = params;
    const subject = `Reminder: ${entityType || 'Notification'}`;

    // Fetch user notification settings + integrations to respect preferences
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        notificationSettings: {
          select: {
            emailNotificationsEnabled: true,
            pushNotificationsEnabled: true,
            telegramNotificationsEnabled: true,
            ntfyNotificationsEnabled: true,
          },
        },
        telegramBot: { select: { chatId: true } },
        ntfyIntegration: { select: { topic: true } },
      },
    });

    if (!user) {
      this.logger.warn(`User ${userId} not found, skipping channel ${channel}`);
      return;
    }

    const userName = user.name ?? 'TDG Collaborator';

    switch (channel) {
      case 'EMAIL':
        if (user.notificationSettings?.emailNotificationsEnabled && email) {
          this.mailService.sendHtmlEmail({
            to: [email],
            subject,
            toName: userName,
            paragraphs: [message],
          });
        }
        break;

      case 'PUSH':
        if (user.notificationSettings?.pushNotificationsEnabled) {
          this.notificationsService.createNotificationFromSystem(userId, {
            title: subject,
            body: message,
          });
        }
        break;

      case 'IN_APP':
        // IN_APP always creates a DB notification regardless of push setting
        this.notificationsService.createNotificationFromSystem(userId, {
          title: subject,
          body: message,
        });
        break;

      case 'TELEGRAM':
        if (
          user.notificationSettings?.telegramNotificationsEnabled &&
          user.telegramBot?.chatId
        ) {
          this.telegramService.sendTelegramMessage(
            user.telegramBot.chatId,
            `${subject}\n${message}`,
          );
        }
        break;

      case 'NTFY':
        if (
          user.notificationSettings?.ntfyNotificationsEnabled &&
          user.ntfyIntegration?.topic
        ) {
          this.ntfyService.sendNtfyMessage(user.ntfyIntegration.topic, {
            title: subject,
            message,
            priority: 'default',
          });
        }
        break;

      default:
        this.logger.warn(`Unknown channel: ${channel}`);
    }
  }
}
