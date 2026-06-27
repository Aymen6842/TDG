import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Request,
  ParseUUIDPipe,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiConsumes,
} from '@nestjs/swagger';

import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { AgileOnlyGuard } from 'src/auths/guards/agile-only.guard';
import { AgileProject } from 'src/auths/decorators/agile-project.decorator';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/request/post/create-task.dto';
import { CreateTaskCommentDto } from '../dto/request/post/create-task-comment.dto';
import { MoveTaskInKanbanDto } from '../dto/request/post/move-task-in-kanban.dto';
import { ReorderBacklogDto } from '../dto/request/post/reorder-backlog.dto';
import { MoveToSprintDto } from '../dto/request/post/move-to-sprint.dto';
import { AddDependencyDto } from '../dto/request/post/add-dependency.dto';
import { LogTimeEntryDto } from '../dto/request/post/log-time-entry.dto';
import { CreateTaskLabelDto } from '../dto/request/post/create-task-label.dto';
import { UpdateTaskDto } from '../dto/request/update/update-task.dto';
import { UpdateTaskCommentDto } from '../dto/request/update/update-task-comment.dto';
import { UpdateTimeEntryDto } from '../dto/request/update/update-time-entry.dto';
import { UpdateTaskLabelDto } from '../dto/request/update/update-task-label.dto';
import { BulkUpdateTaskStatusDto } from '../dto/request/update/bulk-update-task-status.dto';
import { TaskQueryDto } from '../dto/request/fetch/task-query.dto';
import { CreatedTaskDto } from '../dto/response/post/created-task.dto';
import { UpdatedTaskDto } from '../dto/response/update/updated-task.dto';
import {
  TaskListDto,
  TaskResponseDto,
  TaskSummaryDto,
  TaskCommentResponseDto,
  TaskDependencyResponseDto,
  TaskLabelDto,
} from '../dto/response/fetch/task.dto';
import { TaskBulkUpdateStatusResponseDto } from '../dto/response/fetch/task-bulk-update-status-response.dto';
import { TaskDisplayOrderDto } from '../dto/response/fetch/task-display-order.dto';
import { TaskLabelAssignmentResponseDto } from '../dto/response/fetch/task-label-assignment-response.dto';
import { TaskMoveToSprintResponseDto } from '../dto/response/fetch/task-move-to-sprint-response.dto';
import { TaskTimeEntryDto } from '../dto/response/fetch/task-time-entry.dto';
import { TaskSortByOptions } from '../types/request.type';
import { CreateTaskStatusDto } from '../dto/request/post/create-task-status.dto';
import { UpdateTaskStatusDto } from '../dto/request/update/update-task-status.dto';
import { TaskStatusDto } from '../dto/response/fetch/task-status.dto';

