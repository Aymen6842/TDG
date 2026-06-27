import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsUUID,
  IsDateString,
  Min,
  Max,
  IsInt,
  IsBoolean,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaskPriority, TaskType } from '@prisma/client';
import { TaskSortByOptions } from 'src/tasks/types/request.type';

export class TaskQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status (enum value or custom status name)',
    example: 'TODO',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority',
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SPIKE'],
    example: 'TASK',
  })
  @IsOptional()
  @IsEnum(TaskType)
  type?: TaskType;

  @ApiPropertyOptional({
    description: 'Filter by assignee ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  assigneeId?: string;

  @ApiPropertyOptional({
    description: 'Filter by sprint ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  sprintId?: string;

  @ApiPropertyOptional({
    description: 'Filter by epic ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  epicId?: string;

  @ApiPropertyOptional({
    description: 'Filter by milestone ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  milestoneId?: string;

  @ApiPropertyOptional({
    description: 'Filter by due date (from)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by due date (to)',
    example: '2026-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by isFavorite',
    example: true,
  })
  @Transform(
    ({ value }) =>
      value === true || value === 'true'
        ? true
        : value === false || value === 'false'
          ? false
          : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsBoolean()
  isFavorite?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by archived',
    example: false,
  })
  @Transform(
    ({ value }) =>
      value === true || value === 'true'
        ? true
        : value === false || value === 'false'
          ? false
          : undefined,
    { toClassOnly: true },
  )
  @IsOptional()
  @IsBoolean()
  archived?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by label name',
    example: 'Frontend',
  })
  @IsOptional()
  @IsString()
  labelName?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: TaskSortByOptions,
    example: 'createdAtDesc',
  })
  @IsOptional()
  @IsEnum(TaskSortByOptions)
  sortBy?: TaskSortByOptions;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiHideProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiHideProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  take?: number;
}
