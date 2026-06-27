import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokensService } from 'src/tokens/service/tokens.service';
import { PrismaService } from 'src/common/prisma/service/prisma.service';
import { CustomRequest } from 'src/common/types/request.type';
import { ErrorCode } from 'src/common/exceptions/error-codes/error.code';
import { AGILE_PROJECT_KEY } from '../decorators/agile-project.decorator';

/**
 * AgileOnlyGuard - Protects routes that should only be accessible for AGILE projects
 *
 * This guard checks if the project referenced in the request parameter is of type AGILE.
 * It must be used AFTER the HasPermissionGuard so that authentication is already verified
 * and the user is attached to the request.
 *
 * Usage:
 * - Use @AgileProject() decorator to specify the parameter name containing projectId OR sprintId
 * - The guard will first try to use the value as projectId directly
 * - If that fails (project not found), it will try to fetch the sprint to get the projectId
 * - Place this guard AFTER HasPermissionGuard in the @UseGuards array
 *
 * Example:
 * ```
 * // For routes like /projects/:projectId/sprints
 * @UseGuards(HasPermissionGuard, AgileOnlyGuard)
 * @AgileProject('projectId')
 * @Permissions([PERMISSIONS.SPRINTS.SPRINT_CREATE])
 *
 * // For routes like /sprints/:id
 * @UseGuards(HasPermissionGuard, AgileOnlyGuard)
 * @AgileProject('sprint')
 * @Permissions([PERMISSIONS.SPRINTS.SPRINT_READ_BY_ID])
 * ```
 */
@Injectable()
export class AgileOnlyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private tokensService: TokensService,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Get the parameter name from the decorator
    const paramName =
      this.reflector.get<string>(AGILE_PROJECT_KEY, context.getHandler()) ||
      'projectId';

    const request: CustomRequest = context.switchToHttp().getRequest();
    const paramValue = request.params[paramName];

    if (!paramValue) {
      throw new BadRequestException('Project or Sprint ID is required');
    }

    // Verify token and attach user to request if not already done
    if (!request.user) {
      const token = request.headers?.authorization?.split('Bearer ')[1];
      if (token) {
        const user =
          this.tokensService.verifyAuthenticationTokenAndReturnPayload(token);
        request.user = user;
      }
    }

    // Try to find project directly by param value
    let project = await this.prisma.project.findUnique({
      where: { id: paramValue },
      select: { id: true, projectType: true },
    });

    // If not found as project, try to find as sprint and get its project
    if (!project) {
      const sprint = await this.prisma.sprint.findUnique({
        where: { id: paramValue },
        select: { projectId: true },
      });

      if (sprint) {
        project = await this.prisma.project.findUnique({
          where: { id: sprint.projectId },
          select: { id: true, projectType: true },
        });
      }
    }

    // If still not found, try Task
    if (!project) {
      const task = await this.prisma.task.findUnique({
        where: { id: paramValue },
        select: { projectId: true },
      });

      if (task) {
        project = await this.prisma.project.findUnique({
          where: { id: task.projectId },
          select: { id: true, projectType: true },
        });
      }
    }

    // If still not found, try Epic
    if (!project) {
      const epic = await this.prisma.epic.findUnique({
        where: { id: paramValue },
        select: { projectId: true },
      });

      if (epic) {
        project = await this.prisma.project.findUnique({
          where: { id: epic.projectId },
          select: { id: true, projectType: true },
        });
      }
    }

    // If still not found, try Milestone
    if (!project) {
      const milestone = await this.prisma.milestone.findUnique({
        where: { id: paramValue },
        select: { projectId: true },
      });

      if (milestone) {
        project = await this.prisma.project.findUnique({
          where: { id: milestone.projectId },
          select: { id: true, projectType: true },
        });
      }
    }

    if (!project) {
      // Project not found - let the controller handle the 404
      // Don't throw here, as the controller will handle the "not found" case
      return true;
    }

    if (project.projectType !== 'AGILE') {
      throw new BadRequestException({
        message: 'This operation is only available for AGILE projects',
        errorCode: ErrorCode.PROJECT_NOT_AGILE,
      });
    }

    // Attach project to request for later use
    request.project = project;

    return true;
  }
}