import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  ForbiddenApiResponse,
  TaskNotFoundApiResponse,
  TaskAlreadyExistsApiResponse,
  TaskInvalidStatusTransitionApiResponse,
  TaskCircularDependencyApiResponse,
  TaskLabelNotFoundApiResponse,
  TaskLabelAlreadyExistsApiResponse,
  TaskLabelAlreadyAssignedApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // ─── Task Status Management ────────────────────────────────────────────────

  @Post('projects/:projectId/task-statuses')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_STATUS_MANAGE])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Create a custom task status' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: CreateTaskStatusDto })
  @ApiResponse({
    status: 201,
    description: 'Task status created successfully',
    type: TaskStatusDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(TaskAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createTaskStatus(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskStatusDto,
  ) {
    return this.tasksService.createTaskStatus(req, projectId, dto);
  }

  @Get('projects/:projectId/task-statuses')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'List all task statuses for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Task statuses retrieved successfully',
    type: [TaskStatusDto],
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getTaskStatuses(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.tasksService.getTaskStatuses(req, projectId);
  }

  @Patch('projects/:projectId/task-statuses/:statusId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_STATUS_MANAGE])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Update a task status' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'statusId', description: 'Status UUID' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Task status updated successfully',
    type: TaskStatusDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateTaskStatus(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('statusId', ParseUUIDPipe) statusId: string,
    @Body() dto: UpdateTaskStatusDto,
  ) {
    return this.tasksService.updateTaskStatusDefinition(
      req,
      projectId,
      statusId,
      dto,
    );
  }

  @Delete('projects/:projectId/task-statuses/:statusId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_STATUS_MANAGE])
  @ApiOperation({ summary: 'Delete a task status' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'statusId', description: 'Status UUID' })
  @ApiResponse({ status: 204, description: 'Task status deleted successfully' })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteTaskStatus(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('statusId', ParseUUIDPipe) statusId: string,
  ) {
    return this.tasksService.deleteTaskStatus(req, projectId, statusId);
  }

  @Post('projects/:projectId/tasks')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_CREATE])
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.TaskAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: CreatedTaskDto })
  @ApiOperation({ summary: 'Create a new task' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({
    status: 201,
    description: 'Task created successfully',
    type: CreatedTaskDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(TaskAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createTask(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(
      req,
      projectId,
      attachments,
      createTaskDto,
    );
  }

  @Get('projects/:projectId/tasks')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskListDto })
  @ApiOperation({ summary: 'List all tasks for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (enum value or custom status name)',
    example: 'TODO',
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
  })
  @ApiQuery({ name: 'assigneeId', required: false })
  @ApiQuery({ name: 'sprintId', required: false })
  @ApiQuery({ name: 'epicId', required: false })
  @ApiQuery({ name: 'milestoneId', required: false })
  @ApiQuery({
    name: 'dueDateFrom',
    required: false,
    description: 'Filter tasks with due date from this ISO date/time',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'dueDateTo',
    required: false,
    description: 'Filter tasks with due date to this ISO date/time',
    example: '2026-12-31T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    type: Boolean,
    description: 'Filter by favorite flag',
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    type: Boolean,
    description: 'Filter by archived flag',
  })
  @ApiQuery({
    name: 'labelName',
    required: false,
    description: 'Filter by assigned project label name',
    example: 'Frontend',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: TaskSortByOptions,
    description: 'Sort tasks',
    example: 'createdAtDesc',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SPIKE'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: TaskListDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  listTasks(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getTasks(req, projectId, query);
  }

  @Get('projects/:projectId/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_BY_ID])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskResponseDto })
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiResponse({
    status: 200,
    description: 'Task retrieved successfully',
    type: TaskResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getTaskById(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.getTaskById(req, projectId, taskId);
  }

  // ─── Bulk Status Update ───────────────────────────────────────────────────

  @Patch('projects/:projectId/tasks/bulk-status')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_STATUS_MANAGE])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Bulk update task statuses' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: BulkUpdateTaskStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Bulk update results',
    type: TaskBulkUpdateStatusResponseDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  bulkUpdateStatus(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: BulkUpdateTaskStatusDto,
  ) {
    return this.tasksService.bulkUpdateStatus(req, projectId, dto);
  }

  @Patch('projects/:projectId/tasks/:taskId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_UPDATE_ANY,
    PERMISSIONS.TASKS.TASK_UPDATE_OWN,
  ])
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 10 }],
      UploadStorage.TaskAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: UpdatedTaskDto })
  @ApiOperation({ summary: 'Update a task' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({
    status: 200,
    description: 'Task updated successfully',
    type: UpdatedTaskDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(TaskInvalidStatusTransitionApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateTask(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.tasksService.updateTask(
      req,
      projectId,
      taskId,
      attachments,
      updateTaskDto,
    );
  }

  @Delete('projects/:projectId/tasks/:taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_DELETE])
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiResponse({ status: 204, description: 'Task deleted successfully' })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteTask(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.deleteTask(req, projectId, taskId);
  }

  @Get('projects/:projectId/kanban')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get Kanban board for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'sprintId',
    required: false,
    description: 'Filter by sprint',
  })
  @ApiQuery({ name: 'epicId', required: false, description: 'Filter by epic' })
  @ApiQuery({
    name: 'groupBy',
    required: false,
    description: 'Group tasks by swimlane. Use "assignee" for swimlane view.',
    enum: ['assignee'],
  })
  @ApiResponse({
    status: 200,
    description: 'Kanban board retrieved successfully',
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getKanban(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('sprintId') sprintId?: string,
    @Query('epicId') epicId?: string,
    @Query('groupBy') groupBy?: string,
  ) {
    return this.tasksService.getKanban(req, projectId, {
      sprintId,
      epicId,
      groupBy,
    });
  }

  @Patch('projects/:projectId/kanban/move')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_UPDATE_STATUS_ANY,
    PERMISSIONS.TASKS.TASK_UPDATE_STATUS_OWN,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Move task in Kanban board' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: MoveTaskInKanbanDto })
  @ApiResponse({ status: 200, description: 'Task moved successfully' })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(TaskInvalidStatusTransitionApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  moveTaskInKanban(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: MoveTaskInKanbanDto,
  ) {
    return this.tasksService.moveTaskInKanban(req, projectId, body);
  }

  @Post('projects/:projectId/tasks/:taskId/comments')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_CREATE_COMMENT])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskCommentResponseDto })
  @ApiOperation({ summary: 'Add a comment to a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiBody({ type: CreateTaskCommentDto })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
    type: TaskCommentResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  addComment(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: CreateTaskCommentDto,
  ) {
    return this.tasksService.addComment(req, projectId, taskId, dto);
  }

  @Get('projects/:projectId/backlog')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.BACKLOG.BACKLOG_READ])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get backlog tasks (not assigned to any sprint)' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    type: Boolean,
    description: 'Filter by isFavorite',
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    type: Boolean,
    description: 'Filter by archived',
  })
  @ApiResponse({
    status: 200,
    description: 'Backlog tasks retrieved successfully',
    type: [TaskSummaryDto],
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getBacklog(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('archived') archived?: string,
  ) {
    const filters = {
      isFavorite:
        isFavorite === 'true'
          ? true
          : isFavorite === 'false'
            ? false
            : undefined,
      archived:
        archived === 'true' ? true : archived === 'false' ? false : undefined,
    };
    return this.tasksService.getBacklog(req, projectId, filters);
  }

  @Get('projects/:projectId/sprints/:sprintId/tasks')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get tasks by sprint' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'sprintId', description: 'Sprint UUID' })
  @ApiQuery({
    name: 'isFavorite',
    required: false,
    type: Boolean,
    description: 'Filter by isFavorite',
  })
  @ApiQuery({
    name: 'archived',
    required: false,
    type: Boolean,
    description: 'Filter by archived',
  })
  @ApiResponse({
    status: 200,
    description: 'Tasks retrieved successfully',
    type: [TaskSummaryDto],
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getTasksBySprint(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('sprintId', ParseUUIDPipe) sprintId: string,
    @Query('isFavorite') isFavorite?: string,
    @Query('archived') archived?: string,
  ) {
    const filters = {
      isFavorite:
        isFavorite === 'true'
          ? true
          : isFavorite === 'false'
            ? false
            : undefined,
      archived:
        archived === 'true' ? true : archived === 'false' ? false : undefined,
    };
    return this.tasksService.getTasksBySprint(
      req,
      projectId,
      sprintId,
      filters,
    );
  }

  @Patch('projects/:projectId/backlog/reorder')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.BACKLOG.BACKLOG_MANAGE])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Reorder backlog tasks' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: ReorderBacklogDto })
  @ApiResponse({
    status: 200,
    description: 'Backlog reordered successfully',
    type: [TaskDisplayOrderDto],
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  reorderBacklog(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() body: ReorderBacklogDto,
  ) {
    return this.tasksService.reorderBacklog(req, projectId, body);
  }

  @Post('projects/:projectId/backlog/:taskId/move-to-sprint')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.BACKLOG.BACKLOG_MANAGE])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Move task from backlog to sprint' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiBody({ type: MoveToSprintDto })
  @ApiResponse({
    status: 200,
    description: 'Task moved to sprint successfully',
    type: TaskMoveToSprintResponseDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  moveToSprint(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() body: MoveToSprintDto,
  ) {
    return this.tasksService.moveToSprint(
      req,
      projectId,
      taskId,
      body.sprintId,
    );
  }

  @Post('projects/:projectId/tasks/:taskId/dependencies')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_ADD_DEPENDENCY])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskDependencyResponseDto })
  @ApiOperation({ summary: 'Add a dependency to a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiBody({ type: AddDependencyDto })
  @ApiResponse({
    status: 201,
    description: 'Dependency added successfully',
    type: TaskDependencyResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(TaskCircularDependencyApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  addDependency(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() body: AddDependencyDto,
  ) {
    return this.tasksService.addDependency(
      req,
      projectId,
      taskId,
      body.blockingTaskId,
    );
  }

  @Delete('projects/:projectId/tasks/:taskId/dependencies/:dependencyId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_REMOVE_DEPENDENCY])
  @ApiOperation({ summary: 'Remove a dependency from a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'dependencyId', description: 'Dependency UUID' })
  @ApiResponse({ status: 204, description: 'Dependency removed successfully' })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  removeDependency(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('dependencyId', ParseUUIDPipe) dependencyId: string,
  ) {
    return this.tasksService.removeDependency(
      req,
      projectId,
      taskId,
      dependencyId,
    );
  }

  @Delete('projects/:projectId/tasks/:taskId/comments/:commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_DELETE_COMMENT,
    PERMISSIONS.TASKS.TASK_DELETE_OWN_COMMENT,
  ])
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({ status: 204, description: 'Comment deleted successfully' })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteComment(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.tasksService.deleteComment(req, projectId, taskId, commentId);
  }

  @Patch('projects/:projectId/tasks/:taskId/comments/:commentId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_UPDATE_COMMENT,
    PERMISSIONS.TASKS.TASK_UPDATE_OWN_COMMENT,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskCommentResponseDto })
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiBody({ type: UpdateTaskCommentDto })
  @ApiResponse({
    status: 200,
    description: 'Comment updated successfully',
    type: TaskCommentResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateComment(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() dto: UpdateTaskCommentDto,
  ) {
    return this.tasksService.updateComment(
      req,
      projectId,
      taskId,
      commentId,
      dto,
    );
  }

  @Post('projects/:projectId/tasks/:taskId/comments/:commentId/like')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_LIKE_COMMENT])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskCommentResponseDto })
  @ApiOperation({ summary: 'Toggle like on a comment' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'commentId', description: 'Comment UUID' })
  @ApiResponse({
    status: 200,
    description: 'Like toggled successfully',
    type: TaskCommentResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  toggleCommentLike(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.tasksService.toggleCommentLike(
      req,
      projectId,
      taskId,
      commentId,
    );
  }

  @Post('projects/:projectId/tasks/:taskId/time-entries')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_LOG_TIME])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Log time on a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiBody({ type: LogTimeEntryDto })
  @ApiResponse({
    status: 201,
    description: 'Time entry created successfully',
    type: TaskTimeEntryDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  logTimeEntry(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: LogTimeEntryDto,
  ) {
    return this.tasksService.logTime(req, projectId, taskId, dto);
  }

  @Get('projects/:projectId/tasks/:taskId/time-entries')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_TIME_ENTRIES])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Get all time entries for a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiResponse({
    status: 200,
    description: 'Time entries retrieved successfully',
    type: [TaskTimeEntryDto],
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getTimeEntries(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.getTimeEntries(req, projectId, taskId);
  }

  @Patch('projects/:projectId/tasks/:taskId/time-entries/:timeEntryId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_UPDATE_TIME_ENTRY,
    PERMISSIONS.TASKS.TASK_UPDATE_OWN_TIME_ENTRY,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Update a time entry' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'timeEntryId', description: 'Time entry UUID' })
  @ApiBody({ type: UpdateTimeEntryDto })
  @ApiResponse({
    status: 200,
    description: 'Time entry updated successfully',
    type: TaskTimeEntryDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateTimeEntry(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('timeEntryId', ParseUUIDPipe) timeEntryId: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.tasksService.updateTimeEntry(
      req,
      projectId,
      taskId,
      timeEntryId,
      dto,
    );
  }

  @Delete('projects/:projectId/tasks/:taskId/time-entries/:timeEntryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.TASKS.TASK_DELETE_TIME_ENTRY,
    PERMISSIONS.TASKS.TASK_DELETE_OWN_TIME_ENTRY,
  ])
  @ApiOperation({ summary: 'Delete a time entry' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'timeEntryId', description: 'Time entry UUID' })
  @ApiResponse({
    status: 204,
    description: 'Time entry deleted successfully',
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteTimeEntry(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('timeEntryId', ParseUUIDPipe) timeEntryId: string,
  ) {
    return this.tasksService.deleteTimeEntry(
      req,
      projectId,
      taskId,
      timeEntryId,
    );
  }

  // ─── Project-Level Label Endpoints ──────────────────────────────────────────

  @Get('projects/:projectId/labels')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskLabelDto })
  @ApiOperation({ summary: 'Get all labels for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Labels retrieved successfully',
    type: [TaskLabelDto],
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getProjectLabels(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.tasksService.getProjectLabels(req, projectId);
  }

  @Get('projects/:projectId/labels/:labelId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskLabelDto })
  @ApiOperation({ summary: 'Get a specific label for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'labelId', description: 'Label UUID' })
  @ApiResponse({
    status: 200,
    description: 'Label retrieved successfully',
    type: TaskLabelDto,
  })
  @ApiResponse(TaskLabelNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getProjectLabel(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.tasksService.getProjectLabel(req, projectId, labelId);
  }

  @Post('projects/:projectId/labels')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_CREATE_LABEL])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskLabelDto })
  @ApiOperation({ summary: 'Create a label for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: CreateTaskLabelDto })
  @ApiResponse({
    status: 201,
    description: 'Label created successfully',
    type: TaskLabelDto,
  })
  @ApiResponse(TaskLabelAlreadyExistsApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createLabel(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: CreateTaskLabelDto,
  ) {
    return this.tasksService.createLabel(req, projectId, dto);
  }

  @Patch('projects/:projectId/labels/:labelId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_UPDATE_LABEL])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: TaskLabelDto })
  @ApiOperation({ summary: 'Update a project label' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'labelId', description: 'Label UUID' })
  @ApiBody({ type: UpdateTaskLabelDto })
  @ApiResponse({
    status: 200,
    description: 'Label updated successfully',
    type: TaskLabelDto,
  })
  @ApiResponse(TaskLabelNotFoundApiResponse)
  @ApiResponse(TaskLabelAlreadyExistsApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateLabel(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
    @Body() dto: UpdateTaskLabelDto,
  ) {
    return this.tasksService.updateLabel(req, projectId, labelId, dto);
  }

  @Delete('projects/:projectId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_DELETE_LABEL])
  @ApiOperation({ summary: 'Delete a project-level label' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'labelId', description: 'Label UUID' })
  @ApiResponse({ status: 204, description: 'Label deleted successfully' })
  @ApiResponse(TaskLabelNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteLabel(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.tasksService.deleteLabel(req, projectId, labelId);
  }

  @Post('projects/:projectId/tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_CREATE_LABEL])
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Assign a project label to a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'labelId', description: 'Label UUID' })
  @ApiResponse({
    status: 201,
    description: 'Label assigned to task successfully',
    type: TaskLabelAssignmentResponseDto,
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(TaskLabelNotFoundApiResponse)
  @ApiResponse(TaskLabelAlreadyAssignedApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  assignLabelToTask(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.tasksService.assignLabelToTask(req, projectId, taskId, labelId);
  }

  @Delete('projects/:projectId/tasks/:taskId/labels/:labelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_DELETE_LABEL])
  @ApiOperation({ summary: 'Remove a label from a task' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'taskId', description: 'Task UUID' })
  @ApiParam({ name: 'labelId', description: 'Label UUID' })
  @ApiResponse({
    status: 204,
    description: 'Label removed from task successfully',
  })
  @ApiResponse(TaskNotFoundApiResponse)
  @ApiResponse(TaskLabelNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  removeLabelFromTask(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('labelId', ParseUUIDPipe) labelId: string,
  ) {
    return this.tasksService.removeLabelFromTask(
      req,
      projectId,
      taskId,
      labelId,
    );
  }
}
