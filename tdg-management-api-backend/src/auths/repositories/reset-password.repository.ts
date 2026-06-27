import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class ResetPasswordRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // creating a reset password
  public createResetPasswordCode(
    userId: string,
    code: string,
    expiredAt: string,
  ) {
    return this.prismaService.resetPasswordCode.upsert({
      where: { userId: userId },
      update: { code: code, expiredAt: expiredAt },
      create: {
        userId: userId,
        code: code,
        expiredAt: expiredAt,
      },
    });
  }

  // retrieving a reset password
  public retrieveUserWithResetPasswordCodeByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        resetPasswordCode: {
          select: {
            code: true,
            expiredAt: true,
          },
        },
      },
    });
  }

  retrieveUserForResetByEmail(email: string) {
    return this.prismaService.user.findUnique({
      where: { email: email },
      select: {
        id: true,
        name: true,
        password: true,
      },
    });
  }

  // updating the password of the user
  public updatePassword(id: string, password: string) {
    return this.prismaService.user.update({
      where: { id: id },
      data: { password: password },
    });
  }
}
