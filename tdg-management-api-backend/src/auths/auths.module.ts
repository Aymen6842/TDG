import { Module } from '@nestjs/common';

import { AuthsController } from './controller/auths.controller';
import { ResetPasswordService } from './services/reset-password/reset-password.service';
import { AccountRegistrationService } from './services/account-registration/account-registration.service';
import { LoginService } from './services/login/login.service';
import { LogoutService } from './services/logout/logout.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenRepository } from 'src/tokens/repositories/refresh-token.repository';
import { ConfigService } from '@nestjs/config';
import { LoginRepository } from './repositories/login.repository';
import { LogoutRepository } from './repositories/logout.repository';
import { AccountRegistrationRepository } from './repositories/registration.repository';
import { ResetPasswordRepository } from './repositories/reset-password.repository';
import { HttpModule } from '@nestjs/axios';
import { TokensModule } from 'src/tokens/tokens.module';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { MailModule } from 'src/common/mail/mail.module';
import { BcryptModule } from 'src/common/bcrypt/bcrypt.module';
import { LoggerModule } from 'src/common/logger/logger.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { ManagePermissionsRepository } from './repositories/manage-permissions.repository';
import { PermissionsService } from './services/permissions/permissions.service';

@Module({
  controllers: [AuthsController],
  providers: [
    ResetPasswordService,
    AccountRegistrationService,
    LoginService,
    LogoutService,
    JwtService,
    RefreshTokenRepository,
    ConfigService,
    LoginRepository,
    LogoutRepository,
    AccountRegistrationRepository,
    ResetPasswordRepository,
    PermissionsService,
    ManagePermissionsRepository,
  ],
  imports: [
    HttpModule.register({
      timeout: 5000, // axios configuration
      maxRedirects: 5,
    }),
    UploadModule,
    PrismaModule,
    MailModule,
    BcryptModule,
    TokensModule,
    LoggerModule,
  ],
  exports: [LoginService, PermissionsService],
})
export class AuthsModule {}
