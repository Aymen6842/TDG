import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PeriodDto } from './period.dto';
import { EventDto } from './event.dto';

export class EventsInPeriodDto {
  @ApiProperty({
    description: 'The period for which the statistics are calculated.',
    type: PeriodDto,
  })
  @Type(() => PeriodDto)
  period: PeriodDto;

  @ApiProperty({
    description: 'The events in the period.',
    type: EventDto,
    isArray: true,
  })
  @Type(() => EventDto)
  events: EventDto[];
}
