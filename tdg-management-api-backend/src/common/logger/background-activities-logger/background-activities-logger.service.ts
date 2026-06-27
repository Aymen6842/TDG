import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class BackgroundActivitiesLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info', // Default level
      format: winston.format.combine(
        winston.format.timestamp(), // adds timestamp field
        winston.format.errors({ stack: true }), // include stack traces if available
        winston.format.json(), // output proper JSON
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/background-activities/%DATE%.json',
          datePattern: 'YYYY-MM-DD',
          maxSize: '500m',
          maxFiles: '5d',
          auditFile: 'logs/background-activities/audit.json',
          level: 'info',
        }),
      ],
    });
  }

  log(message: string, meta?: Record<string, any>) {
    this.logger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, any>) {
    this.logger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, any>) {
    this.logger.error(message, meta);
  }
}
