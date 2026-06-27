import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import {
  TDG_EMAIL_FOOTER,
  TDG_EMAIL_HEADER,
} from 'src/common/constants/email-constants';
import { BackgroundActivitiesLoggerService } from 'src/common/logger/background-activities-logger/background-activities-logger.service';

@Injectable()
export class MailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
    private readonly backgroundActivitiesLoggerService: BackgroundActivitiesLoggerService,
  ) {}

  async sendHtmlEmail(options: {
    to: string[];
    subject: string;
    toName?: string;
    paragraphs?: string[];
    cc?: string[];
    bcc?: string[];
    attachments?: Express.Multer.File[];
  }) {
    try {
      const { to, subject, toName, paragraphs, cc, bcc, attachments } = options;

      await this.mailerService.sendMail({
        to,
        cc,
        bcc,
        from: this.configService.get<string>('MAIL_USER'),
        subject,
        attachments: attachments?.map((file) => ({
          filename: file.originalname,
          content: file.buffer,
        })),
        html: `
          ${TDG_EMAIL_HEADER}

          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="padding:26px 28px; font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #333; line-height: 1.9;">
                ${toName ? `<p style="margin:0 0 18px 0;">Dear <strong>${toName}</strong>,</p>` : ''}

                ${paragraphs?.length ? paragraphs.map((paragraph) => `<p style="margin:0 0 18px 0;">${paragraph}</p>`).join('') : ``}

                <p style="margin:0 0 18px 0;">
                  Best regards,<br>
                  Tawer Digital Group Team<br>
                </p>

                <!-- Bottom Spacing -->
                <div style="height:10px;"></div>

              </td>
            </tr>
          </table>

          ${TDG_EMAIL_FOOTER}
      `,
      });
    } catch (error: unknown) {
      this.backgroundActivitiesLoggerService.log(
        `Error while sending email: ${error instanceof Error ? error.message : String(error)}`,
        {
          service: 'Mail Service',
          method: 'Sending HTML Email',
        },
      );

      throw error;
    }
  }
}
