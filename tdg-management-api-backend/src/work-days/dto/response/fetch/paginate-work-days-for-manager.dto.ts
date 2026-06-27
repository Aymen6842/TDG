import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationParametersInResponse } from 'src/work-days/types/response.type';
import { WorkDayForManagerDto } from './work-day-for-manager.dto';

export class PaginateWorkDaysForManagerDto {
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
  @ApiProperty({ type: WorkDayForManagerDto, isArray: true })
  @Type(() => WorkDayForManagerDto)
  data: WorkDayForManagerDto[];
}
