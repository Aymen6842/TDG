import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  SerializeOptions,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateWorkDayDto } from '../dto/request/post/create-work-day.dto';
import { CreatedWorkDayDto } from '../dto/response/post/created-work-day.dto';
import {
  InternalServerErrorApiResponse,
  SessionIsAlreadyOpenApiResponse,
  WorkDayNotFoundApiResponse,
  WorkSessionNotFoundApiResponse,
} from '../swagger-documentation/error-response';
import { CustomRequest } from 'src/common/types/request.type';
import { WorkDaysService } from '../services/work-days.service';

import { FilterWrokDaysParametersDto } from '../dto/request/fetch/filter-work-days-parameters.dto';
import { PaginateWorkDaysForUserDto } from '../dto/response/fetch/paginate-work-days-for-user.dto';
import { UpdatedWorkDayByManagerDto } from '../dto/response/update/updated-work-day-by-manager.dto';
import { UpdateWorkDayByManagerDto } from '../dto/request/update/update-work-day-by-manager.dto';
import { UpdateWorkDayByWorkerDto } from '../dto/request/update/update-work-day-by-worker.dto';
import { UpdatedWorkDayByWorkerDto } from '../dto/response/update/updated-work-day-by-worker.dto';
import { PaginateWorkDaysForManagerDto } from '../dto/response/fetch/paginate-work-days-for-manager.dto';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { FilterWorkDaysStatisticsParametersDto } from '../dto/request/fetch/filter-work-days-statistics-parameters.dto';
import { WorkDaysStatisticsDetailsForManagerDto } from '../dto/response/fetch/work-days-statistics-details-for-manager.dto';
import { WorkDaysStatisticsOverviewForManagerDto } from '../dto/response/fetch/work-days-statistics-overview-for-manager.dto';
import { WorkDaysStatisticsDetailsForUserDto } from '../dto/response/fetch/work-days-statistics-details-for-user.dto';
import { WorkDaysStatisticsOverviewForUserDto } from '../dto/response/fetch/work-days-statistics-overview-for-user.dto';
import { WorkDayForUserDto } from '../dto/response/fetch/work-day-for-user.dto';

@Controller('work-days')
export class WorkDaysController {
  constructor(private readonly workDaysService: WorkDaysService) {}

