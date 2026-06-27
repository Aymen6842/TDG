import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

export class ProjectContentDto {
  @ApiProperty({ description: 'Content name', example: 'E-Commerce Platform' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiHideProperty()
  unaccentedName: string;

  @ApiPropertyOptional({
    description: 'Content description',
    example: 'A full-featured e-commerce platform for online retail',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Content details',
    example:
      'This project includes product management, cart, checkout, and payment integration',
  })
  @IsString()
  @IsOptional()
  details?: string;

  @ApiPropertyOptional({
    description: 'Content language',
    enum: Language,
    example: 'English',
  })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
