import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { ServerServiceStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateServerDto {
  @ApiProperty({ description: 'The name of the server' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  nextNotificationAt?: string;

  @ApiProperty({
    description: 'The domain of the server',
    required: false,
    example: 'example.com',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({
    description: 'Description of the server',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'IP address of the server',
    example: '192.168.1.1',
  })
  @IsOptional()
  @IsString()
  ip: string;

  @ApiProperty({
    description: 'CPU configuration',
    example: '8 vCPUs',
    required: false,
  })
  @IsOptional()
  @IsString()
  cpus?: string;

  @ApiProperty({
    description: 'RAM configuration',
    example: '32 GB',
    required: false,
  })
  @IsOptional()
  @IsString()
  ram?: string;

  @ApiProperty({
    description: 'Storage configuration',
    example: '1 TB',
    required: false,
  })
  @IsOptional()
  @IsString()
  storage?: string;

  @ApiProperty({
    description: 'Bandwidth information',
    example: '10 TB/month',
    required: false,
  })
  @IsOptional()
  @IsString()
  bandwidth?: string;

  @ApiProperty({
    description: 'Is backup managed by cloud provider',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  backupCloudProvider?: boolean;

  @ApiProperty({
    description: 'Is the server paid',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @ApiProperty({
    description: 'Server status',
    enum: ServerServiceStatus,
    example: ServerServiceStatus.Running,
  })
  @IsOptional()
  @IsEnum(ServerServiceStatus)
  status?: ServerServiceStatus;

  @ApiProperty({
    description: 'Payment date',
    required: false,
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  paidAt?: Date;

  @ApiProperty({
    description: 'Expiration date',
    required: false,
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsISO8601()
  expiredAt?: Date;

  @ApiProperty({
    description: 'Managers of the server (user ids)',
    type: [String],
    example: ['uuid-user-1', 'uuid-user-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  managersIds?: string[];
}
