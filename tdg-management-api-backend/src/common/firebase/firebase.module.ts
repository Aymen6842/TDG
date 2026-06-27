import { FirebaseService } from './service/firebase.service';
import { FetchNotificationsRepository } from 'src/notifications/repositories/fetch-notifications.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ErrorLoggerService } from '../logger/error-logger/error-logger.service';
import * as admin from 'firebase-admin';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: 'FIREBASE_APP',
      inject: [ConfigService],
      useFactory: (configService: ConfigService): admin.app.App | null => {
        try {
          const privateKey = configService
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n');

          return admin.initializeApp({
            credential: admin.credential.cert({
              projectId: configService.get<string>('FIREBASE_PROJECT_ID'),
              clientEmail: configService.get<string>('FIREBASE_CLIENT_EMAIL'),
              privateKey,
            }),
          });
        } catch {
          return null; // prevent crash
        }
      },
    },
    FirebaseService,
    FetchNotificationsRepository,
    ErrorLoggerService,
  ],
  exports: ['FIREBASE_APP', FirebaseService],
})
export class FirebaseModule {}
