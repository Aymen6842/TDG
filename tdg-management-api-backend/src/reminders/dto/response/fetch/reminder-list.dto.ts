import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReminderSummaryDto } from './reminder-summary.dto';

/**
 * Reminder list DTO - Paginated list response
 * Used by GET /projects/:projectId/reminders
 */
export class ReminderListDto {
  @ApiProperty({
    description: 'List of reminders',
    type: [ReminderSummaryDto],
  })
  @Type(() => ReminderSummaryDto)
  data: ReminderSummaryDto[];

  @ApiProperty({
    description: 'Pagination information',
    example: {
      records: 50,
      currentPage: 1,
      totalPages: 3,
      perPage: 20,
    },
  })
  pagination: {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  };
}
