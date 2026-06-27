import { Injectable } from '@nestjs/common';
import { CreateLockRepository } from '../repositories/create.repository';
import { DeleteLockRepository } from '../repositories/delete.repository';
import { TimeService } from 'src/common/time/service/time.service';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { UpdateLockRepository } from '../repositories/update.repository';

@Injectable()
export class LockManagementService {
  constructor(
    private readonly createLockRepository: CreateLockRepository,
    private readonly deleteLockRepository: DeleteLockRepository,
    private readonly updateLockRepository: UpdateLockRepository,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async lock(key: string, value: string, ttlSeconds: number) {
    try {
      return await this.updateLockRepository.lock(
        key,
        value,
        TimeService.getFutureTimeBySeconds(ttlSeconds),
      );
    } catch (error) {
      this.backgroundActivitiesLoggerService.log(
        'Error in the lock management service: ' + (error as Error).message,
        {
          service: 'Lock Management Service',
          method: 'Locking',
        },
      );
    }
  }

  async createOrUpdateLock(key: string, value: string, ttlSeconds: number) {
    try {
      return await this.createLockRepository.createOrUpdateLock(
        key,
        value,
        TimeService.getFutureTimeBySeconds(ttlSeconds),
      );
    } catch (error) {
      this.backgroundActivitiesLoggerService.log(
        'Error in the lock management service: ' + (error as Error).message,
        {
          service: 'Lock Management Service',
          method: 'Creating or Updating Lock',
        },
      );
    }
  }

  async deleteLock(key: string) {
    try {
      return this.deleteLockRepository.deleteLock(key);
    } catch (error) {
      this.backgroundActivitiesLoggerService.log(
        'Error in the lock management service: ' + (error as Error).message,
        {
          service: 'Lock Management Service',
          method: 'Deleting Lock',
        },
      );
    }
  }
}
