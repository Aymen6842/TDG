import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class BacklogTaskOrderDto {
  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'New display order',
    example: 0,
  })
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class ReorderBacklogDto {
  @ApiProperty({
    description: 'Array of tasks with new display orders',
    type: [BacklogTaskOrderDto],
    example: [
      { taskId: '550e8400-e29b-41d4-a716-446655440000', displayOrder: 0 },
      { taskId: '660e8400-e29b-41d4-a716-446655440001', displayOrder: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BacklogTaskOrderDto)
  tasks: BacklogTaskOrderDto[];
}
