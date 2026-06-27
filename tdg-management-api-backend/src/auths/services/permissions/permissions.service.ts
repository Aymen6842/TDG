import { Injectable } from '@nestjs/common';
import { UserType } from '@prisma/client';
import { ManagePermissionsRepository } from 'src/auths/repositories/manage-permissions.repository';
import {
  EXECUTIVE_MANAGER_ROLES,
  EXECUTIVE_ROLES,
  ROLE_MANAGE_ROLES,
} from 'src/common/constants/permissions';
import { CustomRequest } from 'src/common/types/request.type';

@Injectable()
export class PermissionsService {
  constructor(
    private readonly managePermissionsRepository: ManagePermissionsRepository,
  ) {}

  async canUserManageUsers(
    actorUserId: string,
    targetusersIds: string[],
  ): Promise<boolean> {
    if (targetusersIds.length === 0) return true;

    const actorRoles =
      await this.managePermissionsRepository.getRolesByUsersIds([actorUserId]);
    const executiveOrMangerRole = this.getExecutiveRoleOrManagerRole(
      actorRoles.map((r) => r.type),
    );

    if (!executiveOrMangerRole) return false;
    if (executiveOrMangerRole === UserType.CEO) return true;

    const manageableRoles =
      await this.managePermissionsRepository.getRolesByUsersIds(targetusersIds);
    if (
      executiveOrMangerRole === UserType.CTO ||
      executiveOrMangerRole === UserType.CMO
    )
      return this.canRolesManageRoles(
        [executiveOrMangerRole],
        manageableRoles.map((r) => r.type),
      );

    // If the user is a project manager
    const isManagerWithUsers =
      await this.managePermissionsRepository.isManagerWithUsers(
        actorUserId,
        targetusersIds,
      );

    return isManagerWithUsers !== null;
  }

  async canUserManageTeams(actorUserId: string, teamIds: string[]) {
    const actorRoles =
      await this.managePermissionsRepository.getRolesByUsersIds([actorUserId]);
    const executiveOrMangerRole = this.getExecutiveRoleOrManagerRole(
      actorRoles.map((r) => r.type),
    );

    if (!executiveOrMangerRole) return false;
    if (executiveOrMangerRole === UserType.CEO) return true;

    const allowedRoles = this.getManageableRolesByRole(executiveOrMangerRole);
    const numberOfTeams =
      await this.managePermissionsRepository.countTeamByIdsAndMembersRoles(
        teamIds,
        allowedRoles,
      );

    return numberOfTeams === teamIds.length;
  }

  canRolesManageRoles(
    actorRoles: UserType[],
    targetRoles: UserType[] = [],
  ): boolean {
    if (targetRoles.length === 0) return true;

    return actorRoles.every((actorRole) => {
      const manageableRoles = this.getManageableRolesByRole(actorRole);

      return targetRoles.every((targetRole) =>
        manageableRoles.includes(targetRole),
      );
    });
  }

  getManageableRolesFromRequest(req: CustomRequest): UserType[] {
    const executiveRole = this.getExecutiveRoleOrManagerRole(
      req.user?.roles || [],
    );

    return executiveRole ? this.getManageableRolesByRole(executiveRole) : [];
  }

  getManageableRolesByRole(role: UserType): UserType[] {
    return ROLE_MANAGE_ROLES[role] || [];
  }

  async getManageableRolesByUserId(userId: string) {
    const userRoles = await this.managePermissionsRepository.getRolesByUsersIds(
      [userId],
    );
    const executiveRole = userRoles.find((role) =>
      EXECUTIVE_MANAGER_ROLES.includes(role.type),
    );

    if (executiveRole) return this.getManageableRolesByRole(executiveRole.type);
    return [];
  }

  getExecutiveRoleOrManagerRole(roles: UserType[]): UserType | null {
    for (const managerOrExecutiveRole of EXECUTIVE_MANAGER_ROLES) {
      if (roles.includes(managerOrExecutiveRole)) {
        return managerOrExecutiveRole;
      }
    }

    return null;
  }

  getExecutiveRoleFromRoles(roles: UserType[]): UserType | null {
    for (const executiveRole of EXECUTIVE_ROLES) {
      if (roles.includes(executiveRole)) {
        return executiveRole;
      }
    }

    return null;
  }
}
