import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateNotificationContentDto {
  @ApiProperty({
    description: 'The title of the notification.',
    required: true,
    example: 'Create',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The message/body of the notification.',
    required: true,
    example: 'Create is successful',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: 'The url of the notification.',
    required: false,
    example: 'https://example.com/notification',
  })
  @IsOptional()
  @IsString()
  url?: string;
}
