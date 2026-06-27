import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsBoolean, IsOptional, ValidateIf } from 'class-validator';

export class ProjectMemberDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((_, value: unknown) => {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Is manager',
    default: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isManager?: boolean;
}
