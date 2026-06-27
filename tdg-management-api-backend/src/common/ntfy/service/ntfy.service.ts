import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';
import { NtfyOptions } from '../types/ntfy.type';

@Injectable()
export class NtfyService {
  constructor(
    private readonly configService: ConfigService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async sendNtfyMessage(topic: string, options: NtfyOptions) {
    try {
      if (!topic) {
        this.backgroundActivitiesLoggerService.log(
          `No topic provided for Ntfy message`,
          {
            service: 'Ntfy Service',
            method: 'Sending Ntfy Message',
          },
        );
        return;
      }

      const ntfyUrl = `${this.configService.get<string>('NTFY_URL')}/${topic}`;

      // Prepare headers
      const headers: Record<string, string> = {};
      headers['Icon'] = this.configService.get<string>('LOGO_URL') || '';
      headers['Click'] =
        this.configService.get<string>('FRONTEND_ADDRESS') || '';

      if (options) {
        if (options.priority) headers['Priority'] = options.priority;
        if (options.title) headers['Title'] = options.title;
        if (options.tags) headers['Tags'] = options.tags;
        if (options.attach) headers['Attach'] = options.attach;
        if (options.actions)
          headers['Actions'] = JSON.stringify(options.actions);
        if (options.replace) headers['Replace'] = options.replace;
        if (options.icon) headers['Icon'] = options.icon;
        if (options.expiration) headers['Expiration'] = options.expiration;
        if (options.retry) headers['Retry'] = options.retry;
        if (options.ttl) headers['TTL'] = options.ttl;
      }

      await axios.post(
        ntfyUrl,
        { content: options?.message || '' },
        { headers },
      );
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Error while sending Ntfy message: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Ntfy Service',
          method: 'Sending Ntfy Message',
        },
      );
    }
  }
}
