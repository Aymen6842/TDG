import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

export class UpdateOwnDetailsDto {
  @ApiProperty({
    description: 'The image path of the user',
    example: '/images/johndoe.jpg',
    required: false,
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiHideProperty()
  unaccentedName?: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: '+1234567890',
    required: false,
  })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({
    description: 'The email of the user',
    example: 'user@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'The telegram chat ID of the user',
    example: '1234567890',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  telegramChatId?: string;

  @ApiProperty({
    description: 'The ntfy topic of the user',
    example: 'user-notifications',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  ntfyTopic?: string;

  @ApiProperty({
    description: 'Enable email notifications for the user',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : (value as string),
    {
      toClassOnly: true,
    },
  )
  @IsBoolean()
  emailNotificationsEnabled?: boolean;

  @ApiProperty({
    description: 'Enable telegram notifications for the user',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : (value as string),
    {
      toClassOnly: true,
    },
  )
  @IsBoolean()
  telegramNotificationsEnabled?: boolean;

  @ApiProperty({
    description: 'Enable telegram notifications for the user',
    example: true,
    type: Boolean,
    required: false,
  })
  @IsOptional()
  @Transform(
    ({ value }) =>
      value === 'true' ? true : value === 'false' ? false : (value as string),
    {
      toClassOnly: true,
    },
  )
  @IsBoolean()
  ntfyNotificationsEnabled?: boolean;
}
