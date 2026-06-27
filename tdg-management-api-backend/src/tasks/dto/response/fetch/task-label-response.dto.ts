import { ApiProperty } from '@nestjs/swagger';

/** Lightweight response for a label when embedded inside a task */
export class TaskLabelResponseDto {
  @ApiProperty({
    description: 'Label UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id!: string;

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
}
