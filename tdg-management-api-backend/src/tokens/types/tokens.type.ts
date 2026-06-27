import { UserType } from '@prisma/client';

export type ExpirationTimeFormat =
  `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'M' | 'y'}`;

export interface RefreshAccessTokens {
  access: string;
  refresh: string;
}

export interface AccessToken {
  access: string;
}

export interface RefreshToken {
  refresh: string;
}

export interface JwtPayloadForAuthentication {
  id: string;
  name: string;
  roles: UserType[];
  teamsIds: string[];
  type: 'access' | 'refresh' | 'activation';
  iat?: number; // issued at
  exp?: number; // expiration time
}
