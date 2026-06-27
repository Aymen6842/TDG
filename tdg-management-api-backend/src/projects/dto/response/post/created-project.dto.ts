import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ProjectStatus, BusinessUnit, ProjectType } from '@prisma/client';
import { TimeService } from 'src/common/time/service/time.service';
import { CreatedProjectMemberDto } from './created-project-member.dto';

interface CreatedProjectWithContents {
  id: string;
  paid: boolean;
  status: ProjectStatus;
  businessUnit: BusinessUnit;
  startDate: Date | string;
  endDate: Date | string;
  estimatedStartDate: Date | string;
  estimatedEndDate: Date | string;
  displayOrder: number;
  createdById: string;
  createdByName: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  members: CreatedProjectMemberDto[];
  contents: Array<{
    id: string;
    name: string;
    unaccentedName: string;
    description?: string;
    details?: string;
    createdAt: Date | string;
  }>;
}

export class CreatedProjectDto {
  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({ description: 'Is paid', example: false })
  paid!: boolean;

  @ApiProperty({
    description: 'Project status',
    enum: ProjectStatus,
    example: 'Pending',
  })
  status!: ProjectStatus;

  @ApiProperty({
    description: 'Business unit',
    enum: BusinessUnit,
    example: 'TawerDev',
  })
  businessUnit!: BusinessUnit;

  @ApiProperty({
    description: 'Project type',
    enum: ProjectType,
    example: 'AGILE',
  })
  projectType!: ProjectType;

  @ApiPropertyOptional({
    description: 'Kanban WIP limit settings (status → max count)',
    example: null,
  })
  kanbanSettings?: Record<string, number> | null;

  @ApiProperty({ description: 'Start date', example: '2025-01-01 00:00:00' })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  startDate!: Date | string;

  @ApiProperty({ description: 'End date', example: '2025-12-31 00:00:00' })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  endDate!: Date | string;

  @ApiProperty({
    description: 'Estimated start date',
    example: '2025-01-15 00:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  estimatedStartDate!: Date | string;

  @ApiProperty({
    description: 'Estimated end date',
    example: '2025-12-15 00:00:00',
  })
  @Transform(
    ({ value }) =>
      TimeService.getTimeByZoneFromUtcTime(value as string, 'Africa/Tunis'),
    { toClassOnly: true },
  )
  estimatedEndDate!: Date | string;

  @ApiProperty({ description: 'Display order', example: 1000 })
  displayOrder!: number;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174099',
  })
  createdById!: string;

  @ApiProperty({
    description: 'Created by user name',
    example: 'John Doe',
  })
  createdByName!: string;

  @ApiProperty({ description: 'Created at', example: '2025-01-15T10:30:00Z' })
  createdAt!: Date | string;

  @ApiProperty({ description: 'Updated at', example: '2025-01-15T10:30:00Z' })
  updatedAt!: Date | string;

  @ApiProperty({
    description: 'Project members',
    type: [CreatedProjectMemberDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        userId: '123e4567-e89b-12d3-a456-426614174000',
        memberName: 'John Doe',
        isManager: true,
        createdAt: '2025-01-15T10:30:00Z',
      },
    ],
  })
  members!: CreatedProjectMemberDto[];

  // Content fields extracted from the first content item
  @ApiProperty({
    description: 'Project name (from default content)',
    example: 'E-Commerce Platform',
  })
  @Transform(
    ({ obj }: { obj: CreatedProjectWithContents }) =>
      obj.contents?.[0]?.name ?? '',
    { toClassOnly: true },
  )
  name!: string;

  @ApiProperty({
    description: 'Project name without accents (for search)',
    example: 'E-Commerce Platform',
  })
  @Transform(
    ({ obj }: { obj: CreatedProjectWithContents }) =>
      obj.contents?.[0]?.unaccentedName ?? '',
    { toClassOnly: true },
  )
  unaccentedName!: string;

  @ApiPropertyOptional({
    description: 'Project description (from default content)',
    example: 'A full-featured e-commerce platform',
  })
  @Transform(
    ({ obj }: { obj: CreatedProjectWithContents }) =>
      obj.contents?.[0]?.description ?? null,
    { toClassOnly: true },
  )
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Project details (from default content)',
    example: 'Includes product management and payment integration',
  })
  @Transform(
    ({ obj }: { obj: CreatedProjectWithContents }) =>
      obj.contents?.[0]?.details ?? null,
    { toClassOnly: true },
  )
  details?: string | null;

  // Keep contents for backward compatibility
  @ApiPropertyOptional({
    description:
      'Project contents with language support (for backward compatibility)',
  })
  contents?: Array<{
    id: string;
    name: string;
    unaccentedName: string;
    description?: string;
    details?: string;
    createdAt: Date | string;
  }>;
}
