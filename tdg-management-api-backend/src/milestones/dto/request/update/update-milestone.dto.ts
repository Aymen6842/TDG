import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateMilestoneDto {
  @ApiPropertyOptional({
    description: 'Milestone name',
    example: 'Q1 2026 Release',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  name?: string | null;

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
