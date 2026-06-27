import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { EpicSortBy } from 'src/epics/types/request.type';

export class EpicQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by start date (from)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (to)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  startDateTo?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (from)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  endDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (to)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  endDateTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: EpicSortBy,
    example: 'createdAtDesc',
  })
  @IsOptional()
  @IsEnum(EpicSortBy)
  sortBy?: EpicSortBy;

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
  skip?: number;

  @ApiHideProperty()
  take?: number;
}
