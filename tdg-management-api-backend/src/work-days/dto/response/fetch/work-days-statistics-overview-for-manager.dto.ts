import { ApiProperty } from '@nestjs/swagger';

export class WorkDaysStatisticsOverviewForManagerDto {
  @ApiProperty({
    description: 'Average daily mood across all work days',
    example: '3.75',
    type: String,
  })
  avgDailyMood: string;

  @ApiProperty({
    description: 'Average performance rating across all work days',
    example: '4.20',
    type: String,
  })
  avgPerformanceRating: string;

  @ApiProperty({
    description: 'Total number of work sessions',
    example: 12,
    type: Number,
  })
  totalWorkSessions: number;

  @ApiProperty({
    description: 'Total time spent across all sessions (in minutes)',
    example: 540,
    type: Number,
  })
  totalTimeSpentInMinutes: number;

  @ApiProperty({
    description: 'Average time spent per session (in minutes)',
    example: '45.00',
    type: String,
  })
  avgTimeSpentInMinutes: string;

  @ApiProperty({
    description: 'Earliest start time among all work sessions',
    example: '2025-12-01 08:00:00',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  earliestStartTime: Date | null;

  @ApiProperty({
    description: 'Latest end time among all work sessions',
    example: '2025-12-01 18:00:00',
    nullable: true,
    type: String,
    format: 'date-time',
  })
  latestEndTime: Date | null;
}
