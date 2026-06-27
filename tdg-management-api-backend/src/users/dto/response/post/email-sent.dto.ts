import { ApiProperty } from '@nestjs/swagger';

export class EmailSentDto {
  @ApiProperty({
    description: 'The list of email addresses to send the email to',
    example: ['example@example.com'],
    isArray: true,
  })
  emails: string[];

  @ApiProperty({
    description: 'The cc email addresses to send the email to',
    example: ['example@gmail.com'],
    isArray: true,
    required: false,
  })
  cc: string[];

  @ApiProperty({
    description: 'The bcc email addresses to send the email to',
    example: ['example@outlook.com'],
    isArray: true,
    required: false,
  })
  bcc: string[];

  @ApiProperty({
    description: 'The subject of the email',
    example: 'Welcome to Our Service',
    required: true,
  })
  subject: string;

  @ApiProperty({
    description: 'The body text of the email',
    example: 'Thank you for registering with our service.',
    required: true,
  })
  text: string;

  @ApiProperty({
    description: 'The attachments for the email',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  attachments: Express.Multer.File[];
}
