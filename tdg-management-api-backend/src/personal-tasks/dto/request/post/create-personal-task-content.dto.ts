import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreatePersonalTaskContentDto {
  @ApiProperty({
    description: 'The title of the task',
    example: 'Design Homepage',
    required: true,
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'The description of the task',
    example: 'Create a responsive design for the homepage',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The details of the task',
    example:
      'This task involves creating wireframes and mockups for the homepage design.',
    required: false,
  })
  @IsOptional()
  @IsString()
  details?: string;
}
