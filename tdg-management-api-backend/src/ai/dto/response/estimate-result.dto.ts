import { ApiProperty } from '@nestjs/swagger';
import { EstimationScope } from '../../services/estimation.service';

/** One completed task shown as evidence behind an estimate. */
export class EstimationNeighborDto {
  @ApiProperty({ description: 'Task key, e.g. "TAWER-12".', example: 'TAWER-12' })
  key: string;

  @ApiProperty({ description: 'Task title.', example: 'Add OAuth login' })
  title: string;

  @ApiProperty({
    description: 'Real logged effort of the completed task, in hours.',
    example: 6.5,
  })
  actualHours: number;

  @ApiProperty({
    description: 'Story points the completed task carried, if any.',
    example: 5,
    nullable: true,
  })
  storyPoints: number | null;

  @ApiProperty({
    description: 'Cosine similarity to the draft, as a 0..1 fraction.',
    example: 0.83,
  })
  similarity: number;
}

/**
 * Response for `POST /ai/estimate`. When no comparable completed tasks exist,
 * the numeric fields are null, `sampleSize` is 0 and `scope` is `NONE` — the UI
 * renders an honest "not enough history" state rather than a fabricated number.
 */
export class EstimateResultDto {
  @ApiProperty({
    description: 'Similarity-weighted median of neighbors\' actual hours.',
    example: 6,
    nullable: true,
  })
  predictedHours: number | null;

  @ApiProperty({
    description: 'Low end of the uncertainty band (weighted 25th percentile).',
    example: 5,
    nullable: true,
  })
  rangeLow: number | null;

  @ApiProperty({
    description: 'High end of the uncertainty band (weighted 75th percentile).',
    example: 8,
    nullable: true,
  })
  rangeHigh: number | null;

  @ApiProperty({
    description: 'Weighted mode of neighbors\' story points.',
    example: 5,
    nullable: true,
  })
  suggestedPoints: number | null;

  @ApiProperty({
    description: 'How many completed tasks backed the estimate.',
    example: 5,
  })
  sampleSize: number;

  @ApiProperty({
    description: 'Whether neighbors came from this project or its business unit.',
    enum: ['PROJECT', 'BUSINESS_UNIT', 'NONE'],
    example: 'PROJECT',
  })
  scope: EstimationScope;

  @ApiProperty({
    description: 'The neighbor tasks used as evidence.',
    type: [EstimationNeighborDto],
  })
  neighbors: EstimationNeighborDto[];
}
