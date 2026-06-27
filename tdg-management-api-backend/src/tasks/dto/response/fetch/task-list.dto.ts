import { ApiProperty } from '@nestjs/swagger';
import { TaskSummaryDto } from './task-summary.dto';

export class TaskListDto {
  @ApiProperty({
    description: 'List of tasks',
    type: [TaskSummaryDto],
    example: [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        title: 'Implement login feature',
        type: 'TASK',
        priority: 'HIGH',
        status: 'TODO',
        assigneeId: '550e8400-e29b-41d4-a716-446655440001',
        sprintId: '550e8400-e29b-41d4-a716-446655440002',
        epicId: null,
        milestoneId: null,
        storyPoints: 5,
        progressPercent: null,
        dueDate: '2026-03-15 00:00:00',
        displayOrder: 0,
        isFavorite: false,
        archived: false,
        createdAt: '2026-02-15 10:30:00',
      },
    ],
  })
  data!: TaskSummaryDto[];

  @ApiProperty({
    description: 'Pagination parameters',
    type: Object,
    example: {
      records: 50,
      currentPage: 1,
      totalPages: 5,
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
