import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class MoveTaskInKanbanDto {
  @ApiProperty({
    description: 'Task UUID to move',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'Target Kanban status (enum value or custom status name)',
    example: 'IN_PROGRESS',
  })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    description: 'New display order in the column',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;
}
