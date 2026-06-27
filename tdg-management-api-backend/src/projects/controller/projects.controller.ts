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
import { ProjectsService } from '../services/projects.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiExtraModels,
  ApiBearerAuth,
  ApiBody,
  ApiQuery,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { HasPermissionGuard } from 'src/auths/guards/has-permission.guard';
import { IsAuthenticatedGuard } from 'src/auths/guards/is-authenticated.guard';
import { Permissions } from 'src/auths/decorators/permissions.decorator';
import { PERMISSIONS } from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';
import { TransformLanguagePipe } from 'src/common/pipes/transform-language.pipe';
import { Language } from '@prisma/client';

import { CreateProjectDto } from '../dto/request/post/create-project.dto';
import { UpdateProjectDto } from '../dto/request/update/update-project.dto';
import { UpdateProjectMemberDto } from '../dto/request/update/update-project-member.dto';
import { UpdateKanbanSettingsDto } from '../dto/request/update/update-kanban-settings.dto';
import { ProjectQueryDto } from '../dto/request/fetch/project-query.dto';
import { CreateInvitationDto } from '../dto/request/post/create-invitation.dto';
import { AcceptInvitationDto } from '../dto/request/post/accept-invitation.dto';
import { CreatedProjectDto } from '../dto/response/post/created-project.dto';
import { CreatedProjectMemberDto } from '../dto/response/post/created-project-member.dto';
import { UpdatedProjectMemberDto } from '../dto/response/update/updated-project-member.dto';

import { CreatedInvitationDto } from '../dto/response/post/created-invitation.dto';
import { UpdatedProjectDto } from '../dto/response/update/updated-project.dto';
import { ProjectDto } from '../dto/response/fetch/project.dto';
import { ProjectListDto } from '../dto/response/fetch/project-list.dto';
import { ProjectKanbanSettingsDto } from '../dto/response/fetch/project-kanban-settings.dto';
import { ProjectCapacityDto } from '../dto/response/fetch/project-capacity.dto';

import {
  ProjectAlreadyExistsApiResponse,
  ProjectCannotChangeBusinessUnitApiResponse,
  ProjectNotFoundApiResponse,
  ProjectForbiddenApiResponse,
  ProjectInvalidDataApiResponse,
} from '../swagger-documentation/error-response';
import { AddMemberDto } from '../dto/request/post/add-member.dto';

