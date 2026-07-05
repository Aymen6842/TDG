import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UserType,
  BusinessUnit,
  EmbeddingEntityType,
} from '@prisma/client';

import { CreateEpicRepository } from '../repositories/create-epic.repository';
import { FetchEpicRepository } from '../repositories/fetch-epic.repository';
import { UpdateEpicRepository } from '../repositories/update-epic.repository';
import { DeleteEpicRepository } from '../repositories/delete-epic.repository';

import { CreateEpicDto } from '../dto/request/post/create-epic.dto';
import { UpdateEpicDto } from '../dto/request/update/update-epic.dto';
import { EpicQueryDto } from '../dto/request/fetch/epic-query.dto';

import { CustomRequest } from 'src/common/types/request.type';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { IndexOutboxService } from 'src/ai/services/index-outbox.service';

@Injectable()
export class EpicsService {
  constructor(
    private readonly createEpicRepository: CreateEpicRepository,
    private readonly fetchEpicRepository: FetchEpicRepository,
    private readonly updateEpicRepository: UpdateEpicRepository,
    private readonly deleteEpicRepository: DeleteEpicRepository,
    private readonly indexOutboxService: IndexOutboxService,
  ) {}

  private isExecutive(roles: UserType[]): boolean {
    return (
      roles.includes(UserType.CEO) ||
      roles.includes(UserType.CTO) ||
      roles.includes(UserType.CMO)
    );
  }

  private isGlobalExecutive(roles: UserType[]): boolean {
    return roles.includes(UserType.CEO);
  }

  private getExecutiveBusinessUnitScope(
    roles: UserType[],
  ): BusinessUnit | null {
    if (this.isGlobalExecutive(roles)) return null;
    if (roles.includes(UserType.CTO)) return BusinessUnit.TawerDev;
    if (roles.includes(UserType.CMO)) return BusinessUnit.TawerCreative;
    return null;
  }

  private async hasExecutiveProjectAccess(
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isGlobalExecutive(userRoles)) return true;

    const scope = this.getExecutiveBusinessUnitScope(userRoles);
    if (!scope) return false;

