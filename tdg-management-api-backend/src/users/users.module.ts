import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { AuthsModule } from 'src/auths/auths.module';
import { TokensModule } from 'src/tokens/tokens.module';
import { CreateUserRepository } from './repositories/create-user-repository';
import { UpdateUserRepository } from './repositories/update-user-repository';
import { DeleteUserRepository } from './repositories/delete-user.repository';
import { FetchUserRepository } from './repositories/fetch-user.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';
import { BcryptModule } from 'src/common/bcrypt/bcrypt.module';
import { MailModule } from 'src/common/mail/mail.module';
import { UploadModule } from 'src/common/upload/upload.module';
import { LoggerModule } from 'src/common/logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    BcryptModule,
    AuthsModule,
    TokensModule,
    MailModule,
    UploadModule,
    LoggerModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    CreateUserRepository,
    UpdateUserRepository,
    DeleteUserRepository,
    FetchUserRepository,
  ],
  exports: [UsersService],
})
export class UsersModule {}
