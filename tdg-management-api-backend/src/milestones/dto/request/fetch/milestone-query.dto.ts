import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsEnum, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { MilestoneSortBy } from '../../../types/request.type';

export class MilestoneQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by due date (from)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  dueDateFrom?: string;

  @ApiPropertyOptional({
    description: 'Filter by due date (to)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsString()
  @Type(() => String)
  dueDateTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by',
    enum: MilestoneSortBy,
    example: 'createdAtDesc',
  })
  @IsOptional()
  @IsEnum(MilestoneSortBy)
  sortBy?: MilestoneSortBy;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @ApiHideProperty()
  skip?: number;

  @ApiHideProperty()
  take?: number;
}
