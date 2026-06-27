import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFoundCustomException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        message: message,
        code: code,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
