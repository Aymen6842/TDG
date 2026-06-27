import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class LoginRepository {
  constructor(private readonly prismaService: PrismaService) {}

  retrieveDataForLoginByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email, isActive: true },
      select: {
        id: true,
        email: true,
        phone: true,
        image: true,
        password: true,
        roles: {
          select: { type: true },
        },
        teams: { select: { teamId: true } },
      },
    });
  }

  retrieveDataForLoginByPhone(phone: string) {
    return this.prismaService.user.findUnique({
      where: { phone: phone, isActive: true },
      select: {
        id: true,
        email: true,
        phone: true,
        image: true,
        password: true,
        roles: {
          select: { type: true },
        },
        teams: { select: { teamId: true } },
      },
    });
  }

  saveRefreshToken(userId: string, refresh: string) {
    return this.prismaService.refreshToken.create({
      data: {
        userId: userId,
        token: refresh,
      },
    });
  }
}
