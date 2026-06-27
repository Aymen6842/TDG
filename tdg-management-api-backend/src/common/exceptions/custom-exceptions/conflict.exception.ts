import { HttpException, HttpStatus } from '@nestjs/common';

export class ConflictCustomException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        message: message,
        code: code,
      },
      HttpStatus.CONFLICT,
    );
  }
}
