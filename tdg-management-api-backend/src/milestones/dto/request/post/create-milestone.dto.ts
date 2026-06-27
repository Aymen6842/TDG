import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateMilestoneDto {
  @ApiProperty({
    description: 'Milestone name',
    example: 'Q1 2026 Release',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Milestone description',
    example: 'Complete the first quarter release milestone',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Milestone due date',
    example: '2026-03-31T00:00:00.000Z',
    nullable: true,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @IsDateString()
  @IsOptional()
  dueDate?: string | null;
}
