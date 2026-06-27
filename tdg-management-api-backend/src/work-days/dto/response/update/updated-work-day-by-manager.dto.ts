import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { UpdatedWorkSessionDto } from './updated-work-session.dto';

export class UpdatedWorkDayByManagerDto {
  @ApiProperty({
    description: 'The id of the work day',
    example: 'id',
  })
  id: string;
  @ApiProperty({
    description: 'The daily mood reported by the worker',
    example: 3,
  })
  dailyMood: number;

  @ApiProperty({
    description: 'The notes added by the manager',
    example: 'Good job on the project.',
  })
  workerNotes: string;

  @ApiProperty({
    description: 'work sessions',
    type: [UpdatedWorkSessionDto],
    isArray: true,
  })
  @Type(() => UpdatedWorkSessionDto)
  workSessions: UpdatedWorkSessionDto[];

  @ApiProperty({
    description: 'The performance rating given by the manager',
    example: 4,
  })
  performanceRating: number;

  @ApiProperty({
    description: 'The notes added by the manager',
    example: 'Needs improvement in time management.',
  })
  managerNotes: string;

  @ApiProperty({
    description: 'The creation date of the work day',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the work day',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
