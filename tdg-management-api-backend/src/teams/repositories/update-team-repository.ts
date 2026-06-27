import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { UpdateTeamDto } from '../dto/request/update/update-team.dto';

@Injectable()
export class UpdateTeamRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  updateTeam(id: string, data: UpdateTeamDto) {
    return this.prismaService.team.update({
      where: { id: id },
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
            skipDuplicates: true,
          },
          updateMany:
            data.members?.map((member) => ({
              where: { userId: member.userId },
              data: { isManager: member.isManager },
            })) || [],
          deleteMany: data.members
            ? {
                userId: {
                  notIn: data.members.map((member) => member.userId),
                },
              }
            : undefined,
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
