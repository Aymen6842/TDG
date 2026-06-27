import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateProjectMemberPayloadDto {
  @ApiPropertyOptional({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
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
