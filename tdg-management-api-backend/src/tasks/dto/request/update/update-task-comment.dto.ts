import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateTaskCommentDto {
  @ApiProperty({
    description: 'Updated comment content',
    example: 'Updated comment text',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
