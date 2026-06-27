import { ApiProperty } from '@nestjs/swagger';

import { TaskBulkUpdateStatusResultDto } from './task-bulk-update-status-result.dto';

export class TaskBulkUpdateStatusResponseDto {
  @ApiProperty({
    description: 'Per-task bulk status update results',
    type: [TaskBulkUpdateStatusResultDto],
  })
  results: TaskBulkUpdateStatusResultDto[];
}
