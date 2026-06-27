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
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

import { MilestonesService } from '../services/milestones.service';
import { CreateMilestoneDto } from '../dto/request/post/create-milestone.dto';
import { UpdateMilestoneDto } from '../dto/request/update/update-milestone.dto';
import { MilestoneQueryDto } from '../dto/request/fetch/milestone-query.dto';
import { CreatedMilestoneDto } from '../dto/response/post/created-milestone.dto';
import { UpdatedMilestoneDto } from '../dto/response/update/updated-milestone.dto';
import {
  MilestoneListDto,
  MilestoneSummaryDto,
  GanttChartDto,
} from '../dto/response/fetch/milestone.dto';

import {
  InternalServerErrorApiResponse,
  InvalidDataApiResponse,
  MilestoneNotFoundApiResponse,
  MilestoneAlreadyExistsApiResponse,
  MilestoneForbiddenApiResponse,
} from '../swagger-documentation/error-response';

@ApiTags('Milestones')
@ApiBearerAuth()
@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  /**
   * 1. Create Milestone
   * POST /projects/:projectId/milestones
   */
  @Post('projects/:projectId/milestones')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_MANAGE])
  @SerializeOptions({ type: CreatedMilestoneDto })
  @ApiOperation({ summary: 'Create a new milestone' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: CreateMilestoneDto })
  @ApiResponse({
    status: 201,
    description: 'Milestone created successfully',
    type: CreatedMilestoneDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(MilestoneAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  createMilestone(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() createMilestoneDto: CreateMilestoneDto,
  ) {
    return this.milestonesService.createMilestone(
      req,
      projectId,
      createMilestoneDto,
    );
  }

  /**
   * 2. List Milestones
   * GET /projects/:projectId/milestones
   */
  @Get('projects/:projectId/milestones')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_READ])
  @SerializeOptions({ type: MilestoneListDto })
  @ApiOperation({ summary: 'List all milestones for a project' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiQuery({ type: MilestoneQueryDto })
  @ApiResponse({
    status: 200,
    description: 'Milestones retrieved successfully',
    type: MilestoneListDto,
  })
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getMilestones(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query: MilestoneQueryDto,
  ) {
    return this.milestonesService.getMilestones(req, projectId, query);
  }

  /**
   * 3. Get Milestone by ID
   * GET /projects/:projectId/milestones/:milestoneId
   */
  @Get('projects/:projectId/milestones/:milestoneId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_READ])
  @SerializeOptions({ type: MilestoneSummaryDto })
  @ApiOperation({ summary: 'Get a milestone by ID' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone UUID' })
  @ApiResponse({
    status: 200,
    description: 'Milestone retrieved successfully',
    type: MilestoneSummaryDto,
  })
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(MilestoneNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getMilestoneById(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.milestonesService.getMilestoneById(req, projectId, milestoneId);
  }

  /**
   * 4. Update Milestone
   * PATCH /projects/:projectId/milestones/:milestoneId
   */
  @Patch('projects/:projectId/milestones/:milestoneId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_MANAGE])
  @SerializeOptions({ type: UpdatedMilestoneDto })
  @ApiOperation({ summary: 'Update a milestone' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone UUID' })
  @ApiBody({ type: UpdateMilestoneDto })
  @ApiResponse({
    status: 200,
    description: 'Milestone updated successfully',
    type: UpdatedMilestoneDto,
  })
  @ApiResponse(InvalidDataApiResponse)
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(MilestoneNotFoundApiResponse)
  @ApiResponse(MilestoneAlreadyExistsApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  updateMilestone(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
    @Body() updateMilestoneDto: UpdateMilestoneDto,
  ) {
    return this.milestonesService.updateMilestone(
      req,
      projectId,
      milestoneId,
      updateMilestoneDto,
    );
  }

  /**
   * 5. Delete Milestone
   * DELETE /projects/:projectId/milestones/:milestoneId
   */
  @Delete('projects/:projectId/milestones/:milestoneId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_MANAGE])
  @ApiOperation({ summary: 'Delete a milestone' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone UUID' })
  @ApiResponse({
    status: 204,
    description: 'Milestone deleted successfully',
  })
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(MilestoneNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  deleteMilestone(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.milestonesService.deleteMilestone(req, projectId, milestoneId);
  }

  /**
   * 6. Complete Milestone
   * PATCH /projects/:projectId/milestones/:milestoneId/complete
   */
  @Patch('projects/:projectId/milestones/:milestoneId/complete')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_MANAGE])
  @SerializeOptions({ type: UpdatedMilestoneDto })
  @ApiOperation({ summary: 'Mark a milestone as complete' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiParam({ name: 'milestoneId', description: 'Milestone UUID' })
  @ApiResponse({
    status: 200,
    description: 'Milestone marked as complete',
    type: UpdatedMilestoneDto,
  })
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(MilestoneNotFoundApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  completeMilestone(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('milestoneId', ParseUUIDPipe) milestoneId: string,
  ) {
    return this.milestonesService.completeMilestone(
      req,
      projectId,
      milestoneId,
    );
  }

  /**
   * 7. Get Gantt Chart
   * GET /projects/:projectId/gantt
   */
  @Get('projects/:projectId/gantt')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.MILESTONES.MILESTONE_READ])
  @ApiOperation({ summary: 'Get Gantt chart data for a project' })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Gantt chart data retrieved successfully',
    type: GanttChartDto,
  })
  @ApiResponse(MilestoneForbiddenApiResponse)
  @ApiResponse(InternalServerErrorApiResponse)
  getGantt(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.milestonesService.getGantt(req, projectId);
  }
}
