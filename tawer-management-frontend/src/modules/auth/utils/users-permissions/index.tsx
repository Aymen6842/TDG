import { UserRoleOnFrontendSide } from "../../types";
import { ModulePermissions, UserPermissions } from "../../types/permissions";
import { rolePermissions } from "./role-permissions";

/**
 * Checks whether a given user role is allowed to perform
 * a specific action on a specific module.
 * @param roles - The list of roles assigned to the current user
 * @param module - The target module to check access for usersManagement
 * @param action - The action to be performed on the module read, delete ...
 *
 * @returns `true` if the role has permission, otherwise `false`
 *
 * @example
 * ```ts
 * hasPermissions("softwareEngineer", "projectsManagement", "edit");
 * ```
 */
export function hasPermissions(
  roles: UserRoleOnFrontendSide[],
  module: keyof UserPermissions,
  action: keyof ModulePermissions
): boolean {
  return roles.some((role) => rolePermissions[role]?.[module]?.[action]?.includes(role));
}
