import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TelegramService } from './service/telegram.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [TelegramService, ConfigService],
  exports: [TelegramService],
  imports: [LoggerModule],
})
export class TelegramModule {}
