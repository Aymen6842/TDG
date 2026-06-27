import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateEventContentDto {
  @ApiProperty({
    description: 'Title of the event.',
    example: 'Team Meeting',
    required: true,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'Description of the event.',
    example: 'Weekly team sync-up meeting.',
    required: true,
  })
  @IsString()
  @IsOptional()
  description?: string;
}
