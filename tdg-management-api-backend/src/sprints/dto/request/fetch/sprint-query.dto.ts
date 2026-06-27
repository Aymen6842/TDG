import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { SprintStatus } from '@prisma/client';
import { SprintSortBy } from 'src/sprints/types/request.type';

export class SprintQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by sprint name (partial match)',
    example: 'Sprint 1',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by sprint status',
    enum: SprintStatus,
    example: 'Running',
  })
  @IsEnum(SprintStatus)
  @IsOptional()
  status?: SprintStatus;

  @ApiPropertyOptional({
    description: 'Filter by start date (from)',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (to)',
    example: '2026-12-31',
  })
  @IsString()
  @IsOptional()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (from)',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  endDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (to)',
    example: '2026-12-31',
  })
  @IsString()
  @IsOptional()
  endDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated start date (from)',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  estimatedStartDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated start date (to)',
    example: '2026-12-31',
  })
  @IsString()
  @IsOptional()
  estimatedStartDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated end date (from)',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  estimatedEndDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated end date (to)',
    example: '2026-12-31',
  })
  @IsString()
  @IsOptional()
  estimatedEndDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date (from)',
    example: '2026-01-01',
  })
  @IsString()
  @IsOptional()
  createdAtFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date (to)',
    example: '2026-12-31',
  })
  @IsString()
  @IsOptional()
  createdAtTo?: string;

  @ApiPropertyOptional({
    description:
      'Sort fields (single value or comma-separated values). Applied in order.',
    enum: SprintSortBy,
    isArray: true,
    example: ['createdAtDesc', 'startDateAsc'],
  })
  @Transform(
    ({ value }) => {
      if (!value) return undefined;
      return (value as string)?.split(',')?.map((s: string) => s.trim());
    },
    { toClassOnly: true },
  )
  @IsEnum(SprintSortBy, { each: true })
  @IsOptional()
  sortBy?: SprintSortBy[];

  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiHideProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiHideProperty()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take?: number;
}
