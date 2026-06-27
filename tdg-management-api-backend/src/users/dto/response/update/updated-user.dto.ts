import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { UserTeam, UserType } from '@prisma/client';
import { UserNtfyIntegrationDto } from './user-ntfy-integration.dto';
import { UserTelegramBotDto } from './user-telegram-bot.dto';
import { UserNotificationSettingsDto } from './user-notification-settings.dto';

export class UpdatedUserDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The email of the user.',
    type: 'string',
    example: 'test@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the user.',
    type: 'string',
    example: '+218 912345678',
  })
  phone: string;

  @ApiProperty({
    description: 'The name of the user.',
    type: 'string',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({ description: 'The image of the user', required: false })
  image: string;

  @ApiProperty({
    description: 'The role of the user.',
    type: 'string',
    example: 'Admin',
  })
  @Transform(
    ({ value }) => (value as { type: UserType }[]).map((role) => role.type),
    {
      toClassOnly: true,
    },
  )
  roles: UserType[];

  @ApiHideProperty()
  @Exclude({ toPlainOnly: true })
  teams: UserTeam[];

  @ApiProperty({
    description: 'The notification settings of the user.',
    type: UserNotificationSettingsDto,
  })
  @Type(() => UserNotificationSettingsDto)
  notificationSettings: UserNotificationSettingsDto;

  @ApiProperty({
    description: 'The telegram bot settings of the user.',
    type: UserTelegramBotDto,
  })
  @Type(() => UserTelegramBotDto)
  telegramBot: UserTelegramBotDto;

  @ApiProperty({
    description: 'The ntfy integration settings of the user.',
    type: UserNtfyIntegrationDto,
  })
  @Type(() => UserNtfyIntegrationDto)
  ntfyIntegration: UserNtfyIntegrationDto;

  @ApiProperty({
    description: 'The ids of the teams the user belongs to',
    type: 'string',
    isArray: true,
    example: ['team-id-1', 'team-id-2'],
  })
  @Expose()
  @Transform(
    ({ obj }) =>
      (obj as UpdatedUserDto).teams?.map((team) => team.teamId) || [],
    { toClassOnly: true },
  )
  teamsIds: string[];

  @ApiProperty({
    description: 'The date of the creation',
    type: 'string',
    example: '2025-02-20 22:20:45',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The date of the update',
    type: 'string',
    example: '2025-02-20 22:20:45',
  })
  updatedAt: string;
}
