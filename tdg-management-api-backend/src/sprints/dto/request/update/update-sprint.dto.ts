import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SprintStatus } from '@prisma/client';
import { SprintContentDto } from '../post/sprint-content.dto';
import { SprintAttachmentDto } from '../post/sprint-attachment.dto';

export class UpdateSprintDto {
  @ApiPropertyOptional({
    description: 'Sprint status',
    enum: SprintStatus,
    example: 'Running',
  })
  @IsEnum(SprintStatus)
  @IsOptional()
  status?: SprintStatus;

  @ApiPropertyOptional({
    description: 'Sprint start date',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Sprint end date',
    example: '2026-03-14T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated start date',
    example: '2026-02-28T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  estimatedStartDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated end date',
    example: '2026-03-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  estimatedEndDate?: string;

  @ApiPropertyOptional({
    description: 'Story points capacity',
    example: 20,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Sprint content (multilingual)',
    type: [SprintContentDto],
    example: [
      {
        name: 'Sprint 1 - Authentication Updated',
        language: 'English',
        description: 'Updated description',
        details: 'Updated details',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintContentDto)
  @IsOptional()
  content?: SprintContentDto[];

  @ApiPropertyOptional({
    description: 'Sprint attachments',
    type: [SprintAttachmentDto],
    example: [{ file: '/uploads/sprints/new-attachment.pdf' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintAttachmentDto)
  @IsOptional()
  attachments?: SprintAttachmentDto[];
}
