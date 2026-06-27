import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SprintVelocityItemDto {
  @ApiProperty({ description: 'Sprint ID', example: 'sprint-uuid' })
  sprintId!: string;

  @ApiProperty({ description: 'Sprint name', example: 'Sprint 1' })
  name!: string;

  @ApiProperty({ description: 'Completed story points', example: 15 })
  completedPoints!: number;

  @ApiPropertyOptional({
    description: 'Sprint capacity',
    example: 20,
    nullable: true,
  })
  capacity?: number | null;
}
