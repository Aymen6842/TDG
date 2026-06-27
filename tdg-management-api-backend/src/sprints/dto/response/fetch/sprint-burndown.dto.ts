import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SprintStatus } from '@prisma/client';
import { BurndownDataPointDto } from './burndown-data-point.dto';

export class SprintBurndownDto {
  @ApiProperty({
    description: 'Sprint ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  sprintId: string;

  @ApiProperty({
    description: 'Sprint name',
    example: 'Sprint 1 - Authentication',
  })
  sprintName: string;

  @ApiProperty({
    description: 'Sprint status',
    enum: SprintStatus,
    example: 'Running',
  })
  status: SprintStatus;

  @ApiProperty({
    description: 'Sprint start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  startDate: string;

  @ApiProperty({
    description: 'Sprint end date',
    example: '2025-01-14T00:00:00.000Z',
  })
  endDate: string;

  @ApiProperty({
    description: 'Total committed story points',
    example: 50,
  })
  totalPoints: number;

  @ApiProperty({
    description: 'Completed story points',
    example: 35,
  })
  completedPoints: number;

  @ApiProperty({
    description: 'Remaining story points',
    example: 15,
  })
  remainingPoints: number;

  @ApiProperty({
    description: 'Completion percentage',
    example: 70,
  })
  completionPercentage: number;

  @ApiProperty({
    description: 'Burndown chart data points',
    type: [BurndownDataPointDto],
    example: [
      {
        date: '2025-01-01',
        idealRemaining: 50,
        actualRemaining: 50,
        completed: 0,
        added: 0,
      },
    ],
  })
  @Type(() => BurndownDataPointDto)
  chartData: BurndownDataPointDto[];

  @ApiProperty({
    description: 'Number of tasks in sprint',
    example: 12,
  })
  totalTasks: number;

  @ApiProperty({
    description: 'Number of completed tasks',
    example: 8,
  })
  completedTasks: number;
}
