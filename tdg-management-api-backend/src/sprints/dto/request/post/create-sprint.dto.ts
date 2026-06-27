import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SprintContentDto } from './sprint-content.dto';
import { SprintAttachmentDto } from './sprint-attachment.dto';

export class CreateSprintDto {
  @ApiProperty({
    description: 'Sprint content (multilingual)',
    type: [SprintContentDto],
    example: [
      {
        name: 'Sprint 1 - Authentication',
        language: 'English',
        description: 'Complete user authentication feature',
        details: 'Detailed breakdown of tasks',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintContentDto)
  content: SprintContentDto[];

  @ApiProperty({
    description: 'Sprint start date',
    example: '2026-03-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Sprint end date',
    example: '2026-03-14T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Estimated start date',
    example: '2026-02-28T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  estimatedStartDate: string;

  @ApiProperty({
    description: 'Estimated end date',
    example: '2026-03-15T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  estimatedEndDate: string;

  @ApiPropertyOptional({
    description: 'Story points capacity',
    example: 20,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @ApiPropertyOptional({
    description: 'Sprint attachments',
    type: [SprintAttachmentDto],
    example: [{ file: '/uploads/sprints/attachment.pdf' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SprintAttachmentDto)
  @IsOptional()
  attachments?: SprintAttachmentDto[];
}
