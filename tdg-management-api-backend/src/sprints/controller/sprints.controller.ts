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
import { SprintsService } from '../services/sprints.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { AgileOnlyGuard } from 'src/auths/guards/agile-only.guard';
import { AgileProject } from 'src/auths/decorators/agile-project.decorator';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';
import { TransformLanguagePipe } from 'src/common/pipes/transform-language.pipe';
import { Language } from '@prisma/client';

import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadStorage } from 'src/common/upload/upload.storage';
import { CreateSprintDto } from '../dto/request/post/create-sprint.dto';
import { UpdateSprintDto } from '../dto/request/update/update-sprint.dto';
import { SprintQueryDto } from '../dto/request/fetch/sprint-query.dto';
import { SprintSortBy } from '../types/request.type';
import { CreatedSprintDto } from '../dto/response/post/created-sprint.dto';
import { UpdatedSprintDto } from '../dto/response/update/updated-sprint.dto';
import { SprintDto, SprintListDto } from '../dto/response/fetch/sprint.dto';
import { SprintBurndownDto } from '../dto/response/fetch/sprint-burndown.dto';
import { VelocityResponseDto } from '../dto/response/fetch/velocity-response.dto';

import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  ForbiddenApiResponse,
  SprintNotFoundApiResponse,
  SprintAlreadyExistsApiResponse,
  SprintInvalidDateRangeApiResponse,
  SprintHasActiveTasksApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('Sprints')
@ApiBearerAuth()
@Controller()
export class SprintsController {
  constructor(private readonly sprintsService: SprintsService) {}

  @Post('projects/:projectId/sprints')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_MANAGE])
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.SprintAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: CreatedSprintDto })
  @ApiOperation({ summary: 'Create a new sprint' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateSprintDto })
  @ApiResponse({
    status: 201,
    description: 'Sprint created successfully',
    type: CreatedSprintDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(SprintAlreadyExistsApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(SprintInvalidDateRangeApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createSprint(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() createSprintDto: CreateSprintDto,
  ) {
    return this.sprintsService.createSprintForProject(
      req,
      projectId,
      attachments,
      createSprintDto,
    );
  }

  @Get('projects/:projectId/sprints')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_READ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: SprintListDto })
  @ApiOperation({ summary: 'List all sprints for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by sprint status',
    enum: ['Pending', 'Running', 'Stopped', 'Completed'],
    example: 'Pending',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by sprint name (partial match)',
    example: 'Sprint',
  })
  @ApiQuery({
    name: 'startDateFrom',
    required: false,
    description: 'Filter by sprint start date from (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'startDateTo',
    required: false,
    description: 'Filter by sprint start date to (ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'endDateFrom',
    required: false,
    description: 'Filter by sprint end date from (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'endDateTo',
    required: false,
    description: 'Filter by sprint end date to (ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'estimatedStartDateFrom',
    required: false,
    description: 'Filter by estimated start date from (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'estimatedStartDateTo',
    required: false,
    description: 'Filter by estimated start date to (ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'estimatedEndDateFrom',
    required: false,
    description: 'Filter by estimated end date from (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'estimatedEndDateTo',
    required: false,
    description: 'Filter by estimated end date to (ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'createdAtFrom',
    required: false,
    description: 'Filter by createdAt from (ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'createdAtTo',
    required: false,
    description: 'Filter by createdAt to (ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by one or multiple fields (comma-separated values).',
    enum: SprintSortBy,
    example: 'createdAtDesc,startDateAsc',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language (ar, fr, en)',
    enum: ['ar', 'fr', 'en'],
    example: 'en',
  })
  @ApiQuery({ name: 'page', required: false, example: '1' })
  @ApiQuery({ name: 'limit', required: false, example: '10' })
  @ApiResponse({
    status: 200,
    description: 'Sprints retrieved successfully',
    type: SprintListDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  listSprints(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: SprintQueryDto,
    @Query('language', new TransformLanguagePipe()) language?: Language,
  ) {
    return this.sprintsService.listSprints(req, projectId, query, language);
  }

  @Get('sprints/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('id')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_READ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: SprintDto })
  @ApiOperation({ summary: 'Get sprint by ID with full details' })
  @ApiParam({ name: 'id', description: 'Sprint UUID' })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter content language (ar, fr, en)',
    enum: ['ar', 'fr', 'en'],
    example: 'en',
  })
  @ApiResponse({
    status: 200,
    description: 'Sprint retrieved successfully',
    type: SprintDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getSprintById(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('language', new TransformLanguagePipe()) language?: Language,
  ) {
    return this.sprintsService.getSprintById(req, id, language);
  }

  @Patch('projects/sprints/:id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('id')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_MANAGE])
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'attachments', maxCount: 50 }],
      UploadStorage.SprintAttachments(),
    ),
    ClassSerializerInterceptor,
  )
  @SerializeOptions({ type: UpdatedSprintDto })
  @ApiOperation({ summary: 'Update a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint UUID' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateSprintDto })
  @ApiResponse({
    status: 200,
    description: 'Sprint updated successfully',
    type: UpdatedSprintDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(SprintAlreadyExistsApiResponse)
  @ApiResponse(SprintNotFoundApiResponse)
  @ApiResponse(SprintInvalidDateRangeApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateSprint(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFiles() attachments: { attachments?: Express.Multer.File[] },
    @Body() updateSprintDto: UpdateSprintDto,
  ) {
    return this.sprintsService.updateSprint(
      req,
      id,
      attachments,
      updateSprintDto,
    );
  }

  @Delete('projects/sprints/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('id')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_MANAGE])
  @ApiOperation({ summary: 'Delete a sprint' })
  @ApiParam({ name: 'id', description: 'Sprint UUID' })
  @ApiResponse({
    status: 204,
    description: 'Sprint deleted successfully',
  })
  @ApiResponse(SprintNotFoundApiResponse)
  @ApiResponse(SprintHasActiveTasksApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteSprint(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.sprintsService.deleteSprint(req, id);
  }

  @Get('sprints/:sprintId/burndown')
  @ApiOperation({
    summary: 'Get sprint burndown chart data',
    description:
      'Retrieves burndown chart data for a specific sprint including story points progression',
  })
  @ApiParam({
    name: 'sprintId',
    description: 'UUID of the sprint',
    type: String,
  })
  @ApiQuery({
    name: 'language',
    description: 'Language for sprint content (ar, fr, en). Default is en.',
    required: false,
    enum: ['ar', 'fr', 'en'],
    example: 'en',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sprint burndown chart data retrieved successfully',
    type: SprintBurndownDto,
  })
  @ApiResponse(SprintNotFoundApiResponse)
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('sprintId')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_READ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: SprintBurndownDto })
  async getSprintBurndown(
    @Request() req: CustomRequest,
    @Param('sprintId', ParseUUIDPipe) sprintId: string,
    @Query('language', TransformLanguagePipe) language?: Language,
  ) {
    return await this.sprintsService.getSprintBurndown(req, sprintId, language);
  }

  @Get('projects/:projectId/velocity')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get sprint velocity data',
    description:
      'Returns completed story points per sprint and average velocity across completed sprints',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Velocity data retrieved successfully',
    type: VelocityResponseDto,
  })
  @ApiResponse(ForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  @UseGuards(HasPermissionGuard, AgileOnlyGuard)
  @AgileProject('projectId')
  @Permissions([PERMISSIONS.SPRINTS.SPRINT_READ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: VelocityResponseDto })
  async getVelocity(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return await this.sprintsService.getVelocity(req, projectId);
  }
}
