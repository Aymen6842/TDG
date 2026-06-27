import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { PaginationParametersRequestDto } from './pagination-parameters.dto';
import { TimeService } from 'src/common/time/service/time.service';

export class FilterWorkDaysStatisticsParametersDto extends PaginationParametersRequestDto {
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
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  from: string = TimeService.getPastDateByYears(1);

  @ApiProperty({
    description: 'Filter work sessions by start time',
    example: '2023-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  to: string = TimeService.getCurrentTime();
}
