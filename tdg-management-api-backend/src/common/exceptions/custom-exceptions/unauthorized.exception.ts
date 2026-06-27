import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from '../error-codes/error.code';

export class UnauthorizedCustomException extends HttpException {
  constructor(message?: string) {
    super(
      {
        message: message || 'Unauthorized!',
        code: ErrorCode.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
