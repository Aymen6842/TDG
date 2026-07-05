import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

/**
 * Request body for `POST /ai/estimate` — the draft task the user is typing.
 * Only the free-text signals (title / description) plus the project scope are
 * needed; retrieval and permission checks derive everything else.
 */
export class EstimateTaskDto {
  @ApiProperty({
    description: 'Project the draft task belongs to (scopes retrieval).',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  projectId: string;

  @ApiProperty({
    description: 'Draft task title.',
    example: 'Implement JWT refresh-token rotation',
  })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiPropertyOptional({
    description: 'Draft task description (optional, improves the match).',
    example: 'Rotate refresh tokens on each use and revoke the previous one.',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;

  @ApiPropertyOptional({
    description:
      'Story points, if the task has already been pointed. When present the ' +
      'estimate uses the neighbors’ local hours-per-point rate scaled by ' +
      'these points (far more accurate than a bare median of neighbor hours).',
    example: 8,
    minimum: 1,
    maximum: 100,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  storyPoints?: number | null;
}
