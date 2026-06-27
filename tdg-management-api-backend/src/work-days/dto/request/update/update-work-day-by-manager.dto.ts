import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateWorkDayByManagerDto {
  @ApiProperty({
    description:
      'The performance rating given by the manager during the work session',
    example: 5,
  })
  @IsOptional()
  @Min(0)
  @Max(5)
  @IsNumber()
  performanceRating: number;

  @ApiProperty({
    description: 'The notes of the work session',
    example: 'Worked on project X',
  })
  @IsOptional()
  @IsString()
  managerNotes: string;
}
