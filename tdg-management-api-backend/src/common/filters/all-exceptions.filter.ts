import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorCode } from '../exceptions/error-codes/error.code';
import { ErrorLoggerService } from '../logger/error-logger/error-logger.service';
import { PrismaService } from '../prisma/service/prisma.service';
import { GeminiService } from '../gemini/services/gemini.service';
import { TelegramService } from '../telegram/service/telegram.service';
import { ConfigService } from '@nestjs/config';
import { BcryptService } from '../bcrypt/service/bcrypt.service';
import { ErrorType } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger: ErrorLoggerService;
  private readonly telegramToken: string;
  private readonly telegramChatId: string;
  private readonly projectName: string;
  private readonly promptToResolveError: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly geminiService: GeminiService,
    private readonly telegramService: TelegramService,
    private readonly configService: ConfigService,
  ) {
    this.logger = new ErrorLoggerService();
    this.projectName = this.configService.get<string>('PROJECT_NAME') || '';
    this.telegramToken =
      this.configService.get<string>('TELGRAM_ADMIN_BOT_TOKEN') || '';
    this.telegramChatId =
      this.configService.get<string>('TELEGRAM_ADMIN_CHAT_ID') || '';
    this.promptToResolveError =
      this.configService.get<string>('GEMINI_PROMPOT_ERROR_RESOLUTION') || '';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    // Extract error details
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const responseData =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: 'Server Error!',
          };

    // Log error details
    if (statusCode === 500) {
      this.logger.error('Internal server error', {
        method: request.method,
        endpoint: request.url,
        statusCode,
        stack: exception instanceof Error ? exception.stack : exception,
      });
      this.notifyAdminInTelegramAboutError(
        request.url,
        request.method,
        exception instanceof Error ? exception.stack : exception,
      );
    }

    // Send response
    response.status(statusCode).json(responseData);
  }

  async notifyAdminInTelegramAboutError(
    endpoint: string,
    method: string,
    error: unknown,
  ) {
    const prompt = `The endpoint is ${endpoint} and the method is ${method}, And the name of the project is ${this.projectName}. ${this.promptToResolveError} ${error as string}.`;
    const normalizeStackTrace = this.normalizeStackTrace(error as string);
    const hash = this.hashMessage(
      `${endpoint}|${method}|${normalizeStackTrace}`,
    );
    const storedInDb = await this.storeHashedMessageInDB(
      endpoint,
      normalizeStackTrace,
      hash,
    );
    if (storedInDb?.created === false) return; // If the error was already stored, do not proceed further

    const message = await this.geminiService.generateContent(prompt);
    if (storedInDb?.error && message)
      await this.updateErrorLogWithAIMessage(storedInDb.error.id, message);

    if (message) {
      await this.telegramService.sendTelegramMessage(
        this.telegramChatId,
        message,
      );
    } else {
      await this.telegramService.sendTelegramMessage(
        this.telegramChatId,
        `An error occurred at endpoint ${endpoint}, this is the error message: ${error as string}.`,
      );
    }
  }

  hashMessage(message: string) {
    return this.bcryptService.hashDataDeterministic(message);
  }

  async storeHashedMessageInDB(
    endpoint: string,
    errorStack: string,
    hashedMessage: string,
  ) {
    try {
      const error = await this.prismaService.errorLog.findUnique({
        where: { hash: hashedMessage },
      });
      if (error) return { error, created: false }; // If the hashed message already exists, do not store it again

      const createdError = await this.prismaService.errorLog.create({
        data: {
          hash: hashedMessage,
          type: ErrorType.Api,
          endpoint,
          stackTrace: errorStack,
        },
      });

      return { error: createdError, created: true };
    } catch {
      this.logger.error('Failed to store error log in database', {
        endpoint,
        stack: errorStack,
      });

      return { error: null, created: false };
    }
  }

  async updateErrorLogWithAIMessage(errorId: string, aiMessage: string) {
    try {
      await this.prismaService.errorLog.update({
        where: { id: errorId },
        data: { message: aiMessage },
      });
    } catch {
      this.logger.error('Failed to update error log with AI message', {
        errorId,
        aiMessage,
      });
    }
  }

  normalizeStackTrace(stack?: string): string {
    if (!stack) return '';

    return stack
      .split('\n')
      .map((line) => line.replace(/.*\((.*):\d+:\d+\)/, '$1'))
      .join(' ');
  }
}
