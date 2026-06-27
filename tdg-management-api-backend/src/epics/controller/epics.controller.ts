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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { AgileOnlyGuard } from 'src/auths/guards/agile-only.guard';
import { AgileProject } from 'src/auths/decorators/agile-project.decorator';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { EpicsService } from '../services/epics.service';
import { CreateEpicDto } from '../dto/request/post/create-epic.dto';
import { UpdateEpicDto } from '../dto/request/update/update-epic.dto';
import { EpicQueryDto } from '../dto/request/fetch/epic-query.dto';
import { CreatedEpicDto } from '../dto/response/post/created-epic.dto';
import { UpdatedEpicDto } from '../dto/response/update/updated-epic.dto';
import { EpicListDto, EpicSummaryDto } from '../dto/response/fetch/epic.dto';
import { EpicSortBy } from '../types/request.type';

import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  EpicNotFoundApiResponse,
  EpicAlreadyExistsApiResponse,
  EpicForbiddenApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('Epics')
@ApiBearerAuth()
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class EpicsController {
  constructor(private readonly epicsService: EpicsService) {}

  @Post('projects/:projectId/epics')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.EPICS.EPIC_MANAGE])
  @SerializeOptions({ type: CreatedEpicDto })
  @ApiOperation({ summary: 'Create a new epic' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: CreateEpicDto })
  @ApiResponse({
    status: 201,
    description: 'Epic created successfully',
    type: CreatedEpicDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(EpicForbiddenApiResponse)
  @ApiResponse(EpicAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createEpic(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createEpicDto: CreateEpicDto,
  ) {
    return this.epicsService.createEpic(req, projectId, createEpicDto);
  }

  @Get('projects/:projectId/epics')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.EPICS.EPIC_READ])
  @SerializeOptions({ type: EpicListDto })
  @ApiOperation({ summary: 'List all epics for a project' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'startDateFrom',
    required: false,
    description: 'Filter by epic start date from (ISO string)',
    example: '2026-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'startDateTo',
    required: false,
    description: 'Filter by epic start date to (ISO string)',
    example: '2026-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'endDateFrom',
    required: false,
    description: 'Filter by epic end date from (ISO string)',
    example: '2026-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDateTo',
    required: false,
    description: 'Filter by epic end date to (ISO string)',
    example: '2026-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort results',
    enum: EpicSortBy,
    example: 'createdAtDesc',
  })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiResponse({
    status: 200,
    description: 'Epics retrieved successfully',
    type: EpicListDto,
  })
  @ApiResponse(EpicForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getEpics(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: EpicQueryDto,
  ) {
    return this.epicsService.getEpics(req, projectId, query);
  }

  @Get('projects/:projectId/epics/:epicId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.EPICS.EPIC_READ])
  @SerializeOptions({ type: EpicSummaryDto })
  @ApiOperation({ summary: 'Get an epic by ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'epicId', description: 'Epic UUID' })
  @ApiResponse({
    status: 200,
    description: 'Epic retrieved successfully',
    type: EpicSummaryDto,
  })
  @ApiResponse(EpicForbiddenApiResponse)
  @ApiResponse(EpicNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getEpicById(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('epicId', ParseUUIDPipe) epicId: string,
  ) {
    return this.epicsService.getEpicById(req, projectId, epicId);
  }

  @Patch('projects/:projectId/epics/:epicId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.EPICS.EPIC_MANAGE])
  @SerializeOptions({ type: UpdatedEpicDto })
  @ApiOperation({ summary: 'Update an epic' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'epicId', description: 'Epic UUID' })
  @ApiBody({ type: UpdateEpicDto })
  @ApiResponse({
    status: 200,
    description: 'Epic updated successfully',
    type: UpdatedEpicDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(EpicForbiddenApiResponse)
  @ApiResponse(EpicNotFoundApiResponse)
  @ApiResponse(EpicAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateEpic(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('epicId', ParseUUIDPipe) epicId: string,
    @Body() updateEpicDto: UpdateEpicDto,
  ) {
    return this.epicsService.updateEpic(req, projectId, epicId, updateEpicDto);
  }

  @Delete('projects/:projectId/epics/:epicId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.EPICS.EPIC_MANAGE])
  @ApiOperation({ summary: 'Delete an epic' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'epicId', description: 'Epic UUID' })
  @ApiResponse({
    status: 204,
    description: 'Epic deleted successfully',
  })
  @ApiResponse(EpicForbiddenApiResponse)
  @ApiResponse(EpicNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteEpic(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('epicId', ParseUUIDPipe) epicId: string,
  ) {
    return this.epicsService.deleteEpic(req, projectId, epicId);
  }
}
