import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import {
  BusinessUnit,
  Prisma,
  ReminderEntityType,
  ReminderStatus,
} from '@prisma/client';
import { ReminderSortBy } from '../types/request.type';

@Injectable()
export class FetchReminderRepository {
  constructor(protected readonly prismaService: PrismaService) {}

  /**
   * Build the select object for reminder list view
   */
  private buildSelectForList() {
    return {
      id: true,
      userId: true,
      entityType: true,
      entityId: true,
      message: true,
      reminderAt: true,
      isRecurring: true,
      status: true,
      sentAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    };
  }

  /**
   * Build the select object for full reminder details
   * Reusable builder following Projects pattern
   */
  private buildSelectForDetails() {
    return {
      id: true,
      userId: true,
      entityType: true,
      entityId: true,
      projectId: true,
      taskId: true,
      milestoneId: true,
      message: true,
      reminderAt: true,
      isRecurring: true,
      recurrenceRule: true,
      createdById: true,
      status: true,
      sentAt: true,
      dismissedAt: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
        },
      },
      channels: {
        select: {
          id: true,
          channel: true,
        },
      },
    };
  }

  /**
   * Build the where clause from query parameters
   * Following Projects pattern with reusable builder
   */
  private buildWhereClause(query: {
    userId?: string;
    projectId?: string;
    status?: string;
    entityType?: ReminderEntityType;
    reminderAtFrom?: Date | string;
    reminderAtTo?: Date | string;
  }): Prisma.ReminderWhereInput {
    const where: Prisma.ReminderWhereInput = {};

    if (query.userId) where.userId = query.userId;
    if (query.projectId) where.projectId = query.projectId;
    if (query.status) where.status = query.status as ReminderStatus;
    if (query.entityType) where.entityType = query.entityType;

    if (query.reminderAtFrom || query.reminderAtTo) {
      where.reminderAt = {};

      if (query.reminderAtFrom) {
        where.reminderAt.gte = new Date(query.reminderAtFrom);
      }

      if (query.reminderAtTo) {
        where.reminderAt.lte = new Date(query.reminderAtTo);
      }
    }

    return where;
  }

  /**
   * Build the orderBy clause from sortBy parameter
   * Following Projects pattern with reusable builder
   */
  private buildOrderBy(
    sortBy?: ReminderSortBy,
  ): Prisma.ReminderOrderByWithRelationInput {
    switch (sortBy) {
      case ReminderSortBy.ReminderAtAsc:
        return { reminderAt: 'asc' };
      case ReminderSortBy.ReminderAtDesc:
        return { reminderAt: 'desc' };
      case ReminderSortBy.CreatedAtAsc:
        return { createdAt: 'asc' };
      case ReminderSortBy.CreatedAtDesc:
        return { createdAt: 'desc' };
      case ReminderSortBy.UpdatedAtAsc:
        return { updatedAt: 'asc' };
      case ReminderSortBy.UpdatedAtDesc:
        return { updatedAt: 'desc' };
      default:
        return { reminderAt: 'asc' }; // Default sorting
    }
  }

  /**
   * Find reminder by ID (throws P2025 if not found)
   */
  findById(data: { reminderId: string }) {
    return this.prismaService.reminder.findUniqueOrThrow({
      where: { id: data.reminderId },
      select: this.buildSelectForDetails(),
    });
  }

  /**
   * Find reminder by ID within a project (throws P2025 if not found)
   */
  findByIdInProject(data: { reminderId: string; projectId: string }) {
    return this.prismaService.reminder.findFirstOrThrow({
      where: { id: data.reminderId, projectId: data.projectId },
      select: this.buildSelectForDetails(),
    });
  }

  async findMany(data: {
    userId?: string;
    projectId?: string;
    status?: string;
    entityType?: ReminderEntityType;
    reminderAtFrom?: Date | string;
    reminderAtTo?: Date | string;
    skip?: number;
    take?: number;
    sortBy?: ReminderSortBy;
  }) {
    const skip = data.skip ?? 0;
    const take = data.take ?? 20;

    const where = this.buildWhereClause(data);
    const orderBy = this.buildOrderBy(data.sortBy);

    const [records, total] = await Promise.all([
      this.prismaService.reminder.findMany({
        where,
        skip,
        take,
        orderBy,
        select: this.buildSelectForList(),
      }),
      this.prismaService.reminder.count({ where }),
    ]);

    return { data: records, total };
  }

  findPending(data: { now: Date }) {
    return this.prismaService.reminder.findMany({
      where: {
        status: 'PENDING',
        reminderAt: { lte: data.now },
      },
      select: this.buildSelectForDetails(),
    });
  }

  async findRecurring() {
    return this.prismaService.reminder.findMany({
      where: {
        isRecurring: true,
        status: 'PENDING',
      },
      select: this.buildSelectForDetails(),
    });
  }

  /**
   * Find all reminders for a specific user (across all projects)
   * Used for GET /reminders/me endpoint
   */
  async findByUserId(data: {
    userId: string;
    status?: string;
    entityType?: ReminderEntityType;
    reminderAtFrom?: Date | string;
    reminderAtTo?: Date | string;
    skip?: number;
    take?: number;
    sortBy?: ReminderSortBy;
  }) {
    const skip = data.skip ?? 0;
    const take = data.take ?? 20;

    const where = this.buildWhereClause(data);
    const orderBy = this.buildOrderBy(data.sortBy);

    const [records, total] = await Promise.all([
      this.prismaService.reminder.findMany({
        where,
        skip,
        take,
        orderBy,
        select: this.buildSelectForList(),
      }),
      this.prismaService.reminder.count({ where }),
    ]);

    return { data: records, total };
  }

  /**
   * Find a single reminder by ID and user ID (throws P2025 if not found)
   * Used for checking ownership in dismiss endpoint
   */
  findByIdAndUserId(data: { reminderId: string; userId: string }) {
    return this.prismaService.reminder.findFirstOrThrow({
      where: {
        id: data.reminderId,
        userId: data.userId,
      },
      select: this.buildSelectForDetails(),
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
