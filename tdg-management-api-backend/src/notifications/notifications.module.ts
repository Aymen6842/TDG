import { Module } from '@nestjs/common';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CreateNotificationRepository } from './repositories/create-notification.repository';
import { DeleteNotificationRepository } from './repositories/delete-notification.repository';
import { FirebaseModule } from 'src/common/firebase/firebase.module';
import { UpdateNotificationRepository } from './repositories/update-notification.repositoty';
import { FetchNotificationsRepository } from './repositories/fetch-notifications.repository';
import { TokensModule } from 'src/tokens/tokens.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { AuthsModule } from 'src/auths/auths.module';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    CreateNotificationRepository,
    DeleteNotificationRepository,
    UpdateNotificationRepository,
    FetchNotificationsRepository,
  ],
  exports: [NotificationsService],
  imports: [
    PrismaModule,
    FirebaseModule,
    TokensModule,
    UploadModule,
    AuthsModule,
    LoggerModule,
  ],
})
export class NotificationsModule {}
