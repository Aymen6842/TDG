import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskTimeEntryDto {
  @ApiProperty({
    description: 'Time entry UUID',
    example: '550e8400-e29b-41d4-a716-446655440010',
  })
  id: string;

  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  taskId: string;

  @ApiProperty({
    description: 'User UUID',
    example: '550e8400-e29b-41d4-a716-446655440011',
  })
  userId: string;

  @ApiPropertyOptional({
    description: 'Linked work session UUID',
    example: '550e8400-e29b-41d4-a716-446655440012',
    nullable: true,
  })
  workSessionId?: string | null;

  @ApiProperty({
    description: 'Logged hours',
    example: 3.5,
  })
  hours: number;

  @ApiPropertyOptional({
    description: 'Optional time entry description',
    example: 'Investigated reminder permission behavior',
    nullable: true,
  })
  description?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2026-03-15 11:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  createdAt: Date | string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2026-03-15 12:15:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  updatedAt: Date | string;

  @ApiPropertyOptional({
    description: 'User summary when included by list endpoints',
    type: Object,
    example: {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Ahmed Ben Salah',
    },
  })
  user?: {
    id: string;
    name: string;
  };
}
