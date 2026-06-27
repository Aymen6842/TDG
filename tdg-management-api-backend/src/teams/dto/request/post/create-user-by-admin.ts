import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserByAdminDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsOptional()
  @IsString()
  @IsPhoneNumber()
  @IsNotEmpty()
  @ApiProperty({ description: 'The phone number of the user' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiProperty({ description: 'The image of the user', required: false })
  @IsOptional()
  image?: string;

  @ApiHideProperty()
  unaccentedName?: string;

  @ApiProperty({
    description: 'the roles of the user',
    enum: UserType,
    isArray: true,
    example: [UserType.CEO],
  })
  @Transform(({ value }) => (value as string)?.split(','), {
    toClassOnly: true,
  })
  @IsArray()
  @IsEnum(UserType, { each: true })
  roles: UserType[];

  @ApiProperty({
    description: 'the teams ids of the user',
    enum: UserType,
    isArray: true,
    example: [UserType.CEO],
  })
  @IsOptional()
  @Transform(({ value }) => (value as string)?.split(','), {
    toClassOnly: true,
  })
  @IsArray()
  @IsString({ each: true })
  teamsIds?: string[];

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user', minLength: 7 })
  password: string;

  @ApiHideProperty()
  hashedPassword?: string;
}
