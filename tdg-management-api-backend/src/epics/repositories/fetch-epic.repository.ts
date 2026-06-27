import { Injectable } from '@nestjs/common';
import { BusinessUnit, Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { EpicQueryDto } from '../dto/request/fetch/epic-query.dto';
import { EpicSortBy } from '../types/request.type';

@Injectable()
export class FetchEpicRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Build the select object for epic list view
   * Reusable builder following Projects pattern
   */
  private buildSelectForList() {
    return {
      id: true,
      projectId: true,
      name: true,
      description: true,
      color: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          tasks: true,
        },
      },
    };
  }

  /**
   * Build the select object for single epic details
   */
  private buildSelectForDetails() {
    return {
      id: true,
      projectId: true,
      name: true,
      description: true,
      color: true,
      startDate: true,
      endDate: true,
      createdAt: true,
      updatedAt: true,
      tasks: {
        select: {
          id: true,
          key: true,
          title: true,
          description: true,
          type: true,
          priority: true,
          status: true,
          storyPoints: true,
          dueDate: true,
          completedAt: true,
          createdAt: true,
        },
      },
    };
  }

  /**
   * Build the where clause from query filters
   * Following Projects pattern with reusable builder
   */
  private buildWhereClause(
    projectId: string,
    data: EpicQueryDto,
  ): Prisma.EpicWhereInput {
    const where: Prisma.EpicWhereInput = {
      projectId: projectId,
    };

    // Build date filters
    if (data.startDateFrom) {
      where.startDate = {
        gte: new Date(data.startDateFrom),
      } as Prisma.DateTimeFilter;
    }
    if (data.startDateTo) {
      const existingStartDate = where.startDate as
        | Prisma.DateTimeFilter
        | undefined;
      where.startDate = {
        ...(existingStartDate || {}),
        lte: new Date(data.startDateTo),
      } as Prisma.DateTimeFilter;
    }
    if (data.endDateFrom) {
      where.endDate = {
        gte: new Date(data.endDateFrom),
      } as Prisma.DateTimeFilter;
    }
    if (data.endDateTo) {
      const existingEndDate = where.endDate as
        | Prisma.DateTimeFilter
        | undefined;
      where.endDate = {
        ...(existingEndDate || {}),
        lte: new Date(data.endDateTo),
      } as Prisma.DateTimeFilter;
    }

    return where;
  }

  /**
   * Build orderBy from sortBy parameter
   */
  private buildOrderBy(
    sortBy?: EpicSortBy,
  ): Prisma.EpicOrderByWithRelationInput {
    if (!sortBy) return { createdAt: 'desc' };

    const sortMap: Record<EpicSortBy, Prisma.EpicOrderByWithRelationInput> = {
      [EpicSortBy.CREATED_AT_ASC]: { createdAt: 'asc' },
      [EpicSortBy.CREATED_AT_DESC]: { createdAt: 'desc' },
      [EpicSortBy.START_DATE_ASC]: { startDate: 'asc' },
      [EpicSortBy.START_DATE_DESC]: { startDate: 'desc' },
      [EpicSortBy.END_DATE_ASC]: { endDate: 'asc' },
      [EpicSortBy.END_DATE_DESC]: { endDate: 'desc' },
      [EpicSortBy.NAME_ASC]: { name: 'asc' },
      [EpicSortBy.NAME_DESC]: { name: 'desc' },
    };

    return sortMap[sortBy] || { createdAt: 'desc' };
  }

  /**
   * Get all epics for a project with pagination and filtering
   */
  async getEpics(data: { projectId: string; query: EpicQueryDto }) {
    const where = this.buildWhereClause(data.projectId, data.query);
    const orderBy = this.buildOrderBy(data.query.sortBy);

    // Pagination
    const page = data.query.page ?? 1;
    const limit = data.query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [epics, total] = await Promise.all([
      this.prismaService.epic.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: this.buildSelectForList(),
      }),
      this.prismaService.epic.count({ where }),
    ]);

    return {
      data: epics,
      pagination: {
        records: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  /**
   * Get epic by ID
   */
  getEpicById(data: { epicId: string; projectId: string }) {
    return this.prismaService.epic.findFirstOrThrow({
      where: {
        id: data.epicId,
        projectId: data.projectId,
      },
      select: this.buildSelectForDetails(),
    });
  }

  findById(data: { epicId: string; projectId: string }) {
    return this.prismaService.epic.findFirstOrThrow({
      where: {
        id: data.epicId,
        projectId: data.projectId,
      },
      select: {
        id: true,
        projectId: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  /**
   * Count done tasks per epic (batch query for progress calculation)
   */
  async countDoneTasksByEpics(data: { epicIds: string[] }) {
    const results = await this.prismaService.task.groupBy({
      by: ['epicId'],
      where: {
        epicId: { in: data.epicIds },
        status: 'DONE',
      },
      _count: true,
    });

    const map: Record<string, number> = {};
    for (const r of results) {
      if (r.epicId) {
        map[r.epicId] = r._count;
      }
    }
    return map;
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

  findProjectDates(data: { projectId: string }): Promise<{
    startDate: Date;
    endDate: Date;
  }> {
    return this.prismaService.project.findUniqueOrThrow({
      where: { id: data.projectId },
      select: {
        startDate: true,
        endDate: true,
      },
    });
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
      select: {
        id: true,
        userId: true,
        isManager: true,
      },
    });
  }

  countLinkedTasks(data: {
    epicId: string;
    projectId: string;
  }): Promise<number> {
    return this.prismaService.task.count({
      where: {
        epicId: data.epicId,
        projectId: data.projectId,
      },
    });
  }
}
