import { ApiProperty } from '@nestjs/swagger';

export class BurndownDataPointDto {
  @ApiProperty({
    description: 'Date of the data point',
    example: '2025-01-15',
  })
  date: string;

  @ApiProperty({
    description: 'Remaining story points (ideal)',
    example: 40,
  })
  idealRemaining: number;

  @ApiProperty({
    description: 'Actual remaining story points',
    example: 38,
  })
  actualRemaining: number | null;

  @ApiProperty({
    description: 'Completed story points on this day',
    example: 2,
  })
  completed: number;

  @ApiProperty({
    description: 'Added story points on this day',
    example: 0,
  })
  added: number;
}
