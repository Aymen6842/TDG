import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

export class GanttMilestoneDto {
  @ApiProperty({
    description: 'Milestone ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Milestone name',
    example: 'Q1 2026 Release',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Milestone description',
    example: 'Finalize release scope and delivery',
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
    description: 'Milestone completion timestamp',
    example: '2026-03-30T18:45:00.000Z',
    nullable: true,
  })
  @ToIsoDateString()
  completedAt?: string | null;

  @ApiProperty({
    description: 'Derived gantt status',
    example: 'PENDING',
    enum: ['COMPLETED', 'OVERDUE', 'PENDING', 'IN_PROGRESS'],
  })
  status: 'COMPLETED' | 'OVERDUE' | 'PENDING' | 'IN_PROGRESS';
}