  @Post('sessions/start')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORK_SESSION_CREATE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Create or update work day' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: CreateWorkDayDto,
    description:
      'Contains the work day data to create or update a work session.',
  })
  @ApiCreatedResponse({
    description: 'Work day created or updated successfully',
    type: CreatedWorkDayDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @ApiResponse(SessionIsAlreadyOpenApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedWorkDayDto })
  createWorkSession(@Req() req: CustomRequest, @Body() data: CreateWorkDayDto) {
    return this.workDaysService.createWorkSession(req, data);
  }

  @Get('current')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_CURRENT_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Get current work day for user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'the current work day for user',
    type: WorkDayForUserDto,
  })
  @ApiResponse(WorkDayNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: WorkDayForUserDto })
  getCurrentWorkDayForUser(@Req() req: CustomRequest) {
    return this.workDaysService.getCurrentWorkDayForUser(req);
  }

  @Patch(':id/manager')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_UPDATE_BY_MANAGER])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'update work day by manager' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiBody({
    type: UpdateWorkDayByManagerDto,
    description: ' Contains the work day data to update a work day.',
  })
  @ApiOkResponse({
    description: 'Work day updated successfully by manager',
    type: UpdatedWorkDayByManagerDto,
  })
  @ApiResponse(WorkSessionNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedWorkDayByManagerDto })
  updateWorkDayByManager(
    @Req() req: CustomRequest,
    @Param('id') workDayId: string,
    @Body() data: UpdateWorkDayByManagerDto,
  ) {
    return this.workDaysService.updateWorkDayByManager(req, workDayId, data);
  }

  @Patch(':id/worker')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_UPDATE_BY_WORKER])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Close a work session' })
  @ApiBody({
    type: UpdateWorkDayByWorkerDto,
    description: ' Contains the work day data to update a work day.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiOkResponse({
    description: 'Work day updated successfully by woker',
    type: UpdatedWorkDayByWorkerDto,
  })
  @ApiResponse(WorkSessionNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedWorkDayByWorkerDto })
  updateWorkSessionByWorker(
    @Req() req: CustomRequest,
    @Param('id') workSessionId: string,
    @Body() data: UpdateWorkDayByWorkerDto,
  ) {
    return this.workDaysService.updateWorkSessionByWorker(
      req,
      workSessionId,
      data,
    );
  }

  @Patch('sessions/:id/close')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORK_SESSION_CLOSE])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'Close a work session' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiResponse(WorkSessionNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @ApiNoContentResponse({ description: 'Work session closed successfully' })
  closeWorkSession(@Req() req: CustomRequest, @Param('id') workDayId: string) {
    return this.workDaysService.closeWorkSession(req, workDayId);
  }

  @Get('manager')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'retrieve work days for manager' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'startTime',
    description: 'Filter work sessions by start time (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endTime',
    description: 'Filter work sessions by end time (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'performanceRating',
    description: 'Filter work sessions by performance rating',
    required: false,
    example: 4,
  })
  @ApiQuery({
    name: 'dailyMood',
    description: 'Filter work sessions by daily mood',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    description: 'the work days',
    type: PaginateWorkDaysForManagerDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateWorkDaysForManagerDto })
  filterWorkDaysForManager(
    @Req() req: CustomRequest,
    @Query() query: FilterWrokDaysParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysForManager(req, query);
  }

  @Get('statistics/overview/manager')
  @Permissions([
    PERMISSIONS.WORK_SESSIONS.WORKDAY_STATISTICS_OVERVIEW_READ_BY_MANAGER,
  ])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({
    summary: 'retrieve overview work day statistics for manager',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'usersIds',
    description: 'Filter work sessions by user IDs',
    required: false,
    example: 4,
  })
  @ApiQuery({
    name: 'teamIds',
    description: 'Filter work sessions by team IDs',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    description: 'the work days statistics overview',
    type: WorkDaysStatisticsOverviewForManagerDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: WorkDaysStatisticsOverviewForManagerDto })
  filterWorkDaysStatisticsOverviewBetweenDatesForManager(
    @Req() req: CustomRequest,
    @Query() query: FilterWorkDaysStatisticsParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysStatisticsOverviewBetweenDatesForManager(
      req,
      query,
    );
  }

  @Get('statistics/details/manager')
  @Permissions([
    PERMISSIONS.WORK_SESSIONS.WORKDAY_STATISTICS_DETAILS_READ_BY_MANAGER,
  ])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({
    summary: 'retrieve details work day statistics for manager',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'usersIds',
    description: 'Filter work sessions by user IDs',
    required: false,
    example: 4,
  })
  @ApiQuery({
    name: 'teamIds',
    description: 'Filter work sessions by team IDs',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    description: 'the work days statistics overview',
    type: WorkDaysStatisticsDetailsForManagerDto,
    isArray: true,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: WorkDaysStatisticsDetailsForManagerDto })
  filterWorkDaysStatisticsDetailsBetweenDatesForManager(
    @Req() req: CustomRequest,
    @Query() query: FilterWorkDaysStatisticsParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysStatisticsDetailsBetweenDatesForManager(
      req,
      query,
    );
  }

  @Get('statistics/overview')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_STATISTICS_OVERVIEW_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({
    summary: 'retrieve overview work day statistics for user',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiOkResponse({
    description: 'the work days statistics overview',
    type: WorkDaysStatisticsOverviewForUserDto,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: WorkDaysStatisticsOverviewForUserDto })
  filterWorkDaysStatisticsOverviewBetweenDatesForUser(
    @Req() req: CustomRequest,
    @Query() query: FilterWorkDaysStatisticsParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysStatisticsOverviewBetweenDatesForUser(
      req,
      query,
    );
  }

  @Get('statistics/details')
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_STATISTICS_DETAILS_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({
    summary: 'retrieve details work day statistics for user',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiOkResponse({
    description: 'the work days statistics overview',
    type: WorkDaysStatisticsDetailsForUserDto,
    isArray: true,
  })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: WorkDaysStatisticsDetailsForUserDto })
  filterWorkDaysStatisticsDetailsBetweenDatesForUser(
    @Req() req: CustomRequest,
    @Query() query: FilterWorkDaysStatisticsParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysStatisticsDetailsBetweenDatesForUser(
      req,
      query,
    );
  }

  @Get()
  @Permissions([PERMISSIONS.WORK_SESSIONS.WORKDAY_READ_OWN])
  @UseGuards(HasPermissionGuard)
  @ApiOperation({ summary: 'retrieve work days for user' })
  @ApiHeader({
    name: 'Authorization',
    description: 'the token',
    required: true,
    example: 'Bearer token',
  })
  @ApiQuery({
    name: 'page',
    description: 'The number of the page of the work sessions',
    required: false,
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    description: 'The number of the work sessions returned',
    required: false,
    example: '5',
  })
  @ApiQuery({
    name: 'startTime',
    description: 'Filter work sessions by start time (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'endTime',
    description: 'Filter work sessions by end time (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'from',
    description: 'Filter work sessions from this date (ISO 8601 format)',
    required: false,
    example: '2023-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    description: 'Filter work sessions to this date (ISO 8601 format)',
    required: false,
    example: '2023-01-31T23:59:59.000Z',
  })
  @ApiQuery({
    name: 'dailyMood',
    description: 'Filter work sessions by daily mood',
    required: false,
    example: 1,
  })
  @ApiOkResponse({
    description: 'the work sessions',
    type: PaginateWorkDaysForUserDto,
  })
  @ApiResponse(InternalServerErrorApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: PaginateWorkDaysForUserDto })
  filterWorkDaysForUser(
    @Req() req: CustomRequest,
    @Query() query: FilterWrokDaysParametersDto,
  ) {
    return this.workDaysService.filterWorkDaysForUser(req, query);
  }
}
