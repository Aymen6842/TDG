import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import {
  EventType,
  EventColor,
  EventParticipant,
  EventContent,
} from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class EventDto {
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

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  content: EventContent[];

  @ApiProperty({
    description: 'The title of the event.',
    required: true,
    example: 'Project Kickoff Meeting',
  })
  @Expose()
  @Transform(({ obj }) => (obj as EventDto).content[0]?.title, {
    toClassOnly: true,
  })
  title: string;

  @ApiProperty({
    description: 'The description of the event.',
    required: false,
    example: 'Initial meeting to discuss project goals and timelines.',
  })
  @Expose()
  @Transform(({ obj }) => (obj as EventDto).content[0]?.description, {
    toClassOnly: true,
  })
  description: string;

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
