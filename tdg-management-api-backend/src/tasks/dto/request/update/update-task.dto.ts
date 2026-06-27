import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  IsDateString,
  Min,
  Max,
  IsInt,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { TaskType, TaskPriority } from '@prisma/client';
import { TaskAttachmentDto } from '../post/task-attachment.dto';

const toOptionalNumber = ({ value }: { value: unknown }) => {
  if (value === '' || value === undefined) return undefined;
  if (value === null || value === 'null') return null;
  return Number(value);
};

const toOptionalBoolean = ({ value }: { value: unknown }) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
};

export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title',
    example: 'Updated task title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Task description',
    example: 'Updated description',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Task type',
    enum: TaskType,
    enumName: 'TaskType',
    example: 'TASK',
  })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TaskPriority,
    enumName: 'TaskPriority',
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Task status (enum value or custom status name)',
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Assignee user UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;

  @ApiPropertyOptional({
    description: 'Epic UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  epicId?: string | null;

  @ApiPropertyOptional({
    description: 'Sprint UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string | null;

  @ApiPropertyOptional({
    description: 'Milestone UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  milestoneId?: string | null;

  @ApiPropertyOptional({
    description: 'Story points estimate',
    example: 5,
    nullable: true,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  storyPoints?: number | null;

  @ApiPropertyOptional({
    description: 'Estimated hours',
    example: 16.5,
    nullable: true,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedHours?: number | null;

  @ApiPropertyOptional({
    description: 'Due date',
    example: '2026-03-15T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string | null;

  @ApiPropertyOptional({
    description: 'Progress percentage (FREESTYLE only)',
    example: 50,
    nullable: true,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  progressPercent?: number | null;

  @ApiPropertyOptional({
    description: 'Display order in Kanban',
    example: 0,
  })
  @IsOptional()
  @Transform(toOptionalNumber)
  @Type(() => Number)
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Mark task as favorite',
    example: false,
  })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Archive the task',
    example: false,
  })
  @IsOptional()
  @Transform(toOptionalBoolean)
  @IsBoolean()
  archived?: boolean;

  @ApiPropertyOptional({
    description: 'Parent task UUID (for subtasks)',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  parentTaskId?: string | null;

  @ApiPropertyOptional({
    description: 'Task attachments',
    type: [TaskAttachmentDto],
    example: [{ file: '/uploads/tasks/attachment.pdf' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskAttachmentDto)
  attachments?: TaskAttachmentDto[];

  @ApiPropertyOptional({
    description: 'File paths of attachments to delete',
    type: [String],
    example: ['/uploads/tasks/old-file.pdf'],
  })
  @IsOptional()
  @Transform(
    ({ value }) =>
      typeof value === 'string'
        ? value.split(',').map((file) => file.trim()).filter(Boolean)
        : value,
    { toClassOnly: true },
  )
  @IsArray()
  @IsString({ each: true })
  deletedAttachments?: string[];
}
