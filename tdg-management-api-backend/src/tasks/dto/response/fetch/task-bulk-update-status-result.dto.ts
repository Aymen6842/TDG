import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TaskBulkUpdateStatusResultDto {
  @ApiProperty({
    description: 'Task UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  taskId: string;

  @ApiProperty({
    description: 'Whether the update succeeded for this task',
    example: true,
  })
  success: boolean;

  @ApiPropertyOptional({
    description: 'Failure reason when the update does not succeed',
    example: 'Task not found',
  })
  error?: string;
}
