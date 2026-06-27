import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

@Injectable()
export class ManagePermissionsRepository {
  constructor(private readonly prismaService: PrismaService) {}

  getRolesByUsersIds(usersIds: string[]) {
    return this.prismaService.role.findMany({
      where: { userId: { in: usersIds } },
      select: {
        userId: true,
        type: true,
      },
    });
  }

  isManagerWithUsers(managerId: string, usersIds: string[]) {
    return this.prismaService.userTeam.findFirst({
      where: {
        userId: managerId,
        isManager: true,
        team: {
          members: {
            some: {
              userId: { in: usersIds },
            },
          },
        },
      },
    });
  }

  countTeamByIdsAndMembersRoles(teamIds: string[], roles: UserType[]) {
    return this.prismaService.team.count({
      where: {
        id: { in: teamIds },
        members: {
          some: {
            user: {
              roles: {
                some: {
                  type: { in: roles },
                },
              },
            },
          },
        },
      },
    });
  }
}
