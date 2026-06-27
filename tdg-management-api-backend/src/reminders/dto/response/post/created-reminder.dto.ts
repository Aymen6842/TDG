import { ApiProperty } from '@nestjs/swagger';
import {
  ReminderEntityType,
  ReminderStatus,
  ChannelType,
} from '@prisma/client';
import { ToIsoDateString } from 'src/common/transformers/iso-date.transform';

export class CreatedReminderDto {
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
  })
  entityType: ReminderEntityType;

  @ApiProperty({
    description: 'Entity ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  entityId: string | null;

  @ApiProperty({
    description: 'Project ID',
    example: '123e4567-e89b-12d3-a456-426614174003',
  })
  projectId: string | null;

  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174004',
  })
  taskId: string | null;

  @ApiProperty({
    description: 'Milestone ID',
    example: '123e4567-e89b-12d3-a456-426614174005',
  })
  milestoneId: string | null;

  @ApiProperty({
    description: 'Reminder message',
    example: 'Task due soon',
  })
  message: string | null;

  @ApiProperty({
    description: 'When to send the reminder',
    example: '2025-12-30T10:00:00.000Z',
  })
  @ToIsoDateString()
  reminderAt: Date;

  @ApiProperty({
    description: 'Is recurring',
    example: false,
  })
  isRecurring: boolean;

  @ApiProperty({
    description: 'Recurrence rule',
    example: '0 9 * * *',
  })
  recurrenceRule: string | null;

  @ApiProperty({
    description: 'Created by user ID',
    example: '123e4567-e89b-12d3-a456-426614174006',
  })
  createdById: string;

  @ApiProperty({
    description: 'Reminder status',
    example: 'PENDING',
    enum: ReminderStatus,
  })
  status: ReminderStatus;

  @ApiProperty({
    description: 'When reminder was sent',
    example: '2025-12-30T10:00:00.000Z',
  })
  @ToIsoDateString()
  sentAt: Date | null;

  @ApiProperty({
    description: 'When reminder was dismissed',
    example: '2025-12-30T09:00:00.000Z',
  })
  @ToIsoDateString()
  dismissedAt: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-29T10:00:00.000Z',
  })
  @ToIsoDateString()
  createdAt: Date;

  @ApiProperty({
    description: 'Update timestamp',
    example: '2025-12-29T10:00:00.000Z',
  })
  @ToIsoDateString()
  updatedAt: Date;

  @ApiProperty({
    description: 'Notification channels',
    example: ['EMAIL', 'PUSH'],
    enum: ChannelType,
    isArray: true,
  })
  channels: { id: string; channel: ChannelType }[];
}
