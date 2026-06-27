import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class FilterTeamsParametersDto {
  @ApiProperty({ description: 'Current page number', example: '1' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ description: 'Number of items per page', example: '10' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ description: 'Filter by team name', example: 'Development' })
  @IsOptional()
  @IsString()
  search?: string;
}
