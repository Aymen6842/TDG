import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description:
      'Should this person be a project manager? (true = MANAGER, false = TEAM_MEMBER). Default: false',
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  isManager?: boolean;

  @ApiPropertyOptional({
    description: 'Number of days until invitation expires (default: 7 days)',
    example: 7,
  })
  @IsOptional()
  expiresInDays?: number;
}
