import {
  ApiProperty,
  ApiPropertyOptional,
  ApiHideProperty,
} from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
  IsInt,
  IsISO8601,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProjectStatus, BusinessUnit, ProjectType } from '@prisma/client';
import { ProjectMemberDto } from './project-member.dto';
import { ProjectContentDto } from './project-content.dto';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Business unit',
    enum: BusinessUnit,
    example: 'TawerDev',
  })
  @IsEnum(BusinessUnit)
  @IsNotEmpty()
  businessUnit: BusinessUnit;

  @ApiPropertyOptional({
    description: 'Project type - AGILE or FREESTYLE',
    enum: ProjectType,
    default: 'AGILE',
    example: 'AGILE',
  })
  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType = ProjectType.AGILE;

  @ApiPropertyOptional({
    description: 'Project status',
    enum: ProjectStatus,
    default: 'Pending',
    example: 'Pending',
  })
  @IsEnum(ProjectStatus)
  @IsOptional()
  status?: ProjectStatus = ProjectStatus.Pending;

  @ApiProperty({
    description: 'Start date',
    example: '2025-01-01T00:00:00Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'End date', example: '2025-12-31T00:00:00Z' })
  @IsISO8601()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Estimated start date',
    example: '2025-01-01T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  estimatedStartDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated end date',
    example: '2025-12-31T00:00:00Z',
  })
  @IsISO8601()
  @IsOptional()
  estimatedEndDate?: string;

  @ApiPropertyOptional({
    description: 'Is paid project',
    default: false,
    example: false,
  })
  @IsBoolean()
  @IsOptional()
  paid?: boolean = false;

  @ApiPropertyOptional({
    description: 'Display order',
    default: 1000,
    example: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  displayOrder?: number = 1000;

  @ApiProperty({
    description: 'Project contents with language support',
    type: [ProjectContentDto],
    example: [
      {
        name: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform',
        details: 'Includes product management and payment integration',
        language: 'English',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectContentDto)
  contents: ProjectContentDto[];

  @ApiPropertyOptional({
    description: 'Project members',
    type: [ProjectMemberDto],
    example: [
      {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        isManager: true,
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectMemberDto)
  @IsOptional()
  members?: ProjectMemberDto[];

  @ApiPropertyOptional({
    description:
      'Manager user ID. If omitted, authenticated creator is used as manager by default.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ValidateIf((_, value: unknown) => {
    if (value === undefined || value === null) {
      return false;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    return true;
  })
  @IsUUID()
  @IsOptional()
  manager?: string;

  @ApiHideProperty()
  createdById: string;
}
