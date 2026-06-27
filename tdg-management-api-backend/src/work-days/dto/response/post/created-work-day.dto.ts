import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreatedWorkSessionDto } from './created-work-session.dto';

export class CreatedWorkDayDto {
  @ApiProperty({
    description: 'The id of the work session',
    example: 'id',
  })
  id: string;

  @ApiProperty({
    description: 'work sessions',
    type: CreatedWorkSessionDto,
    isArray: true,
  })
  @Type(() => CreatedWorkSessionDto)
  workSessions: CreatedWorkSessionDto[];

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
