import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ReminderEntityType,
  ReminderStatus,
  ChannelType,
} from '@prisma/client';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';
import {
  ReminderUserDto,
  ReminderCreatorDto,
  ReminderChannelDto,
} from './reminder-user.dto';

/**
 * Type representing reminder data with relations from Prisma
 * Used for internal type mapping between repository and DTO
 */
export type ReminderWithRelations = {
  id: string;
  userId: string;
  entityType: ReminderEntityType;
  entityId: string | null;
  projectId: string | null;
  taskId: string | null;
  milestoneId: string | null;
  message: string | null;
  reminderAt: Date | string;
  isRecurring: boolean;
  recurrenceRule: string | null;
  createdById: string;
  status: ReminderStatus;
  sentAt: Date | string | null;
  dismissedAt: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  user: { id: string; name: string; email: string };
  createdBy: { id: string; name: string };
  channels: Array<{ id: string; channel: ChannelType }>;
};

/**
 * Reminder detail DTO - Full details for single reminder fetch
 * Used by GET /projects/:projectId/reminders/:reminderId
 */
export class ReminderDetailDto {
  @ApiProperty({
    description: 'Reminder ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  userId: string;

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
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  projectId?: string | null;

  @ApiPropertyOptional({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  taskId?: string | null;

  @ApiPropertyOptional({
    description: 'Milestone ID',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  milestoneId?: string | null;

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

  @ApiPropertyOptional({
    description: 'Recurrence rule (cron format)',
    example: '0 9 * * *',
  })
  recurrenceRule?: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174006',
  })
  createdById: string;

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

  @ApiPropertyOptional({
    description: 'When reminder was dismissed',
    example: '2025-12-30T09:00:00.000Z',
  })
  @ToIsoDateString()
  dismissedAt?: Date | string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  @ToIsoDateString()
  createdAt: Date | string;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-12-01T10:00:00.000Z',
  })
  @ToIsoDateString()
  updatedAt: Date | string;

  @ApiProperty({
    description: 'User associated with the reminder',
    type: ReminderUserDto,
  })
  @Type(() => ReminderUserDto)
  user: ReminderUserDto;

  @ApiProperty({
    description: 'Creator of the reminder',
    type: ReminderCreatorDto,
  })
  @Type(() => ReminderCreatorDto)
  createdBy: ReminderCreatorDto;

  @ApiProperty({
    description: 'Notification channels',
    type: [ReminderChannelDto],
  })
  @Type(() => ReminderChannelDto)
  channels: ReminderChannelDto[];
}
