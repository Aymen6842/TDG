import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ReceivedNotificationDto } from './received-notification.dto';
import { PaginationParametersInResponse } from 'src/notifications/types/response.type';

export class PaginateReceivedNotificationsDto {
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
  @ApiProperty({ type: ReceivedNotificationDto, isArray: true })
  @Type(() => ReceivedNotificationDto)
  data: ReceivedNotificationDto[];
}
