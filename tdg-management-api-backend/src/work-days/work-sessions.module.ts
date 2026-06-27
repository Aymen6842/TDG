import { Module } from '@nestjs/common';
import { WorkDaysController } from './controllers/work-days.controller';

import { FilterWorkSessionsRepository } from './repositories/filter-work-day.repository';
import { AuthsModule } from 'src/auths/auths.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { CreateWorkDayRepository } from './repositories/create-work-day.repository';
import { UpdateWorkDayRepository } from './repositories/update-work-day.repository';
import { WorkDaysService } from './services/work-days.service';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MailModule } from 'src/common/mail/mail.module';
import { TelegramModule } from 'src/common/telegram/telegram.module';
import { NtfyModule } from 'src/common/ntfy/ntfy.module';

@Module({
  controllers: [WorkDaysController],
  providers: [
    WorkDaysService,
    CreateWorkDayRepository,
    UpdateWorkDayRepository,
    FilterWorkSessionsRepository,
  ],
  imports: [
    AuthsModule,
    PrismaModule,
    NtfyModule,
    TokensModule,
    UsersModule,
    TelegramModule,
    NotificationsModule,
    MailModule,
  ],
})
export class WorkDaysModule {}
