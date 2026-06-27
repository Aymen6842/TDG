import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

const transformCsvOrArray = ({ value }: { value: unknown }): unknown => {
  if (Array.isArray(value)) {
    return value as unknown;
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  return value;
};

export class UpdateUserDetailsByAdminDto {
  @ApiProperty({
    description: 'the roles of the user',
    enum: UserType,
    example: 'CTO,CEO',
  })
  @IsOptional()
  @Transform(transformCsvOrArray, {
    toClassOnly: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one role must be specified' })
  @IsEnum(UserType, { each: true })
  roles?: UserType[];

  @ApiProperty({
    description: 'is the user active or not',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'the teams ids of the user',
    enum: UserType,
    isArray: true,
    example: [UserType.CEO],
  })
  @IsOptional()
  @Transform(transformCsvOrArray, {
    toClassOnly: true,
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'At least one team ID must be specified' })
  @IsString({ each: true })
  teamsIds?: string[];

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
    description: 'The image path of the user',
    example: '/images/johndoe.jpg',
    required: false,
  })
  @IsOptional()
  image?: string;

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
  @IsString()
  email?: string;

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
    description: 'The telegram chat ID of the user',
    example: '1234567890',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  telegramChatId?: string;

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
    description: 'Enable push notifications for the user',
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
  pushNotificationsEnabled?: boolean;

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
