import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { UserType } from '@prisma/client';
import { TeamSummaryDto } from './team-summary.dto';
import { DecimalNumber } from 'src/common/dto/decimal-numbers/decimal.dto';
import { Decimal } from '@prisma/client/runtime/client';
import { UserNotificationSettingsDto } from './user-notification-settings.dto';
import { UserTelegramBotDto } from './user-telegram-bot.dto';
import { UserNtfyIntegrationDto } from './user-ntfy-integration.dto';

export class UserSummaryForManagerDto {
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

  @ApiProperty({
    description: 'Indicates if the user is currently online.',
    type: 'boolean',
    example: true,
  })
  online: boolean;

  @ApiProperty({ description: 'The image of the user' })
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

  @ApiProperty({
    description: 'The teams of the user.',
    type: TeamSummaryDto,
    isArray: true,
  })
  @Type(() => TeamSummaryDto)
  teams: TeamSummaryDto[];

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
    description: 'The total time worked by the user in minutes.',
    type: 'string',
    example: '1250.000',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  timeWorkedInMinutes: string;

  @ApiProperty({
    description: 'The average session time of the user in minutes.',
    type: 'string',
    example: '1250.000',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averageSessionTimeInMinutes: number;

  @ApiProperty({
    description: 'The average performance rating of the user.',
    type: 'string',
    example: '4.500',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averagePerformanceRating: number;

  @ApiProperty({
    description: 'The average daily mood of the user.',
    type: 'string',
    example: '3.800',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averageDailyMood: number;

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
