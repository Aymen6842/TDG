import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GanttTaskDto {
  @ApiProperty({
    description: 'Task ID',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Task key',
    example: 'TDG-42',
  })
  key: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Implement reminder permission checks',
  })
  title: string;

  @ApiProperty({
    description: 'Task type',
    example: 'TASK',
  })
  type: string;

  @ApiProperty({
    description: 'Task priority',
    example: 'HIGH',
  })
  priority: string;

  @ApiProperty({
    description: 'Task status',
    example: 'IN_PROGRESS',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Task due date in Africa/Tunis timezone',
    example: '2026-03-15 18:00:00',
    nullable: true,
  })
  dueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Task completion timestamp in Africa/Tunis timezone',
    example: '2026-03-14 16:30:00',
    nullable: true,
  })
  completedAt?: string | null;

  @ApiPropertyOptional({
    description: 'Story points',
    example: 5,
    nullable: true,
  })
  storyPoints?: number | null;

  @ApiPropertyOptional({
    description: 'Linked epic ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
    nullable: true,
  })
  epicId?: string | null;

  @ApiPropertyOptional({
    description: 'Linked sprint ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
    nullable: true,
  })
  sprintId?: string | null;

  @ApiProperty({
    description: 'Creation timestamp in Africa/Tunis timezone',
    example: '2026-03-01 09:30:00',
  })
  createdAt: string;
}
