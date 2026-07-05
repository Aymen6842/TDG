import { Injectable } from '@nestjs/common';
import {
  UserType,
  SprintStatus,
  Language,
  BusinessUnit,
  ReminderStatus,
  EmbeddingEntityType,
} from '@prisma/client';
import { Prisma } from '@prisma/client';

import { CreateSprintRepository } from '../repositories/create-sprint.repository';
import { FetchSprintRepository } from '../repositories/fetch-sprint.repository';
import { UpdateSprintRepository } from '../repositories/update-sprint.repository';
import { DeleteSprintRepository } from '../repositories/delete-sprint.repository';

import { CreateSprintDto } from '../dto/request/post/create-sprint.dto';
import { UpdateSprintDto } from '../dto/request/update/update-sprint.dto';
import { SprintQueryDto } from '../dto/request/fetch/sprint-query.dto';
import { SprintBurndownDto } from '../dto/response/fetch/sprint-burndown.dto';
import { BurndownDataPointDto } from '../dto/response/fetch/burndown-data-point.dto';

import { CustomRequest } from 'src/common/types/request.type';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { AutoReminderService } from 'src/reminders/services/auto-reminder.service';
import { UploadService } from 'src/common/upload/service/upload.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { IndexOutboxService } from 'src/ai/services/index-outbox.service';

@Injectable()
export class SprintsService {
  constructor(
    private readonly createSprintRepository: CreateSprintRepository,
    private readonly fetchSprintRepository: FetchSprintRepository,
    private readonly updateSprintRepository: UpdateSprintRepository,
    private readonly deleteSprintRepository: DeleteSprintRepository,
    private readonly autoReminderService: AutoReminderService,
    private readonly uploadService: UploadService,
    private readonly notificationsService: NotificationsService,
    private readonly prismaService: PrismaService,
    private readonly indexOutboxService: IndexOutboxService,
  ) {}

  async createSprintForProject(
    req: CustomRequest,
    projectId: string,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    dto: CreateSprintDto,
  ) {
    const user = req.user!;

    if (!(await this.canManageProject(user.id, user.roles, projectId))) {
      throw new ForbiddenCustomException();
    }

    if (!dto.content || dto.content.length === 0) {
      throw new BadRequestCustomException(
        'At least one content entry is required',
        ErrorCode.INVALID_DATA,
      );
    }

    dto.content = dto.content.map((c) => ({
      ...c,
      unaccentedName: this.toUnaccented(c.name),
    }));

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const estimatedStartDate = new Date(dto.estimatedStartDate);
    const estimatedEndDate = new Date(dto.estimatedEndDate);

    if (endDate <= startDate) {
      throw new BadRequestCustomException(
        'End date must be after start date',
        ErrorCode.SPRINT_INVALID_DATE_RANGE,
      );
    }

    if (estimatedEndDate <= estimatedStartDate) {
      throw new BadRequestCustomException(
        'Estimated end date must be after estimated start date',
        ErrorCode.SPRINT_INVALID_DATE_RANGE,
      );
    }

    const projectDates = await this.fetchSprintRepository.findProjectDates({
      projectId,
    });

    if (startDate < projectDates.startDate || endDate > projectDates.endDate) {
      throw new BadRequestCustomException(
        'Sprint dates must be within the project start and end dates',
        ErrorCode.SPRINT_INVALID_DATE_RANGE,
      );
    }

    try {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        dto.attachments = uploadedFiles?.attachments?.map((file) => ({
          file: this.uploadService.setAttachmentPathForSprint(file.filename),
        }));
      }

      const sprint = await this.createSprintRepository.createSprint({
        ...dto,
        projectId,
        createdById: user.id,
      });

      const sprintName = dto.content?.[0]?.name ?? 'Untitled Sprint';
      await this.autoReminderService.createDefaultRemindersForSprint({
        sprintId: sprint.id,
        projectId,
        userId: user.id,
        sprintName,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      });

      await this.indexOutboxService.enqueueUpsert(
        projectId,
        EmbeddingEntityType.SPRINT,
        sprint.id,
      );

      return sprint;
    } catch (error) {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        uploadedFiles.attachments.forEach((file) => {
          this.uploadService.deleteImageByPath(file.path);
        });
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Sprint with this name already exists in this project',
            ErrorCode.SPRINT_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async getSprintById(
    req: CustomRequest,
    sprintId: string,
    language?: Language,
  ) {
    const user = req.user!;

    try {
      const sprint = await this.fetchSprintRepository.findById({
        id: sprintId,
      });

      if (
        !(await this.canAccessProject(user.id, user.roles, sprint.projectId))
      ) {
        throw new ForbiddenCustomException(
          'Sprint not found or access denied',
          ErrorCode.PROJECT_FORBIDDEN,
        );
      }

      return await this.fetchSprintRepository.findSprintWithDetails({
        id: sprintId,
        language,
      });
    } catch (error) {
      if (error instanceof ForbiddenCustomException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenCustomException(
            'Sprint not found or access denied',
            ErrorCode.PROJECT_FORBIDDEN,
          );
        }
      }
      throw error;
    }
  }

