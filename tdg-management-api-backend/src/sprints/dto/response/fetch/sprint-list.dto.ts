import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { SprintSummaryDto } from './sprint-summary.dto';

export class SprintListDto {
  @ApiProperty({
    description: 'List of sprints',
    type: [SprintSummaryDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        projectId: '123e4567-e89b-12d3-a456-426614174001',
        createdById: '123e4567-e89b-12d3-a456-426614174099',
        name: 'Sprint 1 - Authentication',
        description: 'User authentication and authorization features',
        startDate: '2025-01-01 00:00:00',
        endDate: '2025-01-31 00:00:00',
        estimatedStartDate: '2025-01-01 00:00:00',
        estimatedEndDate: '2025-01-31 00:00:00',
        status: 'Running',
        createdAt: '2025-01-15 11:30:00',
        updatedAt: '2025-01-20 15:45:00',
      },
    ],
  })
  @Type(() => SprintSummaryDto)
  data: SprintSummaryDto[];

  @ApiProperty({
    description: 'Pagination parameters',
    type: Object,
    example: {
      records: 24,
      currentPage: 1,
      totalPages: 3,
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
