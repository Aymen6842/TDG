import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NtfyService } from './service/ntfy.service';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [NtfyService, ConfigService],
  exports: [NtfyService],
  imports: [LoggerModule],
})
export class NtfyModule {}