  async listSprints(
    req: CustomRequest,
    projectId: string,
    query: SprintQueryDto,
    language?: Language,
  ) {
    const user = req.user!;

    if (!(await this.canAccessProject(user.id, user.roles, projectId))) {
      throw new ForbiddenCustomException(
        'Project not found or access denied',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    const { page, limit } = this.retrievePaginationParameters(query);
    const skip = (page - 1) * limit;
    query.skip = skip;
    query.take = limit;

    const total = await this.fetchSprintRepository.countSprints({
      projectId,
      query,
      language,
      userId: this.isExecutive(user.roles) ? null : user.id,
    });

    const sprints = await this.fetchSprintRepository.listSprints({
      projectId,
      query,
      language,
      userId: this.isExecutive(user.roles) ? null : user.id,
    });

    const pagination = this.setPaginationParametersInResponse(
      total,
      page,
      limit,
    );

    return {
      data: sprints,
      pagination,
    };
  }

  async updateSprint(
    req: CustomRequest,
    sprintId: string,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    dto: UpdateSprintDto,
  ) {
    const user = req.user!;

    try {
      const sprint = await this.fetchSprintRepository.findById({
        id: sprintId,
      });

      if (
        !(await this.canManageProject(user.id, user.roles, sprint.projectId))
      ) {
        throw new ForbiddenCustomException();
      }

      if (dto.status !== undefined) {
        this.validateStatusTransition(sprint.status, dto.status);

        if (dto.status === SprintStatus.Running) {
          const runningSprint =
            await this.fetchSprintRepository.findRunningSprint({
              projectId: sprint.projectId,
              excludeSprintId: sprintId,
            });
          if (runningSprint) {
            throw new BadRequestCustomException(
              'There is already a running sprint for this project. Please complete or stop the current sprint before starting a new one.',
              ErrorCode.SPRINT_ALREADY_STARTED,
            );
          }
        }
      }

      if (dto.startDate || dto.endDate) {
        const startDate = dto.startDate
          ? new Date(dto.startDate)
          : sprint.startDate;
        const endDate = dto.endDate ? new Date(dto.endDate) : sprint.endDate;

        if (endDate <= startDate) {
          throw new BadRequestCustomException(
            'End date must be after start date',
            ErrorCode.SPRINT_INVALID_DATE_RANGE,
          );
        }

        const projectDates = await this.fetchSprintRepository.findProjectDates({
          projectId: sprint.projectId,
        });
        if (
          startDate < projectDates.startDate ||
          endDate > projectDates.endDate
        ) {
          throw new BadRequestCustomException(
            'Sprint dates must be within the project start and end dates',
            ErrorCode.SPRINT_INVALID_DATE_RANGE,
          );
        }
      }

      if (dto.estimatedStartDate || dto.estimatedEndDate) {
        const estimatedStartDate = dto.estimatedStartDate
          ? new Date(dto.estimatedStartDate)
          : sprint.estimatedStartDate;
        const estimatedEndDate = dto.estimatedEndDate
          ? new Date(dto.estimatedEndDate)
          : sprint.estimatedEndDate;

        if (estimatedEndDate <= estimatedStartDate) {
          throw new BadRequestCustomException(
            'Estimated end date must be after estimated start date',
            ErrorCode.SPRINT_INVALID_DATE_RANGE,
          );
        }
      }

      if (dto.content && dto.content.length > 0) {
        dto.content = dto.content.map((c) => ({
          ...c,
          unaccentedName: this.toUnaccented(c.name),
        }));
      }

      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        const newAttachments = uploadedFiles.attachments.map((file) => ({
          file: this.uploadService.setAttachmentPathForSprint(file.filename),
        }));
        dto.attachments = [...(dto.attachments ?? []), ...newAttachments];
      }

      await this.updateSprintRepository.updateSprint({ id: sprintId, dto });

      if (dto.content) {
        await this.updateSprintRepository.updateContent({
          sprintId,
          content: dto.content,
        });
      }

      if (dto.attachments) {
        await this.updateSprintRepository.updateAttachments({
          sprintId,
          attachments: dto.attachments,
        });
      }

      if (
        dto.status === SprintStatus.Running ||
        dto.status === SprintStatus.Completed
      ) {
        const sprintName = sprint.contents?.[0]?.name ?? 'Sprint';
        const memberIds = await this.fetchSprintRepository.findProjectMemberIds(
          {
            projectId: sprint.projectId,
          },
        );
        const action =
          dto.status === SprintStatus.Running
            ? 'has started'
            : 'has been completed';

        await Promise.all(
          memberIds
            .filter((memberId) => memberId !== user.id)
            .map((memberId) =>
              this.notificationsService.createNotificationFromSystem(memberId, {
                title:
                  dto.status === SprintStatus.Running
                    ? 'Sprint Started'
                    : 'Sprint Completed',
                body: `Sprint "${sprintName}" ${action}`,
              }),
            ),
        );
      }

      // Cancel pending sprint reminders when sprint is completed or stopped
      if (
        dto.status === SprintStatus.Stopped ||
        dto.status === SprintStatus.Completed
      ) {
        await this.prismaService.reminder.updateMany({
          where: {
            entityType: 'SPRINT',
            entityId: sprintId,
            status: ReminderStatus.PENDING,
          },
          data: { status: ReminderStatus.CANCELLED },
        });
      }

      const updatedSprint = await this.fetchSprintRepository.findById({
        id: sprintId,
      });

      await this.indexOutboxService.enqueueUpsert(
        sprint.projectId,
        EmbeddingEntityType.SPRINT,
        sprintId,
      );

      return updatedSprint;
    } catch (error) {
      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        uploadedFiles.attachments.forEach((file) => {
          this.uploadService.deleteImageByPath(file.path);
        });
      }

      if (
        error instanceof ForbiddenCustomException ||
        error instanceof BadRequestCustomException
      ) {
        throw error;
      }

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Sprint with this name already exists in this project',
            ErrorCode.SPRINT_ALREADY_EXISTS,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Sprint not found',
            ErrorCode.SPRINT_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async deleteSprint(req: CustomRequest, sprintId: string): Promise<void> {
    const user = req.user!;

    try {
      const sprint = await this.fetchSprintRepository.findById({
        id: sprintId,
      });

      if (
        !(await this.canManageProject(user.id, user.roles, sprint.projectId))
      ) {
        throw new ForbiddenCustomException();
      }

      const hasTasks = await this.deleteSprintRepository.hasTasks({
        sprintId,
      });
      if (hasTasks) {
        throw new ConflictCustomException(
          'Cannot delete sprint with tasks. Remove tasks first.',
          ErrorCode.SPRINT_HAS_ACTIVE_TASKS,
        );
      }

      // Cancel all pending sprint reminders before deleting the sprint
      await this.prismaService.reminder.updateMany({
        where: {
          entityType: 'SPRINT',
          entityId: sprintId,
          status: ReminderStatus.PENDING,
        },
        data: { status: ReminderStatus.CANCELLED },
      });

      await this.deleteSprintRepository.deleteSprint({
        sprintId,
        projectId: sprint.projectId,
      });

      await this.indexOutboxService.enqueueDelete(
        sprint.projectId,
        EmbeddingEntityType.SPRINT,
        sprintId,
      );
    } catch (error) {
      if (
        error instanceof ForbiddenCustomException ||
        error instanceof BadRequestCustomException ||
        error instanceof ConflictCustomException
      ) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Sprint not found',
            ErrorCode.SPRINT_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

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
    if (this.isGlobalExecutive(roles)) {
      return null;
    }
    if (roles.includes(UserType.CTO)) {
      return BusinessUnit.TawerDev;
    }
    if (roles.includes(UserType.CMO)) {
      return BusinessUnit.TawerCreative;
    }
    return null;
  }

  private async hasExecutiveProjectAccess(
    roles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isGlobalExecutive(roles)) {
      return true;
    }

    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(roles);
    if (!executiveBusinessUnit) {
      return false;
    }

    const projectBusinessUnit =
      await this.fetchSprintRepository.findProjectBusinessUnit({ projectId });

    return projectBusinessUnit === executiveBusinessUnit;
  }

  private async canAccessProject(
    userId: string,
    roles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(roles)) {
      return this.hasExecutiveProjectAccess(roles, projectId);
    }

    const membership = await this.fetchSprintRepository.findMembership({
      userId,
      projectId,
    });

    return !!membership;
  }

  private async canManageProject(
    userId: string,
    roles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(roles)) {
      return this.hasExecutiveProjectAccess(roles, projectId);
    }

    const membership = await this.fetchSprintRepository.findMembership({
      userId,
      projectId,
    });

    return (
      membership?.isManager === true || roles.includes(UserType.ScrumMaster)
    );
  }

