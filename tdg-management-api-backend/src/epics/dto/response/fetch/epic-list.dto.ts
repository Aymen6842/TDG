import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EpicSummaryDto } from './epic-summary.dto';

export class EpicListDto {
  @ApiProperty({
    description: 'List of epics',
    type: [EpicSummaryDto],
  })
  @Type(() => EpicSummaryDto)
  data: EpicSummaryDto[];

  @ApiProperty({
    description: 'Pagination information',
    type: Object,
    example: {
      records: 10,
      currentPage: 1,
      totalPages: 1,
      perPage: 10,
    },
  })
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}
