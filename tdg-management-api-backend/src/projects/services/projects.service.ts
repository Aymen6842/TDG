import { Injectable } from '@nestjs/common';
import {
  Prisma,
  Language,
  UserType,
  InvitationStatus,
  Project,
  BusinessUnit,
} from '@prisma/client';
import { randomUUID } from 'crypto';

import { CreateProjectRepository } from '../repositories/create-project.repository';
import {
  FetchProjectRepository,
  ProjectWithRelations,
} from '../repositories/fetch-project.repository';
import { UpdateProjectRepository } from '../repositories/update-project.repository';
import { DeleteProjectRepository } from '../repositories/delete-project.repository';
import { CreateInvitationRepository } from '../repositories/create-invitation.repository';
import { FetchInvitationRepository } from '../repositories/fetch-invitation.repository';
import { DeleteInvitationRepository } from '../repositories/delete-invitation.repository';

import { CreateProjectDto } from '../dto/request/post/create-project.dto';
import { UpdateProjectDto } from '../dto/request/update/update-project.dto';
import { ProjectQueryDto } from '../dto/request/fetch/project-query.dto';
import { CreateInvitationDto } from '../dto/request/post/create-invitation.dto';
import { AcceptInvitationDto } from '../dto/request/post/accept-invitation.dto';
import { CreatedInvitationDto } from '../dto/response/post/created-invitation.dto';
import { CreatedProjectMemberDto } from '../dto/response/post/created-project-member.dto';
import {
  ProjectCapacityDto,
  ProjectCapacityMemberDto,
} from '../dto/response/fetch/project-capacity.dto';

import { CustomRequest } from 'src/common/types/request.type';
import { ForbiddenCustomException } from 'src/common/exceptions/custom-exceptions/forbidden.exception';
import { BadRequestCustomException } from 'src/common/exceptions/custom-exceptions/bad-request.exception';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { ConflictCustomException } from 'src/common/exceptions/custom-exceptions/conflict.exception';
import { NotFoundCustomException } from 'src/common/exceptions/custom-exceptions/not-found.exception';
import { MailService } from 'src/common/mail/service/mail.service';
import { NotificationsService } from 'src/notifications/services/notifications.service';
import { CreateNotificationDto } from 'src/notifications/dto/request/post/create-notification.dto';
import { PaginationParametersInResponse } from '../types/response.type';

type ProjectListResponse = {
  data: ProjectWithRelations[];
  pagination: PaginationParametersInResponse;
};

type UpdateProjectResponse = ProjectWithRelations | Project;
type KanbanSettings = Record<string, number> | null;

@Injectable()
export class ProjectsService {
  constructor(
    private readonly createProjectRepository: CreateProjectRepository,
    private readonly fetchProjectRepository: FetchProjectRepository,
    private readonly updateProjectRepository: UpdateProjectRepository,
    private readonly deleteProjectRepository: DeleteProjectRepository,
    private readonly createInvitationRepository: CreateInvitationRepository,
    private readonly fetchInvitationRepository: FetchInvitationRepository,
    private readonly deleteInvitationRepository: DeleteInvitationRepository,
    private readonly mailService: MailService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createProject(
    req: CustomRequest,
    data: CreateProjectDto,
  ): Promise<ProjectWithRelations> {
    const user = req.user!;
    const userRoles = user.roles;

    if (!this.canCreateProject(userRoles)) {
      throw new ForbiddenCustomException(
        'Insufficient permissions to create projects',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    this.ensureProjectBusinessUnitAccess(userRoles, data.businessUnit);

    this.normalizeCreateProjectInput(data);

    this.applyDefaultManagerForCreateProject(data, user.id);

    this.validateCreateProjectMembers(data);

    data.createdById = user.id;

    if (data.contents && data.contents.length > 0) {
      data.contents = data.contents.map((content) => ({
        ...content,
        unaccentedName: this.toUnaccented(content.name),
      }));
    }

    try {
      return await this.createProjectRepository.createProject(data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Project with this name already exists',
            ErrorCode.PROJECT_ALREADY_EXISTS,
          );
        }
      }
      throw error;
    }
  }

  async listProjects(
    req: CustomRequest,
    query: ProjectQueryDto,
    language?: Language,
  ): Promise<ProjectListResponse> {
    const user = req.user!;
    const userRoles = user.roles;

    const isExecutive = this.isExecutive(userRoles);
    const ownOnly = query.own === true;
    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(userRoles);

    if (!isExecutive) {
      query.memberName = undefined;
      query.requestUserId = user.id;
    } else {
      query.requestUserId = ownOnly ? user.id : null;
      if (executiveBusinessUnit) {
        query.businessUnit = executiveBusinessUnit;
      }
    }

    const { page, limit } = this.retrievePaginationParameters(query);

    const total = await this.fetchProjectRepository.countProjects(
      query,
      language,
    );
    const skip = (page - 1) * limit;
    query.skip = skip;
    query.take = limit;

    const projects = await this.fetchProjectRepository.listProjects(
      query,
      language,
    );

    const pagination = this.setPaginationParametersInResponse(
      total,
      page,
      limit,
    );

    return {
      data: projects,
      pagination: pagination,
    };
  }

  async getProjectById(
    req: CustomRequest,
    projectId: string,
  ): Promise<ProjectWithRelations> {
    const user = req.user!;
    const userRoles = user.roles;

    const isExecutive = this.isExecutive(userRoles);

    const query = {
      projectId,
      userId: isExecutive ? null : user.id,
      businessUnit: this.getExecutiveBusinessUnitScope(userRoles),
    };

    try {
      return await this.fetchProjectRepository.getProjectByIdWithPermission(
        query,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenCustomException(
            'Project not found or access denied',
            ErrorCode.PROJECT_FORBIDDEN,
          );
        }
      }
      throw error;
    }
  }

