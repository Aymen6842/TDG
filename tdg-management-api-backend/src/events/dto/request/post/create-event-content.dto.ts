import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventContentDto {
  @ApiProperty({
    description: 'Title of the event.',
    example: 'Team Meeting',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Description of the event.',
    example: 'Weekly team sync-up meeting.',
    required: true,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
