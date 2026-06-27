import { Module } from '@nestjs/common';

import { SprintsController } from './controller/sprints.controller';
import { SprintsService } from './services/sprints.service';
import { CreateSprintRepository } from './repositories/create-sprint.repository';
import { FetchSprintRepository } from './repositories/fetch-sprint.repository';
import { UpdateSprintRepository } from './repositories/update-sprint.repository';
import { DeleteSprintRepository } from './repositories/delete-sprint.repository';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { RemindersModule } from 'src/reminders/reminders.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    AuthsModule,
    TokensModule,
    RemindersModule,
    UploadModule,
    NotificationsModule,
  ],
  controllers: [SprintsController],
  providers: [
    SprintsService,
    CreateSprintRepository,
    FetchSprintRepository,
    UpdateSprintRepository,
    DeleteSprintRepository,
  ],
  exports: [SprintsService],
})
export class SprintsModule {}
