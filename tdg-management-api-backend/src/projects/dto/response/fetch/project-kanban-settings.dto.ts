import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProjectKanbanSettingsDto {
  @ApiProperty({
    description: 'Project UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  projectId: string;

  @ApiPropertyOptional({
    description: 'Kanban WIP limit settings (status -> max count)',
    example: { IN_PROGRESS: 5, IN_REVIEW: 3, TESTING: 2 },
    nullable: true,
  })
  kanbanSettings?: Record<string, number> | null;
}
