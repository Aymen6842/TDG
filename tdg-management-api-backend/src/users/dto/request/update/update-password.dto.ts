import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user', minLength: 7 })
  oldPassword: string;

  @IsString()
  @MinLength(7)
  @IsNotEmpty()
  @ApiProperty({ description: 'The password of the user', minLength: 7 })
  newPassword: string;
}
