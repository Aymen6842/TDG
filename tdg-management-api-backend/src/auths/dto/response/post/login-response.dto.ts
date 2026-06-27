import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsNotEmpty } from 'class-validator';

export class LoginResponseDto {
  @IsJWT()
  @IsNotEmpty()
  @ApiProperty({ description: 'The access token.' })
  access: string;

  @IsJWT()
  @IsNotEmpty()
  @ApiProperty({ description: 'The refresh token.' })
  refresh: string;
}
