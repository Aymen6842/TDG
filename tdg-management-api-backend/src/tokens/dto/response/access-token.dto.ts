import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AccessTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'The token' })
  access: string;
}
