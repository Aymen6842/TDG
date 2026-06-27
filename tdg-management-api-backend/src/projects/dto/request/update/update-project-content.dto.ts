import { ApiHideProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProjectContentDto {
  @ApiPropertyOptional({
    description: 'Content ID (for existing content)',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiPropertyOptional({
    description: 'Content name',
    example: 'E-Commerce Platform Updated',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiHideProperty()
  @IsString()
  @IsOptional()
  unaccentedName?: string;

  @ApiPropertyOptional({
    description: 'Content description',
    example: 'Updated description for the e-commerce platform',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Content details',
    example: 'Updated details including new features and improvements',
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
