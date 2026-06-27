import { Injectable, Inject } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ErrorLoggerService } from 'src/common/logger/error-logger/error-logger.service';

@Injectable()
export class FirebaseService {
  constructor(
    @Inject('FIREBASE_APP') private readonly firebaseApp: admin.app.App,
    private readonly logger: ErrorLoggerService,
  ) {}

  public async sendNotificationsToUsers(
    tokens: string[],
    title: string,
    body: string,
    imageUrl?: string | null,
  ) {
    try {
      const response = await this.firebaseApp.messaging().sendEachForMulticast({
        tokens,
        notification: {
          title,
          body,
          imageUrl: imageUrl || undefined,
        },
      });

      response.responses.forEach((res, index) => {
        if (res.error) {
          this.logger.error(`Error sending notifications to users`, {
            method: 'Send Notifications to Users',
            endpoint: 'Firebase Cloud Messaging',
            status: 500,
            message:
              res.error instanceof Error
                ? res.error.stack || ''
                : 'No stack trace',
          });
        }
        if (res.success) {
          this.logger.log(`Notification sent to user ${tokens[index]}`, {
            method: 'Send Notifications to Users',
            endpoint: 'Firebase Cloud Messaging',
            status: 200,
            message: 'Notification sent successfully',
          });
        }
      });
    } catch (error: unknown) {
      this.logger.error(`Error sending notifications to users`, {
        method: 'Send Notifications to Users',
        endpoint: 'Firebase Cloud Messaging',
        status: 400,
        message: error instanceof Error ? error.stack || '' : 'No stack trace',
      });
    }
  }
}
