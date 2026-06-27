import { Inject, Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

@Injectable()
export class GeminiService {
  constructor(
    @Inject('GEMINI_CLIENT') private readonly googleGenAI: GoogleGenAI,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async generateContent(prompt: string) {
    try {
      const response = await this.googleGenAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text ?? null;
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Gemini Service Error: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Gemini Service',
          method: 'Generating Content',
        },
      );
      return null;
    }
  }
}
