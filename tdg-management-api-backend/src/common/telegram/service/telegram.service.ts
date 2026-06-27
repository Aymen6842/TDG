import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

@Injectable()
export class TelegramService {
  constructor(
    private readonly configService: ConfigService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async sendTelegramMessage(chatId: string, message: string) {
    try {
      const apiUrl = this.configService.get<string>('TELEGRAM_API_URL');
      const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
      const url = `${apiUrl}/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(message)}`;

      await axios.get(url);
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Error while sending telegram message: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Telegram Service',
          method: 'Sending Telegram Message',
        },
      );
    }
  }
}
