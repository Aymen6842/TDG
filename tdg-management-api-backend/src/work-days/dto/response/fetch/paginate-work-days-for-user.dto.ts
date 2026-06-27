import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationParametersInResponse } from 'src/work-days/types/response.type';
import { WorkDayForUserDto } from './work-day-for-user.dto';

export class PaginateWorkDaysForUserDto {
  @Expose()
  @ApiProperty({
    type: 'object',
    properties: {
      records: { type: 'number', example: 3 },
      currentPage: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 1 },
    },
  })
  pagination: PaginationParametersInResponse;

  @Expose()
  @ApiProperty({ type: WorkDayForUserDto, isArray: true })
  @Type(() => WorkDayForUserDto)
  data: WorkDayForUserDto[];
}
