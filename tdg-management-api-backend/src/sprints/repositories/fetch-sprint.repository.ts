import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { SprintQueryDto } from '../dto/request/fetch/sprint-query.dto';
import { Prisma, Language, SprintStatus, BusinessUnit } from '@prisma/client';
import { SprintSortBy } from '../types/request.type';

export type SprintWithRelations = Prisma.SprintGetPayload<{
  select: {
    id: true;
    projectId: true;
    createdById: true;
    status: true;
    capacity: true;
    startDate: true;
    endDate: true;
    estimatedStartDate: true;
    estimatedEndDate: true;
    createdAt: true;
    updatedAt: true;
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
    attachments: {
      select: {
        id: true;
        attachment: true;
        createdAt: true;
      };
    };
  };
}>;

export type SprintWithDetails = Prisma.SprintGetPayload<{
  select: {
    id: true;
    projectId: true;
    createdById: true;
    status: true;
    capacity: true;
    startDate: true;
    endDate: true;
    estimatedStartDate: true;
    estimatedEndDate: true;
    createdAt: true;
    updatedAt: true;
    contents: {
      where: { language: Language };
      select: {
        id: true;
        name: true;
        description: true;
        details: true;
      };
    };
    attachments: {
      select: {
        id: true;
        attachment: true;
        createdAt: true;
      };
    };
    tasks: {
      select: {
        id: true;
        title: true;
        status: true;
        labels: {
          select: {
            label: {
              select: {
                id: true;
                name: true;
                color: true;
              };
            };
          };
        };
      };
    };
  };
}>;

