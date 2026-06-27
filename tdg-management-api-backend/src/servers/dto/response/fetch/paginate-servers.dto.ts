import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationParametersInResponse } from 'src/servers/types/response.type';
import { ServerSummaryDto } from './server-summary.dto';

export class PaginateServersDto {
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
  @ApiProperty({ type: ServerSummaryDto, isArray: true })
  @Type(() => ServerSummaryDto)
  data: ServerSummaryDto[];
}
