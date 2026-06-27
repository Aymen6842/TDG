import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SprintVelocityItemDto } from './sprint-velocity-item.dto';

export class VelocityResponseDto {
  @ApiProperty({
    description: 'Array of completed sprints with their completed points',
    type: [SprintVelocityItemDto],
    example: [
      {
        sprintId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Sprint 1 - Authentication',
        completedPoints: 15,
        capacity: 20,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintVelocityItemDto)
  sprints!: SprintVelocityItemDto[];

  @ApiProperty({ description: 'Total number of completed sprints', example: 3 })
  totalCompletedSprints!: number;

  @ApiProperty({
    description: 'Total completed story points across all sprints',
    example: 45,
  })
  totalCompletedPoints!: number;

  @ApiProperty({
    description: 'Average velocity (completed points / number of sprints)',
    example: 15,
  })
  averageVelocity!: number;
}
