import { UserRoleOnFrontendSide } from ".";

export interface ModulePermissions {
  view: UserRoleOnFrontendSide[];
  edit: UserRoleOnFrontendSide[];
  add: UserRoleOnFrontendSide[];
  delete: UserRoleOnFrontendSide[];
}

export interface UserPermissions {
  usersManagement: ModulePermissions;
  teamsManagement: ModulePermissions;
  eventsManagement: ModulePermissions;
  meetingsManagement: ModulePermissions;
  projectsManagement: ModulePermissions;
  serversManagement: ModulePermissions;
  servicesManagement: ModulePermissions;
}
