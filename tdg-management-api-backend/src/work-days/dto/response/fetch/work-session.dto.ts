import { ApiProperty } from '@nestjs/swagger';
import { WorkSessionDevice, WorkSessionLocation } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform, Type } from 'class-transformer';
import { DecimalNumber } from 'src/common/dto/decimal-numbers/decimal.dto';

export class WorkSessionDto {
  @ApiProperty({
    description: 'The start time of the work day',
    example: '2023-01-01T00:00:00.000Z',
  })
  startTime: Date;

  @ApiProperty({
    description: 'The end time of the work session',
    example: '2023-01-01T08:00:00.000Z',
  })
  endTime: Date;

  @ApiProperty({
    description: 'The time spent in minutes during the work session',
    example: 480,
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(2)
        : new Decimal((value as number) ?? 0).toFixed(2),
    { toClassOnly: true },
  )
  timeSpentInMinutes: string;

  @ApiProperty({
    description: 'The location of the work session',
    example: WorkSessionLocation.ONSITE,
  })
  location: WorkSessionLocation;

  @ApiProperty({
    description: 'The device used during the work session',
    example: WorkSessionDevice.DESKTOP,
  })
  device: WorkSessionDevice;
}
