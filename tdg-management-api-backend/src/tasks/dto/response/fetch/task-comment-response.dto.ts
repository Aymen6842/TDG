import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class TaskCommentResponseDto {
  @ApiProperty({
    description: 'Comment UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Comment content',
    example: 'This is a comment',
  })
  content: string;

  @ApiProperty({
    description: 'Author UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  authorId: string;

  @ApiProperty({
    description: 'Created at timestamp',
    example: '2026-02-15 10:30:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at timestamp',
    example: '2026-02-15 10:30:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  updatedAt: Date;
}
