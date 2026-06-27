import { ApiProperty } from '@nestjs/swagger';
import { InvitationStatus } from '@prisma/client';

export class ProjectInvitationSummaryDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id!: string;

  @ApiProperty({
    description: 'Email',
    example: 'user@example.com',
  })
  email!: string;

  @ApiProperty({
    description: 'Invitation status',
    enum: InvitationStatus,
    example: 'PENDING',
  })
  status!: InvitationStatus;

  @ApiProperty({
    description: 'Expires at',
    example: '2026-04-01T00:00:00.000Z',
  })
  expiresAt!: Date | string;

  @ApiProperty({
    description: 'Created at',
    example: '2026-03-25T10:30:00.000Z',
  })
  createdAt!: Date | string;

  @ApiProperty({
    description: 'Invited by user ID',
    example: '123e4567-e89b-12d3-a456-426614174099',
  })
  invitedById!: string;

  @ApiProperty({
    description: 'Whether the invited user will be a project manager',
    example: false,
  })
  isManager!: boolean;
}
