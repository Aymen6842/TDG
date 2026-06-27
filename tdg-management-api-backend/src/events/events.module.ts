import { Module } from '@nestjs/common';
import { EventsService } from './services/events.service';
import { EventsController } from './controllers/events.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CreateEventRepository } from './repositories/create.repository';
import { UpdateEventRepository } from './repositories/update.repository';
import { DeleteEventRepository } from './repositories/delete.repository';
import { FetchEventRepository } from './repositories/fetch.repository';
import { UsersModule } from 'src/users/users.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { MailModule } from 'src/common/mail/mail.module';
import { TelegramModule } from 'src/common/telegram/telegram.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { AuthsModule } from 'src/auths/auths.module';
import { LockManagementModule } from 'src/lock-management/lock-management.module';
import { NtfyModule } from 'src/common/ntfy/ntfy.module';

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    CreateEventRepository,
    DeleteEventRepository,
    UpdateEventRepository,
    FetchEventRepository,
  ],
  imports: [
    PrismaModule,
    UsersModule,
    TokensModule,
    LoggerModule,
    MailModule,
    NtfyModule,
    TelegramModule,
    NotificationsModule,
    AuthsModule,
    LockManagementModule,
  ],
  exports: [EventsService],
})
export class EventsModule {}
