import { Response } from 'express';

export interface FetchAccessTokenFromGoogleResponse extends Response {
  data: {
    access_token?: string;
  };
}

export interface FetchAccessTokenFromFacebookResponse extends Response {
  data: {
    access_token?: string;
  };
}

export interface FetchUserInfoFromGoogleResponse {
  data: {
    sub?: string;
    name?: string;
    email?: string;
  };
}

export interface FetchUserInfoFromFacebookResponse {
  data: {
    id?: string;
    sub?: string;
    name?: string;
    email?: string;
  };
}
