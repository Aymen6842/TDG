import { UserType, ProjectType } from '@prisma/client';
import { Request as ExpressRequest } from 'express';

export interface CustomRequest extends ExpressRequest {
  headers: {
    authorization?: string;
  };
  user?: UserInRequest;
  project?: {
    id: string;
    projectType: ProjectType;
  };
}

export interface UserInRequest {
  id: string;
  name: string;
  roles: UserType[];
  teamsIds?: string[];
}
