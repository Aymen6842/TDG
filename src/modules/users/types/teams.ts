import { UserRoleOnBackendSide, UserRoleOnFrontendSide } from "@/modules/auth/types";

export interface TeamType {
  id: string;
  name: string;
  members: {
    id: string;
    isManager: boolean;
    image: string;
    name: string;
    email: string;
    phone: string;
    roles: UserRoleOnFrontendSide[];
  }[];
}

export interface TeamInResponseType {
  id: string;
  name: string;
  members: {
    id: string;
    isManager: boolean;
    image: string;
    name: string;
    email: string;
    phone: string;
    roles: UserRoleOnBackendSide[];
  }[];
}

export interface UploadedTeamType {
  id?: string;
  name: string;
  members: {
    userId: string;
    isManager: boolean;
  }[];
}
