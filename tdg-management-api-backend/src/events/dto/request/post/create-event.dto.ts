import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateEventContentDto } from './create-event-content.dto';
import { EventType, EventColor } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateEventDto {
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
    required: true,
  })
  @IsISO8601()
  startTime: Date;

  @ApiProperty({
    description: 'End time of the event.',
    example: '2025-01-10T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601()
  endTime?: Date;

  @ApiProperty({
    description: 'Location of the event.',
    example: 'Meeting Room A',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Send the event to all users.',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  toAllUsers?: boolean;

  @ApiProperty({
    description: 'Participants IDs (required if toAllUsers = false).',
    example: ['uuid-user-1', 'uuid-user-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantsIds?: string[];

  @ApiHideProperty()
  createdById: string;

  @ApiHideProperty()
  nextNotificationTime: string;

  @ApiProperty({
    description: 'Event content (always created in English).',
    required: true,
    type: [CreateEventContentDto],
  })
  @IsArray()
  @Type(() => CreateEventContentDto)
  @IsNotEmpty()
  @ValidateNested({ each: true })
  content: CreateEventContentDto[];
}
