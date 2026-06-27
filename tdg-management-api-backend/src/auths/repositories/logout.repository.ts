import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class LogoutRepository {
  constructor(private readonly prismaService: PrismaService) {}

  deleteRefreshToken(userId: string, token: string) {
    return this.prismaService.refreshToken.delete({
      where: {
        token_userId: {
          token: token,
          userId: userId,
        },
      },
    });
  }
}
