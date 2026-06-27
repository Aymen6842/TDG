import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateWorkDayByWorkerDto {
  @ApiHideProperty()
  userId?: string;

  @ApiHideProperty()
  endTime?: string;

  @ApiHideProperty()
  timeSpentInMinutes?: number;

  @ApiProperty({
    description: 'The mood of the worker during the work session',
    example: 5,
  })
  @IsOptional()
  @Min(0)
  @Max(5)
  @IsNumber()
  dailyMood?: number;

  @ApiProperty({
    description: 'The notes of the work session',
    example: 'Worked on project X',
  })
  @IsOptional()
  @IsString()
  workerNotes?: string;
}
