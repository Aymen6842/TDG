import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class CreatedEventContentDto {
  @ApiProperty({
    description: 'Title of the event.',
    example: 'Team Meeting',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the event.',
    example: 'Weekly team sync-up meeting.',
  })
  description: string;

  @ApiProperty({
    description: 'Type of the event.',
    enum: Language,
    example: Language.English,
  })
  @IsEnum(Language)
  language: Language;
}
