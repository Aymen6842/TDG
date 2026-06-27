import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

export class EpicTaskSummaryDto {
  @ApiProperty({
    description: 'Task ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({ description: 'Task key', example: 'PROJ-1' })
  key: string;

  @ApiProperty({ description: 'Task title', example: 'Implement login' })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({ description: 'Task type', example: 'TASK' })
  type: string;

  @ApiProperty({ description: 'Task priority', example: 'HIGH' })
  priority: string;

  @ApiProperty({ description: 'Task status', example: 'TODO' })
  status: string;

  @ApiPropertyOptional({
    description: 'Story points',
    nullable: true,
  })
  storyPoints?: number | null;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2026-03-15T00:00:00.000Z',
    nullable: true,
  })
  @ToIsoDateString()
  dueDate?: Date | string | null;

  @ApiPropertyOptional({
    description: 'Completed at',
    example: '2026-03-10T14:30:00.000Z',
    nullable: true,
  })
  @ToIsoDateString()
  completedAt?: Date | string | null;

  @ApiProperty({
    description: 'Created at',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ToIsoDateString()
  createdAt: Date | string;
}
