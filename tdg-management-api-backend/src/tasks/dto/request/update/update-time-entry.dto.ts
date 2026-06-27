import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateTimeEntryDto {
  @ApiPropertyOptional({
    description: 'Updated hours',
    example: 3.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  hours?: number;

  @ApiPropertyOptional({
    description: 'Updated description',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;
}
