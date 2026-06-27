import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { CreateNotificationContentDto } from './create-notification-content.dto';
import { plainToInstance, Transform } from 'class-transformer';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'List of user IDs to send the notification ',
    required: false,
    example: [
      'b3f81d9f-9e0d-4a91-bc16-67e8b5d9b7f1',
      'b3f81d9f-9e0d-4a91-bcxq-67e8b5d97aze',
    ],
  })
  @ValidateIf((obj) => !(obj as CreateNotificationDto).sendToAllUsers)
  usersIds?: string[];

  @ApiHideProperty()
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiProperty({
    description: 'Whether to send the notification to all users.',
    required: true,
    example: false,
  })
  @Transform(({ value }) => (value === 'true' ? true : false), {
    toClassOnly: true,
  })
  @ValidateIf(
    (obj) =>
      !(obj as CreateNotificationDto).usersIds ||
      (obj as CreateNotificationDto).usersIds?.length === 0,
  )
  @IsBoolean()
  sendToAllUsers: boolean;

  @ApiProperty({
    description: 'The image of the notification.',
    required: false,
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'null' ? null : undefined), {
    toClassOnly: true,
  })
  image?: string;

  @ApiHideProperty()
  @IsOptional()
  @IsArray()
  tokens?: string[];

  @ApiProperty({
    description: 'The content of the notification.',
    required: true,
    type: CreateNotificationContentDto,
  })
  @Transform(
    ({ value }) => {
      try {
        return typeof value === 'string' && value !== '{}'
          ? plainToInstance(CreateNotificationContentDto, JSON.parse(value))
          : undefined;
      } catch {
        throw new BadRequestCustomException(
          'Invalid Data!',
          ErrorCode.INVALID_DATA,
        );
      }
    },
    { toClassOnly: true },
  )
  @ValidateNested({ each: true })
  content: CreateNotificationContentDto;
}
