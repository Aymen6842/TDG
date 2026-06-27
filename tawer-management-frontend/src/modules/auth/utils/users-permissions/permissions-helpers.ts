import { UserRoleOnFrontendSide } from "@/modules/auth/types";
import { ModulePermissions } from "../../types/permissions";

export const ALL: UserRoleOnFrontendSide[] = [
  "ceo",
  "cto",
  "cmo",
  "productOwner",
  "scrumMaster",
  "businessAnalyst"
];

export const DEV_TEAM: UserRoleOnFrontendSide[] = [
  "tawerDevProjectManager",
  "frontendDeveloper",
  "backendDeveloper",
  "fullStackDeveloper",
  "mobileAppDeveloper",
  "softwareEngineer",
  "dataEngineer",
  "devopsEngineer",
  "qualityAssuranceEngineer"
];

export const CREATIVE_TEAM: UserRoleOnFrontendSide[] = [
  "tawerCreativeProjectManager",
  "graphicDesigner",
  "uiUxDesigner",
  "videoEditor",
  "contentWriter",
  "socialMediaManager",
  "seoSpecialist"
];

export const READ_ONLY: UserRoleOnFrontendSide[] = ["customerSupport", "hrManager"];

export const NONE: UserRoleOnFrontendSide[] = [];

export const fullAccess = (roles: UserRoleOnFrontendSide[]): ModulePermissions => ({
  view: roles,
  add: roles,
  edit: roles,
  delete: roles
});

export const viewOnly = (roles: UserRoleOnFrontendSide[]): ModulePermissions => ({
  view: roles,
  add: NONE,
  edit: NONE,
  delete: NONE
});

export const noAccess = (): ModulePermissions => ({
  view: NONE,
  add: NONE,
  edit: NONE,
  delete: NONE
});
