import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaskStatusUpdateItemDto {
  @ApiProperty({ description: 'Task UUID', example: 'uuid-here' })
  @IsUUID()
  taskId: string;

  @ApiProperty({
    description: 'New status for the task (enum value or custom status name)',
    example: 'IN_PROGRESS',
  })
  @IsString()
  status: string;
}

export class BulkUpdateTaskStatusDto {
  @ApiProperty({
    description: 'Array of task ID + status pairs to update (min 1)',
    type: [TaskStatusUpdateItemDto],
    example: [
      { taskId: 'uuid-1', status: 'IN_PROGRESS' },
      { taskId: 'uuid-2', status: 'DONE' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TaskStatusUpdateItemDto)
  tasks: TaskStatusUpdateItemDto[];
}
