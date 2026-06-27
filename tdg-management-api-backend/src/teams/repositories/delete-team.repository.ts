import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class DeleteTeamRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  deleteTeamById(id: string) {
    return this.prismaService.team.delete({
      where: { id: id },
    });
  }
}
