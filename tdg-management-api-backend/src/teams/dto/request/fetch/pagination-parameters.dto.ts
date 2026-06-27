import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PaginationParametersRequestDto {
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
}
