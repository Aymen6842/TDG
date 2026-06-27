import { ApiProperty } from '@nestjs/swagger';
import { ChannelType } from '@prisma/client';

/**
 * Reminder user DTO - nested DTO for user information in reminders
 * Similar to ProjectMemberResponseDto pattern
 */
export class ReminderUserDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'User email',
    example: 'john.doe@example.com',
  })
  email: string;
}

/**
 * Reminder creator DTO - nested DTO for createdBy information
 */
export class ReminderCreatorDto {
  @ApiProperty({
    description: 'Creator ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  id: string;

  @ApiProperty({
    description: 'Creator name',
    example: 'Admin User',
  })
  name: string;
}

/**
 * Reminder channel DTO - nested DTO for notification channels
 */
export class ReminderChannelDto {
  @ApiProperty({
    description: 'Channel ID',
    example: '123e4567-e89b-12d3-a456-426614174002',
  })
  id: string;

  @ApiProperty({
    description: 'Channel type',
    example: 'PUSH',
    enum: ChannelType,
    enumName: 'ChannelType',
  })
  channel: ChannelType;
}
