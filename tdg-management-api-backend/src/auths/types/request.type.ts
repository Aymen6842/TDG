import { ParsedUrlQuery } from 'querystring';

export interface AccountActivationRequestQuery extends ParsedUrlQuery {
  token: string;
}
