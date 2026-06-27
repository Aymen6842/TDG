import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WorkDayOwnerDto } from './work-day-owner.dto';
import { WorkSessionDto } from './work-session.dto';

export class WorkDayForManagerDto {
  @ApiProperty({
    description: 'The id of the work session',
    example: 'id',
  })
  id: string;

  @ApiProperty({
    description: 'The owner of the work session',
    type: WorkDayOwnerDto,
  })
  @Type(() => WorkDayOwnerDto)
  user: WorkDayOwnerDto;

  @ApiProperty({
    description: 'work sessions',
    type: WorkSessionDto,
    isArray: true,
  })
  @Type(() => WorkSessionDto)
  workSessions: WorkSessionDto[];

  @ApiProperty({
    description: 'The performance rating given by the manager',
    example: 3,
  })
  performanceRating: number;

  @ApiProperty({
    description: 'The notes added by the manager',
    example: 'Good job on the project.',
  })
  managerNotes: string;

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
    description: 'The creation date of the work session',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the work session',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
