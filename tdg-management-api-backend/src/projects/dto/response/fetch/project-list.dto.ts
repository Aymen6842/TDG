import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ProjectSummaryDto } from './project-summary.dto';

export class ProjectListDto {
  @ApiProperty({
    description: 'List of projects',
    type: [ProjectSummaryDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        paid: false,
        status: 'Running',
        businessUnit: 'TawerDev',
        startDate: '2025-01-01 00:00:00',
        endDate: '2025-12-31 00:00:00',
        estimatedStartDate: '2025-01-15 00:00:00',
        estimatedEndDate: '2025-12-15 00:00:00',
        displayOrder: 1000,
        createdByName: 'John Doe',
        createdAt: '2025-01-15T10:30:00Z',
        memberCount: 5,
        name: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform',
      },
    ],
  })
  @Type(() => ProjectSummaryDto)
  data!: ProjectSummaryDto[];

  @ApiProperty({
    description: 'Pagination parameters',
    type: Object,
    example: {
      records: 25,
      currentPage: 1,
      totalPages: 3,
      perPage: 10,
    },
  })
  pagination!: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}
