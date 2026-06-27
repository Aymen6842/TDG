import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDate,
  IsArray,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ReminderEntityType, ChannelType } from '@prisma/client';

export class CreateReminderDto {
  @ApiProperty({
    description: 'The user ID to remind',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Entity type (TASK, SPRINT, MILESTONE, PROJECT, CUSTOM)',
    example: 'TASK',
    enum: ReminderEntityType,
  })
  @IsEnum(ReminderEntityType)
  entityType: ReminderEntityType;

  @ApiProperty({
    description: 'ID of the entity (task, sprint, etc.)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiProperty({
    description: 'Reminder message',
    example: 'Task due soon',
    required: false,
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({
    description: 'When to send the reminder',
    example: '2025-12-30T10:00:00.000Z',
  })
  @IsDate()
  @Type(() => Date)
  reminderAt: Date;

  @ApiProperty({
    description: 'Is this a recurring reminder',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiProperty({
    description: 'Recurrence rule (cron expression)',
    example: '0 9 * * *',
    required: false,
  })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @ApiProperty({
    description: 'Notification channels',
    example: ['EMAIL', 'PUSH'],
    enum: ChannelType,
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(ChannelType, { each: true })
  channels?: ChannelType[];
}
