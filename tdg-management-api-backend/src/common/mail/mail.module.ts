import { Module } from '@nestjs/common';
import { MailService } from './service/mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        defaults: {
          from: configService.get<string>('MAIL_USER'),
        },
        transport: {
          host: configService.get<string>('MAIL_HOST'),
          port: Number(configService.get<string>('MAIL_PORT') ?? '587'),
          secure:
            Number(configService.get<string>('MAIL_PORT') ?? '587') === 465,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
          requireTLS:
            Number(configService.get<string>('MAIL_PORT') ?? '587') === 587,
        },
      }),
    }),
  ],
  providers: [MailService, ConfigService],
  exports: [MailService],
})
export class MailModule {}
