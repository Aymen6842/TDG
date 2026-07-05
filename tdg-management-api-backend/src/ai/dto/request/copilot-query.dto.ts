import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

/**
 * Request body for `POST /ai/copilot/query`. `projectId` is optional: when given
 * it scopes (and must be within the caller's allowed set, else 403); when
 * omitted the copilot searches across every project the user can access.
 */
export class CopilotQueryDto {
  @ApiPropertyOptional({
    description:
      'Project to scope the answer to. Must be within the caller\'s allowed set.',
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
