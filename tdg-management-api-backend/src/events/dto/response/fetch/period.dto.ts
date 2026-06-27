import { ApiProperty } from '@nestjs/swagger';

export class PeriodDto {
  @ApiProperty({
    description: 'The period for which the statistics are calculated.',
    example: '2022-01-01T00:00:00.000Z',
  })
  from: string;

  @ApiProperty({
    description:
      'The end of the period for which the statistics are calculated.',
    example: '2022-12-31T23:59:59.999Z',
  })
  to: string;
}
