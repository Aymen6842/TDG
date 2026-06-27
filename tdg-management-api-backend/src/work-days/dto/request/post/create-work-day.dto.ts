import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { WorkSessionDevice, WorkSessionLocation } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class CreateWorkDayDto {
  @ApiProperty({
    description: 'The id of work day',
    example: 'id',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  workDayId?: string;

  @ApiHideProperty()
  userId: string;

  @ApiHideProperty()
  startTime: string;

  @ApiProperty({
    description: 'The device used for the work session',
    example: 'DESKTOP',
    enum: WorkSessionDevice,
  })
  @IsEnum(WorkSessionDevice)
  device: WorkSessionDevice;

  @ApiProperty({
    description: 'The locations to filter work sessions',
    example: WorkSessionLocation.ONSITE,
    enum: WorkSessionLocation,
  })
  @IsEnum(WorkSessionLocation)
  location: WorkSessionLocation;
}
