import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prismaService: PrismaService) {}

  deleteRefreshToken(refresh: string) {
    return this.prismaService.refreshToken.delete({
      where: {
        token: refresh,
      },
    });
  }

  countRefreshToken(refresh: string) {
    return this.prismaService.refreshToken.count({
      where: {
        token: refresh,
      },
    });
  }
}
