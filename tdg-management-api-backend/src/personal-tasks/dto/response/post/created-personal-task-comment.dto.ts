import { ApiProperty } from '@nestjs/swagger';

export class CreatedPersonalTaskCommentDto {
  @ApiProperty({
    description: 'Unique identifier of the personal task.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Content of the personal task comment.',
    example: 'This is a comment on the personal task.',
  })
  comment: string;

  @ApiProperty({
    description: 'Creation timestamp.',
    example: '2025-12-21T12:00:00.000Z',
    type: String,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2025-12-22T12:00:00.000Z',
    type: String,
  })
  updatedAt: Date;
}
