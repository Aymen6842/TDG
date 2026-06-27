import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class SprintAttachmentDto {
  @ApiProperty({
    description: 'Attachment file path/URL',
    example: '/uploads/sprints/attachment.pdf',
  })
  @IsString()
  @IsNotEmpty()
  file!: string;
}