  private toUnaccented(str: string): string {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Validate status transition according to sprint workflow
   * P7003/P7004 - Status transitions
   *
   * Valid transitions:
   * - Pending -> Running
   * - Pending -> Stopped
   * - Pending -> Completed
   * - Running -> Stopped
   * - Running -> Completed
   * - Stopped -> Running (can restart)
   * - Completed -> Running (can restart)
   */
  private validateStatusTransition(
    currentStatus: SprintStatus,
    newStatus: SprintStatus,
  ): void {
    const validTransitions: Record<SprintStatus, SprintStatus[]> = {
      [SprintStatus.Pending]: [
        SprintStatus.Running,
        SprintStatus.Stopped,
        SprintStatus.Completed,
      ],
      [SprintStatus.Running]: [SprintStatus.Stopped, SprintStatus.Completed],
      [SprintStatus.Stopped]: [SprintStatus.Running],
      [SprintStatus.Completed]: [SprintStatus.Running],
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions?.includes(newStatus)) {
      if (currentStatus === SprintStatus.Completed) {
        throw new BadRequestCustomException(
          `Sprint is already completed. Only restart (→ Running) is allowed`,
          ErrorCode.SPRINT_ALREADY_COMPLETED,
        );
      }
      throw new BadRequestCustomException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        ErrorCode.SPRINT_INVALID_STATUS_TRANSITION,
      );
    }
  }

