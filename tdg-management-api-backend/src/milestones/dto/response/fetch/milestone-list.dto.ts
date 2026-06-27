import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { MilestoneSummaryDto } from './milestone-summary.dto';

export class MilestoneListDto {
  @ApiProperty({
    description: 'List of milestones',
    type: [MilestoneSummaryDto],
  })
  @Type(() => MilestoneSummaryDto)
  data: MilestoneSummaryDto[];

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
