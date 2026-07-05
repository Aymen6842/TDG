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

  /**
   * Grounded generation for the RAG copilot (§4.5). The system instruction is
   * passed separately from the user turn so the retrieved (untrusted) context in
   * `prompt` can never override the answering directive — a deliberate
   * prompt-injection boundary (§7). Temperature is kept low for faithful,
   * low-creativity answers. Returns the answer text plus the prompt token count
   * (for `CopilotQueryLog` telemetry), or `null` if the call fails.
   */
  async generateGrounded(params: {
    systemInstruction: string;
    prompt: string;
  }): Promise<{ text: string; promptTokens: number } | null> {
    try {
      const response = await this.googleGenAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: params.prompt,
        config: {
          systemInstruction: params.systemInstruction,
          temperature: 0.2,
        },
      });

      const text = response.text ?? '';
      const promptTokens = response.usageMetadata?.promptTokenCount ?? 0;
      return { text, promptTokens };
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Gemini Service Error: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Gemini Service',
          method: 'Grounded Generation',
        },
      );
      return null;
    }
  }

  /**
   * Streaming variant of {@link generateGrounded} for the SSE copilot (§4.5
   * step 5). Yields answer text incrementally as `gemini-2.5-flash` produces it,
   * then returns the prompt token count (carried on the final chunk's
   * `usageMetadata`) for `CopilotQueryLog` telemetry. Same system/user split and
   * low temperature as the non-streaming call. Errors propagate to the caller,
   * which decides how to surface a partial/failed stream.
   */
  async *generateGroundedStream(params: {
    systemInstruction: string;
    prompt: string;
  }): AsyncGenerator<string, { promptTokens: number }, void> {
    const stream = await this.googleGenAI.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: params.prompt,
      config: {
        systemInstruction: params.systemInstruction,
        temperature: 0.2,
      },
    });

    let promptTokens = 0;
    for await (const chunk of stream) {
      const usage = chunk.usageMetadata?.promptTokenCount;
      if (usage) promptTokens = usage;
      const text = chunk.text;
      if (text) yield text;
    }
    return { promptTokens };
  }
}
