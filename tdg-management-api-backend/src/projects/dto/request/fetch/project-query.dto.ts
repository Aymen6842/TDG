import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ProjectStatus, BusinessUnit } from '@prisma/client';
import { ProjectSortByOptions } from 'src/projects/types/request.type';

export class ProjectQueryDto {
  @ApiPropertyOptional({
    description:
      'When true, force filtering by the authenticated user ID (own projects).',
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
  @IsBoolean()
  @IsOptional()
  own?: boolean;

  @ApiPropertyOptional({
    description:
      'Filter by project member name (partial match). For executives only.',
    example: 'Ahmed',
  })
  @IsString()
  @IsOptional()
  memberName?: string;

  @ApiPropertyOptional({
    description: 'Filter by business unit',
    enum: BusinessUnit,
    example: 'TawerDev',
  })
  @IsEnum(BusinessUnit)
  @IsOptional()
  businessUnit?: BusinessUnit;

  @ApiPropertyOptional({
    description: 'Filter by project name (partial match)',
    example: 'E-Commerce',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated start date (from)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsString()
  @IsOptional()
  estimatedStartDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by estimated end date (to)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsString()
  @IsOptional()
  estimatedEndDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date (from)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsString()
  @IsOptional()
  createdAtFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by created date (to)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsString()
  @IsOptional()
  createdAtTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (from)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsString()
  @IsOptional()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (to)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsString()
  @IsOptional()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by paid status',
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
  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ProjectStatus,
    example: 'Pending',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: ProjectSortByOptions,
    example: 'createdAtDesc',
  })
  @IsEnum(ProjectSortByOptions)
  @IsOptional()
  sortBy?: ProjectSortByOptions;

  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page',
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;

  @ApiHideProperty()
  requestUserId?: string | null;

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
