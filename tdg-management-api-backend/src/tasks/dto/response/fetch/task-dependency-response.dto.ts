import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskDependencyResponseDto {
  @ApiProperty({
    description: 'Dependency UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Blocking task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  blockingTaskId: string;

  @ApiProperty({
    description: 'Blocked task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  blockedTaskId: string;

  @ApiProperty({ description: 'Dependency type', example: 'blocks' })
  dependencyType: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-02-15T10:30:00.000Z',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  createdAt: Date;
}
