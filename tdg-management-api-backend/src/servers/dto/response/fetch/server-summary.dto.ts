import { ApiProperty } from '@nestjs/swagger';
import { ServerServiceStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';
import { ServerManagerDto } from './server-manager.dto';

export class ServerSummaryDto {
  @ApiProperty({ description: 'The id of the server', example: '1' })
  id: string;

  @ApiProperty({ description: 'The name of the server', example: 'Server 1' })
  name: string;

  @ApiProperty({
    description: 'The domain of the server',
    example: 'example.com',
  })
  domain: string;

  @ApiProperty({
    description: 'Description of the server',
    example: 'This is a description of the server',
  })
  description: string;

  @ApiProperty({
    description: 'IP address of the server',
    example: '192.168.1.1',
  })
  ip: string;

  @ApiProperty({
    description: 'CPU configuration',
    example: '8 vCPUs',
  })
  cpus: string;

  @ApiProperty({
    description: 'RAM configuration',
    example: '32 GB',
  })
  ram: string;

  @ApiProperty({
    description: 'Storage configuration',
    example: '1 TB SSD',
  })
  storage: string;

  @ApiProperty({
    description: 'Bandwidth information',
    example: '10 TB/month',
  })
  bandwidth: string;

  @ApiProperty({
    description: 'Is backup managed by cloud provider',
    default: false,
  })
  backupCloudProvider: boolean;

  @ApiProperty({
    description: 'Is the server paid',
    default: false,
  })
  paid: boolean;

  @ApiProperty({
    description: 'Server status',
    enum: ServerServiceStatus,
    example: ServerServiceStatus.Running,
  })
  status: ServerServiceStatus;

  @ApiProperty({
    description: 'Paid date',
    required: false,
    example: '2026-01-01T00:00:00Z',
  })
  paidAt: Date;

  @ApiProperty({
    description: 'Expiration date',
    required: false,
    example: '2026-01-01T00:00:00Z',
  })
  expiredAt: Date;

  @ApiProperty({
    description: 'List of managers associated with the server',
    type: ServerManagerDto,
    isArray: true,
  })
  @Type(() => ServerManagerDto)
  managers: ServerManagerDto[];

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
