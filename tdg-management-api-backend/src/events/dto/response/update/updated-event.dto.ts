import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum } from 'class-validator';
import { UpdatedEventContentDto } from './updated-event-content.dto';
import { EventType, EventColor, EventParticipant } from '@prisma/client';

export class UpdatedEventDto {
  @ApiProperty({
    description: 'id of the event.',
    example: 'uuid-event-1',
    required: true,
  })
  id: string;

  @ApiProperty({
    description: 'Type of the event.',
    enum: EventType,
    example: EventType.Meeting,
    required: true,
  })
  @IsEnum(EventType)
  type: EventType;

  @ApiProperty({
    description: 'Color of the event.',
    enum: EventColor,
    example: EventColor.Sky,
    required: true,
  })
  @IsEnum(EventColor)
  color: EventColor;

  @ApiProperty({
    description: 'Start time of the event.',
    example: '2025-01-10T09:00:00Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'End time of the event.',
    example: '2025-01-10T10:00:00Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'Indicates if the event should be notified.',
    example: false,
  })
  isNotified: boolean;

  @ApiProperty({
    description: 'Location of the event.',
    example: 'Meeting Room A',
    required: false,
  })
  location: string;

  @ApiProperty({
    description: 'Send the event to all users.',
    example: false,
    default: false,
  })
  toAllUsers: boolean;

  @ApiProperty({
    description: 'Participants of the event',
  })
  participants: EventParticipant[];

  @ApiProperty({
    description: 'Created by ID.',
    example: 'uuid-user-1',
  })
  createdById: string;

  @ApiProperty({
    description: 'Next notification time.',
    example: '2025-01-10T09:00:00Z',
  })
  nextNotificationTime: string;

  @ApiProperty({
    description: 'Event content (always available in English).',
    required: true,
    type: [UpdatedEventContentDto],
  })
  @IsArray()
  contents: UpdatedEventContentDto[];

  @ApiProperty({
    description: 'date createdAt of the notification.',
    required: true,
    example: '2025-04-04 12:20:20',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'date updatedAt of the notification.',
    required: true,
    example: '2025-04-04 12:20:20',
  })
  updatedAt: Date;
}
