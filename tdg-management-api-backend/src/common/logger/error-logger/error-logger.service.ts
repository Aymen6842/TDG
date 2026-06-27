import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class ErrorLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: 'error', // Only log errors
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }), // include stack trace
        winston.format.json(), // log as JSON
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'logs/errors/%DATE%.json',
          datePattern: 'YYYY-MM-DD',
          maxSize: '50m',
          maxFiles: '2d',
          auditFile: 'logs/errors/audit.json',
          level: 'error',
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