@ApiTags('Projects')
@ApiBearerAuth()
@ApiExtraModels(CreatedProjectMemberDto, CreatedInvitationDto)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_CREATE])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedProjectDto })
  @ApiOperation({ summary: 'Create a new project' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully',
    type: CreatedProjectDto,
  })
  @ApiResponse(ProjectInvalidDataApiResponse)
  @ApiResponse(ProjectAlreadyExistsApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  createProject(@Request() req: CustomRequest, @Body() data: CreateProjectDto) {
    return this.projectsService.createProject(req, data);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.PROJECTS.PROJECT_READ_MANY,
    PERMISSIONS.PROJECTS.PROJECT_READ_SUMMARY,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectListDto })
  @ApiOperation({ summary: 'List all projects with filtering and sorting' })
  @ApiQuery({
    name: 'businessUnit',
    required: false,
    description: 'Filter by business unit (TawerDev or TawerCreative)',
    enum: ['TawerDev', 'TawerCreative'],
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by project name (partial match)',
    example: 'Project',
  })
  @ApiQuery({
    name: 'estimatedStartDateFrom',
    required: false,
    description: 'Filter by estimated start date (from, ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'estimatedEndDateTo',
    required: false,
    description: 'Filter by estimated end date (to, ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'createdAtFrom',
    required: false,
    description: 'Filter by created date (from, ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'createdAtTo',
    required: false,
    description: 'Filter by created date (to, ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'startDateFrom',
    required: false,
    description: 'Filter by start date (from, ISO string)',
    example: '2025-01-01T00:00:00Z',
  })
  @ApiQuery({
    name: 'startDateTo',
    required: false,
    description: 'Filter by start date (to, ISO string)',
    example: '2025-12-31T23:59:59Z',
  })
  @ApiQuery({
    name: 'own',
    required: false,
    description:
      'If true, returns only projects where the authenticated user is a member.',
    example: 'true',
  })
  @ApiQuery({
    name: 'memberName',
    required: false,
    description:
      'Filter by project member name (partial match). Effective for executives only.',
    example: 'Ahmed',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
    enum: ['Pending', 'Running', 'Stopped', 'Completed'],
  })
  @ApiQuery({
    name: 'paid',
    required: false,
    description: 'Filter by paid status',
    example: 'false',
  })
  @ApiQuery({
    name: 'language',
    required: false,
    description: 'Filter by language (ar, fr, en)',
    enum: ['ar', 'fr', 'en'],
    example: 'en',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort results',
    example: 'createdAtDesc',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: '1',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: '10',
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully',
    type: ProjectListDto,
  })
  listProjects(
    @Request() req: CustomRequest,
    @Query() query: ProjectQueryDto,
    @Query('language', new TransformLanguagePipe()) language?: Language,
  ) {
    return this.projectsService.listProjects(req, query, language);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.PROJECTS.PROJECT_READ_BY_ID,
    PERMISSIONS.PROJECTS.PROJECT_READ_DETAILS,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectDto })
  @ApiOperation({ summary: 'Get project by ID' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully',
    type: ProjectDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  getProjectById(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.getProjectById(req, id);
  }

  @Get(':id/capacity')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([
    PERMISSIONS.PROJECTS.PROJECT_READ_BY_ID,
    PERMISSIONS.PROJECTS.PROJECT_READ_DETAILS,
  ])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectCapacityDto })
  @ApiOperation({ summary: 'Get project capacity overview' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Project capacity retrieved successfully',
    type: ProjectCapacityDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  getProjectCapacity(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.getProjectCapacity(req, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_UPDATE])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedProjectDto })
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully',
    type: UpdatedProjectDto,
  })
  @ApiResponse(ProjectInvalidDataApiResponse)
  @ApiResponse(ProjectCannotChangeBusinessUnitApiResponse)
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  updateProject(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(req, id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_DELETE])
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 204,
    description: 'Project deleted successfully',
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  deleteProject(
    @Request() req: CustomRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.projectsService.deleteProject(req, id);
  }

  @Post(':projectId/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a project',
    description: 'Archives a project so it is hidden from active project lists',
  })
  @ApiParam({
    name: 'projectId',
    description: 'UUID of the project to archive',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project archived successfully',
    type: ProjectDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_UPDATE])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectDto })
  async archiveProject(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return await this.projectsService.archiveProject(projectId, req);
  }

  @Post(':projectId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore an archived project',
    description: 'Restores an archived project back to active status',
  })
  @ApiParam({
    name: 'projectId',
    description: 'UUID of the project to restore',
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Project restored successfully',
    type: ProjectDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_UPDATE])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectDto })
  async restoreProject(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return await this.projectsService.restoreProject(projectId, req);
  }

  @Post(':projectId/members')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_ADD_MEMBER])
  @ApiOperation({ summary: 'Add a member or invite someone to a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: AddMemberDto })
  @ApiResponse({
    status: 201,
    description: 'Member added successfully or invitation sent',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreatedProjectMemberDto) },
        { $ref: getSchemaPath(CreatedInvitationDto) },
      ],
    },
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  addMember(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() data: AddMemberDto,
  ) {
    return this.projectsService.addMemberSmart({
      req,
      projectId,
      userId: data.userId,
      email: data.email,
      isManager: data.isManager,
      expiresInDays: data.expiresInDays,
    });
  }

  @Patch(':projectId/members/:memberId')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_UPDATE_MEMBER])
  @ApiOperation({ summary: 'Update a project member role' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174111',
  })
  @ApiBody({ type: UpdateProjectMemberDto })
  @ApiResponse({
    status: 200,
    description: 'Member updated successfully',
    type: UpdatedProjectMemberDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: UpdatedProjectMemberDto })
  updateMember(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() data: UpdateProjectMemberDto,
  ) {
    return this.projectsService.updateMember({
      req,
      projectId,
      memberId,
      isManager: data.isManager,
    });
  }

  @Delete(':projectId/members/:memberId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_REMOVE_MEMBER])
  @ApiOperation({ summary: 'Remove a member from a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'memberId',
    description: 'Member UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174111',
  })
  @ApiResponse({
    status: 204,
    description: 'Member removed successfully',
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  removeMember(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.projectsService.removeMember({ req, projectId, memberId });
  }

  @Post(':projectId/invitations')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_ADD_MEMBER])
  @ApiOperation({ summary: 'Create invitation to join a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitation created successfully',
    type: CreatedInvitationDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedInvitationDto })
  createInvitation(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() data: CreateInvitationDto,
  ) {
    return this.projectsService.createInvitation({ req, projectId, dto: data });
  }

  @Delete(':projectId/invitations/:invitationId')
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_REMOVE_MEMBER])
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete (revoke) an invitation' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'Invitation UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174222',
  })
  @ApiResponse({
    status: 204,
    description: 'Invitation deleted successfully',
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  deleteInvitation(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ) {
    return this.projectsService.deleteInvitation({
      req,
      projectId,
      invitationId,
    });
  }

  @Post(':projectId/invitations/:invitationId/resend')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_ADD_MEMBER])
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Resend an invitation' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiParam({
    name: 'invitationId',
    description: 'Invitation UUID',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174222',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invitation resent successfully',
    type: CreatedInvitationDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedInvitationDto })
  resendInvitation(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('invitationId', ParseUUIDPipe) invitationId: string,
  ) {
    return this.projectsService.resendInvitation({
      req,
      projectId,
      invitationId,
    });
  }

  @Post('invitations/accept')
  @UseGuards(IsAuthenticatedGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Accept an invitation and join a project' })
  @ApiBody({ type: AcceptInvitationDto })
  @ApiResponse({
    status: 201,
    description: 'Invitation accepted successfully',
    type: CreatedProjectMemberDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: CreatedProjectMemberDto })
  acceptInvitation(
    @Request() req: CustomRequest,
    @Body() data: AcceptInvitationDto,
  ) {
    return this.projectsService.acceptInvitation({
      req,
      dto: data,
    });
  }

  // ─── Kanban Settings (WIP Limits) ───────────────────────────────────────────

  @Get(':projectId/kanban/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_READ_BY_ID])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectKanbanSettingsDto })
  @ApiOperation({ summary: 'Get WIP limits (kanban settings) for a project' })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiResponse({
    status: 200,
    description: 'Kanban settings retrieved successfully',
    type: ProjectKanbanSettingsDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  getKanbanSettings(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
  ) {
    return this.projectsService.getKanbanSettings(req, projectId);
  }

  @Patch(':projectId/kanban/settings')
  @HttpCode(HttpStatus.OK)
  @UseGuards(HasPermissionGuard)
  @Permissions([PERMISSIONS.PROJECTS.PROJECT_UPDATE])
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({ type: ProjectKanbanSettingsDto })
  @ApiOperation({
    summary: 'Update WIP limits (kanban settings) for a project',
  })
  @ApiParam({ name: 'projectId', description: 'Project UUID' })
  @ApiBody({ type: UpdateKanbanSettingsDto })
  @ApiResponse({
    status: 200,
    description: 'Kanban settings updated successfully',
    type: ProjectKanbanSettingsDto,
  })
  @ApiResponse(ProjectNotFoundApiResponse)
  @ApiResponse(ProjectForbiddenApiResponse)
  @ApiResponse(ProjectInvalidDataApiResponse)
  updateKanbanSettings(
    @Request() req: CustomRequest,
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Body() dto: UpdateKanbanSettingsDto,
  ) {
    return this.projectsService.updateKanbanSettings(
      req,
      projectId,
      dto.settings ?? null,
    );
  }
}
