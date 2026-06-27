import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreatePersonalTaskCommentDto {
  @ApiProperty({
    description: 'taks id of the personal task',
    example: 'uuid-string',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @ApiProperty({
    description: 'taks id of the personal task',
    example: 'uuid-string',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  comment: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userId?: string;
}
