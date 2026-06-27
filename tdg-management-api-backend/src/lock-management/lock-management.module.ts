import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/common/logger/logger.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { CreateLockRepository } from './repositories/create.repository';
import { DeleteLockRepository } from './repositories/delete.repository';
import { FetchLockRepository } from './repositories/fetch.repository';
import { LockManagementService } from './services/lock-management.service';
import { UpdateLockRepository } from './repositories/update.repository';

@Module({
  imports: [PrismaModule, LoggerModule],
  providers: [
    CreateLockRepository,
    DeleteLockRepository,
    UpdateLockRepository,
    FetchLockRepository,
    LockManagementService,
  ],
  exports: [LockManagementService],
})
export class LockManagementModule {}
