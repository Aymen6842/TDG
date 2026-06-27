import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Query,
  Request,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { TaskQueryDto } from '../dto/request/fetch/task-query.dto';
import { TaskListDto } from '../dto/response/fetch/task.dto';
import { TasksService } from '../services/tasks.service';
import {
  ForbiddenApiResponse,
  InternalServerErrorApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('User Tasks')
@ApiBearerAuth()
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserTasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('projects/:projectId/tasks/me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @SerializeOptions({ type: TaskListDto })
  @ApiOperation({
    summary: 'Get my assigned tasks in a project',
    description:
      'Returns the tasks assigned to the authenticated user within the specified project. Assignee filtering is always derived from the JWT identity.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: '10',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SPIKE'],
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort order for the returned tasks',
    example: 'createdAtDesc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assigned tasks retrieved successfully',
    type: TaskListDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getMyTasksInProject(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getMyTasksInProject(req, projectId, query);
  }

  @Get('project-tasks/assigned')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.TASKS.TASK_READ_MANY])
  @SerializeOptions({ type: TaskListDto })
  @ApiOperation({
    summary: 'Get my assigned tasks across projects',
    description:
      'Returns the tasks assigned to the authenticated user across all projects. Assignee filtering is always derived from the JWT identity.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
    example: '10',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE'],
  })
  @ApiQuery({
    name: 'priority',
    required: false,
    enum: ['URGENT', 'HIGH', 'MEDIUM', 'LOW'],
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['EPIC', 'STORY', 'TASK', 'BUG', 'SPIKE'],
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort order for the returned tasks',
    example: 'createdAtDesc',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Assigned tasks retrieved successfully',
    type: TaskListDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getMyTasksAcrossProjects(
    @Request() req: CustomRequest,
    @Query() query: TaskQueryDto,
  ) {
    return this.tasksService.getMyTasksAcrossProjects(req, query);
  }
}
