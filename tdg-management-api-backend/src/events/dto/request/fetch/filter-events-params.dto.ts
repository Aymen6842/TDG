import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { TimeService } from 'src/common/time/service/time.service';
import { EventType } from '@prisma/client';

export class FilterEventsParamsDto {
  @ApiProperty({
    description:
      'start date for filtering  (ISO 8601 format), by default is current time.',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  @Transform(
    ({ value }) =>
      value === undefined || value === null || value === ''
        ? TimeService.getCurrentTime()
        : (value as string),
    { toClassOnly: true },
  )
  from: string;

  @ApiHideProperty()
  createdById?: string;

  @ApiProperty({
    description:
      'End date for filtering  (ISO 8601 format), by default is 30 days from now.',
    example: '2023-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601()
  @Transform(
    ({ value }) =>
      value === undefined || value === null || value === ''
        ? TimeService.getFutureDateByDays(30)
        : (value as string),
    { toClassOnly: true },
  )
  to: string;

  @ApiProperty({
    description: 'The type of the event',
    example: EventType.PersonalEvent,
    required: false,
  })
  @IsOptional()
  @IsEnum(EventType)
  eventType?: EventType;
}
