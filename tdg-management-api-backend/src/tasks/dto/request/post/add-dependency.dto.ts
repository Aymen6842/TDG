import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddDependencyDto {
  @ApiProperty({
    description: 'UUID of the blocking task',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  blockingTaskId: string;
}
