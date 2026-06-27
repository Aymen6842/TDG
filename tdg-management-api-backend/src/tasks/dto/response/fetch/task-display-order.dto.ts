import { ApiProperty } from '@nestjs/swagger';

export class TaskDisplayOrderDto {
  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Task display order',
    example: 10,
  })
  displayOrder: number;
}
