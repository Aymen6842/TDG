import { ApiProperty } from '@nestjs/swagger';

export class TaskLabelAssignmentResponseDto {
  @ApiProperty({
    description: 'Task label assignment UUID',
    example: '550e8400-e29b-41d4-a716-446655440020',
  })
  id: string;

  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  taskId: string;

  @ApiProperty({
    description: 'Label UUID',
    example: '550e8400-e29b-41d4-a716-446655440021',
  })
  labelId: string;
}
