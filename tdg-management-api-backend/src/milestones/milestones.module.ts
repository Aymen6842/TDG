import { Module } from '@nestjs/common';

import { MilestonesController } from './controller/milestones.controller';
import { MilestonesService } from './services/milestones.service';

import { CreateMilestoneRepository } from './repositories/create-milestone.repository';
import { FetchMilestoneRepository } from './repositories/fetch-milestone.repository';
import { UpdateMilestoneRepository } from './repositories/update-milestone.repository';
import { DeleteMilestoneRepository } from './repositories/delete-milestone.repository';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { RemindersModule } from 'src/reminders/reminders.module';

@Module({
  imports: [
    PrismaModule,
    LoggerModule,
    AuthsModule,
    TokensModule,
    RemindersModule,
  ],
  controllers: [MilestonesController],
  providers: [
    MilestonesService,
    CreateMilestoneRepository,
    FetchMilestoneRepository,
    UpdateMilestoneRepository,
    DeleteMilestoneRepository,
  ],
  exports: [MilestonesService],
})
export class MilestonesModule {}
