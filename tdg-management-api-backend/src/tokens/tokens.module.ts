import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { TokensService } from './service/tokens.service';
import { TokensController } from './controllers/tokens.controller';
import { JwtModule } from '@nestjs/jwt';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { PrismaModule } from 'src/common/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('SECRET_KEY'),
      }),
    }),
  ],
  controllers: [TokensController],
  providers: [TokensService, RefreshTokenRepository],
  exports: [TokensService],
})
export class TokensModule {}
