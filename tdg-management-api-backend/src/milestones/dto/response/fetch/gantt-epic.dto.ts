import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GanttEpicDto {
  @ApiProperty({
    description: 'Epic ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'Epic name',
    example: 'Authentication overhaul',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'Epic description',
    example: 'Refactor login, refresh, and RBAC workflows',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Epic start date in Africa/Tunis timezone',
    example: '2026-03-01 00:00:00',
    nullable: true,
  })
  startDate?: string | null;

  @ApiPropertyOptional({
    description: 'Epic end date in Africa/Tunis timezone',
    example: '2026-03-21 00:00:00',
    nullable: true,
  })
  endDate?: string | null;
}
