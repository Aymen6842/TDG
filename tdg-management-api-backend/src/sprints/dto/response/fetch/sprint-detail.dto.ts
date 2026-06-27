import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { SprintStatus } from '@prisma/client';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';
import { SprintAttachmentResponseDto } from './sprint-attachment-response.dto';

interface SprintWithContents {
  id: string;
  projectId: string;
  createdById: string;
  startDate: Date | string;
  endDate: Date | string;
  estimatedStartDate: Date | string;
  estimatedEndDate: Date | string;
  status: SprintStatus;
  capacity: number | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  contents: Array<{
    id: string;
    name: string;
    description?: string;
    details?: string;
  }>;
  attachments: Array<{
    createdAt: Date | string;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    labels: Array<{
      label: {
        id: string;
        name: string;
        color: string | null;
      };
    }>;
  }>;
}

export class SprintDto {
  @ApiProperty({
    description: 'Sprint ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  projectId: string;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174099',
  })
  createdById: string;

  @ApiProperty({ description: 'Start date', example: '2025-01-01T00:00:00.000Z' })
  @ToIsoDateString()
  startDate: Date | string;

  @ApiProperty({ description: 'End date', example: '2025-01-31T00:00:00.000Z' })
  @ToIsoDateString()
  endDate: Date | string;

  @ApiProperty({
    description: 'Estimated start date',
    example: '2025-01-01T00:00:00.000Z',
  })
  @ToIsoDateString()
  estimatedStartDate: Date | string;

  @ApiProperty({
    description: 'Estimated end date',
    example: '2025-01-31T00:00:00.000Z',
  })
  @ToIsoDateString()
  estimatedEndDate: Date | string;

  @ApiProperty({
    description: 'Sprint status',
    enum: SprintStatus,
    example: 'Running',
  })
  status: SprintStatus;

  @ApiPropertyOptional({
    description: 'Story points capacity for the sprint',
    example: 20,
  })
  capacity?: number | null;

  @ApiProperty({
    description: 'Sprint name (from default content)',
    example: 'Sprint 1 - Authentication',
  })
  @Transform(
    ({ obj }: { obj: SprintWithContents }) => obj.contents?.[0]?.name ?? '',
    { toClassOnly: true },
  )
  name: string;

  @ApiPropertyOptional({
    description: 'Sprint tasks',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174005',
        title: 'Implement user login',
        status: 'DONE',
        labels: [{ id: '...', name: 'Frontend', color: '#FF5733' }],
      },
    ],
  })
  @Transform(
    ({ value }: { value?: SprintWithContents['tasks'] }) =>
      value?.map((task) => ({
        ...task,
        labels: task.labels.map(({ label }) => label),
      })) ?? [],
    { toClassOnly: true },
  )
  tasks?: Array<{
    id: string;
    title: string;
    status: string;
    labels: Array<{
      id: string;
      name: string;
      color: string | null;
    }>;
  }>;

  @ApiPropertyOptional({
    description: 'Sprint description (from default content)',
    example: 'User authentication and authorization features',
  })
  @Transform(
    ({ obj }: { obj: SprintWithContents }) =>
      obj.contents?.[0]?.description ?? null,
    { toClassOnly: true },
  )
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Sprint details (from default content)',
    example:
      'Includes login, registration, password reset, and OAuth integration',
  })
  @Transform(
    ({ obj }: { obj: SprintWithContents }) =>
      obj.contents?.[0]?.details ?? null,
    { toClassOnly: true },
  )
  details?: string | null;

  @ApiProperty({
    description: 'Sprint attachments',
    type: [SprintAttachmentResponseDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        attachment: '/uploads/sprints/sprint-1/design.pdf',
        createdAt: '2025-01-15T10:30:00Z',
      },
    ],
  })
  attachments: SprintAttachmentResponseDto[];

  @ApiProperty({ description: 'Created at', example: '2025-01-15T11:30:00.000Z' })
  @ToIsoDateString()
  createdAt: Date | string;

  @ApiProperty({ description: 'Updated at', example: '2025-01-20T15:45:00.000Z' })
  @ToIsoDateString()
  updatedAt: Date | string;

  @ApiPropertyOptional({
    description:
      'Sprint contents (for backward compatibility - language not included)',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174010',
        name: 'Sprint 1 - Authentication',
        description: 'User authentication and authorization features',
        details: 'Includes login, registration, and OAuth integration',
      },
    ],
  })
  contents?: Array<{
    id: string;
    name: string;
    description?: string;
    details?: string;
  }>;
}
