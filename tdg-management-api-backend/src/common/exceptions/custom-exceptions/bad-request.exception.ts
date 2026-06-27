import { HttpException, HttpStatus } from '@nestjs/common';

export class BadRequestCustomException extends HttpException {
  constructor(message: string, code: string) {
    super(
      {
        message: message,
        code: code,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
