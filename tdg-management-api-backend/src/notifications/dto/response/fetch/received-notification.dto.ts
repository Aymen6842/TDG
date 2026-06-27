import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { NotificationContent } from '@prisma/client';
import { Exclude, Expose, Transform } from 'class-transformer';

export class ReceivedNotificationDto {
  @ApiProperty({
    description: 'The id of the notification.',
    required: true,
    example: 'b3f81d9f-9e0d-4a91-bc16-67e8b5d9b7f1',
  })
  id: string;

  @ApiProperty({
    description: 'Is Seen status of the notification.',
    required: true,
    example: false,
  })
  isSeen: boolean;

  @ApiHideProperty()
  @Exclude()
  notification: { content: NotificationContent[]; image: string | null };

  @ApiProperty({
    description: 'The title of the notification.',
    required: true,
    example: 'Created',
  })
  @Expose()
  @Transform(
    ({ obj }) =>
      (obj as ReceivedNotificationDto)?.notification?.content?.[0]?.title ??
      null,
    {
      toClassOnly: true,
    },
  )
  title: string;

  @ApiProperty({
    description: 'The body of the notification.',
    required: true,
    example: 'Created is sucesful',
  })
  @Expose()
  @Transform(
    ({ obj }) =>
      (obj as ReceivedNotificationDto)?.notification?.content?.[0]?.body ??
      null,
    {
      toClassOnly: true,
    },
  )
  body: string;

  @ApiProperty({
    description: 'The image of the notification.',
    required: true,
    example: 'https://example.com/notification-image.jpg',
  })
  @Expose()
  @Transform(
    ({ obj }) => (obj as ReceivedNotificationDto)?.notification?.image ?? null,
    {
      toClassOnly: true,
    },
  )
  image: string | null;

  @ApiProperty({
    description: 'The url of the notification.',
    required: true,
    example: 'https://example.com/notification',
  })
  @Expose()
  @Transform(
    ({ obj }) =>
      (obj as ReceivedNotificationDto)?.notification?.content?.[0]?.url ?? null,
    {
      toClassOnly: true,
    },
  )
  url?: string | null;

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
