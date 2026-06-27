import {
  Controller,
  Get,
  Post,
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
  ApiHeader,
} from '@nestjs/swagger';
import { ReminderEntityType, ReminderStatus } from '@prisma/client';

import { RemindersService } from '../services/reminders.service';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { ReminderQueryDto } from '../dto/request/fetch/reminder-query.dto';
import { ReminderListDto } from '../dto/response/fetch/reminder-list.dto';
import { UpdatedReminderDto } from '../dto/response/update/updated-reminder.dto';

import { CustomRequest } from 'src/common/types/request.type';
import {
  InternalServerErrorApiResponse,
  ReminderNotFoundApiResponse,
  ReminderForbiddenApiResponse,
  ReminderAlreadyDismissedApiResponse,
} from '../swagger-documentation/error-response';

/**
 * User Reminders Controller
 * Handles personal reminder operations for the logged-in user
 * Routes: /reminders/me, /reminders/:reminderId/dismiss
 */
@ApiTags('User Reminders')
@ApiBearerAuth()
@Controller('reminders')
@UseInterceptors(ClassSerializerInterceptor)
export class UserRemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  /**
   * Get all reminders for the current user
   * GET /reminders/me
   *
   * Returns all reminders for the logged-in user across all projects
   * Supports the same filters as the project-scoped list route: status,
   * entity type, and reminder date range.
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.REMINDERS.REMINDER_READ])
  @SerializeOptions({ type: ReminderListDto })
  @ApiOperation({
    summary: 'Get all reminders for the current user',
    description:
      'Returns all reminders for the logged-in user across all projects. Supports the same filters as the project-scoped reminder list: status (including FAILED), entity type, and reminder date range.',
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
    description: 'User reminders retrieved successfully',
    type: ReminderListDto,
  })
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async getMyReminders(
    @Request() req: CustomRequest,
    @Query() query: ReminderQueryDto,
  ) {
    return this.remindersService.getMyReminders(req, query);
  }

  /**
   * Dismiss a reminder
   * POST /reminders/:reminderId/dismiss
   *
   * Marks a reminder as DISMISSED
   * User can only dismiss their own reminders
   */
  @Post(':reminderId/dismiss')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.REMINDERS.REMINDER_MANAGE,
    PERMISSIONS.REMINDERS.REMINDER_DISMISS_OWN,
  ])
  @SerializeOptions({ type: UpdatedReminderDto })
  @ApiOperation({
    summary: 'Dismiss a reminder',
    description:
      'Marks a reminder as dismissed. User can only dismiss their own reminders.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token of the authenticated user',
    required: true,
    example: 'Bearer token',
  })
  @ApiParam({
    name: 'reminderId',
    description: 'Reminder ID to dismiss',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reminder dismissed successfully',
    type: UpdatedReminderDto,
  })
  @ApiResponse(ReminderAlreadyDismissedApiResponse)
  @ApiResponse(ReminderNotFoundApiResponse)
  @ApiResponse(ReminderForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  async dismissReminder(
    @Request() req: CustomRequest,
    @Param('reminderId', ParseUUIDPipe) reminderId: string,
  ) {
    return this.remindersService.dismissReminder(req, reminderId);
  }
}
