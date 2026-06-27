import { Module } from '@nestjs/common';
import { LogsService } from './services/logs.service';
import { LogsController } from './controller/logs.controller';
import { TokensModule } from 'src/tokens/tokens.module';

@Module({
  providers: [LogsService],
  controllers: [LogsController],
  imports: [TokensModule],
  exports: [LogsService],
})
export class LogsModule {}
