import { Module } from '@nestjs/common';

import { EpicsController } from './controller/epics.controller';
import { EpicsService } from './services/epics.service';

import { CreateEpicRepository } from './repositories/create-epic.repository';
import { FetchEpicRepository } from './repositories/fetch-epic.repository';
import { UpdateEpicRepository } from './repositories/update-epic.repository';
import { DeleteEpicRepository } from './repositories/delete-epic.repository';

import { PrismaModule } from 'src/common/prisma/prisma.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { AiModule } from 'src/ai/ai.module';

@Module({
  imports: [PrismaModule, LoggerModule, AuthsModule, TokensModule, AiModule],
  controllers: [EpicsController],
  providers: [
    EpicsService,
    CreateEpicRepository,
    FetchEpicRepository,
    UpdateEpicRepository,
    DeleteEpicRepository,
  ],
  exports: [EpicsService],
})
export class EpicsModule {}
