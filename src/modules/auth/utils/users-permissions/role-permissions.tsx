import { UserRoleOnFrontendSide } from "@/modules/auth/types";
import { ALL, DEV_TEAM, CREATIVE_TEAM, NONE, fullAccess, viewOnly, noAccess } from "./permissions-helpers";
import { UserPermissions } from "../../types/permissions";

export const rolePermissions: Record<UserRoleOnFrontendSide, UserPermissions> = {
  /* =======================
     TOP MANAGEMENT
  ======================= */

  ceo: {
    usersManagement: fullAccess(ALL),
    teamsManagement: fullAccess(ALL),
    eventsManagement: fullAccess(ALL),
    meetingsManagement: fullAccess(ALL),
    projectsManagement: fullAccess(ALL),
    serversManagement: fullAccess(ALL),
    servicesManagement: fullAccess(ALL),
  },

  cto: {
    usersManagement: fullAccess(["cto"]),
    teamsManagement: fullAccess(["cto"]),
    eventsManagement: fullAccess(ALL),
    meetingsManagement: fullAccess(["cto"]),
    projectsManagement: fullAccess(["cto"]),
    serversManagement: fullAccess(ALL),
    servicesManagement: fullAccess(ALL),
  },

  cmo: {
    usersManagement: viewOnly(["cmo"]),
    teamsManagement: fullAccess(["cmo"]),
    eventsManagement: fullAccess(["cmo"]),
    meetingsManagement: fullAccess(["cmo"]),
    projectsManagement: fullAccess(["cmo"]),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  productOwner: {
    usersManagement: viewOnly(ALL),
    teamsManagement: fullAccess(ALL),
    eventsManagement: fullAccess(ALL),
    meetingsManagement: fullAccess(ALL),
    projectsManagement: fullAccess(ALL),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  scrumMaster: {
    usersManagement: viewOnly(ALL),
    teamsManagement: fullAccess(ALL),
    eventsManagement: viewOnly(ALL),
    meetingsManagement: fullAccess(ALL),
    projectsManagement: fullAccess(ALL),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  businessAnalyst: {
    usersManagement: viewOnly(ALL),
    teamsManagement: viewOnly(ALL),
    eventsManagement: viewOnly(ALL),
    meetingsManagement: viewOnly(ALL),
    projectsManagement: viewOnly(ALL),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  /* =======================
     PROJECT MANAGERS
  ======================= */

  tawerDevProjectManager: {
    usersManagement: viewOnly(DEV_TEAM),
    teamsManagement: fullAccess(DEV_TEAM),
    eventsManagement: viewOnly(DEV_TEAM),
    meetingsManagement: fullAccess(DEV_TEAM),
    projectsManagement: fullAccess(DEV_TEAM),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  tawerCreativeProjectManager: {
    usersManagement: viewOnly(CREATIVE_TEAM),
    teamsManagement: fullAccess(CREATIVE_TEAM),
    eventsManagement: fullAccess(CREATIVE_TEAM),
    meetingsManagement: fullAccess(CREATIVE_TEAM),
    projectsManagement: fullAccess(CREATIVE_TEAM),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  /* =======================
     DEVELOPERS / ENGINEERS
  ======================= */

  frontendDeveloper: developerPermissions(),
  backendDeveloper: developerPermissions(),
  fullStackDeveloper: developerPermissions(),
  mobileAppDeveloper: developerPermissions(),
  softwareEngineer: developerPermissions(),
  dataEngineer: developerPermissions(),
  devopsEngineer: devopsEngineerPermissions(),
  qualityAssuranceEngineer: developerPermissions(),
  databaseAdministrator: developerPermissions(),
  systemsArchitect: developerPermissions(),
  networkEngineer: developerPermissions(),
  cyberSecuritySpecialist: developerPermissions(),

  /* =======================
     CREATIVE TEAM
  ======================= */

  graphicDesigner: creativePermissions(),
  uiUxDesigner: creativePermissions(),
  seoSpecialist: creativePermissions(),
  contentWriter: creativePermissions(),
  videoEditor: creativePermissions(),
  socialMediaManager: creativePermissions(),

  /* =======================
     SUPPORT / HR
  ======================= */

  customerSupport: {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(NONE),
    eventsManagement: viewOnly(ALL),
    meetingsManagement: viewOnly(ALL),
    projectsManagement: viewOnly(NONE),
    serversManagement: viewOnly(["customerSupport"]),
    servicesManagement: viewOnly(["customerSupport"]),
  },

  hrManager: {
    usersManagement: {
      view: ["hrManager"],
      add: ["hrManager"],
      edit: ["hrManager"],
      delete: NONE
    },
    teamsManagement: viewOnly(ALL),
    eventsManagement: viewOnly(ALL),
    meetingsManagement: viewOnly(ALL),
    projectsManagement: viewOnly(ALL),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  /* =======================
     INTERNS / PENDING
  ======================= */

  tawerDevIntern: {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(DEV_TEAM),
    eventsManagement: viewOnly(DEV_TEAM),
    meetingsManagement: viewOnly(DEV_TEAM),
    projectsManagement: viewOnly(DEV_TEAM),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  tawerCreativeIntern: {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(CREATIVE_TEAM),
    eventsManagement: viewOnly(CREATIVE_TEAM),
    meetingsManagement: viewOnly(CREATIVE_TEAM),
    projectsManagement: viewOnly(CREATIVE_TEAM),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  },

  pendingApproval: {
    usersManagement: noAccess(),
    teamsManagement: noAccess(),
    eventsManagement: noAccess(),
    meetingsManagement: noAccess(),
    projectsManagement: noAccess(),
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  }
};

/* =======================
   SHARED PERMISSION BLOCKS
======================= */

function developerPermissions(): UserPermissions {
  return {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(NONE),
    eventsManagement: viewOnly(DEV_TEAM),
    meetingsManagement: viewOnly(DEV_TEAM),
    projectsManagement: {
      view: DEV_TEAM,
      add: NONE,
      edit: DEV_TEAM,
      delete: NONE
    },
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  };
}

function devopsEngineerPermissions(): UserPermissions {
  return {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(NONE),
    eventsManagement: viewOnly(DEV_TEAM),
    meetingsManagement: viewOnly(DEV_TEAM),
    projectsManagement: {
      view: DEV_TEAM,
      add: NONE,
      edit: DEV_TEAM,
      delete: NONE
    },
    serversManagement: fullAccess(["devopsEngineer"]),
    servicesManagement: fullAccess(["devopsEngineer"]),
  };
}

function creativePermissions(): UserPermissions {
  return {
    usersManagement: viewOnly(NONE),
    teamsManagement: viewOnly(CREATIVE_TEAM),
    eventsManagement: {
      view: CREATIVE_TEAM,
      add: CREATIVE_TEAM,
      edit: CREATIVE_TEAM,
      delete: CREATIVE_TEAM
    },
    meetingsManagement: viewOnly(CREATIVE_TEAM),
    projectsManagement: {
      view: CREATIVE_TEAM,
      add: NONE,
      edit: CREATIVE_TEAM,
      delete: NONE
    },
    serversManagement: noAccess(),
    servicesManagement: noAccess(),
  };
}
