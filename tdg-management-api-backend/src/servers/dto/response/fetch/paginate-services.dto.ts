import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationParametersInResponse } from 'src/servers/types/response.type';
import { ServiceSummaryDto } from './service-summary.dto';

export class PaginateServicesDto {
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
  @ApiProperty({ type: ServiceSummaryDto, isArray: true })
  @Type(() => ServiceSummaryDto)
  data: ServiceSummaryDto[];
}
