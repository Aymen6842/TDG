import { Module } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger/error-logger.service';
import { AppLoggerService } from './app-logger/app-logger.service';
import { BackgroundActivitiesLoggerService } from './background-activities-logger/background-activities-logger.service';

@Module({
  providers: [
    AppLoggerService,
    ErrorLoggerService,
    BackgroundActivitiesLoggerService,
  ],
  exports: [
    AppLoggerService,
    ErrorLoggerService,
    BackgroundActivitiesLoggerService,
  ],
})
export class LoggerModule {}
