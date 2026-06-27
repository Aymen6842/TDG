import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskMoveToSprintResponseDto {
  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Task key',
    example: 'TDG-12',
  })
  key: string;

  @ApiProperty({
    description: 'Task title',
    example: 'Move reminder access validation to sprint',
  })
  title: string;

  @ApiProperty({
    description: 'Assigned sprint UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  sprintId: string;

  @ApiProperty({
    description: 'Task status after the move',
    example: 'TODO',
  })
  status: string;

  @ApiProperty({
    description: 'Task display order',
    example: 0,
  })
  displayOrder: number;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-15 11:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  updatedAt: Date | string;
}
