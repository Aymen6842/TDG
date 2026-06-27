import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTaskCommentMentionDto } from './create-task-comment-mention.dto';

/**
 * DTO for creating a task comment with optional mentions
 */
export class CreateTaskCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Hey @john, can you review this task?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({
    description: 'Array of user UUIDs to mention in the comment',
    type: [CreateTaskCommentMentionDto],
    example: [{ userId: '550e8400-e29b-41d4-a716-446655440000' }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTaskCommentMentionDto)
  mentions?: CreateTaskCommentMentionDto[];
}
