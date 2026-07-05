import { Module } from '@nestjs/common';
import { AuthsModule } from './auths/auths.module';
import { TokensModule } from './tokens/tokens.module';
import { UsersModule } from './users/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { LoggerModule } from './common/logger/logger.module';
import { ScheduleModule } from '@nestjs/schedule';
import { LogsController } from './logs/controller/logs.controller';
import { LogsModule } from './logs/logs.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ConfigModule } from '@nestjs/config';
import { EventsModule } from './events/events.module';
import { ServersModule } from './servers/servers.module';
import { TeamsModule } from './teams/teams.module';
import { PersonalTasksModule } from './personal-tasks/personal-tasks.module';
import { WorkDaysModule } from './work-days/work-sessions.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { PrismaModule } from './common/prisma/prisma.module';
import { GeminiModule } from './common/gemini/gemini.module';
import { TelegramModule } from './common/telegram/telegram.module';
import { BcryptModule } from './common/bcrypt/bcrypt.module';
import { MailModule } from './common/mail/mail.module';
import { LockManagementModule } from './lock-management/lock-management.module';
import { ProjectsModule } from './projects/projects.module';
import { SprintsModule } from './sprints/sprints.module';
import { TasksModule } from './tasks/tasks.module';
import { EpicsModule } from './epics/epics.module';
import { MilestonesModule } from './milestones/milestones.module';
import { RemindersModule } from './reminders/reminders.module';
import { AiModule } from './ai/ai.module';
import { HealthController } from './health/controller/health.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LogsModule,
    AuthsModule,
    TokensModule,
    UsersModule,
    PersonalTasksModule,
    LoggerModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'static'),
      serveRoot: '/static',
      serveStaticOptions: {
        fallthrough: false, // Prevents fallback to index.html
      },
    }),
    NotificationsModule,
    WorkDaysModule,
    ServersModule,
    TeamsModule,
    EventsModule,
    TelegramModule,
    PrismaModule,
    GeminiModule,
    BcryptModule,
    MailModule,
    LockManagementModule,
    ProjectsModule,
    SprintsModule,
    TasksModule,
    EpicsModule,
    MilestonesModule,
    RemindersModule,
    AiModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [LogsController, HealthController],
})
export class AppModule {}
