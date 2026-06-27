import { Module } from '@nestjs/common';
import { PersonalTasksService } from './services/personal-tasks.service';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { PersonalTasksController } from './controllers/personal-tasks.controller';
import { CreatePersonalTasksRepository } from './repositories/create-personal-tasks.repository';
import { UpdatePersonalTasksRepository } from './repositories/update-personal-tasks.repository';
import { DeletePersonalTasksRepository } from './repositories/delete-personal-tasks.repository';
import { FetchPersonalTasksRepository } from './repositories/fetch-personal-tasks.repository';
import { LoggerModule } from 'src/common/logger/logger.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { MailModule } from 'src/common/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { TelegramModule } from 'src/common/telegram/telegram.module';
import { LockManagementModule } from 'src/lock-management/lock-management.module';
import { NtfyModule } from 'src/common/ntfy/ntfy.module';

@Module({
  imports: [
    PrismaModule,
    AuthsModule,
    TokensModule,
    LoggerModule,
    LockManagementModule,
    NotificationsModule,
    NtfyModule,
    UploadModule,
    MailModule,
    TelegramModule,
  ],
  controllers: [PersonalTasksController],
  providers: [
    PersonalTasksService,
    CreatePersonalTasksRepository,
    UpdatePersonalTasksRepository,
    DeletePersonalTasksRepository,
    FetchPersonalTasksRepository,
  ],
  exports: [PersonalTasksService],
})
export class PersonalTasksModule {}
