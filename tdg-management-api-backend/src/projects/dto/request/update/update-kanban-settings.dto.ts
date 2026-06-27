import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';
import { IsValidKanbanSettings } from './validators/is-valid-kanban-settings.decorator';

export class UpdateKanbanSettingsDto {
  @ApiProperty({
    description:
      'WIP limits per Kanban column. Use null to clear all limits. Keys must be valid TaskStatus values.',
    example: { IN_PROGRESS: 5, IN_REVIEW: 3, TESTING: 2 },
    nullable: true,
  })
  @IsOptional()
  @IsObject()
  @IsValidKanbanSettings()
  settings?: Record<string, number> | null;
}
