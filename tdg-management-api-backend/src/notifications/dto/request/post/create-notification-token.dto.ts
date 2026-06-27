import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateNotificationTokenDto {
  @ApiHideProperty()
  @IsOptional()
  @IsString()
  userId?: string | null;

  @ApiProperty({
    description: 'The name of the token.',
    required: true,
    example: 'token of firebase',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'The device of the user.',
    required: false,
    example: 'Iphone 13',
  })
  @IsString()
  device: string;

  @ApiProperty({
    description: 'The type of the device.',
    required: false,
    example: DeviceType.Android,
  })
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty({
    description: 'The height of the device.',
    required: false,
    example: '844',
  })
  @IsOptional()
  @IsNumber()
  deviceHeight?: number;

  @ApiProperty({
    description: 'The width of the device.',
    required: false,
    example: '390',
  })
  @IsOptional()
  @IsNumber()
  deviceWidth?: number;
}
