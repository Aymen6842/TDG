import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNotEmpty,
} from 'class-validator';

export class CreateEpicDto {
  @ApiProperty({
    description: 'Epic name',
    example: 'User Authentication System',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Epic description',
    example: 'Complete user authentication system with JWT',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Hex color for UI',
    example: '#FF5733',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  color?: string | null;

  @ApiPropertyOptional({
    description: 'Epic start date',
    example: '2026-03-01T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string | null;

  @ApiPropertyOptional({
    description: 'Epic end date',
    example: '2026-06-30T00:00:00.000Z',
    nullable: true,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string | null;
}
