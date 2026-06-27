import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TaskPriority, TaskType } from '@prisma/client';
import { TimeService } from 'src/common/time/service/time.service';

import { TaskCommentResponseDto } from './task-comment-response.dto';
import { TaskDependencyResponseDto } from './task-dependency-response.dto';
import { TaskLabelResponseDto } from './task-label-response.dto';

export { TaskCommentResponseDto } from './task-comment-response.dto';
export { TaskDependencyResponseDto } from './task-dependency-response.dto';
export { TaskLabelResponseDto } from './task-label-response.dto';

export class TaskResponseDto {
  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Implement login feature',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Implement JWT login and refresh flow',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
    enumName: 'TaskType',
    example: 'TASK',
  })
  type: TaskType;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
    enumName: 'TaskPriority',
    example: 'HIGH',
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task status (enum value or custom status name)',
    example: 'TODO',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Assignee UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  assigneeId: string | null;

  @ApiPropertyOptional({
    description: 'Sprint UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  sprintId: string | null;

  @ApiPropertyOptional({
    description: 'Epic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  epicId: string | null;

  @ApiPropertyOptional({
    description: 'Milestone UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  milestoneId: string | null;

  @ApiPropertyOptional({
    description: 'Parent task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  parentTaskId: string | null;

  @ApiPropertyOptional({
    description: 'Story points',
    example: 5,
    nullable: true,
  })
  storyPoints: number | null;

  @ApiPropertyOptional({
    description: 'Estimated hours',
    example: 16.5,
    nullable: true,
  })
  estimatedHours: number | null;

  @ApiPropertyOptional({
    description: 'Progress percentage (FREESTYLE only)',
    example: 50,
    nullable: true,
  })
  progressPercent: number | null;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2026-03-15T00:00:00.000Z',
    nullable: true,
  })
  @Transform(
    ({ value }) =>
      value
        ? TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis')
        : null,
    { toClassOnly: true },
  )
  dueDate: Date | null;

  @ApiProperty({
    description: 'Display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Is favorite',
    example: false,
  })
  isFavorite: boolean;

  @ApiProperty({
    description: 'Is archived',
    example: false,
  })
  archived: boolean;

  @ApiProperty({
    description: 'Project UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-02-15T10:30:00.000Z',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2026-02-15T10:30:00.000Z',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Reporter UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  reporterId: string;

  @ApiPropertyOptional({
    description: 'Task comments',
    type: [TaskCommentResponseDto],
    example: [],
  })
  comments?: TaskCommentResponseDto[];

  @ApiPropertyOptional({
    description: 'Dependencies where this task is blocked by others',
    type: [TaskDependencyResponseDto],
    example: [],
  })
  taskDependenciesAsBlocked?: TaskDependencyResponseDto[];

  @ApiPropertyOptional({
    description: 'Dependencies where this task blocks others',
    type: [TaskDependencyResponseDto],
    example: [],
  })
  taskDependenciesAsBlocking?: TaskDependencyResponseDto[];

  @ApiPropertyOptional({
    description: 'Task labels',
    type: [TaskLabelResponseDto],
    example: [],
  })
  @Transform(
    ({
      obj,
    }: {
      obj: {
        labels?: { label: { id: string; name: string; color: string } }[];
      };
    }) => obj.labels?.map((a) => a.label) ?? [],
    { toClassOnly: true },
  )
  labels?: TaskLabelResponseDto[];

  @ApiPropertyOptional({ description: 'Subtasks count', example: 3 })
  subtasksCount?: number;

  @ApiPropertyOptional({ description: 'Completed subtasks count', example: 1 })
  completedSubtasksCount?: number;
}
