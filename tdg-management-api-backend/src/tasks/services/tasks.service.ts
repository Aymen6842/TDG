import { Injectable } from '@nestjs/common';
import {
  Prisma,
  UserType,
  ProjectType,
  BusinessUnit,
} from '@prisma/client';

import { CreateTaskRepository } from '../repositories/create-task.repository';
import { FetchTaskRepository } from '../repositories/fetch-task.repository';
import type { KanbanBoardTaskFlat } from '../repositories/fetch-task.repository';
import { UpdateTaskRepository } from '../repositories/update-task.repository';
import { DeleteTaskRepository } from '../repositories/delete-task.repository';
import {
  TaskLabelsRepository,
  type ProjectTaskLabel,
} from '../repositories/task-labels.repository';
import {
  TaskStatusesRepository,
  type ProjectTaskStatusRecord,
} from '../repositories/task-statuses.repository';

import { CreateTaskDto } from '../dto/request/post/create-task.dto';
import { CreateTaskCommentDto } from '../dto/request/post/create-task-comment.dto';
import { CreateTaskLabelDto } from '../dto/request/post/create-task-label.dto';
import { UpdateTaskDto } from '../dto/request/update/update-task.dto';
import { UpdateTaskCommentDto } from '../dto/request/update/update-task-comment.dto';
import { UpdateTaskLabelDto } from '../dto/request/update/update-task-label.dto';
import { BulkUpdateTaskStatusDto } from '../dto/request/update/bulk-update-task-status.dto';
import { TaskQueryDto } from '../dto/request/fetch/task-query.dto';
import { CreateTaskStatusDto } from '../dto/request/post/create-task-status.dto';
import { UpdateTaskStatusDto } from '../dto/request/update/update-task-status.dto';
import { TaskStatusDto } from '../dto/response/fetch/task-status.dto';

import { CustomRequest } from 'src/common/types/request.type';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { AutoReminderService } from 'src/reminders/services/auto-reminder.service';
import { UploadService } from 'src/common/upload/service/upload.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';

const DEFAULT_TASK_LABEL_COLOR = '#6B7280';

@Injectable()
export class TasksService {
  constructor(
    private readonly createTaskRepository: CreateTaskRepository,
    private readonly fetchTaskRepository: FetchTaskRepository,
    private readonly updateTaskRepository: UpdateTaskRepository,
    private readonly deleteTaskRepository: DeleteTaskRepository,
    private readonly taskLabelsRepository: TaskLabelsRepository,
    private readonly taskStatusesRepository: TaskStatusesRepository,
    private readonly autoReminderService: AutoReminderService,
    private readonly uploadService: UploadService,
    private readonly notificationsService: NotificationsService,
  ) {}

  // ===== DYNAMIC TASK STATUS INTEGRATION =====

  private async loadProjectStatuses(
    projectId: string,
  ): Promise<ProjectTaskStatusRecord[]> {
    return this.taskStatusesRepository.findAllByProject({ projectId });
  }

  /**
   * Load a project's statuses, lazily seeding the system defaults if none
   * exist yet. Project creation does not seed statuses, so this guarantees any
   * read path (status list, kanban) sees the same seeded statuses the transition
   * validator relies on — the frontend can then derive legal transitions purely
   * from `allowedTransitions` without duplicating the enum fallback maps.
   */
  private async loadProjectStatusesEnsured(
    projectId: string,
    projectType?: ProjectType,
  ): Promise<ProjectTaskStatusRecord[]> {
    let statuses = await this.loadProjectStatuses(projectId);
    if (statuses.length === 0) {
      const type = projectType ?? (await this.getProjectType(projectId));
      await this.taskStatusesRepository.seedDefaultsForProject({
        projectId,
        projectType: type,
      });
      statuses = await this.loadProjectStatuses(projectId);
    }
    return statuses;
  }

  private async getDefaultStatusForProject(projectId: string): Promise<string> {
    const statuses = await this.loadProjectStatuses(projectId);
    const defaultStatus = statuses.find((s) => s.isDefault);
    return defaultStatus?.name ?? statuses[0]?.name ?? 'TODO';
  }

  async createTaskStatus(
    req: CustomRequest,
    projectId: string,
    dto: CreateTaskStatusDto,
  ): Promise<TaskStatusDto> {
    const user = req.user!;
    const canManage = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canManage) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can manage task statuses',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // Check for duplicate names
    const existingStatus =
      await this.taskStatusesRepository.findByNameInProject({
        projectId,
        name: dto.name,
      });
    if (existingStatus) {
      throw new ConflictCustomException(
        'A status with this name already exists in this project',
        ErrorCode.TASK_ALREADY_EXISTS,
      );
    }

    // Get next display order
    const maxOrder = await this.taskStatusesRepository.getMaxOrder({
      projectId,
    });
    const displayOrder = dto.displayOrder ?? maxOrder + 1;

    const status = await this.taskStatusesRepository.createStatus({
      projectId,
      name: dto.name,
      color: dto.color ?? '#6B7280',
      order: displayOrder,
      allowedTransitions: dto.allowedTransitions,
    });

