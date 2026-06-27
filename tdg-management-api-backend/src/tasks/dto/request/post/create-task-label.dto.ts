import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Matches, MaxLength } from 'class-validator';

export class CreateTaskLabelDto {
  @ApiProperty({
    description: 'Label name',
    example: 'Frontend',
  })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiPropertyOptional({
    description: 'Label color (hex code)',
    example: '#FF5733',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'color must be a valid hex color code (e.g. #FF5733)',
  })
  color?: string | null;
}
