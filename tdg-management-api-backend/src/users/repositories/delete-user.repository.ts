import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteUserRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteUserById(id: string) {
    return this.prismaService.user.delete({
      where: { id: id },
    });
  }
}
