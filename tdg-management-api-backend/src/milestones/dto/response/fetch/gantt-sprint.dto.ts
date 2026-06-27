import { ApiProperty } from '@nestjs/swagger';

export class GanttSprintDto {
  @ApiProperty({
    description: 'Sprint ID',
    example: '550e8400-e29b-41d4-a716-446655440002',
  })
  id: string;

  @ApiProperty({
    description: 'Sprint status',
    example: 'Running',
  })
  status: string;

  @ApiProperty({
    description: 'Sprint start date in Africa/Tunis timezone',
    example: '2026-03-01 00:00:00',
    nullable: true,
  })
  startDate: string | null;

  @ApiProperty({
    description: 'Sprint end date in Africa/Tunis timezone',
    example: '2026-03-14 00:00:00',
    nullable: true,
  })
  endDate: string | null;
}
