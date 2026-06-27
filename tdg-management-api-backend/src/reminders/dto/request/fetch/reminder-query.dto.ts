import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReminderEntityType, ReminderStatus } from '@prisma/client';
import { ReminderSortBy } from '../../../types/request.type';

export class ReminderQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    example: 'PENDING',
    enum: ReminderStatus,
  })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
    example: 'TASK',
    enum: ReminderEntityType,
  })
  @IsOptional()
  @IsEnum(ReminderEntityType)
  entityType?: ReminderEntityType;

  @ApiPropertyOptional({
    description: 'Filter reminders scheduled from this date/time',
    example: '2026-01-01T09:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  reminderAtFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter reminders scheduled until this date/time',
    example: '2026-01-31T18:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  reminderAtTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: ReminderSortBy,
    example: 'reminderAtAsc',
  })
  @IsOptional()
  @IsEnum(ReminderSortBy)
  sortBy?: ReminderSortBy;
}
