import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

/**
 * Query params for `GET /ai/copilot/stream` (SSE). Same shape as
 * {@link CopilotQueryDto} but read from the query string, because SSE is a GET —
 * the browser opens the stream with an `EventSource`-style request rather than a
 * JSON body.
 */
export class CopilotStreamQueryDto {
  @ApiPropertyOptional({
    description:
      "Project to scope the answer to. Must be within the caller's allowed set.",
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string | null;

  @ApiProperty({
    description: 'The natural-language question about the project.',
    example: 'Why did we choose NB-IoT for the sensors?',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(1000)
  question: string;
}
