import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SprintStatus } from '@prisma/client';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

interface SprintWithContents {
  contents?: Array<{
    name: string;
    description?: string | null;
  }>;
}

export class SprintSummaryDto {
  @ApiProperty({
    description: 'Sprint ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId!: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174099',
  })
  createdById!: string;

  @ApiProperty({
    description: 'Sprint name (from default content)',
    example: 'Sprint 1 - Authentication',
  })
  @Transform(
    ({ obj }: { obj: SprintWithContents }) => obj.contents?.[0]?.name ?? '',
    { toClassOnly: true },
  )
  name!: string;

  @ApiPropertyOptional({
    description: 'Sprint description (from default content)',
    example: 'User authentication and authorization features',
    nullable: true,
  })
  @Transform(
    ({ obj }: { obj: SprintWithContents }) =>
      obj.contents?.[0]?.description ?? null,
    { toClassOnly: true },
  )
  description?: string | null;

  @ApiProperty({ description: 'Start date', example: '2025-01-01T00:00:00.000Z' })
  @ToIsoDateString()
  startDate!: Date | string;

  @ApiProperty({ description: 'End date', example: '2025-01-31T00:00:00.000Z' })
  @ToIsoDateString()
  endDate!: Date | string;

  @ApiProperty({
    description: 'Estimated start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ToIsoDateString()
  estimatedStartDate!: Date | string;

  @ApiProperty({
    description: 'Estimated end date',
    example: '2025-01-31T00:00:00.000Z',
  })
  @ToIsoDateString()
  estimatedEndDate!: Date | string;

  @ApiProperty({
    description: 'Sprint status',
    enum: SprintStatus,
    example: 'Running',
  })
  status!: SprintStatus;

  @ApiPropertyOptional({
    description: 'Story points capacity for the sprint',
    example: 20,
    nullable: true,
  })
  capacity?: number | null;

  @ApiProperty({ description: 'Created at', example: '2025-01-15T11:30:00.000Z' })
  @ToIsoDateString()
  createdAt!: Date | string;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T15:45:00.000Z' })
  @ToIsoDateString()
  updatedAt!: Date | string;
}
