import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationParametersInResponse } from 'src/users/types/response.type';
import { TeamSummaryDto } from './team-summary.dto';

export class PaginateTeamsDto {
  @ApiProperty({
    type: 'object',
    properties: {
      records: { type: 'number', example: 3 },
      currentPage: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 1 },
    },
  })
  pagination: PaginationParametersInResponse;

  @ApiProperty({ type: TeamSummaryDto, isArray: true })
  @Type(() => TeamSummaryDto)
  data: TeamSummaryDto[];
}
