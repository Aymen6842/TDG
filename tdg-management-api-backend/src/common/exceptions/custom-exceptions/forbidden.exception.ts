import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes/error.code';

export class ForbiddenCustomException extends HttpException {
  constructor(message?: string, code?: string) {
    super(
      {
        message: message || 'Forbidden!',
        code: code || ErrorCode.FORBIDDEN,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}