  async updateProject(
    req: CustomRequest,
    projectId: string,
    data: UpdateProjectDto,
  ): Promise<UpdateProjectResponse> {
    const user = req.user!;
    const userRoles = user.roles;

    if (data.isArchived !== undefined) {
      if (data.isArchived === true) {
        return await this.archiveProject(projectId, req);
      }
      return await this.restoreProject(projectId, req);
    }

    if (data.businessUnit !== undefined)
      throw new BadRequestCustomException(
        'Business unit cannot be changed after creation',
        ErrorCode.PROJECT_CANNOT_CHANGE_BUSINESS_UNIT,
      );

    this.validateUpdateProjectMembers(data);

    if (data.kanbanSettings !== undefined) {
      await this.validateKanbanSettingsForProject(
        projectId,
        data.kanbanSettings,
      );
    }

    if (data.contents && data.contents.length > 0) {
      data.contents = data.contents.map((content) => ({
        ...content,
        unaccentedName: content.name ? this.toUnaccented(content.name) : '',
      }));
    }

    const query = {
      projectId,
      userId: this.getUpdatePermissionUserId(userRoles, user.id),
      businessUnit: this.getUpdatePermissionBusinessUnit(userRoles),
    };

    try {
      return await this.updateProjectRepository.updateProjectWithPermission({
        data: query,
        projectData: data,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenCustomException(
            'Project not found or access denied',
            ErrorCode.PROJECT_FORBIDDEN,
          );
        }
        if (error.code === 'P2002') {
          throw new ConflictCustomException(
            'Project with this name already exists',
            ErrorCode.PROJECT_ALREADY_EXISTS,
          );
        }
      }

      throw error;
    }
  }

  async deleteProject(req: CustomRequest, projectId: string): Promise<void> {
    const user = req.user!;
    const userRoles = user.roles;

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const query = {
      projectId,
      businessUnit: this.getDeletePermissionBusinessUnit(userRoles),
    };

    try {
      return await this.deleteProjectRepository.deleteProjectWithPermission({
        projectId: query.projectId,
        businessUnit: query.businessUnit,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenCustomException(
            'Project not found or access denied',
            ErrorCode.PROJECT_FORBIDDEN,
          );
        }
      }
      throw error;
    }
  }

  async addMemberSmart(query: {
    req: CustomRequest;
    projectId: string;
    userId?: string;
    email?: string;
    isManager: boolean;
    expiresInDays?: number;
  }) {
    const { req, projectId, userId, email, isManager, expiresInDays } = query;
    const user = req.user!;
    const callerRoles = user.roles;

    await this.ensureProjectExists({ projectId });

    const isExecutive = this.isExecutive(callerRoles);
    const isProjectManager = await this.checkIsProjectManager(
      user.id,
      projectId,
    );

    if (userId && email) {
      throw new BadRequestCustomException(
        'Cannot provide both userId and email. Use either one.',
        ErrorCode.INVALID_DATA,
      );
    }

    if (!userId && !email) {
      throw new BadRequestCustomException(
        'Either userId or email must be provided',
        ErrorCode.INVALID_DATA,
      );
    }

    if (userId) {
      if (!isExecutive) {
        throw new ForbiddenCustomException(
          'Only executives (CEO/CTO/CMO) can add direct members by userId',
          ErrorCode.PROJECT_FORBIDDEN,
        );
      }

      await this.verifyProjectAccess({
        userId: user.id,
        userRoles: callerRoles,
        projectId,
      });

      const existing = await this.fetchProjectRepository.findMember({
        projectId,
        userId,
      });

      if (existing) {
        throw new ConflictCustomException(
          'User is already a member of this project',
          ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS,
        );
      }

      return this.mapProjectMemberResponse(
        await this.createProjectRepository.addMember({
          projectId,
          userId,
          isManager,
        }),
      );
    }

    if (email) {
      const normalizedEmail = email.toLowerCase();

      if (!isExecutive && !isProjectManager) {
        throw new ForbiddenCustomException(
          'Only executives and project managers can invite people',
          ErrorCode.PROJECT_FORBIDDEN,
        );
      }

      await this.verifyProjectAccess({
        userId: user.id,
        userRoles: callerRoles,
        projectId,
      });

      const existingUser = await this.fetchProjectRepository.findUserByEmail({
        email: normalizedEmail,
      });

      if (existingUser && isExecutive) {
        const existing = await this.fetchProjectRepository.findMember({
          projectId,
          userId: existingUser.id,
        });
        if (existing) {
          throw new ConflictCustomException(
            'User is already a member of this project',
            ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS,
          );
        }

        return this.mapProjectMemberResponse(
          await this.createProjectRepository.addMember({
            projectId,
            userId: existingUser.id,
            isManager,
          }),
        );
      }

      await this.ensureInvitationEligibility({
        projectId,
        invitedEmail: normalizedEmail,
      });

      return await this.createAndNotifyInvitation({
        req,
        projectId,
        inviterId: user.id,
        inviterName: user.name,
        invitedEmail: normalizedEmail,
        isManager,
        expiresInDays,
        emailSubject: 'Invitation to join a project',
        notificationTitle: 'New Project Invitation',
        notificationBody: `You have been invited to join a project by ${user.name}. Click the link to accept.`,
      });
    }
  }