    return {
      id: status.id,
      projectId: status.projectId,
      name: status.name,
      color: status.color,
      displayOrder: status.order,
      isSystem: status.isSystem,
      allowedTransitions: status.allowedTransitions,
      createdAt: status.createdAt,
      updatedAt: status.createdAt, // New records use createdAt as updatedAt
    };
  }

  async getTaskStatuses(
    req: CustomRequest,
    projectId: string,
  ): Promise<TaskStatusDto[]> {
    // Validate project access (user must be project member or executive)
    try {
      const canAccess = await this.canAccessProject(
        req.user!.id,
        req.user!.roles,
        projectId,
      );

      if (!canAccess) {
        throw new ForbiddenCustomException(
          'Access denied: You are not a member of this project',
        );
      }
    } catch (error) {
      if (error instanceof ForbiddenCustomException) {
        throw error;
      }
      throw error;
    }

    const statuses = await this.loadProjectStatusesEnsured(projectId);

    return statuses.map((status) => ({
      id: status.id,
      projectId: status.projectId,
      name: status.name,
      color: status.color,
      displayOrder: status.order,
      isSystem: status.isSystem,
      allowedTransitions: status.allowedTransitions,
      createdAt: status.createdAt,
      updatedAt: status.updatedAt,
    }));
  }

  async updateTaskStatusDefinition(
    req: CustomRequest,
    projectId: string,
    statusId: string,
    dto: UpdateTaskStatusDto,
  ): Promise<TaskStatusDto> {
    const user = req.user!;
    const canManage = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canManage) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can manage task statuses',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // Verify status exists and belongs to project
    const existingStatus = await this.taskStatusesRepository.findByIdInProject({
      statusId,
      projectId,
    });
    if (!existingStatus) {
      throw new NotFoundCustomException(
        'Task status not found',
        ErrorCode.TASK_NOT_FOUND,
      );
    }

    // Prevent updating system statuses properties except displayOrder
    if (existingStatus.isSystem) {
      const isTryingToChangeProtectedFields = 
        (dto.name !== undefined && dto.name !== existingStatus.name) ||
        (dto.color !== undefined && dto.color !== existingStatus.color) ||
        (dto.allowedTransitions !== undefined);
        
      if (isTryingToChangeProtectedFields) {
        throw new ForbiddenCustomException(
          'System statuses can only have their display order modified',
          ErrorCode.FORBIDDEN,
        );
      }
    }

    // Check for duplicate names if name is being updated
    if (dto.name && dto.name !== existingStatus.name) {
      const duplicate = await this.taskStatusesRepository.findByNameInProject({
        projectId,
        name: dto.name,
      });
      if (duplicate) {
        throw new ConflictCustomException(
          'A status with this name already exists in this project',
          ErrorCode.TASK_ALREADY_EXISTS,
        );
      }
    }

    const updatedStatus = await this.taskStatusesRepository.updateStatus({
      statusId,
      ...dto,
    });

    return {
      id: updatedStatus.id,
      projectId: updatedStatus.projectId,
      name: updatedStatus.name,
      color: updatedStatus.color,
      displayOrder: updatedStatus.order,
      isSystem: updatedStatus.isSystem,
      allowedTransitions: updatedStatus.allowedTransitions,
      createdAt: updatedStatus.createdAt,
      updatedAt: updatedStatus.updatedAt,
    };
  }

  async deleteTaskStatus(
    req: CustomRequest,
    projectId: string,
    statusId: string,
  ): Promise<void> {
    const user = req.user!;
    const canManage = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canManage) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can manage task statuses',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // Verify status exists and belongs to project
    const existingStatus = await this.taskStatusesRepository.findByIdInProject({
      statusId,
      projectId,
    });
    if (!existingStatus) {
      throw new NotFoundCustomException(
        'Task status not found',
        ErrorCode.TASK_NOT_FOUND,
      );
    }

    // Prevent deleting system statuses
    if (existingStatus.isSystem) {
      throw new ForbiddenCustomException(
        'System statuses cannot be deleted',
        ErrorCode.FORBIDDEN,
      );
    }

    // Check if status is being used by tasks
    const tasksUsingStatus =
      await this.taskStatusesRepository.countTasksUsingStatus({
        projectId,
        statusName: existingStatus.name,
      });
    if (tasksUsingStatus > 0) {
      throw new ConflictCustomException(
        `Cannot delete: ${tasksUsingStatus} task(s) currently have status "${existingStatus.name}". Reassign them first.`,
        ErrorCode.FORBIDDEN,
      );
    }

    await this.taskStatusesRepository.deleteStatus({ statusId });
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
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isGlobalExecutive(userRoles)) {
      return true;
    }

    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(userRoles);
    if (!executiveBusinessUnit) {
      return false;
    }

    const projectBusinessUnit =
      await this.fetchTaskRepository.findProjectBusinessUnit({ projectId });

    return projectBusinessUnit === executiveBusinessUnit;
  }

  /**
   * Validate status transition using project-specific task statuses
   * Falls back to enum-based validation if no custom statuses exist
   */
  private async isValidStatusTransitionDynamic(
    projectId: string,
    currentStatus: string,
    newStatus: string,
  ): Promise<boolean> {
    try {
      const projectStatuses = await this.loadProjectStatuses(projectId);

      if (projectStatuses.length === 0) {
        // Fall back to enum-based validation
        return this.isValidStatusTransitionEnum(currentStatus, newStatus);
      }

      // Find the current status in project statuses
      const currentStatusRecord = projectStatuses.find(
        (s) => s.name === currentStatus,
      );
      if (!currentStatusRecord) {
        return false; // Current status not found in project statuses
      }

      // Find the target status in project statuses
      const targetStatusRecord = projectStatuses.find(
        (s) => s.name === newStatus,
      );
      if (!targetStatusRecord) {
        return false; // Target status not found in project statuses
      }

      // If target is a custom status, allow transition from any status
      if (!targetStatusRecord.isSystem) {
        return true;
      }

      // For system status transitions, check allowed transitions
      return currentStatusRecord.allowedTransitions.includes(newStatus);
    } catch {
      // If there's an error loading statuses, fall back to enum validation
      return this.isValidStatusTransitionEnum(currentStatus, newStatus);
    }
  }

  /**
   * Validate status transition using enum-based logic (fallback)
   * FREESTYLE projects: TODO <-> IN_PROGRESS <-> DONE (3 statuses)
   * AGILE projects: BACKLOG -> TODO -> IN_PROGRESS -> IN_REVIEW -> TESTING -> DONE (6 statuses)
   */
  private isValidStatusTransitionEnum(
    currentStatus: string,
    newStatus: string,
  ): boolean {
    // FREESTYLE transitions
    const freestyleTransitions: Record<string, string[]> = {
      TODO: ['IN_PROGRESS'],
      IN_PROGRESS: ['TODO', 'DONE'],
      DONE: ['IN_PROGRESS'],
    };

    if (freestyleTransitions[currentStatus]?.includes(newStatus)) {
      return true;
    }

    // AGILE transitions
    const validTransitions: Record<string, string[]> = {
      BACKLOG: ['TODO'],
      TODO: ['BACKLOG', 'IN_PROGRESS'],
      IN_PROGRESS: ['TODO', 'IN_REVIEW'],
      IN_REVIEW: ['IN_PROGRESS', 'TESTING'],
      TESTING: ['IN_REVIEW', 'DONE'],
      DONE: ['TESTING'],
    };

    return validTransitions[currentStatus]?.includes(newStatus) ?? false;
  }

  private async canAccessProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }
    try {
      await this.fetchTaskRepository.findMembership({
        userId,
        projectId,
      });
      return true;
    } catch {
      return false;
    }
  }

  private async canManageProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    try {
      const membership = await this.fetchTaskRepository.findMembership({
        userId,
        projectId,
      });
      return membership.isManager === true;
    } catch {
      return false;
    }
  }

  private hasAnyRole(userRoles: UserType[], allowedRoles: UserType[]): boolean {
    return allowedRoles.some((role) => userRoles.includes(role));
  }

  private async getProjectMembership(
    userId: string,
    projectId: string,
  ): Promise<{
    id: string;
    userId: string;
    projectId: string;
    isManager: boolean;
  } | null> {
    try {
      return await this.fetchTaskRepository.findMembership({
        userId,
        projectId,
      });
    } catch {
      return null;
    }
  }

  private async canCreateTaskForProject(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.getProjectMembership(userId, projectId);
    if (!membership) {
      return false;
    }

    return (
      membership.isManager ||
      this.hasAnyRole(userRoles, [
        UserType.ProductOwner,
        UserType.BusinessAnalyst,
      ])
    );
  }

  private async canManageTaskStructure(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.getProjectMembership(userId, projectId);
    if (!membership) {
      return false;
    }

    return membership.isManager || userRoles.includes(UserType.ProductOwner);
  }

  private async canManageBacklog(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.getProjectMembership(userId, projectId);
    if (!membership) {
      return false;
    }

    return (
      membership.isManager ||
      this.hasAnyRole(userRoles, [UserType.ProductOwner, UserType.ScrumMaster])
    );
  }

  private async canUpdateTask(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    // Executives, managers, and product owners can update any task
    if (await this.canManageTaskStructure(userId, userRoles, projectId)) {
      return true;
    }

    // Scrum Masters can update tasks
    if (userRoles.includes(UserType.ScrumMaster)) {
      // Check if user is project member
      const membership = await this.getProjectMembership(userId, projectId);
      return !!membership;
    }

    // Software Engineers can update their own tasks
    if (
      this.hasAnyRole(userRoles, [
        UserType.SoftwareEngineer,
        UserType.DataEngineer,
        UserType.DevopsEngineer,
        UserType.QualityAssuranceEngineer,
        UserType.MobileAppDeveloper,
        UserType.FrontendDeveloper,
        UserType.BackendDeveloper,
        UserType.FullStackDeveloper,
      ])
    ) {
      // Check if user is project member
      const membership = await this.getProjectMembership(userId, projectId);
      return !!membership;
    }

    return false;
  }

  private async ensureTaskExistsInProject(
    taskId: string,
    projectId: string,
  ): Promise<void> {
    try {
      await this.fetchTaskRepository.findByIdInProject({ taskId, projectId });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundCustomException(
          'Task not found',
          ErrorCode.TASK_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  private async getProjectLabelOrThrow(data: {
    projectId: string;
    labelId: string;
  }): Promise<ProjectTaskLabel> {
    const label = await this.taskLabelsRepository.findByIdInProject({
      labelId: data.labelId,
      projectId: data.projectId,
    });

    if (!label) {
      throw new NotFoundCustomException(
        'Label not found',
        ErrorCode.TASK_LABEL_NOT_FOUND,
      );
    }

    return label;
  }

  private async canManageSprintAssignment(
    userId: string,
    userRoles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.getProjectMembership(userId, projectId);
    if (!membership) {
      return false;
    }

    return (
      membership.isManager ||
      this.hasAnyRole(userRoles, [UserType.ProductOwner, UserType.ScrumMaster])
    );
  }

  private async canAdvanceTaskWorkflow(
    userId: string,
    userRoles: UserType[],
    projectId: string,
    assigneeId?: string | null,
  ): Promise<boolean> {
    if (this.isExecutive(userRoles)) {
      return this.hasExecutiveProjectAccess(userRoles, projectId);
    }

    const membership = await this.getProjectMembership(userId, projectId);
    if (!membership) {
      return false;
    }

    if (
      membership.isManager ||
      this.hasAnyRole(userRoles, [UserType.ProductOwner, UserType.ScrumMaster])
    ) {
      return true;
    }

    return !assigneeId || assigneeId === userId;
  }

  private async ensureCommentMutationAccess(query: {
    commentId: string;
    taskComments: Array<{ id: string; authorId: string }>;
    userId: string;
    userRoles: UserType[];
    projectId: string;
  }): Promise<void> {
    const comment = query.taskComments.find(
      (currentComment) => currentComment.id === query.commentId,
    );

    if (!comment) {
      throw new NotFoundCustomException(
        'Comment not found',
        ErrorCode.TASK_NOT_FOUND,
      );
    }

    if (comment.authorId === query.userId) {
      return;
    }

    const canManageProject = await this.canManageProject(
      query.userId,
      query.userRoles,
      query.projectId,
    );

    if (!canManageProject) {
      throw new ForbiddenCustomException(
        'Only the comment author, project managers, or executives can modify this comment',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
  }

  private async ensureTimeEntryMutationAccess(query: {
    timeEntryId: string;
    taskId: string;
    projectId: string;
    userId: string;
    userRoles: UserType[];
  }): Promise<void> {
    const timeEntries = await this.fetchTaskRepository.getTimeEntries({
      taskId: query.taskId,
    });
    const timeEntry = timeEntries.find(
      (currentTimeEntry) => currentTimeEntry.id === query.timeEntryId,
    );

    if (!timeEntry) {
      throw new NotFoundCustomException(
        'Time entry not found',
        ErrorCode.TASK_NOT_FOUND,
      );
    }

    if (timeEntry.userId === query.userId) {
      return;
    }

    const canManageProject = await this.canManageProject(
      query.userId,
      query.userRoles,
      query.projectId,
    );

    if (!canManageProject) {
      throw new ForbiddenCustomException(
        'Only the time entry owner, project managers, or executives can modify this time entry',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
  }

  private async getProjectType(projectId: string): Promise<ProjectType> {
    return this.fetchTaskRepository.findProjectType({ projectId });
  }

  private validateStatusForProjectType(
    status: string,
    projectType: ProjectType,
  ): void {
    if (projectType !== ProjectType.FREESTYLE) {
      return;
    }

    const freestyleStatuses: string[] = ['TODO', 'IN_PROGRESS', 'DONE'];

    if (freestyleStatuses.includes(status)) {
      return;
    }

    throw new BadRequestCustomException(
      `Status ${status} is not available for FREESTYLE projects`,
      ErrorCode.TASK_INVALID_STATUS_TRANSITION,
    );
  }

  private validateWorkflowSpecificFields(
    projectType: ProjectType,
    data: {
      status?: string;
      progressPercent?: number | null;
      sprintId?: string | null;
      epicId?: string | null;
      storyPoints?: number | null;
    },
  ): void {
    if (data.status) {
      this.validateStatusForProjectType(data.status, projectType);
    }

    if (data.progressPercent != null && projectType !== ProjectType.FREESTYLE) {
      throw new BadRequestCustomException(
        'Progress percentage is only available for FREESTYLE projects',
        ErrorCode.TASK_INVALID_STATUS_TRANSITION,
      );
    }

    if (projectType !== ProjectType.FREESTYLE) {
      return;
    }

    if (data.sprintId != null) {
      throw new BadRequestCustomException(
        'Sprint association is only available for AGILE projects',
        ErrorCode.AGILE_FEATURE_FORBIDDEN,
      );
    }

    if (data.epicId != null) {
      throw new BadRequestCustomException(
        'Epic linking is only available for AGILE projects',
        ErrorCode.AGILE_FEATURE_FORBIDDEN,
      );
    }

    if (data.storyPoints != null) {
      throw new BadRequestCustomException(
        'Story points are only available for AGILE projects',
        ErrorCode.AGILE_FEATURE_FORBIDDEN,
      );
    }
  }

  private validateTaskFiltersForProjectType(
    projectType: ProjectType,
    filters: { sprintId?: string; epicId?: string },
  ): void {
    if (projectType !== ProjectType.FREESTYLE) {
      return;
    }

    if (filters.sprintId) {
      throw new BadRequestCustomException(
        'Sprint filtering is only available for AGILE projects',
        ErrorCode.AGILE_FEATURE_FORBIDDEN,
      );
    }

    if (filters.epicId) {
      throw new BadRequestCustomException(
        'Epic filtering is only available for AGILE projects',
        ErrorCode.AGILE_FEATURE_FORBIDDEN,
      );
    }
  }

  async createTask(
    req: CustomRequest,
    projectId: string,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    dto: CreateTaskDto,
  ) {
    const user = req.user!;

    const canAccess = await this.canCreateTaskForProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, business analysts, or executives can create tasks',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    if (
      uploadedFiles &&
      uploadedFiles?.attachments &&
      uploadedFiles?.attachments?.length > 0
    ) {
      dto.attachments = uploadedFiles.attachments.map((file) => ({
        file: this.uploadService.setAttachmentPathForTask(file.filename),
      }));
    }

    const projectType = await this.getProjectType(projectId);
    const defaultStatus = await this.getDefaultStatusForProject(projectId);
    const status = dto.status || defaultStatus;

    this.validateWorkflowSpecificFields(projectType, {
      ...dto,
      status,
    });

    if (dto.sprintId != null) {
      await this.ensureSprintBelongsToProject(projectId, dto.sprintId);
    }

    if (dto.epicId != null) {
      await this.ensureEpicBelongsToProject(projectId, dto.epicId);
    }

    if (dto.milestoneId != null) {
      await this.ensureMilestoneBelongsToProject(projectId, dto.milestoneId);
    }

    // Validate foreign key references - rely on DB constraints, catch P2025
    // If references are invalid, the create operation will fail with proper error

    try {
      const task = await this.createTaskRepository.createTask({
        dto: {
          ...dto,
          status,
        },
        projectId,
        reporterId: user.id,
      });

      if (task.dueDate) {
        await this.autoReminderService.createDefaultRemindersForTask({
          taskId: task.id,
          projectId,
          userId: user.id,
          taskTitle: task.title,
          dueDate: task.dueDate,
        });
      }

      // Notify assignee about new task assignment (fire-and-forget)
      if (dto.assigneeId && dto.assigneeId !== user.id) {
        this.notificationsService.createNotificationFromSystem(dto.assigneeId, {
          title: 'New Task Assigned',
          body: `You have been assigned task "${task.title}"`,
        });
      }

      return task;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new BadRequestCustomException(
            'Invalid reference: assignee, sprint, epic, milestone, or parent task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Task with this identifier already exists',
            ErrorCode.TASK_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async getTasks(req: CustomRequest, projectId: string, query: TaskQueryDto) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException();
    }

    const projectType = await this.getProjectType(projectId);
    this.validateTaskFiltersForProjectType(projectType, query);

    if (query.sprintId) {
      await this.ensureSprintBelongsToProject(projectId, query.sprintId);
    }

    if (query.epicId) {
      await this.ensureEpicBelongsToProject(projectId, query.epicId);
    }

    if (query.milestoneId) {
      await this.ensureMilestoneBelongsToProject(projectId, query.milestoneId);
    }

    const { page, limit } = this.retrievePaginationParameters(query);

    const total = await this.fetchTaskRepository.countTasks({
      projectId,
      filters: query,
    });

    const skip = (page - 1) * limit;
    query.skip = skip;
    query.take = limit;

    const tasks = await this.fetchTaskRepository.findAll({
      projectId,
      filters: query,
    });

    const pagination = this.setPaginationParametersInResponse(
      total,
      page,
      limit,
    );

    return {
      data: tasks,
      pagination: pagination,
    };
  }

  async getTaskById(req: CustomRequest, projectId: string, taskId: string) {
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
      const task = await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });

      return task;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async updateTask(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    uploadedFiles: { attachments?: Express.Multer.File[] },
    dto: UpdateTaskDto,
  ) {
    const user = req.user!;

    const canAccess = await this.canUpdateTask(user.id, user.roles, projectId);
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, executives, or the assigned developer can update task details',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // Verify task belongs to project (throws P2025 if not found)
    try {
      const existingTask = await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });

      if (
        uploadedFiles &&
        uploadedFiles?.attachments &&
        uploadedFiles?.attachments?.length > 0
      ) {
        dto.attachments = uploadedFiles.attachments.map((file) => ({
          file: this.uploadService.setAttachmentPathForTask(file.filename),
        }));
      }

      const projectType = await this.getProjectType(projectId);

      this.validateWorkflowSpecificFields(projectType, dto);

      // Validate status transition if status is being updated
      if (
        dto.status &&
        !(await this.isValidStatusTransitionDynamic(
          projectId,
          existingTask.status,
          dto.status,
        ))
      ) {
        throw new BadRequestCustomException(
          'Invalid status transition',
          ErrorCode.TASK_INVALID_STATUS_TRANSITION,
        );
      }

      if (dto.sprintId != null) {
        await this.ensureSprintBelongsToProject(projectId, dto.sprintId);
      }

      if (dto.epicId != null) {
        await this.ensureEpicBelongsToProject(projectId, dto.epicId);
      }

      if (dto.milestoneId != null) {
        await this.ensureMilestoneBelongsToProject(projectId, dto.milestoneId);
      }

      const updatedTask = await this.updateTaskRepository.updateTask({
        taskId,
        dto,
      });

      // Notify on reassignment (fire-and-forget)
      if (
        dto.assigneeId &&
        dto.assigneeId !== existingTask.assignee?.id &&
        dto.assigneeId !== user.id
      ) {
        this.notificationsService.createNotificationFromSystem(dto.assigneeId, {
          title: 'Task Assigned to You',
          body: `You have been assigned task "${existingTask.title}"`,
        });
      }

      // Notify assignee on status change (fire-and-forget)
      if (
        dto.status &&
        existingTask.assignee?.id &&
        existingTask.assignee?.id !== user.id
      ) {
        this.notificationsService.createNotificationFromSystem(
          existingTask.assignee.id,
          {
            title: 'Task Status Updated',
            body: `Task "${existingTask.title}" moved to ${dto.status}`,
          },
        );
      }

      return updatedTask;
    } catch (error) {
      if (error instanceof BadRequestCustomException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Task with this identifier already exists',
            ErrorCode.TASK_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async deleteTask(req: CustomRequest, projectId: string, taskId: string) {
    const user = req.user!;

    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can delete tasks',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    try {
      await this.deleteTaskRepository.deleteTask({ taskId, projectId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async addDependency(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    blockingTaskId: string,
  ) {
    const user = req.user!;

    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can manage task dependencies',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    try {
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    const hasCircularDependency = await this.checkCircularDependency({
      taskId,
      blockingTaskId,
    });

    if (hasCircularDependency) {
      throw new BadRequestCustomException(
        'Circular dependency detected',
        ErrorCode.TASK_CIRCULAR_DEPENDENCY,
      );
    }

    return await this.updateTaskRepository.addDependency({
      taskId,
      blockingTaskId,
    });
  }

  async removeDependency(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    dependencyId: string,
  ) {
    const user = req.user!;

    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or executives can manage task dependencies',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    try {
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    try {
      return await this.updateTaskRepository.removeDependency({
        dependencyId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Dependency not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async addComment(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    dto: CreateTaskCommentDto,
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    const mentions = dto.mentions?.map((m) => m.userId) || [];

    const comment = await this.createTaskRepository.addComment({
      taskId,
      authorId: user.id,
      content: dto.content,
      mentions,
    });

    // Send notifications for comment (fire-and-forget)
    const task = await this.fetchTaskRepository.findTaskAssigneeAndTitle({
      taskId,
    });

    // Notify assignee about new comment (skip self)
    if (task.assigneeId && task.assigneeId !== user.id) {
      this.notificationsService.createNotificationFromSystem(task.assigneeId, {
        title: 'New Comment on Task',
        body: `${user.name} commented on "${task.title}"`,
      });
    }

    // Notify @mentioned users (skip self and assignee to avoid duplicate)
    for (const mentionedUserId of mentions) {
      if (mentionedUserId !== user.id && mentionedUserId !== task.assigneeId) {
        this.notificationsService.createNotificationFromSystem(
          mentionedUserId,
          {
            title: 'You Were Mentioned',
            body: `${user.name} mentioned you in task "${task.title}"`,
          },
        );
      }
    }

    return comment;
  }

  async deleteComment(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    commentId: string,
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

    let existingTask: Awaited<
      ReturnType<FetchTaskRepository['findByIdInProject']>
    >;

    try {
      existingTask = await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    await this.ensureCommentMutationAccess({
      commentId,
      taskComments: existingTask.comments,
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    try {
      return await this.deleteTaskRepository.deleteComment({ commentId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Comment not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async updateComment(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    commentId: string,
    dto: UpdateTaskCommentDto,
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

    let existingTask: Awaited<
      ReturnType<FetchTaskRepository['findByIdInProject']>
    >;

    try {
      existingTask = await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    await this.ensureCommentMutationAccess({
      commentId,
      taskComments: existingTask.comments,
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    try {
      return await this.updateTaskRepository.updateComment({
        commentId,
        content: dto.content,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Comment not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async toggleCommentLike(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    commentId: string,
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found in this project',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    return await this.updateTaskRepository.toggleCommentLike({
      commentId,
      userId: user.id,
    });
  }

  async logTime(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    dto: { hours: number; description?: string; workSessionId?: string },
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    const timeEntry = await this.createTaskRepository.addTimeEntry({
      taskId,
      userId: user.id,
      hours: dto.hours,
      description: dto.description,
      workSessionId: dto.workSessionId,
    });

    // Recalculate actualHours on the task
    await this.updateTaskRepository.recalculateActualHours({ taskId });

    return timeEntry;
  }

  async getTimeEntries(req: CustomRequest, projectId: string, taskId: string) {
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    return await this.fetchTaskRepository.getTimeEntries({ taskId });
  }

  async updateTimeEntry(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    timeEntryId: string,
    dto: { hours?: number; description?: string },
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    await this.ensureTimeEntryMutationAccess({
      timeEntryId,
      taskId,
      projectId,
      userId: user.id,
      userRoles: user.roles,
    });

    try {
      const updated = await this.updateTaskRepository.updateTimeEntry({
        timeEntryId,
        hours: dto.hours,
        description: dto.description,
      });

      // Recalculate actualHours on the task
      await this.updateTaskRepository.recalculateActualHours({ taskId });

      return updated;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Time entry not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async deleteTimeEntry(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    timeEntryId: string,
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
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    await this.ensureTimeEntryMutationAccess({
      timeEntryId,
      taskId,
      projectId,
      userId: user.id,
      userRoles: user.roles,
    });

    try {
      await this.deleteTaskRepository.deleteTimeEntry({ timeEntryId });

      // Recalculate actualHours on the task
      await this.updateTaskRepository.recalculateActualHours({ taskId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Time entry not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async reorderBacklog(
    req: CustomRequest,
    projectId: string,
    body: { tasks: { taskId: string; displayOrder: number }[] },
  ) {
    const user = req.user!;

    // Check if user can manage backlog (managers, product owners, or scrum masters)
    const canManage = await this.canManageBacklog(
      user.id,
      user.roles,
      projectId,
    );
    if (!canManage) {
      throw new ForbiddenCustomException(
        'Only project managers, product owners, or scrum masters can reorder the backlog',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    // Bulk validation: verify all tasks belong to the project in a single query
    const taskIds = body.tasks.map((t) => t.taskId);
    const count = await this.countTasksInProjectCount({
      taskIds,
      projectId,
    });
    if (count !== taskIds.length) {
      throw new NotFoundCustomException(
        'One or more tasks not found in this project',
        ErrorCode.TASK_NOT_FOUND,
      );
    }

    return await this.updateTaskRepository.reorderBacklog({
      tasks: body.tasks,
    });
  }

  async moveToSprint(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    sprintId: string,
  ) {
    const user = req.user!;

    const canAccess = await this.canManageSprintAssignment(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only scrum masters, product owners, project managers, or executives can move tasks to sprints',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    try {
      await this.fetchTaskRepository.findByIdInProject({
        taskId,
        projectId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }

    await this.ensureSprintBelongsToProject(projectId, sprintId);

    return await this.updateTaskRepository.moveToSprint({
      taskId,
      sprintId,
    });
  }

  async getBacklog(
    req: CustomRequest,
    projectId: string,
    filters?: { isFavorite?: boolean; archived?: boolean },
  ) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project members or executives can view backlog tasks',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    const backlog = await this.fetchTaskRepository.findBacklog({
      projectId,
      filters,
    });

    return backlog;
  }

  async getTasksBySprint(
    req: CustomRequest,
    projectId: string,
    sprintId: string,
    filters?: { isFavorite?: boolean; archived?: boolean },
  ) {
    const user = req.user!;

    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'Only project members or executives can view sprint tasks',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    await this.ensureSprintBelongsToProject(projectId, sprintId);

    const sprintTasks = await this.fetchTaskRepository.findBySprint({
      projectId,
      sprintId,
      filters,
    });

    return sprintTasks;
  }

  async getKanban(
    req: CustomRequest,
    projectId: string,
    options: { sprintId?: string; epicId?: string; groupBy?: string },
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

    const project =
      await this.fetchTaskRepository.findProjectWithKanbanSettings({
        projectId,
      });

    this.validateTaskFiltersForProjectType(project.projectType, options);

    if (options.sprintId) {
      await this.ensureSprintBelongsToProject(projectId, options.sprintId);
    }

    if (options.epicId) {
      await this.ensureEpicBelongsToProject(projectId, options.epicId);
    }

    const rawTasks = await this.fetchTaskRepository.findKanban({
      projectId,
      options,
    });

    // Flatten nested label assignments to { id, name, color }[]
    const tasks = rawTasks.map((t) => ({
      ...t,
      labels: t.labels.map((a) => a.label),
    }));

    if (options.groupBy === 'assignee') {
      const swimlanes = this.groupTasksByAssignee(tasks, project.projectType);
      return { swimlanes, wipLimits: project.kanbanSettings || null };
    }

    // Load project statuses for dynamic grouping (seeding defaults if none yet)
    const projectStatuses = await this.loadProjectStatusesEnsured(
      projectId,
      project.projectType,
    );

    // Group tasks by status using project statuses
    const kanban = this.groupTasksByStatusDynamic(
      tasks,
      projectStatuses,
      project.projectType,
    );

    return {
      ...kanban,
      wipLimits: project.kanbanSettings || null,
    };
  }

  /**
   * Group tasks by status for Kanban board using dynamic project statuses
   * Falls back to enum-based grouping if no custom statuses exist
   */
  private groupTasksByStatusDynamic(
    tasks: KanbanBoardTaskFlat[],
    projectStatuses: ProjectTaskStatusRecord[],
    projectType: ProjectType,
  ) {
    const grouped: Record<string, KanbanBoardTaskFlat[]> = {};

    // Initialize groups with all project statuses
    for (const status of projectStatuses) {
      grouped[status.name] = [];
    }

    // If no custom statuses, fall back to enum-based grouping
    if (projectStatuses.length === 0) {
      return this.groupTasksByStatus(tasks, projectType);
    }

    // Group tasks by their status
    for (const task of tasks) {
      const status: string = task.status;
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    }

    // Return grouped tasks in the order defined by project statuses
    const result: Record<string, KanbanBoardTaskFlat[]> = {};
    for (const status of projectStatuses) {
      result[status.name] = grouped[status.name] || [];
    }

    return result;
  }

  /**
   * Group tasks by status for Kanban board
   * FREESTYLE: 3 columns (TODO, IN_PROGRESS, DONE)
   * AGILE: 6 columns (BACKLOG, TODO, IN_PROGRESS, IN_REVIEW, TESTING, DONE)
   */
  private groupTasksByStatus(
    tasks: KanbanBoardTaskFlat[],
    projectType: ProjectType,
  ) {
    const grouped: Record<string, KanbanBoardTaskFlat[]> = {};

    for (const task of tasks) {
      const status: string = task.status;
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(task);
    }

    // For FREESTYLE, return only 3 columns
    if (projectType === ProjectType.FREESTYLE) {
      return {
        TODO: grouped['TODO'] || [],
        IN_PROGRESS: grouped['IN_PROGRESS'] || [],
        DONE: grouped['DONE'] || [],
      };
    }

    // For AGILE, return all 6 columns
    return {
      BACKLOG: grouped['BACKLOG'] || [],
      TODO: grouped['TODO'] || [],
      IN_PROGRESS: grouped['IN_PROGRESS'] || [],
      IN_REVIEW: grouped['IN_REVIEW'] || [],
      TESTING: grouped['TESTING'] || [],
      DONE: grouped['DONE'] || [],
    };
  }

  /**
   * Group tasks by assignee (swimlane view), with status columns per assignee
   */
  private groupTasksByAssignee(
    tasks: KanbanBoardTaskFlat[],
    projectType: ProjectType,
  ) {
    const swimlanes: Record<
      string,
      {
        assignee: { id: string; name: string } | null;
        columns: Record<string, KanbanBoardTaskFlat[]>;
      }
    > = {};

    const statusColumns =
      projectType === ProjectType.FREESTYLE
        ? ['TODO', 'IN_PROGRESS', 'DONE']
        : ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE'];

    for (const task of tasks) {
      const assigneeId = task.assignee?.id ?? 'unassigned';
      if (!swimlanes[assigneeId]) {
        swimlanes[assigneeId] = {
          assignee: task.assignee
            ? { id: task.assignee.id, name: task.assignee.name }
            : null,
          columns: Object.fromEntries(statusColumns.map((s) => [s, []])),
        };
      }
      const status: string = task.status;
      if (swimlanes[assigneeId].columns[status]) {
        swimlanes[assigneeId].columns[status].push(task);
      }
    }

    return Object.values(swimlanes);
  }

  async moveTaskInKanban(
    req: CustomRequest,
    projectId: string,
    body: { taskId: string; status: string; displayOrder?: number },
  ) {
    const user = req.user!;

    try {
      const existingTask = await this.fetchTaskRepository.findByIdInProject({
        taskId: body.taskId,
        projectId,
      });

      const canAccess = await this.canAdvanceTaskWorkflow(
        user.id,
        user.roles,
        projectId,
        existingTask.assignee?.id,
      );
      if (!canAccess) {
        throw new ForbiddenCustomException(
          'Only the assignee, scrum masters, product owners, project managers, or executives can move this task on the kanban board',
          ErrorCode.INSUFFICIENT_PERMISSION,
        );
      }

      if (
        !(await this.isValidStatusTransitionDynamic(
          projectId,
          existingTask.status,
          body.status,
        ))
      ) {
        throw new BadRequestCustomException(
          'Invalid status transition',
          ErrorCode.TASK_INVALID_STATUS_TRANSITION,
        );
      }

      // Check if task is blocked by incomplete dependencies
      const blockingTasks = await this.checkTaskBlocked({
        taskId: body.taskId,
      });
      if (blockingTasks) {
        throw new BadRequestCustomException(
          `Task is blocked by: ${blockingTasks.join(', ')}`,
          ErrorCode.TASK_BLOCKED,
        );
      }

      // Check WIP limit for target status
      const project =
        await this.fetchTaskRepository.findProjectWithKanbanSettings({
          projectId,
        });
      if (project.kanbanSettings) {
        const targetStatus = body.status;
        const limit = project.kanbanSettings[targetStatus];
        if (limit !== undefined) {
          const currentCount =
            await this.fetchTaskRepository.countTasksByStatus({
              projectId,
              status: targetStatus,
            });
          if (currentCount >= limit) {
            throw new BadRequestCustomException(
              `WIP limit reached for ${targetStatus} (max: ${limit})`,
              ErrorCode.TASK_WIP_LIMIT_REACHED,
            );
          }
        }
      }

      // Notify assignee about status change on kanban (fire-and-forget)
      if (existingTask.assignee?.id && existingTask.assignee?.id !== user.id) {
        this.notificationsService.createNotificationFromSystem(
          existingTask.assignee?.id,
          {
            title: 'Task Status Updated',
            body: `Task "${existingTask.title}" moved to ${body.status}`,
          },
        );
      }

      return await this.updateTaskRepository.updateTaskStatus({
        taskId: body.taskId,
        status: body.status,
        displayOrder: body.displayOrder,
      });
    } catch (error) {
      if (error instanceof BadRequestCustomException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
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

  private async checkTaskBlocked(query: {
    taskId: string;
  }): Promise<string[] | null> {
    const blockingDeps =
      await this.fetchTaskRepository.findBlockingDependencies({
        taskId: query.taskId,
      });

    if (blockingDeps.length === 0) {
      return null;
    }

    return blockingDeps.map((dep) => dep.blockingTask.title);
  }

  private async countTasksInProjectCount(query: {
    taskIds: string[];
    projectId: string;
  }): Promise<number> {
    return this.fetchTaskRepository.countTasksInProject({
      taskIds: query.taskIds,
      projectId: query.projectId,
    });
  }

  private async ensureSprintBelongsToProject(
    projectId: string,
    sprintId: string,
  ): Promise<void> {
    const sprint = await this.fetchTaskRepository.findSprintInProject({
      projectId,
      sprintId,
    });

    if (!sprint) {
      throw new NotFoundCustomException(
        'Sprint not found in this project',
        ErrorCode.SPRINT_NOT_FOUND,
      );
    }
  }

  private async ensureEpicBelongsToProject(
    projectId: string,
    epicId: string,
  ): Promise<void> {
    const epic = await this.fetchTaskRepository.findEpicInProject({
      projectId,
      epicId,
    });

    if (!epic) {
      throw new NotFoundCustomException(
        'Epic not found in this project',
        ErrorCode.EPIC_NOT_FOUND,
      );
    }
  }

  private async ensureMilestoneBelongsToProject(
    projectId: string,
    milestoneId: string,
  ): Promise<void> {
    const milestone = await this.fetchTaskRepository.findMilestoneInProject({
      projectId,
      milestoneId,
    });

    if (!milestone) {
      throw new NotFoundCustomException(
        'Milestone not found in this project',
        ErrorCode.MILESTONE_NOT_FOUND,
      );
    }
  }

  private async checkCircularDependency(query: {
    taskId: string;
    blockingTaskId: string;
  }): Promise<boolean> {
    const { taskId, blockingTaskId } = query;

    if (taskId === blockingTaskId) {
      return true;
    }

    // Check if reverse dependency exists
    const reverseDeps = await this.fetchTaskRepository.findDependencies({
      taskId: blockingTaskId,
      blockedTaskId: taskId,
    });

    if (reverseDeps.length > 0) {
      return true;
    }

    // Recursively check dependencies
    const deps = await this.fetchTaskRepository.findBlockingDependencies({
      taskId,
    });

    for (const dep of deps) {
      if (
        await this.checkCircularDependency({
          taskId: dep.blockingTask.id,
          blockingTaskId,
        })
      ) {
        return true;
      }
    }

    return false;
  }

  // ─── Project-Level Label Methods ────────────────────────────────────────────

  async getProjectLabels(req: CustomRequest, projectId: string) {
    const user = req.user!;
    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have access to this project',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
    return this.taskLabelsRepository.findAllByProject({ projectId });
  }

  async getProjectLabel(
    req: CustomRequest,
    projectId: string,
    labelId: string,
  ) {
    const user = req.user!;
    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have access to this project',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
    const label = await this.taskLabelsRepository.findByIdInProject({
      labelId,
      projectId,
    });
    if (!label) {
      throw new NotFoundCustomException(
        'Label not found',
        ErrorCode.TASK_LABEL_NOT_FOUND,
      );
    }
    return label;
  }

  async createLabel(
    req: CustomRequest,
    projectId: string,
    dto: CreateTaskLabelDto,
  ) {
    const user = req.user!;
    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have permission to manage task labels',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
    try {
      return await this.taskLabelsRepository.createLabel({
        projectId,
        name: dto.name,
        color: dto.color ?? DEFAULT_TASK_LABEL_COLOR,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Label with this name already exists in this project',
            ErrorCode.TASK_LABEL_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async updateLabel(
    req: CustomRequest,
    projectId: string,
    labelId: string,
    dto: UpdateTaskLabelDto,
  ) {
    const user = req.user!;
    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have permission to manage task labels',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    const label = await this.taskLabelsRepository.findByIdInProject({
      labelId,
      projectId,
    });
    if (!label) {
      throw new NotFoundCustomException(
        'Label not found',
        ErrorCode.TASK_LABEL_NOT_FOUND,
      );
    }

    try {
      const updateData: { labelId: string; name?: string; color?: string } = {
        labelId,
      };
      if (dto.name !== undefined) {
        updateData.name = dto.name;
      }
      if (dto.color !== undefined) {
        updateData.color = dto.color;
      }

      return await this.taskLabelsRepository.updateLabel(updateData);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Label with this name already exists in this project',
            ErrorCode.TASK_LABEL_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async deleteLabel(req: CustomRequest, projectId: string, labelId: string) {
    const user = req.user!;
    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have permission to manage task labels',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }
    await this.getProjectLabelOrThrow({ projectId, labelId });
    await this.taskLabelsRepository.deleteLabel({ labelId });
  }

  async assignLabelToTask(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    labelId: string,
  ) {
    const user = req.user!;
    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have permission to manage task labels',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    await this.ensureTaskExistsInProject(taskId, projectId);

    await this.getProjectLabelOrThrow({ projectId, labelId });
    try {
      return await this.taskLabelsRepository.assignLabel({ taskId, labelId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Label already assigned to this task',
            ErrorCode.TASK_LABEL_ALREADY_ASSIGNED,
          );
        }
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Task not found',
            ErrorCode.TASK_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async removeLabelFromTask(
    req: CustomRequest,
    projectId: string,
    taskId: string,
    labelId: string,
  ) {
    const user = req.user!;
    const canAccess = await this.canManageTaskStructure(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have permission to manage task labels',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    await this.ensureTaskExistsInProject(taskId, projectId);
    await this.getProjectLabelOrThrow({ projectId, labelId });

    try {
      await this.taskLabelsRepository.removeLabel({ taskId, labelId });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundCustomException(
          'Label not found',
          ErrorCode.TASK_LABEL_NOT_FOUND,
        );
      }

      throw error;
    }
  }

  // ─── Bulk Status Update ───────────────────────────────────────────────────

  async bulkUpdateStatus(
    req: CustomRequest,
    projectId: string,
    dto: BulkUpdateTaskStatusDto,
  ) {
    const user = req.user!;
    const canAccess = await this.canAccessProject(
      user.id,
      user.roles,
      projectId,
    );
    if (!canAccess) {
      throw new ForbiddenCustomException(
        'You do not have access to this project',
        ErrorCode.INSUFFICIENT_PERMISSION,
      );
    }

    const results: { taskId: string; success: boolean; error?: string }[] = [];

    for (const item of dto.tasks) {
      try {
        const task = await this.fetchTaskRepository.findByIdInProject({
          taskId: item.taskId,
          projectId,
        });

        if (
          !(await this.isValidStatusTransitionDynamic(
            projectId,
            task.status,
            item.status,
          ))
        ) {
          results.push({
            taskId: item.taskId,
            success: false,
            error: `Invalid status transition from ${task.status} to ${item.status}`,
          });
          continue;
        }

        await this.updateTaskRepository.updateTaskStatus({
          taskId: item.taskId,
          status: item.status,
        });
        results.push({ taskId: item.taskId, success: true });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          results.push({
            taskId: item.taskId,
            success: false,
            error: 'Task not found',
          });
        } else {
          results.push({
            taskId: item.taskId,
            success: false,
            error: 'Failed to update',
          });
        }
      }
    }

    return { results };
  }

  async getMyTasksInProject(
    req: CustomRequest,
    projectId: string,
    query: TaskQueryDto,
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
    const filters: TaskQueryDto = { ...query, assigneeId: user.id };

    const total = await this.fetchTaskRepository.countTasks({
      projectId,
      filters,
    });

    filters.skip = (page - 1) * limit;
    filters.take = limit;

    const tasks = await this.fetchTaskRepository.findAll({
      projectId,
      filters,
    });

    return {
      data: tasks,
      pagination: this.setPaginationParametersInResponse(total, page, limit),
    };
  }

  async getMyTasksAcrossProjects(req: CustomRequest, query: TaskQueryDto) {
    const user = req.user!;

    const { page, limit } = this.retrievePaginationParameters(query);

    const total = await this.fetchTaskRepository.countAssignedToUser({
      userId: user.id,
      filters: query,
    });

    query.skip = (page - 1) * limit;
    query.take = limit;

    const tasks = await this.fetchTaskRepository.findAssignedToUser({
      userId: user.id,
      filters: query,
    });

    return {
      data: tasks,
      pagination: this.setPaginationParametersInResponse(total, page, limit),
    };
  }
}
