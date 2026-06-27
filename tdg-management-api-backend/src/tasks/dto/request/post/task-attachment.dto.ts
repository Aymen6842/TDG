import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TaskAttachmentDto {
  @ApiProperty({
    description: 'Attachment file path/URL',
    example: '/uploads/tasks/attachment.pdf',
  })
  @IsString()
  @IsNotEmpty()
  file: string;
}
