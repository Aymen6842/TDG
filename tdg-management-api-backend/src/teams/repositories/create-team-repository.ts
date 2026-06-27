import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CreateTeamDto } from '../dto/request/post/create-team.dto';

@Injectable()
export class CreateTeamRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  createTeam(data: CreateTeamDto) {
    return this.prismaService.team.create({
      data: {
        name: data.name,
        unaccentedName: data.unaccentedName as string,
        members: {
          createMany: {
            data:
              data.members?.map((member) => ({
                userId: member.userId,
                isManager: member.isManager,
              })) || [],
          },
        },
      },
      select: {
        id: true,
        name: true,
        members: {
          select: { userId: true, isManager: true },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
