import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RequestResetPasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;
}

export class VerificationResetPasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @ApiProperty({
    description: 'The code sent to the email, the length of the code is 5',
  })
  code: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5)
  @ApiProperty({
    description: 'The code sent to the email, the length of the code is 5',
  })
  code: string;

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({ description: 'The updated passwordof the user' })
  password: string;
}
