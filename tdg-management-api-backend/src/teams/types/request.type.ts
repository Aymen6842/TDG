import { ParsedUrlQuery } from 'querystring';

export interface PaginationParameters extends ParsedUrlQuery {
  page?: string;
  limit?: string;
}

export enum SortUserBy {
  nameAsc = 'nameAsc',
  nameDesc = 'nameDesc',
  emailAsc = 'emailAsc',
  emailDesc = 'emailDesc',
  createdAtAsc = 'createdAtAsc',
  createdAtDesc = 'createdAtDesc',
}
