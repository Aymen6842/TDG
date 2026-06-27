import { ApiProperty } from '@nestjs/swagger';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

export class SprintAttachmentResponseDto {
  @ApiProperty({
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  id: string;

  @ApiProperty({
    description: 'Attachment path/URL',
    example: '/uploads/sprints/sprint-1/design.pdf',
  })
  attachment: string;

  @ApiProperty({ description: 'Created at', example: '2025-01-15T10:30:00.000Z' })
  @ToIsoDateString()
  createdAt: Date | string;
}
