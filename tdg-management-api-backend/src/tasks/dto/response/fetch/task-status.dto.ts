import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskStatusDto {
  @ApiProperty({
    description: 'Status UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Project UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Status name',
    example: 'IN_REVIEW',
  })
  name!: string;

  @ApiProperty({
    description: 'Status hex color',
    example: '#F97316',
  })
  color!: string;

  @ApiProperty({
    description: 'Display order (lower numbers appear first)',
    example: 4,
  })
  displayOrder!: number;

  @ApiProperty({
    description: 'Whether this is a system status (cannot be modified/deleted)',
    example: false,
  })
  isSystem!: boolean;

  @ApiPropertyOptional({
    description: 'Allowed transition status names',
    example: ['IN_PROGRESS', 'TESTING'],
    type: [String],
  })
  allowedTransitions?: string[];

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-02-15 10:30:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toPlainOnly: true },
  )
  createdAt!: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2026-02-15 11:45:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toPlainOnly: true },
  )
  updatedAt!: Date;
}
