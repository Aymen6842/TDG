import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { BusinessUnit, Prisma } from '@prisma/client';
import { MilestoneQueryDto } from '../dto/request/fetch/milestone-query.dto';

@Injectable()
export class FetchMilestoneRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Build the select object for milestone list view
   * Reusable builder following Projects pattern
   */
  private buildSelectForList() {
    return {
      id: true,
      projectId: true,
      name: true,
      description: true,
      dueDate: true,
      completedAt: true,
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
   * Build the select object for single milestone details
   */
  private buildSelectForDetails() {
    return {
      id: true,
      projectId: true,
      name: true,
      description: true,
      dueDate: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    };
  }

  /**
   * Build the where clause from query filters
   * Following Projects pattern with reusable builder
   */
  private buildWhereClause(
    projectId: string,
    dto: MilestoneQueryDto,
  ): Prisma.MilestoneWhereInput {
    const where: Prisma.MilestoneWhereInput = {
      projectId,
    };

    // Build date filters
    if (dto.dueDateFrom) {
      where.dueDate = {
        gte: new Date(dto.dueDateFrom),
      } as Prisma.DateTimeFilter;
    }
    if (dto.dueDateTo) {
      const existingDueDate = where.dueDate as
        | Prisma.DateTimeFilter
        | undefined;
      where.dueDate = {
        ...(existingDueDate || {}),
        lte: new Date(dto.dueDateTo),
      } as Prisma.DateTimeFilter;
    }

    return where;
  }

  /**
   * Build orderBy from sortBy parameter
   */
  private buildOrderBy(
    sortBy?: string,
  ): Prisma.MilestoneOrderByWithRelationInput {
    if (!sortBy) return { createdAt: 'desc' };

    const sortMap: Record<string, Prisma.MilestoneOrderByWithRelationInput> = {
      createdAtAsc: { createdAt: 'asc' },
      createdAtDesc: { createdAt: 'desc' },
      dueDateAsc: { dueDate: 'asc' },
      dueDateDesc: { dueDate: 'desc' },
      nameAsc: { name: 'asc' },
      nameDesc: { name: 'desc' },
    };

    return sortMap[sortBy] || { createdAt: 'desc' };
  }

  /**
   * Get all milestones for a project with pagination and filtering
   */
  async getMilestones(data: { projectId: string; query: MilestoneQueryDto }) {
    const where = this.buildWhereClause(data.projectId, data.query);
    const orderBy = this.buildOrderBy(data.query.sortBy);

    // Pagination
    const page = data.query.page || 1;
    const limit = data.query.limit || 10;
    const skip = (page - 1) * limit;

    const [milestones, total] = await Promise.all([
      this.prismaService.milestone.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: this.buildSelectForList(),
      }),
      this.prismaService.milestone.count({ where }),
    ]);

    return {
      data: milestones,
      pagination: {
        records: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        perPage: limit,
      },
    };
  }

  /**
   * Get milestone by ID
   */
  getMilestoneById(data: { milestoneId: string; projectId: string }) {
    return this.prismaService.milestone.findFirstOrThrow({
      where: {
        id: data.milestoneId,
        projectId: data.projectId,
      },
      select: this.buildSelectForDetails(),
    });
  }

  // ================================================================
  // Gantt chart data methods
  // ================================================================

  /**
   * Find all milestones for a project (Gantt chart)
   */
  findAllMilestones(data: { projectId: string }) {
    return this.prismaService.milestone.findMany({
      where: { projectId: data.projectId },
      orderBy: { dueDate: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        dueDate: true,
        completedAt: true,
      },
    });
  }

  /**
   * Find all epics for a project (Gantt chart)
   */
  findAllEpics(data: { projectId: string }) {
    return this.prismaService.epic.findMany({
      where: { projectId: data.projectId },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  /**
   * Find all sprints for a project (Gantt chart)
   */
  findAllSprints(data: { projectId: string }) {
    return this.prismaService.sprint.findMany({
      where: { projectId: data.projectId },
      orderBy: { startDate: 'asc' },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
      },
    });
  }

  /**
   * Find all tasks for a project (Gantt chart)
   */
  findAllTasks(data: { projectId: string }) {
    return this.prismaService.task.findMany({
      where: { projectId: data.projectId },
      select: {
        id: true,
        key: true,
        title: true,
        type: true,
        priority: true,
        status: true,
        dueDate: true,
        completedAt: true,
        storyPoints: true,
        epicId: true,
        sprintId: true,
        createdAt: true,
      },
    });
  }

  /**
   * Count done tasks per milestone (batch query for progress calculation)
   */
  async countDoneTasksByMilestones(data: { milestoneIds: string[] }) {
    const results = await this.prismaService.task.groupBy({
      by: ['milestoneId'],
      where: {
        milestoneId: { in: data.milestoneIds },
        status: 'DONE',
      },
      _count: true,
    });

    const map: Record<string, number> = {};
    for (const r of results) {
      if (r.milestoneId) {
        map[r.milestoneId] = r._count;
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
}
