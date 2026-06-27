import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { UserType } from '@prisma/client';
import { DecimalNumber } from 'src/common/dto/decimal-numbers/decimal.dto';
import { Decimal } from '@prisma/client/runtime/client';
import { TeamSummaryDto } from './team-summary.dto';

export class UserSummaryForManagerInCsvDto {
  @ApiProperty({
    description: 'The unique identifier of the user.',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The email of the user.',
    type: 'string',
    example: 'test@gmail.com',
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the user.',
    type: 'string',
    example: '+218 912345678',
  })
  phone: string;

  @ApiProperty({
    description: 'Indicates if the user is currently online.',
    type: 'boolean',
    example: true,
  })
  online: boolean;

  @ApiProperty({
    description: 'The name of the user.',
    type: 'string',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'The role of the user.',
    type: 'string',
    example: 'Admin',
  })
  @Transform(
    ({ value }) =>
      (value as { type: UserType }[]).map((role) => role.type)?.join(', '),
    {
      toClassOnly: true,
    },
  )
  roles: UserType[];

  @ApiProperty({
    description: 'The teams of the user.',
    type: String,
  })
  @Transform(
    ({ value }) =>
      (value as TeamSummaryDto[]).map((team) => team.name).join(', '),
    { toClassOnly: true },
  )
  teams: string[];

  @ApiProperty({
    description: 'The total time worked by the user in minutes.',
    type: 'string',
    example: '1250.000',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  timeWorkedInMinutes: string;

  @ApiProperty({
    description: 'The average session time of the user in minutes.',
    type: 'string',
    example: '1250.000',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averageSessionTimeInMinutes: number;

  @ApiProperty({
    description: 'The average performance rating of the user.',
    type: 'string',
    example: '4.500',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averagePerformanceRating: number;

  @ApiProperty({
    description: 'The average daily mood of the user.',
    type: 'string',
    example: '3.800',
  })
  @Type(() => DecimalNumber)
  @Transform(
    ({ value }) =>
      value instanceof Decimal
        ? value.toFixed(3)
        : new Decimal((value as number) ?? 0).toFixed(3),
    { toClassOnly: true },
  )
  averageDailyMood: number;

  @ApiProperty({
    description: 'The date of the creation',
    type: 'string',
    example: '2025-02-20 22:20:45',
  })
  createdAt: string;

  @ApiProperty({
    description: 'The date of the update',
    type: 'string',
    example: '2025-02-20 22:20:45',
  })
  updatedAt: string;
}