  private retrievePaginationParameters(query: {
    page?: number;
    limit?: number;
  }): { page: number; limit: number } {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    return { page, limit };
  }

  private setPaginationParametersInResponse(
    totalRecords: number,
    page: number,
    limit: number,
  ): {
    records: number;
    currentPage: number;
    totalPages: number;
    perPage: number;
  } {
    const totalPages = Math.ceil(totalRecords / limit);

    return {
      records: totalRecords,
      currentPage: page,
      totalPages,
      perPage: limit,
    };
  }

  async getSprintBurndown(
    req: CustomRequest,
    sprintId: string,
    language?: Language,
  ): Promise<SprintBurndownDto> {
    const user = req.user!;

    try {
      const sprintMeta = await this.fetchSprintRepository.findById({
        id: sprintId,
      });

      if (
        !(await this.canAccessProject(
          user.id,
          user.roles,
          sprintMeta.projectId,
        ))
      ) {
        throw new ForbiddenCustomException(
          'Project not found or access denied',
          ErrorCode.PROJECT_FORBIDDEN,
        );
      }

      const sprint =
        await this.fetchSprintRepository.findSprintWithTasksForBurndown({
          sprintId,
          language,
        });

      let totalPoints = 0;
      let completedPoints = 0;
      const completedTasks: number[] = [];

      for (const task of sprint.tasks) {
        if (task.storyPoints !== null) {
          totalPoints += task.storyPoints;
          if (task.status === 'DONE' && task.completedAt) {
            completedPoints += task.storyPoints;
            completedTasks.push(task.completedAt.getTime());
          }
        }
      }

      const remainingPoints = totalPoints - completedPoints;
      const completionPercentage =
        totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

      const chartData: BurndownDataPointDto[] = [];
      if (sprint.startDate && sprint.endDate) {
        const startDate = new Date(sprint.startDate);
        const endDate = new Date(sprint.endDate);
        const totalDays = Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        const pointsPerDay = totalPoints / totalDays;

        for (let i = 0; i <= totalDays; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          const idealRemaining = Math.max(0, totalPoints - pointsPerDay * i);

          let actualRemaining = totalPoints;
          const dateTime = date.getTime();
          for (const task of sprint.tasks) {
            if (
              task.storyPoints !== null &&
              task.status === 'DONE' &&
              task.completedAt &&
              task.completedAt.getTime() <= dateTime
            ) {
              actualRemaining -= task.storyPoints;
            }
          }

          let dayCompleted = 0;
          let dayAdded = 0;
          for (const task of sprint.tasks) {
            if (task.storyPoints !== null) {
              if (
                task.completedAt &&
                task.completedAt.getTime() >= dateTime &&
                task.completedAt.getTime() < dateTime + 86400000
              ) {
                dayCompleted += task.storyPoints;
              }
              if (
                task.createdAt.getTime() >= dateTime &&
                task.createdAt.getTime() < dateTime + 86400000
              ) {
                dayAdded += task.storyPoints;
              }
            }
          }

          chartData.push({
            date: date.toISOString().split('T')[0],
            idealRemaining: Math.round(idealRemaining * 100) / 100,
            actualRemaining: Math.max(0, actualRemaining),
            completed: dayCompleted,
            added: dayAdded,
          });
        }
      }

      return {
        sprintId: sprint.id,
        sprintName: sprint.contents[0]?.name ?? '',
        status: sprint.status,
        startDate: sprint.startDate?.toISOString() ?? '',
        endDate: sprint.endDate?.toISOString() ?? '',
        totalPoints,
        completedPoints,
        remainingPoints,
        completionPercentage,
        chartData,
        totalTasks: sprint.tasks.length,
        completedTasks: completedTasks.length,
      };
    } catch (error) {
      if (error instanceof ForbiddenCustomException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Sprint not found',
            ErrorCode.SPRINT_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async getVelocity(req: CustomRequest, projectId: string) {
    const user = req.user!;

    if (!(await this.canAccessProject(user.id, user.roles, projectId))) {
      throw new ForbiddenCustomException(
        'Project not found or access denied',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    const sprints =
      await this.fetchSprintRepository.findCompletedSprintsWithPoints({
        projectId,
      });

    const totalPoints = sprints.reduce((s, sp) => s + sp.completedPoints, 0);
    const averageVelocity =
      sprints.length > 0
        ? Math.round((totalPoints / sprints.length) * 100) / 100
        : 0;

    return {
      sprints,
      totalCompletedSprints: sprints.length,
      totalCompletedPoints: totalPoints,
      averageVelocity,
    };
  }
}
