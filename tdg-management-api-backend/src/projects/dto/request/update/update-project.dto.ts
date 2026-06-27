import { ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsBoolean,
  IsObject,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  IsInt,
  Min,
  IsISO8601,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, BusinessUnit } from '@prisma/client';
import { UpdateProjectContentDto } from './update-project-content.dto';
import { UpdateProjectMemberPayloadDto } from './update-project-member-payload.dto';
import { IsValidKanbanSettings } from './validators/is-valid-kanban-settings.decorator';

export class UpdateProjectDto {
  @ApiHideProperty()
  @IsEnum(BusinessUnit)
  @IsOptional()
  businessUnit?: BusinessUnit;

  @ApiPropertyOptional({
    description: 'Project status',
    enum: ProjectStatus,
    example: 'Running',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus;

  @ApiPropertyOptional({
    description: 'Start date',
    example: '2025-01-01T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date',
    example: '2025-12-31T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated start date',
    example: '2025-01-15T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  estimatedStartDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated end date',
    example: '2025-12-15T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  estimatedEndDate?: string;

  @ApiPropertyOptional({
    description: 'Is paid project',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  paid?: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    example: 500,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number;

  @ApiPropertyOptional({
    description: 'Archive or restore the project',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Kanban WIP limits per status column',
    example: { TODO: 10, IN_PROGRESS: 5, IN_REVIEW: 3 },
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @IsValidKanbanSettings()
  kanbanSettings?: Record<string, number> | null;

  @ApiPropertyOptional({
    description: 'Project members',
    type: [UpdateProjectMemberPayloadDto],
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isManager: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProjectMemberPayloadDto)
  @IsOptional()
  members?: UpdateProjectMemberPayloadDto[];

  @ApiPropertyOptional({
    description: 'Manager user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  @IsOptional()
  manager?: string;

  @ApiPropertyOptional({
    description: 'Project contents with language support',
    type: [UpdateProjectContentDto],
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'E-Commerce Platform Updated',
        description: 'Updated description',
        language: 'English',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProjectContentDto)
  @IsOptional()
  contents?: UpdateProjectContentDto[];
}
