import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

export class AddMemberDto {
  @ApiPropertyOptional({
    description:
      'User ID - ONLY executives (CEO/CTO/CMO) can use this to add direct members',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Email - for invitation (executives + project managers)',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    description:
      'Is this person a project manager? (true = MANAGER, false = TEAM_MEMBER)',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isManager: boolean;

  @ApiPropertyOptional({
    description: 'Number of days until invitation expires (default: 7 days)',
    example: 7,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  expiresInDays?: number;
}
