import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationParametersInResponse } from 'src/notifications/types/response.type';
import { SentNotificationDto } from './sent-notification.dto';

export class PaginateSentNotificationsDto {
  @Expose()
  @ApiProperty({
    type: 'object',
    properties: {
      records: { type: 'number', example: 3 },
      currentPage: { type: 'number', example: 1 },
      totalPages: { type: 'number', example: 1 },
    },
  })
  pagination: PaginationParametersInResponse;

  @Expose()
  @ApiProperty({ type: SentNotificationDto, isArray: true })
  @Type(() => SentNotificationDto)
  data: SentNotificationDto[];
}
