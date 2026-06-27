import { Module } from '@nestjs/common';
import { MailModule } from './mail/mail.module';
import { TimeModule } from './time/time.module';
import { BcryptModule } from './bcrypt/bcrypt.module';
import { UploadModule } from './upload/upload.module';
import { LoggerModule } from './logger/logger.module';
import { SlugifyModule } from './slugify/slugify.module';
import { PrismaModule } from './prisma/prisma.module';
import { FirebaseModule } from './firebase/firebase.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    MailModule,
    TimeModule,
    BcryptModule,
    UploadModule,
    LoggerModule,
    SlugifyModule,
    PrismaModule,
    FirebaseModule,
    GeminiModule,
  ],
  exports: [MailModule, TimeModule, BcryptModule, UploadModule, SlugifyModule],
})
export class CommonModule {}
