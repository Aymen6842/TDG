import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';

export class CreatedInvitationDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id: string;

  @ApiProperty({
    description: 'Invited email',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Invitation token',
    example: '7dcac1ab-43b9-4fe7-8b8e-8d5a4c8f9ce1',
  })
  token: string;

  @ApiProperty({
    description: 'Invitation status',
    example: 'PENDING',
  })
  status: string;

  @ApiProperty({
    description: 'Expiration date',
    example: '2026-04-01 00:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  expiresAt: Date | string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiProperty({
    description: 'Created at',
    example: '2026-03-25 10:30:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  createdAt: Date | string;
}
