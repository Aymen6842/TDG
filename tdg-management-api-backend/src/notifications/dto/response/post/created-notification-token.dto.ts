import { ApiProperty } from '@nestjs/swagger';
import { DeviceType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform, Type } from 'class-transformer';
import { DecimalNumber } from 'src/common/dto/decimal-numbers/decimal.dto';

export class CreatedNotificationTokenDto {
  @ApiProperty({
    description: 'The id of notificationToken.',
    required: false,
    example: 'b3f81d9f-9e0d-4a91-bc16-67e8b5d9b7f1',
  })
  id: string;

  @ApiProperty({
    description: 'The userId of the user.',
    required: false,
    example: '40635a81-d44a-46db-88fa-d08f682dcb1d',
  })
  userId: string;

  @ApiProperty({
    description: 'The Firebase notification token.',
    required: true,
    example: 'token_firebase_123',
  })
  token: string;

  @ApiProperty({
    description: 'User device name.',
    required: true,
    example: 'iPhone 13',
  })
  device: string;

  @ApiProperty({
    description: 'Device type.',
    required: true,
    example: DeviceType.Android,
  })
  deviceType: DeviceType;

  @ApiProperty({
    description: 'Height of the device',
    required: true,
    example: '844',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) => {
      return value instanceof Decimal
        ? value.toFixed(2)
        : typeof value === 'number'
          ? new Decimal(value).toFixed(2)
          : value;
    },
    { toClassOnly: true },
  )
  deviceHeight: string;

  @ApiProperty({
    description: 'Width of the device',
    required: true,
    example: '390',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) => {
      return value instanceof Decimal
        ? value.toFixed(2)
        : typeof value === 'number'
          ? new Decimal(value).toFixed(2)
          : value;
    },
    { toClassOnly: true },
  )
  deviceWidth: string;

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
