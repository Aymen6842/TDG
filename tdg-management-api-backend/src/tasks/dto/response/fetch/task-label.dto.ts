import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskLabelDto {
  @ApiProperty({
    description: 'Label UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

  @ApiProperty({
    description: 'Project UUID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Label name',
    example: 'frontend',
  })
  name!: string;

  @ApiProperty({
    description: 'Label hex color',
    example: '#6B7280',
  })
  color!: string;

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
