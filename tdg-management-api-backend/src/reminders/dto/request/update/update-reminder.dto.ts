import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDate, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReminderDto {
  @ApiPropertyOptional({
    description: 'Reminder message',
    example: 'Updated reminder message',
  })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({
    description: 'When to send the reminder',
    example: '2025-12-31T10:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  reminderAt?: Date;

  @ApiPropertyOptional({
    description: 'Is this a recurring reminder',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence rule (cron expression)',
    example: '0 9 * * *',
  })
  @IsOptional()
  @IsString()
  recurrenceRule?: string;
}
