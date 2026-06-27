import { z } from "zod";

export interface UserSignUpType {
  email: string;
  name: string;
  phone: string;
  password: string;
}

export interface UserSignInType {
  email: string;
  password: string;
}

export interface Generate2FACodeType {
  email?: string;
  phone?: string;
}

export interface Login2FAType {
  email?: string;
  phone?: string;
  twoFactorAuthCode: string;
}

/**
 * Backend representation of user roles.
 * Roles are in PascalCase as defined by the backend.
 */
export const UserRoleOnBackendSideEnum = z.enum([
  "CEO",
  "CTO",
  "CMO",
  "TawerCreativeProjectManager",
  "GraphicDesigner",
  "SocialMediaManager",
  "ContentWriter",
  "VideoEditor",
  "UiUxDesigner",
  "TawerDevProjectManager",
  "SoftwareEngineer",
  "DataEngineer",
  "DevopsEngineer",
  "QualityAssuranceEngineer",
  "ProductOwner",
  "ScrumMaster",
  "BusinessAnalyst",
  "MobileAppDeveloper",
  "FrontendDeveloper",
  "BackendDeveloper",
  "FullStackDeveloper",
  "DatabaseAdministrator",
  "SystemsArchitect",
  "NetworkEngineer",
  "CyberSecuritySpecialist",
  "SeoSpecialist",
  "CustomerSupport",
  "HRManager",
  "PendingApproval",
  "TawerCreativeIntern",
  "TawerDevIntern"
]);

export type UserRoleOnBackendSide = z.infer<typeof UserRoleOnBackendSideEnum>;

/**
 * Frontend representation of user roles.
 * Roles are camelCase for frontend consistency.
 */
export type UserRoleOnFrontendSide =
  | "ceo"
  | "cto"
  | "cmo"
  | "tawerCreativeProjectManager"
  | "graphicDesigner"
  | "socialMediaManager"
  | "contentWriter"
  | "videoEditor"
  | "uiUxDesigner"
  | "tawerDevProjectManager"
  | "softwareEngineer"
  | "dataEngineer"
  | "devopsEngineer"
  | "qualityAssuranceEngineer"
  | "productOwner"
  | "scrumMaster"
  | "businessAnalyst"
  | "mobileAppDeveloper"
  | "frontendDeveloper"
  | "backendDeveloper"
  | "fullStackDeveloper"
  | "databaseAdministrator"
  | "systemsArchitect"
  | "networkEngineer"
  | "cyberSecuritySpecialist"
  | "seoSpecialist"
  | "customerSupport"
  | "hrManager"
  | "pendingApproval"
  | "tawerCreativeIntern"
  | "tawerDevIntern";
