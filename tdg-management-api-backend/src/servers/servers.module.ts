import { Module } from '@nestjs/common';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { FetchServerRepository } from './repositories/fetch-server.repository';
import { ServersController } from './controllers/servers.controller';
import { CreateServerRepository } from './repositories/create-server.repository';
import { DeleteServerRepository } from './repositories/delete-server.repository';
import { UpdateServerRepository } from './repositories/update-server.repository';
import { ServersService } from './services/servers.service';
import { LoggerModule } from 'src/common/logger/logger.module';
import { MailModule } from 'src/common/mail/mail.module';
import { TelegramModule } from 'src/common/telegram/telegram.module';
import { LockManagementModule } from 'src/lock-management/lock-management.module';
import { UsersModule } from 'src/users/users.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { NtfyModule } from 'src/common/ntfy/ntfy.module';

@Module({
  imports: [
    PrismaModule,
    AuthsModule,
    TokensModule,
    LoggerModule,
    MailModule,
    TelegramModule,
    NtfyModule,
    UsersModule,
    NotificationsModule,
    LockManagementModule,
  ],
  controllers: [ServersController],
  providers: [
    ServersService,
    CreateServerRepository,
    UpdateServerRepository,
    DeleteServerRepository,
    FetchServerRepository,
  ],
})
export class ServersModule {}
