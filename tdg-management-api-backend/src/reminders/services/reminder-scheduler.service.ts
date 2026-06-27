import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FetchReminderRepository } from '../repositories/fetch-reminder.repository';
import { UpdateReminderRepository } from '../repositories/update-reminder.repository';
import { AutoReminderService } from './auto-reminder.service';
import { LockManagementService } from 'src/lock-management/services/lock-management.service';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

@Injectable()
export class ReminderSchedulerService implements OnModuleInit {
  private readonly logger = new Logger(ReminderSchedulerService.name);
  private readonly handlePendingRemindersLock = 'handlePendingRemindersLock';
  private readonly handleRecurringRemindersLock =
    'handleRecurringRemindersLock';
  private readonly handleOverdueTasksLock = 'handleOverdueTasksLock';
  private readonly handleStuckTasksLock = 'handleStuckTasksLock';
  private readonly lockTTL = 55; // 55 seconds

  constructor(
    private readonly fetchReminderRepository: FetchReminderRepository,
    private readonly updateReminderRepository: UpdateReminderRepository,
    private readonly autoReminderService: AutoReminderService,
    private readonly lockManagementService: LockManagementService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  onModuleInit() {
    this.lockManagementService.createOrUpdateLock(
      this.handlePendingRemindersLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.handleRecurringRemindersLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.handleOverdueTasksLock,
      'Unlocked',
      0,
    );
    this.lockManagementService.createOrUpdateLock(
      this.handleStuckTasksLock,
      'Unlocked',
      0,
    );
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handlePendingReminders(): Promise<void> {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.handlePendingRemindersLock,
        'locked',
        this.lockTTL,
      );
      if (!isLockAcquired) return;

      this.logger.log('Checking for pending reminders...');

      const pendingReminders = await this.fetchReminderRepository.findPending({
        now: new Date(),
      });

      this.logger.log(`Found ${pendingReminders.length} pending reminders`);

      for (const reminder of pendingReminders) {
        try {
          await this.autoReminderService.sendReminder(reminder);

          await this.updateReminderRepository.markAsSent({
            reminderId: reminder.id,
          });

          this.logger.log(`Reminder ${reminder.id} sent successfully`);
        } catch (error) {
          this.logger.error(`Failed to send reminder ${reminder.id}:`, error);
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error processing pending reminders: ' + (error as Error).message,
        {
          service: 'Reminder Scheduler Service',
          method: 'handlePendingReminders',
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleRecurringReminders(): Promise<void> {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.handleRecurringRemindersLock,
        'locked',
        this.lockTTL,
      );
      if (!isLockAcquired) return;

      this.logger.log('Processing recurring reminders...');

      const recurringReminders =
        await this.fetchReminderRepository.findRecurring();

      for (const reminder of recurringReminders) {
        try {
          const nextOccurrence = this.calculateNextOccurrence(
            reminder.recurrenceRule,
            reminder.reminderAt,
          );

          if (nextOccurrence <= new Date()) {
            await this.autoReminderService.sendReminder(reminder);

            await this.updateReminderRepository.update({
              reminderId: reminder.id,
              projectId: reminder.projectId,
              dto: {
                reminderAt: nextOccurrence,
              },
            });

            this.logger.log(`Recurring reminder ${reminder.id} processed`);
          }
        } catch (error) {
          this.logger.error(
            `Failed to process recurring reminder ${reminder.id}:`,
            error,
          );
        }
      }
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error processing recurring reminders: ' + (error as Error).message,
        {
          service: 'Reminder Scheduler Service',
          method: 'handleRecurringReminders',
        },
      );
    }
  }

  private calculateNextOccurrence(
    rule: string | null,
    lastReminderAt: Date,
  ): Date {
    if (!rule) {
      const date = new Date(lastReminderAt);
      date.setMonth(date.getMonth() + 1);
      return date;
    }

    const date = new Date(lastReminderAt);

    if (rule.startsWith('0 9 * * *')) {
      date.setDate(date.getDate() + 1);
      date.setHours(9, 0, 0, 0);
    } else if (rule.startsWith('0 9 * * 1')) {
      const nextMonday = new Date(date);
      nextMonday.setDate(date.getDate() + ((1 + 7 - date.getDay()) % 7 || 7));
      nextMonday.setHours(9, 0, 0, 0);
      return nextMonday;
    } else if (rule.startsWith('0 9 1 * *')) {
      date.setMonth(date.getMonth() + 1);
      date.setHours(9, 0, 0, 0);
    } else {
      date.setDate(date.getDate() + 1);
    }

    return date;
  }

  /**
   * Check for overdue tasks every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueTasks(): Promise<void> {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.handleOverdueTasksLock,
        'locked',
        this.lockTTL,
      );
      if (!isLockAcquired) return;

      this.logger.log('Checking for overdue tasks...');
      await this.autoReminderService.createRemindersForOverdueTasks();
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error checking overdue tasks: ' + (error as Error).message,
        {
          service: 'Reminder Scheduler Service',
          method: 'handleOverdueTasks',
        },
      );
    }
  }

  /**
   * Check for stuck tasks every 6 hours
   */
  @Cron('0 */6 * * *')
  async handleStuckTasks(): Promise<void> {
    try {
      const isLockAcquired = await this.lockManagementService.lock(
        this.handleStuckTasksLock,
        'locked',
        this.lockTTL,
      );
      if (!isLockAcquired) return;

      this.logger.log('Checking for stuck tasks...');
      await this.autoReminderService.createRemindersForStuckTasks();
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        'Error checking stuck tasks: ' + (error as Error).message,
        {
          service: 'Reminder Scheduler Service',
          method: 'handleStuckTasks',
        },
      );
    }
  }
}
