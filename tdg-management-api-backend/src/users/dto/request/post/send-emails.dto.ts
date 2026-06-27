import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class SendEmailsDto {
  @ApiProperty({
    description: 'Is it for all users or specific emails',
    example: false,
    required: true,
  })
  @IsOptional()
  @IsBoolean()
  isAllUsers?: boolean;

  @ApiProperty({
    description: 'The list of email addresses to send the email to',
    example: ['example@example.com'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];

  @ApiProperty({
    description: 'The cc email addresses to send the email to',
    example: ['example@gmail.com'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cc?: string[];

  @ApiProperty({
    description: 'The bcc email addresses to send the email to',
    example: ['example@outlook.com'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  bcc?: string[];

  @ApiProperty({
    description: 'The subject of the email',
    example: 'Welcome to Our Service',
    required: true,
  })
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'The body text of the email',
    example: 'Thank you for registering with our service.',
    required: true,
  })
  @IsString()
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
  @IsOptional()
  attachments?: Express.Multer.File[];
}