  async updateMember(query: {
    req: CustomRequest;
    projectId: string;
    memberId: string;
    isManager: boolean;
  }) {
    const { req, projectId, memberId, isManager } = query;
    const user = req.user!;

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const currentMember = await this.fetchProjectRepository.getMemberById({
      memberId,
    });
    if (!currentMember) {
      throw new NotFoundCustomException(
        'Member not found',
        ErrorCode.PROJECT_MEMBER_NOT_FOUND,
      );
    }

    if (currentMember.projectId !== projectId) {
      throw new NotFoundCustomException(
        'Member not found in this project',
        ErrorCode.PROJECT_MEMBER_NOT_FOUND,
      );
    }

    if (currentMember.isManager && !isManager) {
      const managerCount = await this.fetchProjectRepository.countManagers({
        projectId,
      });
      if (managerCount <= 1) {
        throw new BadRequestCustomException(
          'Cannot demote the last manager from the project',
          ErrorCode.PROJECT_LAST_MANAGER_CANNOT_BE_DEMOTED,
        );
      }
    }

    try {
      return await this.updateProjectRepository.updateMember({
        memberId,
        projectId,
        isManager,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Member not found',
            ErrorCode.PROJECT_MEMBER_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async removeMember(query: {
    req: CustomRequest;
    projectId: string;
    memberId: string;
  }) {
    const { req, projectId, memberId } = query;
    const user = req.user!;

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const memberToRemove = await this.fetchProjectRepository.getMemberById({
      memberId,
    });
    if (!memberToRemove) {
      throw new NotFoundCustomException(
        'Member not found',
        ErrorCode.PROJECT_MEMBER_NOT_FOUND,
      );
    }

    if (memberToRemove.projectId !== projectId) {
      throw new NotFoundCustomException(
        'Member not found in this project',
        ErrorCode.PROJECT_MEMBER_NOT_FOUND,
      );
    }

    if (memberToRemove.isManager) {
      const managerCount = await this.fetchProjectRepository.countManagers({
        projectId,
      });
      // Allow executives to remove the last manager, but not regular project managers
      const isExecutive = this.isExecutive(user.roles);
      if (managerCount <= 1 && !isExecutive) {
        throw new BadRequestCustomException(
          'Cannot remove the last manager from the project',
          ErrorCode.PROJECT_LAST_MANAGER_CANNOT_BE_REMOVED,
        );
      }
    }

    try {
      await this.deleteProjectRepository.removeMember({ memberId, projectId });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Member not found',
            ErrorCode.PROJECT_MEMBER_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async createInvitation(query: {
    req: CustomRequest;
    projectId: string;
    dto: CreateInvitationDto;
  }): Promise<CreatedInvitationDto> {
    const { req, projectId, dto } = query;
    const user = req.user!;
    const invitedEmail = dto.email.toLowerCase();

    await this.ensureProjectExists({
      projectId,
    });

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    await this.ensureInvitationEligibility({
      projectId,
      invitedEmail,
    });

    return await this.createAndNotifyInvitation({
      req,
      projectId,
      inviterId: user.id,
      inviterName: user.name,
      invitedEmail,
      isManager: dto.isManager ?? false,
      expiresInDays: dto.expiresInDays,
      emailSubject: 'Invitation to join a project',
      notificationTitle: 'New Project Invitation',
      notificationBody: `You have been invited to join a project by ${user.name}. Click the link to accept.`,
    });
  }

  async deleteInvitation(query: {
    req: CustomRequest;
    projectId: string;
    invitationId: string;
  }) {
    const { req, projectId, invitationId } = query;
    const user = req.user!;

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const invitation = await this.fetchInvitationRepository.getInvitationById({
      id: invitationId,
    });

    if (!invitation) {
      throw new NotFoundCustomException(
        'Invitation not found',
        ErrorCode.PROJECT_INVITATION_NOT_FOUND,
      );
    }

    if (invitation.projectId !== projectId) {
      throw new BadRequestCustomException(
        'Invitation does not belong to this project',
        ErrorCode.PROJECT_INVITATION_INVALID_TOKEN,
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestCustomException(
        'Only pending invitations can be cancelled',
        ErrorCode.PROJECT_INVITATION_INVALID_TOKEN,
      );
    }

    try {
      await this.deleteInvitationRepository.deleteInvitation({
        id: invitationId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundCustomException(
            'Invitation not found',
            ErrorCode.PROJECT_INVITATION_NOT_FOUND,
          );
        }
      }
      throw error;
    }
  }

  async resendInvitation(query: {
    req: CustomRequest;
    projectId: string;
    invitationId: string;
  }) {
    const { req, projectId, invitationId } = query;
    const user = req.user!;

    await this.verifyProjectManagerAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const invitation = await this.fetchInvitationRepository.getInvitationById({
      id: invitationId,
    });

    if (!invitation) {
      throw new NotFoundCustomException(
        'Invitation not found',
        ErrorCode.PROJECT_INVITATION_NOT_FOUND,
      );
    }

    if (invitation.projectId !== projectId) {
      throw new BadRequestCustomException(
        'Invitation does not belong to this project',
        ErrorCode.PROJECT_INVITATION_INVALID_TOKEN,
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestCustomException(
        'Only pending invitations can be resent',
        ErrorCode.PROJECT_INVITATION_INVALID_TOKEN,
      );
    }

    const invitationMeta = this.generateInvitationMetadata();

    const updatedInvitation =
      await this.fetchInvitationRepository.updateInvitation({
        id: invitationId,
        token: invitationMeta.token,
        expiresAt: invitationMeta.expiresAt,
      });

    // Fetch the complete user details including name
    const userDetails = await this.fetchProjectRepository.findUserById({
      userId: user.id,
    });

    const inviterName = userDetails?.name || 'TDG Team';

    // Fetch project title
    const projectWithContent =
      await this.fetchProjectRepository.getProjectByIdWithPermission({
        projectId: invitation.projectId,
        userId: null,
      });

    if (
      !projectWithContent ||
      !projectWithContent.contents ||
      !projectWithContent.contents.length
    ) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    const projectTitle = projectWithContent.contents[0].name;

    await this.sendInvitationCommunication({
      req,
      invitedEmail: invitation.email,
      inviterName: inviterName,
      projectTitle,
      token: invitationMeta.token,
      expiresInDays: invitationMeta.expiresInDays,
      emailSubject: 'Invitation to join a project (Resent)',
      notificationTitle: 'Project Invitation Resent',
      notificationBody: `You have been invited to join a project by ${inviterName}. Click the link to accept.`,
    });

    return this.mapInvitationResponse(updatedInvitation);
  }

  async acceptInvitation(query: {
    dto: AcceptInvitationDto;
    req: CustomRequest;
  }) {
    const { dto, req } = query;
    const { token } = dto;

    const invitation =
      await this.fetchInvitationRepository.getInvitationByToken({
        token,
      });

    if (!invitation) {
      throw new NotFoundCustomException(
        'Invitation not found',
        ErrorCode.PROJECT_INVITATION_NOT_FOUND,
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestCustomException(
        'This invitation has already been used or expired',
        ErrorCode.PROJECT_INVITATION_INVALID_TOKEN,
      );
    }

    if (invitation.expiresAt && new Date() > invitation.expiresAt) {
      await this.fetchInvitationRepository.updateInvitationStatus({
        id: invitation.id,
        status: InvitationStatus.EXPIRED,
      });
      throw new BadRequestCustomException(
        'This invitation has expired',
        ErrorCode.PROJECT_INVITATION_EXPIRED,
      );
    }

    const currentUser = await this.fetchProjectRepository.findUserById({
      userId: req.user!.id,
    });

    if (
      !currentUser ||
      currentUser.email.toLowerCase() !== invitation.email.toLowerCase()
    ) {
      throw new ForbiddenCustomException(
        'This invitation was sent to a different email account',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    const existingMember = await this.fetchProjectRepository.findMember({
      projectId: invitation.projectId,
      userId: req.user!.id,
    });

    if (existingMember) {
      await this.fetchInvitationRepository.updateInvitationStatus({
        id: invitation.id,
        status: InvitationStatus.ACCEPTED,
        acceptedAt: new Date(),
        invitedUserId: req.user!.id,
      });

      return this.mapProjectMemberResponse(existingMember);
    }

    const member = await this.createProjectRepository.addMember({
      projectId: invitation.projectId,
      userId: req.user!.id,
      isManager: invitation.isManager === true,
    });

    await this.fetchInvitationRepository.updateInvitationStatus({
      id: invitation.id,
      status: InvitationStatus.ACCEPTED,
      acceptedAt: new Date(),
      invitedUserId: req.user!.id,
    });

    const notificationDto: CreateNotificationDto = {
      usersIds: [invitation.invitedById],
      sendToAllUsers: false,
      content: {
        title: 'Invitation Accepted',
        body: `${req.user!.name} has accepted your invitation to join the project.`,
        url: `/projects/${invitation.projectId}`,
      },
    };
    await this.notificationsService.createNotification(req, notificationDto);

    return this.mapProjectMemberResponse(member);
  }

  private canCreateProject(roles: UserType[]): boolean {
    return this.isExecutive(roles);
  }

  private isGlobalExecutive(roles: UserType[]): boolean {
    return roles.includes(UserType.CEO);
  }

  private isExecutive(roles: UserType[]): boolean {
    return (
      roles.includes(UserType.CEO) ||
      roles.includes(UserType.CTO) ||
      roles.includes(UserType.CMO)
    );
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

  private ensureProjectBusinessUnitAccess(
    roles: UserType[],
    businessUnit?: BusinessUnit,
  ): void {
    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(roles);

    if (!executiveBusinessUnit || !businessUnit) {
      return;
    }

    if (businessUnit !== executiveBusinessUnit) {
      throw new ForbiddenCustomException(
        `You can only manage ${executiveBusinessUnit} projects`,
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }
  }

  private getUpdatePermissionUserId(
    roles: UserType[],
    userId: string,
  ): string | null {
    if (roles.includes(UserType.CEO)) {
      return null;
    }
    if (roles.includes(UserType.CTO) || roles.includes(UserType.CMO)) {
      return null;
    }
    return userId;
  }

  private getUpdatePermissionBusinessUnit(
    roles: UserType[],
  ): BusinessUnit | null {
    if (roles.includes(UserType.CTO) && !roles.includes(UserType.CEO)) {
      return 'TawerDev';
    }
    if (roles.includes(UserType.CMO) && !roles.includes(UserType.CEO)) {
      return 'TawerCreative';
    }
    return null;
  }

  private getDeletePermissionBusinessUnit(
    roles: UserType[],
  ): BusinessUnit | null {
    if (roles.includes(UserType.CTO) && !roles.includes(UserType.CEO)) {
      return 'TawerDev';
    }
    if (roles.includes(UserType.CMO) && !roles.includes(UserType.CEO)) {
      return 'TawerCreative';
    }
    return null;
  }

  private toUnaccented(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private async verifyProjectAccess(query: {
    userId: string;
    userRoles: UserType[];
    projectId: string;
  }) {
    if (this.isGlobalExecutive(query.userRoles)) {
      return;
    }

    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(
      query.userRoles,
    );
    if (executiveBusinessUnit) {
      const projectBusinessUnit =
        await this.fetchProjectRepository.findProjectBusinessUnit({
          projectId: query.projectId,
        });

      if (projectBusinessUnit === executiveBusinessUnit) {
        return;
      }

      throw new ForbiddenCustomException(
        'Project not found or access denied',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    const member = await this.fetchProjectRepository.findMember({
      projectId: query.projectId,
      userId: query.userId,
    });
    if (!member) {
      throw new ForbiddenCustomException(
        'Project not found or access denied',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }
  }

  private async checkIsProjectManager(
    userId: string,
    projectId: string,
  ): Promise<boolean> {
    const member = await this.fetchProjectRepository.findMember({
      projectId,
      userId,
    });
    return member?.isManager === true;
  }

  private async verifyProjectManagerAccess(query: {
    userId: string;
    userRoles: UserType[];
    projectId: string;
  }): Promise<void> {
    if (this.isGlobalExecutive(query.userRoles)) {
      return;
    }

    const executiveBusinessUnit = this.getExecutiveBusinessUnitScope(
      query.userRoles,
    );
    if (executiveBusinessUnit) {
      const projectBusinessUnit =
        await this.fetchProjectRepository.findProjectBusinessUnit({
          projectId: query.projectId,
        });

      if (projectBusinessUnit === executiveBusinessUnit) {
        return;
      }

      throw new ForbiddenCustomException(
        'Project not found or access denied',
        ErrorCode.PROJECT_FORBIDDEN,
      );
    }

    const isProjectManager = await this.checkIsProjectManager(
      query.userId,
      query.projectId,
    );

    if (isProjectManager) {
      return;
    }

    throw new ForbiddenCustomException(
      'Only project managers and executives can manage project members and invitations',
      ErrorCode.PROJECT_FORBIDDEN,
    );
  }

  private retrievePaginationParameters(query: {
    page?: number;
    limit?: number;
  }): { page: number; limit: number } {
    const page = Math.max(query.page || 1, 1);
    const limit = Math.min(query.limit || 10, 100);
    return { page, limit };
  }

  private async validateKanbanSettingsForProject(
    projectId: string,
    settings: KanbanSettings,
  ): Promise<void> {
    if (!settings) {
      return;
    }

    const configuredStatuses = Object.keys(settings);
    if (!configuredStatuses.length) {
      return;
    }

    const taskStatuses =
      await this.fetchProjectRepository.findProjectTaskStatuses({ projectId });

    if (!taskStatuses.length) {
      throw new BadRequestCustomException(
        'Cannot set kanban WIP limits before task statuses are initialized for this project',
        ErrorCode.INVALID_DATA,
      );
    }

    const allowedStatuses = new Set(taskStatuses.map((status) => status.name));
    const invalidStatuses = configuredStatuses.filter(
      (status) => !allowedStatuses.has(status),
    );

    if (invalidStatuses.length) {
      throw new BadRequestCustomException(
        `Invalid kanban status keys: ${invalidStatuses.join(', ')}`,
        ErrorCode.INVALID_DATA,
      );
    }
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

  private async ensureProjectExists(query: {
    projectId: string;
  }): Promise<void> {
    const projectWithContent =
      await this.fetchProjectRepository.getProjectByIdWithPermission({
        projectId: query.projectId,
        userId: null, // Allow access since this is for invitation from authorized user
      });

    if (
      !projectWithContent ||
      !projectWithContent.contents ||
      !projectWithContent.contents.length
    ) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }
  }

  private async ensureInvitationEligibility(query: {
    projectId: string;
    invitedEmail: string;
  }): Promise<void> {
    const existingMember =
      await this.createInvitationRepository.findExistingMember({
        email: query.invitedEmail,
        projectId: query.projectId,
      });

    if (existingMember) {
      throw new ConflictCustomException(
        'User is already a member of this project',
        ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS,
      );
    }

    const existingInvitation =
      await this.createInvitationRepository.findExistingInvitation({
        email: query.invitedEmail,
        projectId: query.projectId,
      });

    if (existingInvitation) {
      throw new ConflictCustomException(
        'An invitation has already been sent to this email',
        ErrorCode.PROJECT_INVITATION_ALREADY_EXISTS,
      );
    }
  }

  private async createAndNotifyInvitation(query: {
    req: CustomRequest;
    projectId: string;
    inviterId: string;
    inviterName: string;
    invitedEmail: string;
    isManager: boolean;
    expiresInDays?: number;
    emailSubject: string;
    notificationTitle: string;
    notificationBody: string;
  }): Promise<CreatedInvitationDto> {
    const invitationMeta = this.generateInvitationMetadata(query.expiresInDays);

    const projectWithContent =
      await this.fetchProjectRepository.getProjectByIdWithPermission({
        projectId: query.projectId,
        userId: null, // Allow access since this is for invitation from authorized user
      });

    if (
      !projectWithContent ||
      !projectWithContent.contents ||
      !projectWithContent.contents.length
    ) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    const projectTitle = projectWithContent.contents[0].name;

    const invitation = await this.createInvitationRepository.createInvitation({
      email: query.invitedEmail,
      projectId: query.projectId,
      invitedById: query.inviterId,
      token: invitationMeta.token,
      expiresAt: invitationMeta.expiresAt,
      isManager: query.isManager,
    });

    await this.sendInvitationCommunication({
      req: query.req,
      invitedEmail: query.invitedEmail,
      inviterName: query.inviterName,
      projectTitle,
      token: invitationMeta.token,
      expiresInDays: invitationMeta.expiresInDays,
      emailSubject: query.emailSubject,
      notificationTitle: query.notificationTitle,
      notificationBody: query.notificationBody,
    });

    return this.mapInvitationResponse(invitation);
  }

  private mapProjectMemberResponse(member: {
    id: string;
    userId: string;
    projectId: string;
    isManager: boolean;
    createdAt: Date | string;
    user?: { name: string };
  }): CreatedProjectMemberDto {
    return {
      id: member.id,
      userId: member.userId,
      projectId: member.projectId,
      memberName: member.user?.name ?? '',
      isManager: member.isManager,
      createdAt: member.createdAt,
    };
  }

  private mapInvitationResponse(invitation: {
    id: string;
    email: string;
    token: string;
    status: InvitationStatus;
    expiresAt: Date;
    projectId: string;
    createdAt: Date;
  }): CreatedInvitationDto {
    return {
      id: invitation.id,
      email: invitation.email,
      token: invitation.token,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      projectId: invitation.projectId,
      createdAt: invitation.createdAt,
    };
  }

  async archiveProject(
    projectId: string,
    req: CustomRequest,
  ): Promise<ProjectWithRelations> {
    const project = await this.updateProjectRepository.findProjectById({
      projectId,
    });

    if (!project) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    await this.verifyProjectUpdateAccess({ req, projectId });

    if (project.isArchived) {
      throw new BadRequestCustomException(
        'Project is already archived',
        ErrorCode.PROJECT_ALREADY_ARCHIVED,
      );
    }

    await this.updateProjectRepository.archiveProject({
      projectId,
    });

    return this.getProjectById(req, projectId);
  }

  async restoreProject(
    projectId: string,
    req: CustomRequest,
  ): Promise<ProjectWithRelations> {
    const project = await this.updateProjectRepository.findProjectById({
      projectId,
    });

    if (!project) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    await this.verifyProjectUpdateAccess({ req, projectId });

    if (!project.isArchived) {
      throw new BadRequestCustomException(
        'Project is not archived',
        ErrorCode.PROJECT_NOT_ARCHIVED,
      );
    }

    await this.updateProjectRepository.restoreProject({
      projectId,
    });

    return this.getProjectById(req, projectId);
  }

  async getKanbanSettings(req: CustomRequest, projectId: string) {
    const user = req.user!;
    const project = await this.updateProjectRepository.findProjectById({
      projectId,
    });
    if (!project) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    await this.verifyProjectAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    return { projectId, kanbanSettings: project.kanbanSettings ?? null };
  }

  async getProjectCapacity(
    req: CustomRequest,
    projectId: string,
  ): Promise<ProjectCapacityDto> {
    const user = req.user!;

    await this.verifyProjectAccess({
      userId: user.id,
      userRoles: user.roles,
      projectId,
    });

    const snapshot = await this.fetchProjectRepository.getCapacitySnapshot({
      projectId,
    });
    if (!snapshot) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    const memberCommittedPoints = new Map<string, number>();
    let totalCapacityPoints = 0;
    let totalCommittedPoints = 0;
    let unassignedCommittedPoints = 0;

    for (const sprint of snapshot.sprints) {
      totalCapacityPoints += sprint.capacity ?? 0;

      for (const task of sprint.tasks) {
        const points = task.storyPoints ?? 0;
        if (points <= 0) {
          continue;
        }
        totalCommittedPoints += points;

        if (!task.assigneeId) {
          unassignedCommittedPoints += points;
          continue;
        }

        const current = memberCommittedPoints.get(task.assigneeId) ?? 0;
        memberCommittedPoints.set(task.assigneeId, current + points);
      }
    }

    const members: ProjectCapacityMemberDto[] = snapshot.members.map(
      (member) => {
        const committedPoints = memberCommittedPoints.get(member.userId) ?? 0;
        const capacityPoints =
          totalCapacityPoints > 0 && totalCommittedPoints > 0
            ? Number(
                (
                  (committedPoints / totalCommittedPoints) *
                  totalCapacityPoints
                ).toFixed(2),
              )
            : 0;

        const remainingPoints = Number(
          (capacityPoints - committedPoints).toFixed(2),
        );
        const utilizationPercent =
          capacityPoints > 0
            ? Number(((committedPoints / capacityPoints) * 100).toFixed(2))
            : 0;

        return {
          userId: member.userId,
          name: member.user.name,
          committedPoints,
          capacityPoints,
          remainingPoints,
          utilizationPercent,
        };
      },
    );

    return {
      projectId: snapshot.id,
      activeSprints: snapshot.sprints.length,
      totalCapacityPoints,
      totalCommittedPoints,
      totalRemainingPoints: Number(
        (totalCapacityPoints - totalCommittedPoints).toFixed(2),
      ),
      unassignedCommittedPoints,
      members,
    };
  }

  async updateKanbanSettings(
    req: CustomRequest,
    projectId: string,
    settings: Record<string, number> | null,
  ) {
    const project = await this.updateProjectRepository.findProjectById({
      projectId,
    });
    if (!project) {
      throw new NotFoundCustomException(
        'Project not found',
        ErrorCode.PROJECT_NOT_FOUND,
      );
    }

    await this.validateKanbanSettingsForProject(projectId, settings);
    await this.verifyProjectUpdateAccess({ req, projectId });

    return this.updateProjectRepository.updateKanbanSettings({
      projectId,
      settings,
    });
  }

  private generateInvitationMetadata(expiresInDays?: number): {
    token: string;
    expiresAt: Date;
    expiresInDays: number;
  } {
    const parsedDays = Number(expiresInDays);
    const validDays =
      Number.isFinite(parsedDays) && parsedDays > 0 ? parsedDays : 7;

    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + validDays);

    return {
      token,
      expiresAt,
      expiresInDays: validDays,
    };
  }

  private buildInvitationLink(token: string): string {
    const frontendUrl =
      process.env.FRONTEND_ADDRESS ||
      process.env.FRONTEND_URL ||
      'http://localhost:3000';
    return `${frontendUrl}/projects/join?token=${token}`;
  }

  private async sendInvitationCommunication(query: {
    req: CustomRequest;
    invitedEmail: string;
    inviterName: string;
    projectTitle: string;
    token: string;
    expiresInDays: number;
    emailSubject: string;
    notificationTitle: string;
    notificationBody: string;
  }): Promise<void> {
    const invitationLink = this.buildInvitationLink(query.token);

    await this.mailService.sendHtmlEmail({
      to: [query.invitedEmail],
      subject: query.emailSubject,
      paragraphs: [
        `You have been invited to join the <strong>${query.projectTitle}</strong> project${query.inviterName && query.inviterName !== 'user.name' ? ` by <strong>${query.inviterName}</strong>` : ''}.`,
        'Click the button below to accept your invitation and join the project team:',
        `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${invitationLink}" style="
            background: linear-gradient(135deg, #f87171 0%, #bcacfb 50%, #160a33 100%);
            color: #ffffff;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            display: inline-block;
            box-shadow: 0 4px 12px rgba(248, 113, 113, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          "
          onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(248, 113, 113, 0.4)';"
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(248, 113, 113, 0.3)';"
          >
            ✅ Accept Invitation
          </a>
        </div>
        `,
        `
        <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f87171;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            <strong>⏰ Expires in:</strong> ${query.expiresInDays} days<br>
            ${query.inviterName && query.inviterName !== 'user.name' ? `<strong>📧 Invited by:</strong> ${query.inviterName}<br>` : ''}
            <strong>🎯 Action:</strong> Click the button above to join the project
          </p>
        </div>
        `,
        `
        <p style="font-size: 12px; color: #999; margin-top: 20px;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <span style="word-break: break-all; color: #0066cc;">${invitationLink}</span>
        </p>
        `,
      ],
    });

    const invitedUser = await this.fetchProjectRepository.findUserByEmail({
      email: query.invitedEmail,
    });

    if (!invitedUser) {
      return;
    }

    const notificationDto: CreateNotificationDto = {
      usersIds: [invitedUser.id],
      sendToAllUsers: false,
      content: {
        title: query.notificationTitle,
        body: query.notificationBody,
        url: `/projects/join?token=${query.token}`,
      },
    };

    await this.notificationsService.createNotification(
      query.req,
      notificationDto,
    );
  }

  private async verifyProjectUpdateAccess(query: {
    req: CustomRequest;
    projectId: string;
  }): Promise<void> {
    const user = query.req.user!;

    try {
      await this.updateProjectRepository.updateProjectWithPermission({
        data: {
          projectId: query.projectId,
          userId: this.getUpdatePermissionUserId(user.roles, user.id),
          businessUnit: this.getUpdatePermissionBusinessUnit(user.roles),
        },
        projectData: {},
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ForbiddenCustomException(
            'Project not found or access denied',
            ErrorCode.PROJECT_FORBIDDEN,
          );
        }
      }

      throw error;
    }
  }

  private validateCreateProjectMembers(data: CreateProjectDto): void {
    this.validateMemberManagerConsistency({
      members: data.members,
      manager: data.manager,
      requireMembers: true,
      requireManagerField: true,
    });
  }

  private normalizeCreateProjectInput(data: CreateProjectDto): void {
    if (!data.estimatedStartDate) {
      data.estimatedStartDate = data.startDate;
    }

    if (!data.estimatedEndDate) {
      data.estimatedEndDate = data.endDate;
    }

    if (typeof data.manager === 'string' && data.manager.trim().length === 0) {
      data.manager = undefined;
    }

    if (Array.isArray(data.members)) {
      data.members = data.members.filter((member) => {
        if (!member || typeof member.userId !== 'string') {
          return false;
        }

        return member.userId.trim().length > 0;
      });
    }
  }

  private applyDefaultManagerForCreateProject(
    data: CreateProjectDto,
    creatorUserId: string,
  ): void {
    if (data.manager) {
      return;
    }

    data.manager = creatorUserId;

    if (!data.members || data.members.length === 0) {
      data.members = [{ userId: creatorUserId, isManager: true }];
      return;
    }

    // Replace empty userIds with the creator's ID
    data.members = data.members.map((member) => ({
      ...member,
      userId:
        member.userId && member.userId.trim() !== ''
          ? member.userId
          : creatorUserId,
      isManager:
        member.userId === creatorUserId ||
        !member.userId ||
        member.userId.trim() === '',
    }));

    // Enforce single-manager rule when manager is auto-defaulted to creator.
    data.members = data.members.map((member) => ({
      ...member,
      isManager: member.userId === creatorUserId,
    }));

    const creatorIsMember = data.members.some(
      (member) => member.userId === creatorUserId,
    );

    if (!creatorIsMember) {
      data.members.push({ userId: creatorUserId, isManager: true });
    }
  }

  private validateUpdateProjectMembers(data: UpdateProjectDto): void {
    const hasMembersUpdate = data.members !== undefined;
    const hasManagerUpdate = data.manager !== undefined;

    if (!hasMembersUpdate && hasManagerUpdate) {
      throw new BadRequestCustomException(
        'manager cannot be updated without members',
        ErrorCode.INVALID_DATA,
      );
    }

    if (!hasMembersUpdate) {
      return;
    }

    this.validateMemberManagerConsistency({
      members: data.members,
      manager: data.manager,
      requireMembers: true,
      requireManagerField: true,
    });
  }

  private validateMemberManagerConsistency(query: {
    members?: Array<{ userId?: string; isManager?: boolean }>;
    manager?: string;
    requireMembers: boolean;
    requireManagerField: boolean;
  }): void {
    if (
      query.requireMembers &&
      (!query.members || query.members.length === 0)
    ) {
      throw new BadRequestCustomException(
        'At least one member is required',
        ErrorCode.INVALID_DATA,
      );
    }

    if (!query.members || query.members.length === 0) {
      return;
    }

    const missingUserId = query.members.some((member) => !member.userId);
    if (missingUserId) {
      throw new BadRequestCustomException(
        'Each member must have a valid userId',
        ErrorCode.INVALID_DATA,
      );
    }

    if (query.requireManagerField && !query.manager) {
      throw new BadRequestCustomException(
        'manager is required when members are provided',
        ErrorCode.INVALID_DATA,
      );
    }

    const managerCount = query.members.filter(
      (member) => member.isManager === true,
    ).length;

    if (managerCount === 0) {
      throw new BadRequestCustomException(
        'At least one member must be a manager (isManager=true)',
        ErrorCode.INVALID_DATA,
      );
    }

    if (managerCount > 1) {
      throw new BadRequestCustomException(
        'Only one project manager is allowed per project',
        ErrorCode.INVALID_DATA,
      );
    }

    const managerInMembers = query.members.some(
      (member) => member.userId === query.manager && member.isManager === true,
    );

    if (!managerInMembers) {
      throw new BadRequestCustomException(
        'The specified manager must be a member with isManager=true',
        ErrorCode.INVALID_DATA,
      );
    }
  }
}
