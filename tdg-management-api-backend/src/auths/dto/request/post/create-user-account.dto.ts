import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserAccountDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The phone number of the user' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiHideProperty()
  unaccentedName?: string;

  @ApiProperty({
    description: 'The image of the user',
    type: 'string',
    format: 'binary',
    required: false,
  })
  image?: string;

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user', minLength: 7 })
  password: string;

  @ApiHideProperty()
  hashedPassword?: string;

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
    description: 'Enable ntfy notifications for the user',
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
}