@Injectable()
export class FetchSprintRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  private buildSelectWithLanguage(language?: Language) {
    return {
      id: true,
      projectId: true,
      createdById: true,
      status: true,
      capacity: true,
      startDate: true,
      endDate: true,
      estimatedStartDate: true,
      estimatedEndDate: true,
      createdAt: true,
      updatedAt: true,
      contents: {
        where: language ? { language } : undefined,
        select: {
          id: true,
          name: true,
          unaccentedName: true,
          description: true,
          details: true,
        },
      },
      attachments: {
        select: {
          id: true,
          attachment: true,
          createdAt: true,
        },
      },
    };
  }

  findById(data: {
    id: string;
    language?: Language;
  }): Promise<SprintWithRelations> {
    return this.prismaService.sprint.findUniqueOrThrow({
      where: { id: data.id },
      select: this.buildSelectWithLanguage(data.language),
    });
  }

  findSprintWithDetails(data: { id: string; language?: Language }) {
    return this.prismaService.sprint.findUniqueOrThrow({
      where: { id: data.id },
      select: {
        id: true,
        projectId: true,
        createdById: true,
        status: true,
        capacity: true,
        startDate: true,
        endDate: true,
        estimatedStartDate: true,
        estimatedEndDate: true,
        createdAt: true,
        updatedAt: true,
        contents: {
          where: data.language ? { language: data.language } : undefined,
          select: {
            id: true,
            name: true,
            description: true,
            details: true,
          },
        },
        attachments: {
          select: {
            id: true,
            attachment: true,
            createdAt: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            labels: {
              select: {
                label: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        },
      },
    });
  }

  findSprintWithDetailsWithPermission(data: {
    id: string;
    userId: string | null;
    language?: Language;
  }) {
    return this.prismaService.sprint.findFirstOrThrow({
      where: {
        id: data.id,
        ...(data.userId
          ? {
              project: {
                members: {
                  some: {
                    userId: data.userId,
                  },
                },
              },
            }
          : {}),
      },
      select: {
        id: true,
        projectId: true,
        createdById: true,
        status: true,
        capacity: true,
        startDate: true,
        endDate: true,
        estimatedStartDate: true,
        estimatedEndDate: true,
        createdAt: true,
        updatedAt: true,
        contents: {
          where: data.language ? { language: data.language } : undefined,
          select: {
            id: true,
            name: true,
            description: true,
            details: true,
          },
        },
        attachments: {
          select: {
            id: true,
            attachment: true,
            createdAt: true,
          },
        },
        tasks: {
          select: {
            id: true,
            title: true,
            status: true,
            labels: {
              select: {
                label: {
                  select: { id: true, name: true, color: true },
                },
              },
            },
          },
        },
      },
    });
  }

  listSprints(data: {
    projectId: string;
    query: SprintQueryDto;
    language?: Language;
    userId?: string | null;
  }): Promise<SprintWithRelations[]> {
    const where = this.buildWhereClause(
      data.projectId,
      data.query,
      data.language,
      data.userId ?? null,
    );
    const skip = data.query.skip ?? 0;
    const take = data.query.take ?? 10;

    const orderBy: Prisma.SprintOrderByWithRelationInput[] = [];

    if (data.query.sortBy && data.query.sortBy.length > 0) {
      for (const sort of data.query.sortBy) {
        switch (sort) {
          case SprintSortBy.START_DATE_ASC:
            orderBy.push({ startDate: 'asc' });
            break;
          case SprintSortBy.START_DATE_DESC:
            orderBy.push({ startDate: 'desc' });
            break;
          case SprintSortBy.END_DATE_ASC:
            orderBy.push({ endDate: 'asc' });
            break;
          case SprintSortBy.END_DATE_DESC:
            orderBy.push({ endDate: 'desc' });
            break;
          case SprintSortBy.ESTIMATED_START_DATE_ASC:
            orderBy.push({ estimatedStartDate: 'asc' });
            break;
          case SprintSortBy.ESTIMATED_START_DATE_DESC:
            orderBy.push({ estimatedStartDate: 'desc' });
            break;
          case SprintSortBy.ESTIMATED_END_DATE_ASC:
            orderBy.push({ estimatedEndDate: 'asc' });
            break;
          case SprintSortBy.ESTIMATED_END_DATE_DESC:
            orderBy.push({ estimatedEndDate: 'desc' });
            break;
          case SprintSortBy.CREATED_AT_ASC:
            orderBy.push({ createdAt: 'asc' });
            break;
          case SprintSortBy.CREATED_AT_DESC:
            orderBy.push({ createdAt: 'desc' });
            break;
        }
      }
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    orderBy.push({ createdAt: 'desc' }, { id: 'asc' });

    return this.prismaService.sprint.findMany({
      where,
      skip,
      take,
      orderBy,
      select: this.buildSelectWithLanguage(data.language),
    });
  }

  countSprints(data: {
    projectId: string;
    query: SprintQueryDto;
    language?: Language;
    userId?: string | null;
  }): Promise<number> {
    const where = this.buildWhereClause(
      data.projectId,
      data.query,
      data.language,
      data.userId ?? null,
    );

    return this.prismaService.sprint.count({ where });
  }

  findSprintProject(data: { sprintId: string }): Promise<string | null> {
    return this.prismaService.sprint
      .findUnique({
        where: { id: data.sprintId },
        select: { projectId: true },
      })
      .then((sprint) => sprint?.projectId ?? null);
  }

  private buildWhereClause(
    projectId: string,
    query: SprintQueryDto,
    language?: Language,
    userId?: string | null,
  ): Prisma.SprintWhereInput {
    const where: Prisma.SprintWhereInput = {
      projectId,
      ...(userId
        ? {
            project: {
              members: {
                some: {
                  userId,
                },
              },
            },
          }
        : {}),
    };

    if (query.name || language) {
      where.contents = {
        some: {
          ...(language && { language }),
          ...(query.name && {
            OR: [
              {
                name: {
                  contains: query.name,
                  mode: 'insensitive',
                },
              },
              {
                unaccentedName: {
                  contains: query.name,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        },
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDateFrom || query.startDateTo) {
      where.startDate = {};
      if (query.startDateFrom) {
        where.startDate.gte = query.startDateFrom;
      }
      if (query.startDateTo) {
        where.startDate.lte = query.startDateTo;
      }
    }

    if (query.endDateFrom || query.endDateTo) {
      where.endDate = {};
      if (query.endDateFrom) {
        where.endDate.gte = query.endDateFrom;
      }
      if (query.endDateTo) {
        where.endDate.lte = query.endDateTo;
      }
    }

    if (query.estimatedStartDateFrom || query.estimatedStartDateTo) {
      where.estimatedStartDate = {};
      if (query.estimatedStartDateFrom) {
        where.estimatedStartDate.gte = query.estimatedStartDateFrom;
      }
      if (query.estimatedStartDateTo) {
        where.estimatedStartDate.lte = query.estimatedStartDateTo;
      }
    }

    if (query.estimatedEndDateFrom || query.estimatedEndDateTo) {
      where.estimatedEndDate = {};
      if (query.estimatedEndDateFrom) {
        where.estimatedEndDate.gte = query.estimatedEndDateFrom;
      }
      if (query.estimatedEndDateTo) {
        where.estimatedEndDate.lte = query.estimatedEndDateTo;
      }
    }

    if (query.createdAtFrom || query.createdAtTo) {
      where.createdAt = {};
      if (query.createdAtFrom) {
        where.createdAt.gte = query.createdAtFrom;
      }
      if (query.createdAtTo) {
        where.createdAt.lte = query.createdAtTo;
      }
    }

    return where;
  }

  findSprintWithTasksForBurndown(data: {
    sprintId: string;
    language?: Language;
  }) {
    return this.prismaService.sprint.findUniqueOrThrow({
      where: { id: data.sprintId },
      select: {
        id: true,
        projectId: true,
        status: true,
        startDate: true,
        endDate: true,
        contents: {
          where: { language: data.language ?? Language.English },
          select: { name: true },
        },
        tasks: {
          select: {
            id: true,
            storyPoints: true,
            status: true,
            completedAt: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findProjectMemberIds(data: { projectId: string }) {
    return this.prismaService.projectMember
      .findMany({
        where: { projectId: data.projectId },
        select: { userId: true },
      })
      .then((members) => members.map((m) => m.userId));
  }

  findCompletedSprintsWithPoints(data: { projectId: string }) {
    return this.prismaService.sprint
      .findMany({
        where: {
          projectId: data.projectId,
          status: SprintStatus.Completed,
        },
        orderBy: [{ endDate: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
          startDate: true,
          endDate: true,
          capacity: true,
          contents: {
            select: { name: true },
            take: 1,
          },
          tasks: {
            where: { status: 'DONE' },
            select: { storyPoints: true },
          },
        },
      })
      .then((sprints) =>
        sprints.map((sprint) => {
          const completedPoints = sprint.tasks.reduce(
            (sum, t) => sum + (t.storyPoints ?? 0),
            0,
          );
          return {
            sprintId: sprint.id,
            name: sprint.contents?.[0]?.name ?? 'Sprint',
            startDate: sprint.startDate,
            endDate: sprint.endDate,
            capacity: sprint.capacity ?? null,
            completedPoints,
          };
        }),
      );
  }

  hasProjectAccess(data: {
    projectId: string;
    userId: string | null;
  }): Promise<boolean> {
    if (!data.userId) {
      return Promise.resolve(true);
    }

    return this.prismaService.project
      .findFirst({
        where: {
          id: data.projectId,
          members: {
            some: {
              userId: data.userId,
            },
          },
        },
        select: { id: true },
      })
      .then((project) => !!project);
  }

  findProjectType(data: { projectId: string }): Promise<string | null> {
    return this.prismaService.project
      .findUnique({
        where: { id: data.projectId },
        select: { projectType: true },
      })
      .then((project) => project?.projectType ?? null);
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

  findMembership(data: {
    userId: string;
    projectId: string;
  }): Promise<{ id: string; userId: string; isManager: boolean } | null> {
    return this.prismaService.projectMember.findFirst({
      where: {
        userId: data.userId,
        projectId: data.projectId,
      },
      select: { id: true, userId: true, isManager: true },
    });
  }

  findProjectDates(data: {
    projectId: string;
  }): Promise<{ startDate: Date; endDate: Date }> {
    return this.prismaService.project.findUniqueOrThrow({
      where: { id: data.projectId },
      select: { startDate: true, endDate: true },
    });
  }

  findRunningSprint(data: {
    projectId: string;
    excludeSprintId?: string;
  }): Promise<{ id: string } | null> {
    return this.prismaService.sprint.findFirst({
      where: {
        projectId: data.projectId,
        status: SprintStatus.Running,
        id: data.excludeSprintId ? { not: data.excludeSprintId } : undefined,
      },
      select: { id: true },
    });
  }
}
