import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

export class MilestoneSummaryDto {
  @ApiProperty({
    description: 'Milestone ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Milestone name',
    example: 'Q1 2026 Release',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Milestone description',
    example: 'Complete the first quarter release milestone',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Milestone due date',
    example: '2026-03-31T00:00:00.000Z',
    nullable: true,
  })
  @ToIsoDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Completion timestamp',
    example: '2026-03-31T12:00:00.000Z',
    nullable: true,
  })
  @ToIsoDateString()
  completedAt?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ToIsoDateString()
  createdAt: string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ToIsoDateString()
  updatedAt: string;

  @ApiProperty({
    description: 'Total tasks linked to this milestone',
    example: 10,
  })
  totalTasks: number;

  @ApiProperty({ description: 'Done tasks in this milestone', example: 6 })
  doneTasks: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 60,
  })
  progress: number;
}
