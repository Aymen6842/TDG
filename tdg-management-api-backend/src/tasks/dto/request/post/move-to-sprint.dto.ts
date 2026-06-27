import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class MoveToSprintDto {
  @ApiProperty({
    description: 'Sprint UUID to move the task to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  sprintId: string;
}
