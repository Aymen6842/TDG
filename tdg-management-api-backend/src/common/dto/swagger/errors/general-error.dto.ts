import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class GeneralErrorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The message of the error' })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The code of the error' })
  code: string;

  @IsArray()
  @IsNotEmpty()
  @ApiProperty({ description: 'the details of the error', required: false })
  details: string;
}
