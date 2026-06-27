import { ApiProperty } from '@nestjs/swagger';

export class UserTelegramBotDto {
  @ApiProperty({
    description: 'The unique identifier of the Telegram chat.',
    type: 'string',
    example: '123456789',
  })
  chatId: string;
}
