import { Injectable } from '@nestjs/common';
import { BusinessUnit, UserType } from '@prisma/client';
import { PrismaService } from 'src/common/prisma/service/prisma.service';

/**
 * Permission scoping for all AI retrieval (§4.3 — the security core).
 *
 * Centralizes the single question "which projectIds may this user retrieve
 * from?" so every AI feature (estimation now, copilot later) shares one set of
 * business rules instead of duplicating `tasks.service`'s membership/executive
 * logic. Every retrieval query is filtered by this set *in SQL* before ranking,
 * so there is no code path that can surface content from a project the user
 * cannot access.
 *
 * The rules mirror `tasks.service`'s `canAccessProject`:
 *  - CEO (global executive)  → every project.
 *  - CTO                     → every `TawerDev` project.
 *  - CMO                     → every `TawerCreative` project.
 *  - everyone else           → the projects they are a `ProjectMember` of.
 */
@Injectable()
export class AiAccessService {
  constructor(private readonly prismaService: PrismaService) {}

  private isGlobalExecutive(roles: UserType[]): boolean {
    return roles.includes(UserType.CEO);
  }

  /**
   * The business unit an executive is scoped to, or `null` for a global
   * executive (CEO) / a non-executive. Same mapping as
   * `tasks.service.getExecutiveBusinessUnitScope`.
   */
  private executiveBusinessUnitScope(roles: UserType[]): BusinessUnit | null {
    if (roles.includes(UserType.CTO)) return BusinessUnit.TawerDev;
    if (roles.includes(UserType.CMO)) return BusinessUnit.TawerCreative;
    return null;
  }

  /**
   * The set of projectIds this user is allowed to retrieve from. Empty when the
   * user is a non-executive with no memberships.
   */
  async allowedProjectIds(
    userId: string,
    roles: UserType[],
  ): Promise<string[]> {
    // Global executive: every project.
    if (this.isGlobalExecutive(roles)) {
      const projects = await this.prismaService.project.findMany({
        select: { id: true },
      });
      return projects.map((project) => project.id);
    }

    // Business-unit executive (CTO / CMO): every project in their unit.
    const businessUnit = this.executiveBusinessUnitScope(roles);
    if (businessUnit) {
      const projects = await this.prismaService.project.findMany({
        where: { businessUnit },
        select: { id: true },
      });
      return projects.map((project) => project.id);
    }

    // Everyone else: the projects they are a member of.
    const memberships = await this.prismaService.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    });
    return memberships.map((membership) => membership.projectId);
  }

  /** Whether `projectId` is within the user's allowed retrieval scope. */
  async canAccessProject(
    userId: string,
    roles: UserType[],
    projectId: string,
  ): Promise<boolean> {
    const allowed = await this.allowedProjectIds(userId, roles);
    return allowed.includes(projectId);
  }

  /**
   * The subset of `allowedProjectIds` sharing `projectId`'s business unit —
   * used by estimation's project → business-unit fallback when the current
   * project has too few completed neighbors (§4.6). Always includes projects
   * the user is actually allowed to see; never widens scope.
   */
  async sameBusinessUnitProjectIds(
    projectId: string,
    allowedProjectIds: string[],
  ): Promise<string[]> {
    if (allowedProjectIds.length === 0) return [];

    const project = await this.prismaService.project.findUnique({
      where: { id: projectId },
      select: { businessUnit: true },
    });
    if (!project) return [];

    const projects = await this.prismaService.project.findMany({
      where: {
        id: { in: allowedProjectIds },
        businessUnit: project.businessUnit,
      },
      select: { id: true },
    });
    return projects.map((row) => row.id);
  }
}
