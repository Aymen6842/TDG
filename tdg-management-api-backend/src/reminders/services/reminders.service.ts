import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UserType,
  BusinessUnit,
  ReminderEntityType,
  ReminderStatus,
} from '@prisma/client';

import { CreateReminderRepository } from '../repositories/create-reminder.repository';
import { FetchReminderRepository } from '../repositories/fetch-reminder.repository';
import { UpdateReminderRepository } from '../repositories/update-reminder.repository';
import { DeleteReminderRepository } from '../repositories/delete-reminder.repository';

import { CreateReminderDto } from '../dto/request/post/create-reminder.dto';
import { UpdateReminderDto } from '../dto/request/update/update-reminder.dto';
import { ReminderQueryDto } from '../dto/request/fetch/reminder-query.dto';
import { ReminderSortBy } from '../types/request.type';

import { CustomRequest } from 'src/common/types/request.type';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';

@Injectable()
export class RemindersService {
  constructor(
    private readonly createReminderRepository: CreateReminderRepository,
    private readonly fetchReminderRepository: FetchReminderRepository,
    private readonly updateReminderRepository: UpdateReminderRepository,
    private readonly deleteReminderRepository: DeleteReminderRepository,
  ) {}

  /**
   * Check if user has global executive role (CEO only)
   */
  private isGlobalExecutive(roles: UserType[]): boolean {
    return roles.includes(UserType.CEO);
  }

  /**
   * Get the business unit scope for an executive role.
   * CEO → null (global), CTO → TawerDev, CMO → TawerCreative.
   */
  private getExecutiveBusinessUnitScope(
    roles: UserType[],
  ): BusinessUnit | null | undefined {
    if (roles.includes(UserType.CEO)) return null; // global
    if (roles.includes(UserType.CTO)) return BusinessUnit.TawerDev;
    if (roles.includes(UserType.CMO)) return BusinessUnit.TawerCreative;
    return undefined;
  }

  private validateReminderDate(reminderAt?: Date) {
    if (!reminderAt) {
      return;
    }

    if (new Date(reminderAt) <= new Date()) {
      throw new BadRequestCustomException(
        'Reminder date must be in the future',
        ErrorCode.REMINDER_INVALID_DATE,
      );
    }
  }

  /**
   * Check if an executive role can access a specific project's business unit.
   */
  private async hasExecutiveProjectAccess(
    roles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    const scope = this.getExecutiveBusinessUnitScope(roles);
    if (scope === undefined) return false; // not an executive
    if (scope === null) return true; // CEO – global access

    const projectBU =
      await this.fetchReminderRepository.findProjectBusinessUnit({ projectId });
    return projectBU === scope;
  }

