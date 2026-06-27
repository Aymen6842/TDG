import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Language } from '@prisma/client';

export class SprintContentDto {
  @ApiProperty({
    description: 'Sprint content name',
    example: 'Sprint 1 - Authentication',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Content language',
    enum: Language,
    example: Language.English,
  })
  @IsEnum(Language)
  @IsNotEmpty()
  language: Language;

  @ApiPropertyOptional({
    description: 'Sprint description',
    example: 'Complete user authentication feature',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Sprint details',
    example: 'Detailed breakdown of tasks',
  })
  @IsString()
  @IsOptional()
  details?: string;

  unaccentedName: string;
}
