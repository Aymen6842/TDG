import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { ReminderEntityType, ReminderStatus } from '@prisma/client';

import { RemindersService } from '../services/reminders.service';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CreateReminderDto } from '../dto/request/post/create-reminder.dto';
import { UpdateReminderDto } from '../dto/request/update/update-reminder.dto';
import { ReminderQueryDto } from '../dto/request/fetch/reminder-query.dto';
import { CreatedReminderDto } from '../dto/response/post/created-reminder.dto';
import { UpdatedReminderDto } from '../dto/response/update/updated-reminder.dto';
import {
  ReminderDetailDto,
  ReminderListDto,
} from '../dto/response/fetch/reminder.dto';

import { CustomRequest } from 'src/common/types/request.type';
import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  ReminderNotFoundApiResponse,
  ReminderForbiddenApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('Reminders')
@Controller('projects/:projectId/reminders')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  /**
   * Create a new reminder
   * POST /projects/:projectId/reminders
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_MANAGE])
  @SerializeOptions({ type: CreatedReminderDto })
  @ApiOperation({ summary: 'Create a new reminder' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: String,
  })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Reminder created successfully',
    type: CreatedReminderDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async createReminder(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createReminderDto: CreateReminderDto,
  ) {
    return this.remindersService.createReminder(
      req,
      projectId,
      createReminderDto,
    );
  }

  /**
   * Get all reminders for a project
   * GET /projects/:projectId/reminders
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_READ])
  @SerializeOptions({ type: ReminderListDto })
  @ApiOperation({ summary: 'Get all reminders for a project' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
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
    description: 'Items per page (default: 20)',
    example: '20',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: String,
    description: 'Filter by status (PENDING, SENT, DISMISSED, FAILED)',
    enum: ReminderStatus,
  })
  @ApiQuery({
    name: 'entityType',
    required: false,
    enum: ReminderEntityType,
    enumName: 'ReminderEntityType',
    description:
      'Filter by entity type (TASK, SPRINT, MILESTONE, PROJECT, CUSTOM)',
  })
  @ApiQuery({
    name: 'reminderAtFrom',
    required: false,
    type: String,
    description: 'Filter reminders scheduled from this date/time (ISO 8601)',
    example: '2026-01-01T09:00:00.000Z',
  })
  @ApiQuery({
    name: 'reminderAtTo',
    required: false,
    type: String,
    description: 'Filter reminders scheduled until this date/time (ISO 8601)',
    example: '2026-01-31T18:00:00.000Z',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reminders retrieved successfully',
    type: ReminderListDto,
  })
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async getReminders(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: ReminderQueryDto,
  ) {
    return this.remindersService.getReminders(req, projectId, query);
  }

  /**
   * Get a reminder by ID
   * GET /projects/:projectId/reminders/:reminderId
   */
  @Get(':reminderId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_READ])
  @SerializeOptions({ type: ReminderDetailDto })
  @ApiOperation({ summary: 'Get a reminder by ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: String,
  })
  @ApiParam({
    name: 'reminderId',
    description: 'Reminder ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reminder retrieved successfully',
    type: ReminderDetailDto,
  })
  @ApiResponse(ReminderNotFoundApiResponse)
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async getReminderById(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    return this.remindersService.getReminderById(req, projectId, reminderId);
  }

  /**
   * Update a reminder
   * PATCH /projects/:projectId/reminders/:reminderId
   */
  @Patch(':reminderId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_MANAGE])
  @SerializeOptions({ type: UpdatedReminderDto })
  @ApiOperation({ summary: 'Update a reminder' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: String,
  })
  @ApiParam({
    name: 'reminderId',
    description: 'Reminder ID',
    type: String,
  })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reminder updated successfully',
    type: UpdatedReminderDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(ReminderNotFoundApiResponse)
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async updateReminder(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
    @Body() updateReminderDto: UpdateReminderDto,
  ) {
    return this.remindersService.updateReminder(
      req,
      projectId,
      reminderId,
      updateReminderDto,
    );
  }

  /**
   * Delete a reminder
   * DELETE /projects/:projectId/reminders/:reminderId
   */
  @Delete(':reminderId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_MANAGE])
  @ApiOperation({ summary: 'Delete a reminder' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Project ID',
    type: String,
  })
  @ApiParam({
    name: 'reminderId',
    description: 'Reminder ID',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Reminder deleted successfully',
  })
  @ApiResponse(ReminderNotFoundApiResponse)
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async deleteReminder(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    return this.remindersService.deleteReminder(req, projectId, reminderId);
  }
}