  /**
   * Check if user can access project (BU-scoped executive or project member)
   */
  private async canAccessProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (
      this.isGlobalExecutive(userRoles) ||
      userRoles.includes(UserType.CTO) ||
      userRoles.includes(UserType.CMO)
    ) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.fetchReminderRepository.findMembership({
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
    if (
      this.isGlobalExecutive(userRoles) ||
      userRoles.includes(UserType.CTO) ||
      userRoles.includes(UserType.CMO)
    ) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.fetchReminderRepository.findMembership({
      userId,
      projectId,
    });

    return (
      membership?.isManager === true ||
      userRoles.includes(UserType.ProductOwner)
    );
  }

  /**
   * Retrieve pagination parameters from query
   */
  private retrievePaginationParameters(query: ReminderQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    return { page, limit };
  }

  private parseReminderEnumValue<T extends string>(
    enumObject: Record<string, T>,
    value: unknown,
  ): T | undefined {
    if (typeof value !== 'string') {
      return undefined;
    }

    return Object.values(enumObject).includes(value as T)
      ? (value as T)
      : undefined;
  }

  private parseOptionalString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private extractReminderFilters(query: ReminderQueryDto): {
    status?: ReminderStatus;
    entityType?: ReminderEntityType;
    reminderAtFrom?: string;
    reminderAtTo?: string;
    sortBy?: ReminderSortBy;
  } {
    return {
      status: this.parseReminderEnumValue(ReminderStatus, query.status),
      entityType: this.parseReminderEnumValue(
        ReminderEntityType,
        query.entityType,
      ),
      reminderAtFrom: this.parseOptionalString(query.reminderAtFrom),
      reminderAtTo: this.parseOptionalString(query.reminderAtTo),
      sortBy: query.sortBy,
    };
  }

  /**
   * Set pagination parameters in response
   */
  private setPaginationParametersInResponse(
    total: number,
    page: number,
    limit: number,
  ) {
    return {
      records: total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      perPage: limit,
    };
  }

  /**
   * Create a new reminder
   * POST /projects/:projectId/reminders
   */
  async createReminder(
    req: CustomRequest,
    projectId: string,
    dto: CreateReminderDto,
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

    this.validateReminderDate(dto.reminderAt);

    try {
      return await this.createReminderRepository.createReminder({
        ...dto,
        projectId,
        createdById: user.id,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestCustomException(
            'Invalid reference: user or related entity not found',
            ErrorCode.REMINDER_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Reminder already exists',
            ErrorCode.REMINDER_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get all reminders for a project
   * GET /projects/:projectId/reminders
   */
  async getReminders(
    req: CustomRequest,
    projectId: string,
    query: ReminderQueryDto,
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

    const { page, limit } = this.retrievePaginationParameters(query);
    const skip = (page - 1) * limit;
    const filters = this.extractReminderFilters(query);

    const result = await this.fetchReminderRepository.findMany({
      projectId,
      ...filters,
      skip,
      take: limit,
    });

    const pagination = this.setPaginationParametersInResponse(
      result.total,
      page,
      limit,
    );

    return {
      data: result.data,
      pagination,
    };
  }

  /**
   * Get a single reminder by ID
   * GET /projects/:projectId/reminders/:reminderId
   */
  async getReminderById(
    req: CustomRequest,
    projectId: string,
    reminderId: string,
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
      return await this.fetchReminderRepository.findByIdInProject({
        reminderId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Reminder not found',
            ErrorCode.REMINDER_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Update a reminder
   * PATCH /projects/:projectId/reminders/:reminderId
   */
  async updateReminder(
    req: CustomRequest,
    projectId: string,
    reminderId: string,
    dto: UpdateReminderDto,
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

    this.validateReminderDate(dto.reminderAt);

    try {
      const reminder = await this.updateReminderRepository.update({
        reminderId,
        projectId,
        dto,
      });

      return reminder;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Reminder not found',
            ErrorCode.REMINDER_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Reminder already exists',
            ErrorCode.REMINDER_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Delete a reminder
   * DELETE /projects/:projectId/reminders/:reminderId
   */
  async deleteReminder(
    req: CustomRequest,
    projectId: string,
    reminderId: string,
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
      await this.deleteReminderRepository.deleteReminder({
        reminderId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Reminder not found',
            ErrorCode.REMINDER_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  /**
   * Get all reminders for the current user (across all projects)
   * GET /reminders/me
   */
  async getMyReminders(req: CustomRequest, query: ReminderQueryDto) {
    const user = req.user!;

    const { page, limit } = this.retrievePaginationParameters(query);
    const skip = (page - 1) * limit;
    const filters = this.extractReminderFilters(query);

    const result = await this.fetchReminderRepository.findByUserId({
      userId: user.id,
      ...filters,
      skip,
      take: limit,
    });

    const pagination = this.setPaginationParametersInResponse(
      result.total,
      page,
      limit,
    );

    return {
      data: result.data,
      pagination,
    };
  }

  /**
   * Dismiss a reminder (mark as DISMISSED)
   * POST /reminders/:reminderId/dismiss
   */
  async dismissReminder(req: CustomRequest, reminderId: string) {
    const user = req.user!;

    try {
      // Check if reminder exists and belongs to user (throws P2025 if not found)
      const reminder = await this.fetchReminderRepository.findByIdAndUserId({
        reminderId,
        userId: user.id,
      });

      // Check if already dismissed
      if (reminder.status === 'DISMISSED') {
        throw new BadRequestCustomException(
          'Reminder is already dismissed',
          ErrorCode.REMINDER_ALREADY_DISMISSED,
        );
      }

      // Check if already cancelled
      if (reminder.status === 'CANCELLED') {
        throw new BadRequestCustomException(
          'This reminder has been cancelled',
          ErrorCode.REMINDER_ALREADY_CANCELLED,
        );
      }

      const updatedReminder =
        await this.updateReminderRepository.markAsDismissed({
          reminderId,
          userId: user.id,
        });

      return updatedReminder;
    } catch (error) {
      if (error instanceof BadRequestCustomException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Reminder not found or you do not have permission',
            ErrorCode.REMINDER_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }
}
