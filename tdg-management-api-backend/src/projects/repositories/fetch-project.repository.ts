import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { ProjectQueryDto } from '../dto/request/fetch/project-query.dto';
import { Prisma, Language, BusinessUnit, SprintStatus } from '@prisma/client';
import { ProjectSortByOptions } from '../types/request.type';

export type ProjectWithRelations = Prisma.ProjectGetPayload<{
  select: {
    id: true;
    businessUnit: true;
    status: true;
    paid: true;
    projectType: true;
    kanbanSettings: true;
    startDate: true;
    endDate: true;
    estimatedStartDate: true;
    estimatedEndDate: true;
    displayOrder: true;
    createdAt: true;
    updatedAt: true;
    createdBy: {
      select: {
        id: true;
        name: true;
      };
    };
    members: {
      select: {
        id: true;
        isManager: true;
        user: {
          select: {
            id: true;
            name: true;
            roles: {
              select: {
                type: true;
              };
            };
          };
        };
      };
    };
    contents: {
      where: { language: Language };
      select: {
        id: true;
        name: true;
        unaccentedName: true;
        description: true;
        details: true;
      };
    };
  };
}>;

@Injectable()
export class FetchProjectRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private buildWhereClause(
    data: ProjectQueryDto,
    language?: Language,
  ): Prisma.ProjectWhereInput {
    const memberFilters: Prisma.ProjectWhereInput[] = [];

    if (data.requestUserId) {
      memberFilters.push({
        members: {
          some: {
            userId: data.requestUserId,
          },
        },
      });
    }

    if (data.memberName) {
      memberFilters.push({
        members: {
          some: {
            user: {
              is: {
                name: {
                  contains: data.memberName,
                  mode: Prisma.QueryMode.insensitive,
                },
              },
            },
          },
        },
      });
    }

    return {
      ...(memberFilters.length > 0 && { AND: memberFilters }),
      ...(data.businessUnit && { businessUnit: data.businessUnit }),
      ...(data.status && { status: data.status }),
      ...(data.paid !== undefined && { paid: data.paid }),
      ...((data.name || language) && {
        contents: {
          some: {
            ...(language && { language }),
            ...(data.name && {
              OR: [
                {
                  name: {
                    contains: data.name,
                    mode: 'insensitive',
                  },
                },
                {
                  unaccentedName: {
                    contains: data.name,
                    mode: 'insensitive',
                  },
                },
              ],
            }),
          },
        },
      }),
      ...(data.estimatedStartDateFrom && {
        estimatedStartDate: {
          gte: new Date(data.estimatedStartDateFrom),
        },
      }),
      ...(data.estimatedEndDateTo && {
        estimatedEndDate: {
          lte: new Date(data.estimatedEndDateTo),
        },
      }),
      ...((data.startDateFrom || data.startDateTo) && {
        startDate: {
          ...(data.startDateFrom && {
            gte: new Date(data.startDateFrom),
          }),
          ...(data.startDateTo && {
            lte: new Date(data.startDateTo),
          }),
        },
      }),
      ...((data.createdAtFrom || data.createdAtTo) && {
        createdAt: {
          ...(data.createdAtFrom && {
            gte: new Date(data.createdAtFrom),
          }),
          ...(data.createdAtTo && {
            lte: new Date(data.createdAtTo),
          }),
        },
      }),
    };
  }

  /**
   * Build the select object with language filter
   */
  private buildSelectWithLanguage(language?: Language) {
    return {
      id: true,
      businessUnit: true,
      status: true,
      paid: true,
      projectType: true,
      kanbanSettings: true,
      startDate: true,
      endDate: true,
      estimatedStartDate: true,
      estimatedEndDate: true,
      displayOrder: true,
      createdAt: true,
      updatedAt: true,
      createdById: true,
      isArchived: true,
      archivedAt: true,
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      members: {
        select: {
          id: true,
          userId: true,
          isManager: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              roles: {
                select: {
                  type: true,
                },
              },
            },
          },
        },
      },
      contents: {
        where: language ? { language } : undefined,
        select: {
          id: true,
          name: true,
          unaccentedName: true,
          description: true,
          details: true,
          createdAt: true,
        },
      },
      invitations: {
        select: {
          id: true,
          email: true,
          status: true,
          expiresAt: true,
          createdAt: true,
          invitedById: true,
          isManager: true,
        },
      },
    };
  }

  listProjects(
    data: ProjectQueryDto,
    language?: Language,
  ): Promise<ProjectWithRelations[]> {
    const orderBy: Prisma.ProjectOrderByWithRelationInput[] = [
      { displayOrder: 'asc' },
    ];

    switch (data.sortBy) {
      case ProjectSortByOptions.DisplayOrderAsc:
        break;
      case ProjectSortByOptions.EstimatedStartDateAsc:
        orderBy.push({ estimatedStartDate: 'asc' });
        break;
      case ProjectSortByOptions.EstimatedStartDateDesc:
        orderBy.push({ estimatedStartDate: 'desc' });
        break;
      case ProjectSortByOptions.StartDateAsc:
        orderBy.push({ startDate: 'asc' });
        break;
      case ProjectSortByOptions.StartDateDesc:
        orderBy.push({ startDate: 'desc' });
        break;
      case ProjectSortByOptions.CreatedAtAsc:
        orderBy.push({ createdAt: 'asc' });
        break;
      case ProjectSortByOptions.CreatedAtDesc:
      default:
        orderBy.push({ createdAt: 'desc' });
        break;
      case ProjectSortByOptions.EstimatedEndDateAsc:
        orderBy.push({ estimatedEndDate: 'asc' });
        break;
      case ProjectSortByOptions.EstimatedEndDateDesc:
        orderBy.push({ estimatedEndDate: 'desc' });
        break;
    }

    orderBy.push({ createdAt: 'desc' }, { id: 'asc' });

    return this.prismaService.project.findMany({
      where: this.buildWhereClause(data, language),
      orderBy,
      skip: data.skip ?? 0,
      take: data.take ?? 10,
      select: this.buildSelectWithLanguage(language),
    });
  }

  countProjects(data: ProjectQueryDto, language?: Language): Promise<number> {
    return this.prismaService.project.count({
      where: this.buildWhereClause(data, language),
    });
  }

  getProjectByIdWithPermission(data: {
    projectId: string;
    userId: string | null;
    businessUnit?: BusinessUnit | null;
  }): Promise<ProjectWithRelations> {
    return this.prismaService.project.findFirstOrThrow({
      where: {
        id: data.projectId,
        ...(data.businessUnit ? { businessUnit: data.businessUnit } : {}),
        ...(data.userId
          ? {
              members: {
                some: {
                  userId: data.userId,
                },
              },
            }
          : {}),
      },
      select: this.buildSelectWithLanguage(),
    });
  }

  findProjectBusinessUnit(data: {
    projectId: string;
  }): Promise<BusinessUnit | null> {
    return this.prismaService.project
      .findUnique({
        where: { id: data.projectId },
        select: { businessUnit: true },
      })
      .then((project) => project?.businessUnit ?? null);
  }

  findMember(data: { projectId: string; userId: string }) {
    return this.prismaService.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: data.projectId,
          userId: data.userId,
        },
      },
      select: {
        id: true,
        userId: true,
        projectId: true,
        isManager: true,
        createdAt: true,
        user: {
          select: {
            name: true,
          },
        },
      },
    });
  }

  countManagers(data: { projectId: string }): Promise<number> {
    return this.prismaService.projectMember.count({
      where: {
        projectId: data.projectId,
        isManager: true,
      },
    });
  }

  getMemberById(data: { memberId: string }) {
    return this.prismaService.projectMember.findUnique({
      where: { id: data.memberId },
      select: { id: true, userId: true, isManager: true, projectId: true },
    });
  }

  findUserByEmail(data: { email: string }) {
    return this.prismaService.user.findUnique({
      where: { email: data.email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
  }

  findUserById(data: { userId: string }) {
    return this.prismaService.user.findUnique({
      where: { id: data.userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }

  findProjectTaskStatuses(data: { projectId: string }) {
    return this.prismaService.projectTaskStatus.findMany({
      where: {
        projectId: data.projectId,
        isArchived: false,
      },
      select: {
        name: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }

  getCapacitySnapshot(data: { projectId: string }) {
    return this.prismaService.project.findUnique({
      where: { id: data.projectId },
      select: {
        id: true,
        members: {
          select: {
            userId: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        sprints: {
          where: {
            status: {
              in: [SprintStatus.Pending, SprintStatus.Running],
            },
          },
          select: {
            id: true,
            capacity: true,
            status: true,
            tasks: {
              where: {
                archived: false,
              },
              select: {
                storyPoints: true,
                assigneeId: true,
              },
            },
          },
        },
      },
    });
  }
}
