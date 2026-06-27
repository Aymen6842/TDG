import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { LoggerModule } from '../logger/logger.module';

@Module({
  providers: [
    GeminiService,
    {
      provide: 'GEMINI_CLIENT',
      useFactory: (configService: ConfigService) => {
        try {
          const apiKey = configService.get<string>('GEMINI_API_KEY');
          return new GoogleGenAI({ apiKey });
        } catch {
          return null;
        }
      },
      inject: [ConfigService],
    },
  ],
  exports: [GeminiService],
  imports: [LoggerModule],
})
export class GeminiModule {}
