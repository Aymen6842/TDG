import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TelegramModule } from 'src/common/telegram/telegram.module';
import { MailModule } from 'src/common/mail/mail.module';
import { NtfyModule } from 'src/common/ntfy/ntfy.module';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { LockManagementModule } from 'src/lock-management/lock-management.module';
import { LoggerModule } from 'src/common/logger/logger.module';

import { CreateReminderRepository } from './repositories/create-reminder.repository';
import { FetchReminderRepository } from './repositories/fetch-reminder.repository';
import { UpdateReminderRepository } from './repositories/update-reminder.repository';
import { DeleteReminderRepository } from './repositories/delete-reminder.repository';

import { RemindersService } from './services/reminders.service';
import { ReminderSchedulerService } from './services/reminder-scheduler.service';
import { AutoReminderService } from './services/auto-reminder.service';
import { RemindersController } from './controller/reminders.controller';
import { UserRemindersController } from './controller/user-reminders.controller';

@Module({
  imports: [
    PrismaModule,
    NotificationsModule,
    TelegramModule,
    MailModule,
    NtfyModule,
    AuthsModule,
    TokensModule,
    LockManagementModule,
    LoggerModule,
  ],
  controllers: [RemindersController, UserRemindersController],
  providers: [
    CreateReminderRepository,
    FetchReminderRepository,
    UpdateReminderRepository,
    DeleteReminderRepository,
    RemindersService,
    ReminderSchedulerService,
    AutoReminderService,
  ],
  exports: [RemindersService, AutoReminderService],
})
export class RemindersModule {}
