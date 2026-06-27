import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class LoginUserDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user', required: false })
  @ValidateIf((obj) => !(obj as LoginUserDto).phone)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber()
  @ApiProperty({ description: 'The phone number of the user', required: false })
  @ValidateIf((obj) => !(obj as LoginUserDto).email)
  phone?: string;

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({
    description: 'The password of the user',
    minLength: 7,
    required: false,
  })
  password: string;
}
