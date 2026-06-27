import { ApiProperty } from '@nestjs/swagger';

export class UserNotificationSettingsDto {
  @ApiProperty({
    description: 'Indicates if email notifications are enabled for the user.',
    type: 'boolean',
    example: true,
  })
  emailNotificationsEnabled: boolean;

  @ApiProperty({
    description:
      'Indicates if Telegram notifications are enabled for the user.',
    type: 'boolean',
    example: false,
  })
  telegramNotificationsEnabled: boolean;

  @ApiProperty({
    description: 'Indicates if ntfy notifications are enabled for the user.',
    type: 'boolean',
    example: true,
  })
  ntfyNotificationsEnabled: boolean;
}
