import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class LogTimeEntryDto {
  @ApiProperty({
    description: 'Hours worked',
    example: 2.5,
  })
  @IsNumber()
  @Min(0)
  hours: number;

  @ApiPropertyOptional({
    description: 'Description of work performed',
    example: 'Worked on API integration',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Work session UUID to link',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  workSessionId?: string;
}
