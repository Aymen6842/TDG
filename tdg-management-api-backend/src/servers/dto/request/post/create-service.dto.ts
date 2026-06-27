import { ApiProperty } from '@nestjs/swagger';
import { ServerServiceStatus } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateServiceDto {
  @ApiProperty({
    description: 'The name of the service',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'The domain of the service',
    required: false,
    example: 'api.example.com',
  })
  @IsOptional()
  @IsString()
  domain?: string;

  @ApiProperty({
    description: 'Description of the service',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indicates if the service has an SSL certificate',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sslCertificate?: boolean;

  @ApiProperty({
    description: 'SSL certificate provided by cloud provider',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  sslCertificateByCloudProvider?: boolean;

  @ApiProperty({
    description: 'Service status',
    enum: ServerServiceStatus,
    example: ServerServiceStatus.Running,
  })
  @IsOptional()
  @IsEnum(ServerServiceStatus)
  status?: ServerServiceStatus;

  @ApiProperty({
    description: 'Is the service has backup',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  hasBackup?: boolean;

  @ApiProperty({
    description: 'Backup destination for the service',
    required: false,
    example: 's3://backup-bucket',
  })
  @IsOptional()
  @IsString()
  backupDestination?: string;

  @ApiProperty({
    description: 'Is the server paid',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  paid?: boolean;

  @ApiProperty({
    description: 'Paid date',
    required: false,
    example: '2026-01-01T00:00:00Z',
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
    description: 'Server ID linked to this service',
    example: 'uuid-server-id',
  })
  @IsString()
  @IsNotEmpty()
  serverId: string;
}
