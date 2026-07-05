import { ApiProperty } from '@nestjs/swagger';
import { EmbeddingEntityType } from '@prisma/client';

/** One clickable citation the UI renders as a chip and deep-links from. */
export class CopilotCitationDto {
  @ApiProperty({
    description: 'The `[n]` marker as it appears in the answer text.',
    example: 1,
  })
  marker: number;

  @ApiProperty({
    description: 'The cited entity type.',
    enum: EmbeddingEntityType,
    example: EmbeddingEntityType.TASK_COMMENT,
  })
  entityType: EmbeddingEntityType;

  @ApiProperty({
    description: 'Source row id of the cited entity.',
    example: 'b1c2d3e4-...',
  })
  entityId: string;

  @ApiProperty({ description: 'Project the cited entity belongs to.' })
  projectId: string;

  @ApiProperty({
    description:
      'Task to open when deep-linking (TASK / TASK_COMMENT citations), else null.',
    nullable: true,
  })
  taskId: string | null;

  @ApiProperty({
    description: 'Human task key for TASK / TASK_COMMENT citations, else null.',
    example: 'TAWER-12',
    nullable: true,
  })
  taskKey: string | null;

  @ApiProperty({
    description: 'Display label for the chip.',
    example: 'Comment on TAWER-12',
  })
  label: string;

  @ApiProperty({
    description: 'Short excerpt of the cited chunk (tooltip / preview).',
  })
  snippet: string;
}

/**
 * Response for `POST /ai/copilot/query`. When `insufficientContext` is true the
 * answer is the honest refusal and `citations` is empty — the UI renders a
 * "not found in this project" state rather than a fabricated answer.
 */
export class CopilotAnswerDto {
  @ApiProperty({
    description: 'The grounded answer, with inline `[n]` citation markers.',
  })
  answer: string;

  @ApiProperty({
    description: 'The resolved citations behind the answer.',
    type: [CopilotCitationDto],
  })
  citations: CopilotCitationDto[];

  @ApiProperty({
    description: 'True when retrieval was too weak to answer / the model refused.',
    example: false,
  })
  insufficientContext: boolean;
}
