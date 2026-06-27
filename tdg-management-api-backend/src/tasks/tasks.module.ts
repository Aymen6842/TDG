import { Module } from '@nestjs/common';

import { TasksController } from './controller/tasks.controller';
import { UserTasksController } from './controller/user-tasks.controller';
import { TasksService } from './services/tasks.service';
import { CreateTaskRepository } from './repositories/create-task.repository';
import { FetchTaskRepository } from './repositories/fetch-task.repository';
import { UpdateTaskRepository } from './repositories/update-task.repository';
import { DeleteTaskRepository } from './repositories/delete-task.repository';
import { TaskLabelsRepository } from './repositories/task-labels.repository';
import { TaskStatusesRepository } from './repositories/task-statuses.repository';

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
  controllers: [UserTasksController, TasksController],
  providers: [
    TasksService,
    CreateTaskRepository,
    FetchTaskRepository,
    UpdateTaskRepository,
    DeleteTaskRepository,
    TaskLabelsRepository,
    TaskStatusesRepository,
  ],
  exports: [TasksService],
})
export class TasksModule {}
