import { Injectable } from '@nestjs/common';
import { Prisma, UserType, BusinessUnit } from '@prisma/client';

import { CreateMilestoneRepository } from '../repositories/create-milestone.repository';
import { FetchMilestoneRepository } from '../repositories/fetch-milestone.repository';
import { UpdateMilestoneRepository } from '../repositories/update-milestone.repository';
import { DeleteMilestoneRepository } from '../repositories/delete-milestone.repository';

import { CreateMilestoneDto } from '../dto/request/post/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/request/update/update-milestone.dto';
import { MilestoneQueryDto } from '../dto/request/fetch/milestone-query.dto';

import { CustomRequest } from 'src/common/types/request.type';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { AutoReminderService } from 'src/reminders/services/auto-reminder.service';

@Injectable()
export class MilestonesService {
  constructor(
    private readonly createMilestoneRepository: CreateMilestoneRepository,
    private readonly fetchMilestoneRepository: FetchMilestoneRepository,
    private readonly updateMilestoneRepository: UpdateMilestoneRepository,
    private readonly deleteMilestoneRepository: DeleteMilestoneRepository,
    private readonly autoReminderService: AutoReminderService,
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

    const bu = await this.fetchMilestoneRepository.findProjectBusinessUnit({
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

    const membership = await this.fetchMilestoneRepository.findMembership({
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

    const membership = await this.fetchMilestoneRepository.findMembership({
      userId,
      projectId,
    });

    return (
      membership?.isManager === true ||
      userRoles.includes(UserType.ProductOwner)
    );
  }

  /**
   * Create a new milestone
   * POST /projects/:projectId/milestones
   */
  async createMilestone(
    req: CustomRequest,
    projectId: string,
    dto: CreateMilestoneDto,
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
      const milestone = await this.createMilestoneRepository.createMilestone({
        projectId,
        dto,
      });

      if (milestone.dueDate) {
        await this.autoReminderService.createDefaultRemindersForMilestone({
          milestoneId: milestone.id,
          projectId,
          userId: user.id,
          milestoneName: milestone.name,
          dueDate: milestone.dueDate,
        });
      }

      return milestone;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestCustomException(
            'Invalid reference: project not found',
            ErrorCode.MILESTONE_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Milestone with this name already exists',
            ErrorCode.MILESTONE_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get all milestones for a project
   * GET /projects/:projectId/milestones
   */
  async getMilestones(
    req: CustomRequest,
    projectId: string,
    query: MilestoneQueryDto,
  ) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const result = await this.fetchMilestoneRepository.getMilestones({
      projectId,
      query,
    });

    // Compute progress for each milestone
    const milestoneIds = result.data.map((m) => m.id);
    let doneCounts: Record<string, number> = {};
    if (milestoneIds.length > 0) {
      doneCounts =
        await this.fetchMilestoneRepository.countDoneTasksByMilestones({
          milestoneIds,
        });
    }

    const data = result.data.map((milestone) => {
      const totalTasks = milestone._count?.tasks ?? 0;
      const doneTasks = doneCounts[milestone.id] ?? 0;
      return {
        ...milestone,
        totalTasks,
        doneTasks,
        progress:
          totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0,
      };
    });

    return {
      data,
      pagination: result.pagination,
    };
  }

  /**
   * Get a single milestone by ID
   * GET /projects/:projectId/milestones/:milestoneId
   */
  async getMilestoneById(
    req: CustomRequest,
    projectId: string,
    milestoneId: string,
  ) {
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
      return await this.fetchMilestoneRepository.getMilestoneById({
        milestoneId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Milestone not found',
            ErrorCode.MILESTONE_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update a milestone
   * PATCH /projects/:projectId/milestones/:milestoneId
   */
  async updateMilestone(
    req: CustomRequest,
    projectId: string,
    milestoneId: string,
    dto: UpdateMilestoneDto,
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
      return await this.updateMilestoneRepository.updateMilestone({
        milestoneId,
        projectId,
        dto,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Milestone not found',
            ErrorCode.MILESTONE_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Milestone with this name already exists',
            ErrorCode.MILESTONE_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Delete a milestone
   * DELETE /projects/:projectId/milestones/:milestoneId
   */
  async deleteMilestone(
    req: CustomRequest,
    projectId: string,
    milestoneId: string,
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

    const linkedTasksCount =
      await this.deleteMilestoneRepository.countLinkedTasks({
        milestoneId,
        projectId,
      });

    if (linkedTasksCount > 0) {
      throw new BadRequestCustomException(
        `Cannot delete milestone with ${linkedTasksCount} linked tasks. Please reassign or delete the tasks first.`,
        ErrorCode.MILESTONE_HAS_LINKED_TASKS,
      );
    }

    try {
      await this.deleteMilestoneRepository.deleteMilestone({
        milestoneId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Milestone not found',
            ErrorCode.MILESTONE_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Mark a milestone as complete
   * PATCH /projects/:projectId/milestones/:milestoneId/complete
   */
  async completeMilestone(
    req: CustomRequest,
    projectId: string,
    milestoneId: string,
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
      return await this.updateMilestoneRepository.completeMilestone({
        milestoneId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Milestone not found',
            ErrorCode.MILESTONE_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get Gantt chart data for a project
   * GET /projects/:projectId/gantt
   */
  async getGantt(req: CustomRequest, projectId: string) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const [milestones, epics, sprints, tasks] = await Promise.all([
      this.fetchMilestoneRepository.findAllMilestones({ projectId }),
      this.fetchMilestoneRepository.findAllEpics({ projectId }),
      this.fetchMilestoneRepository.findAllSprints({ projectId }),
      this.fetchMilestoneRepository.findAllTasks({ projectId }),
    ]);

    return {
      milestones: milestones.map((m) => {
        const dueDate = m.dueDate ? new Date(m.dueDate) : null;
        const now = new Date();
        let status: 'COMPLETED' | 'OVERDUE' | 'PENDING' | 'IN_PROGRESS' =
          'PENDING';

        if (m.completedAt) {
          status = 'COMPLETED';
        } else if (dueDate && dueDate < now) {
          status = 'OVERDUE';
        } else if (dueDate) {
          status = 'PENDING';
        }

        return {
          id: m.id,
          name: m.name,
          description: m.description,
          dueDate: this.toIsoString(m.dueDate),
          completedAt: this.toIsoString(m.completedAt),
          status,
        };
      }),
      epics: epics.map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description,
        startDate: this.toIsoString(e.startDate),
        endDate: this.toIsoString(e.endDate),
      })),
      sprints: sprints.map((s) => ({
        id: s.id,
        status: s.status,
        startDate: this.toIsoString(s.startDate),
        endDate: this.toIsoString(s.endDate),
      })),
      tasks: tasks.map((t) => ({
        id: t.id,
        key: t.key,
        title: t.title,
        type: t.type,
        priority: t.priority,
        status: t.status,
        dueDate: this.toIsoString(t.dueDate),
        completedAt: this.toIsoString(t.completedAt),
        storyPoints: t.storyPoints,
        epicId: t.epicId,
        sprintId: t.sprintId,
        createdAt: this.toIsoString(t.createdAt),
      })),
    };
  }

  /**
   * Convert a date value to ISO-8601 UTC string for Gantt chart payloads.
   */
  private toIsoString(
    value: Date | string | null | undefined,
  ): string | null {
    if (!value) return null;
    return new Date(value as string).toISOString();
  }
}
