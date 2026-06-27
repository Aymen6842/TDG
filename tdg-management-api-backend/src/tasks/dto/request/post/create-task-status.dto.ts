import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  MaxLength,
  Matches,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateTaskStatusDto {
  @ApiProperty({
    description: 'Status name',
    example: 'IN_REVIEW',
    maxLength: 50,
  })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiPropertyOptional({
    description: 'Status color (hex code)',
    example: '#F97316',
    default: '#6B7280',
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g. #F97316)',
  })
  color?: string;

  @ApiPropertyOptional({
    description: 'Display order (lower numbers appear first)',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Allowed transition status names',
    example: ['TODO', 'IN_PROGRESS'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  allowedTransitions?: string[];
}
