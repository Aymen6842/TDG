import { ApiProperty } from '@nestjs/swagger';
import { Decimal } from '@prisma/client/runtime/client';
import { Transform, Type } from 'class-transformer';
import { DecimalNumber } from 'src/common/dto/decimal-numbers/decimal.dto';

export class WorkDaysStatisticsDetailsForUserDto {
  @ApiProperty({
    description: 'The date of the work day',
    example: '2023-01-01',
  })
  date: string;

  @ApiProperty({
    description: 'remote worked hours',
    example: '5.50',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(2)
        : typeof value === 'number'
          ? new Decimal(value).toFixed(2)
          : '0.00',
    { toClassOnly: true },
  )
  remoteWorkedHours: number;

  @ApiProperty({
    description: 'office worked hours',
    example: '5.50',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(2)
        : typeof value === 'number'
          ? new Decimal(value).toFixed(2)
          : '0.00',
    { toClassOnly: true },
  )
  officeWorkedHours: number;
}
