import { ApiProperty } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import { UserNtfyIntegrationDto } from './user-ntfy-integration.dto';
import { UserTelegramBotDto } from './user-telegram-bot.dto';
import { UserNotificationSettingsDto } from './user-notification-settings.dto';

export class CreatedUserDto {
  @ApiProperty({ description: 'The uuid of the user' })
  id: string;

  @ApiProperty({ description: 'The email of the user' })
  email: string;

  @ApiProperty({ description: 'The phone number of the user' })
  phone: string;

  @ApiProperty({ description: 'The name of the user' })
  name: string;

  @ApiProperty({ description: 'The image of the user' })
  image: string;

  @ApiProperty({ description: 'The roles of the user' })
  @Transform(
    ({ value }) =>
      (value as { type: UserType }[])?.map(
        (role: { type: string }) => role.type,
      ),
    { toClassOnly: true },
  )
  roles: UserType[];

  @ApiProperty({ description: 'The roles of the user' })
  @Transform(
    ({ value }) =>
      (value as { teamId: string }[])?.map(
        (team: { teamId: string }) => team.teamId,
      ),
    { toClassOnly: true },
  )
  teamsIds: string[];

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

  @ApiProperty({ description: 'The time of the registration of the user' })
  createdAt: string;

  @ApiProperty({ description: 'The time of the last update of the user' })
  updatedAt: string;
}
