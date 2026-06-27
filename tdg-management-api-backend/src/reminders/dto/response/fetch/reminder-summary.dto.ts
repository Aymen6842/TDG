import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ReminderEntityType, ReminderStatus } from '@prisma/client';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';
import { ReminderUserDto } from './reminder-user.dto';

/**
 * Reminder summary DTO - Lightweight version for list views
 * Used by GET /projects/:projectId/reminders (list)
 */
export class ReminderSummaryDto {
  @ApiProperty({
    description: 'Reminder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Entity type',
    example: 'TASK',
    enum: ReminderEntityType,
    enumName: 'ReminderEntityType',
  })
  entityType: ReminderEntityType;

  @ApiPropertyOptional({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  entityId?: string | null;

  @ApiPropertyOptional({
    description: 'Reminder message',
    example: 'Task due soon',
  })
  message?: string | null;

  @ApiProperty({
    description: 'When to send the reminder',
    example: '2025-12-30T10:00:00.000Z',
  })
  @ToIsoDateString()
  reminderAt: Date | string;

  @ApiProperty({
    description: 'Is recurring',
    example: false,
  })
  isRecurring: boolean;

  @ApiProperty({
    description: 'Reminder status',
    example: 'PENDING',
    enum: ReminderStatus,
    enumName: 'ReminderStatus',
  })
  status: ReminderStatus;

  @ApiPropertyOptional({
    description: 'When reminder was sent',
    example: '2025-12-30T10:00:00.000Z',
  })
  @ToIsoDateString()
  sentAt?: Date | string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  @ToIsoDateString()
  createdAt: Date | string;

  @ApiProperty({
    description: 'User associated with the reminder',
    type: ReminderUserDto,
  })
  @Type(() => ReminderUserDto)
  user: ReminderUserDto;
}
