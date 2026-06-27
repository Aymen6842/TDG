import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class InvalidDataErrorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'The provided data is invalid!' })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'P1000' })
  code: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ default: ['email must be an email'] })
  details: string;
}
