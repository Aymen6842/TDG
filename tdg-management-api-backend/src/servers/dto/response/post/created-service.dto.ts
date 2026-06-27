import { ApiProperty } from '@nestjs/swagger';
import { ServerServiceStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { TimeService } from 'src/common/time/service/time.service';

export class CreatedServiceDto {
  @ApiProperty({ description: 'The id of the service', example: '1' })
  id: string;

  @ApiProperty({
    description: 'The name of the service',
    example: 'Service 1',
  })
  name: string;

  @ApiProperty({
    description: 'The domain of the service',
    example: 'api.example.com',
  })
  domain: string;

  @ApiProperty({
    description: 'Description of the service',
    example: 'Description of the service',
  })
  description: string;

  @ApiProperty({
    description: 'Indicates if the service has an SSL certificate',
    default: false,
  })
  sslCertificate: boolean;

  @ApiProperty({
    description: 'SSL certificate provided by cloud provider',
    default: false,
  })
  sslCertificateByCloudProvider: boolean;

  @ApiProperty({
    description: 'Indicates if the service has a backup',
    default: false,
  })
  hasBackup: boolean;

  @ApiProperty({
    description: 'Indicates the destination of the backup',
    default: false,
  })
  backupDestination: string;

  @ApiProperty({
    description: 'Indicates if the service is paid',
    default: false,
  })
  paid: boolean;

  @ApiProperty({
    description: 'Service status',
    enum: ServerServiceStatus,
    example: ServerServiceStatus.Running,
  })
  @IsEnum(ServerServiceStatus)
  status: ServerServiceStatus;

  @ApiProperty({
    description: 'Paid date',
    example: '2026-01-01T00:00:00Z',
  })
  paidAt: Date;

  @ApiProperty({
    description: 'Expiration date',
    example: '2026-01-01T00:00:00Z',
  })
  expiredAt: Date;

  @ApiProperty({
    type: 'string',
    description: 'The time of the server creation',
    default: '2025-05-06 18:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tripoli'),
    { toClassOnly: true },
  )
  createdAt: string;

  @ApiProperty({
    type: 'string',
    description: 'The time of the server update',
    default: '2025-05-06 18:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tripoli'),
    { toClassOnly: true },
  )
  updatedAt: string;
}
