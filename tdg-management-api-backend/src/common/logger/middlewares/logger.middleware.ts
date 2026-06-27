import { Injectable, NestMiddleware } from '@nestjs/common';
import { Response, NextFunction } from 'express';
import { AppLoggerService } from '../app-logger/app-logger.service';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: AppLoggerService) {}

  maskSensitiveData = (body: Record<string, any>) => {
    const sensitiveFields = [
      'password',
      'oldPassword',
      'newPassword',
      'token',
      'code',
      'access',
      'refresh',
    ];

    if (!body || typeof body !== 'object') return {};

    return Object.fromEntries(
      Object.entries(body)?.map(([key, value]) => [
        key,
        sensitiveFields.includes(key) ? '*****' : value,
      ]),
    );
  };

  use(req: CustomRequest, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      const userId = req.user ? req.user.id : 'Guest';

      if (Number(res.statusCode) >= 200 && Number(res.statusCode) < 400)
        this.logger.log('Request succeeded', {
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: duration,
          userId,
          ip: req.ip,
          request: {
            headers: {
              ...req.headers,
              authorization: req.headers.authorization
                ? `${req.headers.authorization?.split(' ')[0]} ******`
                : undefined,
            },
            body: this.maskSensitiveData(req.body as Record<string, any>),
          },
        });
      else if (Number(res.statusCode) >= 400 && Number(res.statusCode) < 500) {
        this.logger.warn('Request failed', {
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: duration,
          userId,
          ip: req.ip,
          request: {
            headers: {
              ...req.headers,
              authorization: req.headers.authorization
                ? `${req.headers.authorization.split(' ')[0]} ******`
                : undefined,
            },
            body: req.body as Record<string, any>,
          },
          response: {
            headers: res.getHeaders(),
            Body: (res.locals.body as object) || {},
          },
        });
      } else if (
        Number(res.statusCode) >= 500 &&
        Number(res.statusCode) < 600
      ) {
        this.logger.error('Server error', {
          method: req.method,
          endpoint: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: duration,
          userId,
          ip: req.ip,
          request: {
            headers: {
              ...req.headers,
              authorization: req.headers.authorization
                ? `${req.headers.authorization?.split(' ')[0]} ******`
                : undefined,
            },
            body: req.body as Record<string, any>,
          },
          response: {
            headers: res.getHeaders(),
            Body: (res.locals.body as object) || {},
          },
        });
      }
    });

    next();
  }
}
