import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class InternalServerErrorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'Server Error!' })
  message: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ default: 'P1001' })
  code: string;
}
