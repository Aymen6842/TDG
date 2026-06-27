import { UserRoleOnBackendSide, UserRoleOnFrontendSide } from "../types";

/**
 * Backend → Frontend role mapping
 */
export const backendToFrontendRoleMap: Record<UserRoleOnBackendSide, UserRoleOnFrontendSide> = {
  CEO: "ceo",
  CTO: "cto",
  CMO: "cmo",
  TawerCreativeProjectManager: "tawerCreativeProjectManager",
  GraphicDesigner: "graphicDesigner",
  SocialMediaManager: "socialMediaManager",
  ContentWriter: "contentWriter",
  VideoEditor: "videoEditor",
  UiUxDesigner: "uiUxDesigner",
  TawerDevProjectManager: "tawerDevProjectManager",
  SoftwareEngineer: "softwareEngineer",
  DataEngineer: "dataEngineer",
  DevopsEngineer: "devopsEngineer",
  QualityAssuranceEngineer: "qualityAssuranceEngineer",
  ProductOwner: "productOwner",
  ScrumMaster: "scrumMaster",
  BusinessAnalyst: "businessAnalyst",
  MobileAppDeveloper: "mobileAppDeveloper",
  FrontendDeveloper: "frontendDeveloper",
  BackendDeveloper: "backendDeveloper",
  FullStackDeveloper: "fullStackDeveloper",
  DatabaseAdministrator: "databaseAdministrator",
  SystemsArchitect: "systemsArchitect",
  NetworkEngineer: "networkEngineer",
  CyberSecuritySpecialist: "cyberSecuritySpecialist",
  SeoSpecialist: "seoSpecialist",
  CustomerSupport: "customerSupport",
  HRManager: "hrManager",
  PendingApproval: "pendingApproval",
  TawerCreativeIntern: "tawerCreativeIntern",
  TawerDevIntern: "tawerDevIntern"
};

/**
 * Frontend → Backend role mapping (auto-derived)
 */
export const frontendToBackendRoleMap: Record<UserRoleOnFrontendSide, UserRoleOnBackendSide> =
  Object.fromEntries(
    Object.entries(backendToFrontendRoleMap).map(([backend, frontend]) => [frontend, backend])
  ) as Record<UserRoleOnFrontendSide, UserRoleOnBackendSide>;

export function castRoleFromFrontendToBackend(
  role: UserRoleOnFrontendSide | ""
): UserRoleOnBackendSide | "" {
  if (role === "") return "";
  return frontendToBackendRoleMap[role];
}

export function castRoleFromBackendToFrontend(role: UserRoleOnBackendSide): UserRoleOnFrontendSide {
  return backendToFrontendRoleMap[role];
}
