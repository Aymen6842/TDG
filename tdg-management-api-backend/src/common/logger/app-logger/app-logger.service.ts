import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(), // adds "timestamp"
        winston.format.errors({ stack: true }), // include stack traces if available
        winston.format.json(), // outputs proper JSON
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/app/%DATE%.json',
          datePattern: 'YYYY-MM-DD',
          maxSize: '500m',
          maxFiles: '1d',
          auditFile: 'logs/app/audit.json',
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
