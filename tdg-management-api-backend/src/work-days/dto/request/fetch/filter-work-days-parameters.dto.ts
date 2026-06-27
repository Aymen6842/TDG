import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationParametersRequestDto } from './pagination-parameters.dto';
import { WorkSessionLocation } from '@prisma/client';

export class FilterWrokDaysParametersDto extends PaginationParametersRequestDto {
  @ApiProperty({
    description: 'The ids of the users to filter work sessions',
    example: 'userId1,userId2,userId3',
  })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(',') ?? [], {
    toClassOnly: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  usersIds?: string[];

  @ApiProperty({
    description: 'The locations to filter work sessions',
    example: WorkSessionLocation.ONSITE,
    enum: WorkSessionLocation,
  })
  @IsOptional()
  @IsEnum(WorkSessionLocation)
  location?: WorkSessionLocation;

  @ApiProperty({
    description: 'The ids of the teams to filter work sessions',
    example: 'teamId1,teamId2,teamId3',
  })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(',') ?? [], {
    toClassOnly: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  teamIds?: string[];

  @ApiProperty({
    description: 'the performance rating to filter work sessions',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  performanceRating?: number;

  @ApiProperty({
    description: 'the daily mood to filter work sessions',
    example: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  dailyMood?: number;

  @ApiProperty({
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  startTime?: string;

  @ApiProperty({
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  endTime?: string;

  @ApiProperty({
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  from?: string;

  @ApiProperty({
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  to?: string;
}
