import { Module } from '@nestjs/common';

import { ProjectsController } from './controller/projects.controller';
import { ProjectsService } from './services/projects.service';
import { CreateProjectRepository } from './repositories/create-project.repository';
import { FetchProjectRepository } from './repositories/fetch-project.repository';
import { UpdateProjectRepository } from './repositories/update-project.repository';
import { DeleteProjectRepository } from './repositories/delete-project.repository';
import { CreateInvitationRepository } from './repositories/create-invitation.repository';
import { FetchInvitationRepository } from './repositories/fetch-invitation.repository';
import { DeleteInvitationRepository } from './repositories/delete-invitation.repository';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { MailModule } from 'src/common/mail/mail.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    AuthsModule,
    TokensModule,
    MailModule,
    NotificationsModule,
  ],
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    CreateProjectRepository,
    FetchProjectRepository,
    UpdateProjectRepository,
    DeleteProjectRepository,
    CreateInvitationRepository,
    FetchInvitationRepository,
    DeleteInvitationRepository,
  ],
  exports: [ProjectsService],
})
export class ProjectsModule {}