    const bu = await this.fetchEpicRepository.findProjectBusinessUnit({
      projectId,
    });
    return bu === scope;
  }

  private async canAccessProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.fetchEpicRepository.findMembership({
      userId,
      projectId,
    });

    return !!membership;
  }

  private async canManageProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.fetchEpicRepository.findMembership({
      userId,
      projectId,
    });

    return (
      membership?.isManager === true ||
      userRoles.includes(UserType.ProductOwner)
    );
  }

  private validateEpicDateRange(
    startDate: Date | null,
    endDate: Date | null,
  ): void {
    if (startDate && endDate && endDate <= startDate) {
      throw new BadRequestCustomException(
        'End date must be after start date',
        ErrorCode.INVALID_DATA,
      );
    }
  }

  private async validateEpicDatesWithinProject(
    projectId: string,
    startDate: Date | null,
    endDate: Date | null,
  ): Promise<void> {
    if (!startDate && !endDate) {
      return;
    }

    const projectDates = await this.fetchEpicRepository.findProjectDates({
      projectId,
    });

    if (
      (startDate && startDate < projectDates.startDate) ||
      (endDate && endDate > projectDates.endDate)
    ) {
      throw new BadRequestCustomException(
        'Epic dates must be within the project start and end dates',
        ErrorCode.INVALID_DATA,
      );
    }
  }

  /**
   * Create a new epic
   * POST /projects/:projectId/epics
   */
  async createEpic(req: CustomRequest, projectId: string, dto: CreateEpicDto) {
    const user = req.user!;

    const canAccess = await this.canManageProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : null;
    const endDate = dto.endDate ? new Date(dto.endDate) : null;

    this.validateEpicDateRange(startDate, endDate);
    await this.validateEpicDatesWithinProject(projectId, startDate, endDate);

    try {
      const epic = await this.createEpicRepository.createEpic({
        projectId,
        dto,
      });
      await this.indexOutboxService.enqueueUpsert(
        projectId,
        EmbeddingEntityType.EPIC,
        epic.id,
      );
      return epic;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestCustomException(
            'Invalid reference: project not found',
            ErrorCode.EPIC_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Epic with this name already exists',
            ErrorCode.EPIC_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get all epics for a project
   * GET /projects/:projectId/epics
   */
  async getEpics(req: CustomRequest, projectId: string, query: EpicQueryDto) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const result = await this.fetchEpicRepository.getEpics({
      projectId,
      query,
    });

    // Fetch done task counts for all epics in a single query
    const epicIds = result.data.map((e) => e.id);
    let doneCounts: Record<string, number> = {};
    if (epicIds.length > 0) {
      doneCounts = await this.fetchEpicRepository.countDoneTasksByEpics({
        epicIds,
      });
    }

    // Compute progress for each epic
    const epicsWithProgress = result.data.map((epic) => {
      const totalTasks = epic._count?.tasks ?? 0;
      const doneTasks = doneCounts[epic.id] ?? 0;
      return {
        ...epic,
        totalTasks,
        doneTasks,
        progress:
          totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    });

    return {
      data: epicsWithProgress,
      pagination: result.pagination,
    };
  }

  /**
   * Get a single epic by ID
   * GET /projects/:projectId/epics/:epicId
   */
  async getEpicById(req: CustomRequest, projectId: string, epicId: string) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    try {
      const epic = await this.fetchEpicRepository.getEpicById({
        epicId,
        projectId,
      });

      // Compute progress from tasks array
      const tasks = epic.tasks ?? [];
      const totalTasks = tasks.length;
      const doneTasks = tasks.filter((t) => t.status === 'DONE').length;

      return {
        ...epic,
        totalTasks,
        doneTasks,
        progress:
          totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Epic not found',
            ErrorCode.EPIC_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update an epic
   * PATCH /projects/:projectId/epics/:epicId
   */
  async updateEpic(
    req: CustomRequest,
    projectId: string,
    epicId: string,
    dto: UpdateEpicDto,
  ) {
    const user = req.user!;

    const canAccess = await this.canManageProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    try {
      const epic = await this.fetchEpicRepository.findById({
        epicId,
        projectId,
      });

      const startDate =
        dto.startDate !== undefined
          ? dto.startDate
            ? new Date(dto.startDate)
            : null
          : epic.startDate;
      const endDate =
        dto.endDate !== undefined
          ? dto.endDate
            ? new Date(dto.endDate)
            : null
          : epic.endDate;

      this.validateEpicDateRange(startDate, endDate);
      await this.validateEpicDatesWithinProject(projectId, startDate, endDate);

      const updated = await this.updateEpicRepository.updateEpic({
        epicId,
        projectId,
        dto,
      });
      await this.indexOutboxService.enqueueUpsert(
        projectId,
        EmbeddingEntityType.EPIC,
        epicId,
      );
      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Epic not found',
            ErrorCode.EPIC_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Epic with this name already exists',
            ErrorCode.EPIC_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Delete an epic
   * DELETE /projects/:projectId/epics/:epicId
   */
  async deleteEpic(req: CustomRequest, projectId: string, epicId: string) {
    const user = req.user!;

    const canAccess = await this.canManageProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const linkedTasksCount = await this.fetchEpicRepository.countLinkedTasks({
      epicId,
      projectId,
    });

    if (linkedTasksCount > 0) {
      throw new BadRequestCustomException(
        `Cannot delete epic with ${linkedTasksCount} linked tasks. Please reassign or delete the tasks first.`,
        ErrorCode.EPIC_HAS_LINKED_TASKS,
      );
    }

    try {
      await this.deleteEpicRepository.deleteEpic({ epicId, projectId });
      await this.indexOutboxService.enqueueDelete(
        projectId,
        EmbeddingEntityType.EPIC,
        epicId,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Epic not found',
            ErrorCode.EPIC_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }
}
