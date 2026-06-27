import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { FilterTeamsParametersDto } from '../dto/request/fetch/filter-teams-parameters.dto';

@Injectable()
export class FetchTeamRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  getTeamById(teamId: string) {
    return this.prismaService.team.findUniqueOrThrow({
      where: { id: teamId },
      select: {
        id: true,
        name: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                image: true,
                roles: { select: { type: true } },
              },
            },
            isManager: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  countFiltredTeams(data: FilterTeamsParametersDto) {
    return this.prismaService.team.count({
      where: {
        ...(data.search && {
          OR: [
            {
              unaccentedName: { startsWith: data.search, mode: 'insensitive' },
            },
            { unaccentedName: { contains: data.search, mode: 'insensitive' } },
            { unaccentedName: { equals: data.search, mode: 'insensitive' } },
          ],
        }),
      },
    });
  }

  filterTeams(data: FilterTeamsParametersDto, skip?: number, take?: number) {
    return this.prismaService.team.findMany({
      where: {
        ...(data.search && {
          OR: [
            {
              unaccentedName: { startsWith: data.search, mode: 'insensitive' },
            },
            { unaccentedName: { contains: data.search, mode: 'insensitive' } },
            { unaccentedName: { equals: data.search, mode: 'insensitive' } },
          ],
        }),
      },
      select: {
        id: true,
        name: true,
        members: {
          select: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                image: true,
                roles: { select: { type: true } },
              },
            },
            isManager: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
      skip: skip,
      take: take,
    });
  }
}
