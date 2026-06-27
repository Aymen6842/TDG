import { ParsedUrlQuery } from 'querystring';

export interface PaginationParameters extends ParsedUrlQuery {
  page?: string;
  limit?: string;
}

export enum PersonalTasksSortByOptions {
  StatusAsc = 'statusAsc',
  StatusDesc = 'statusDesc',
  PriorityAsc = 'priorityAsc',
  PriorityDesc = 'priorityDesc',
  DueDateAsc = 'dueDateAsc',
  DueDateDesc = 'dueDateDesc',
  DisplayOrderAsc = 'displayOrderAsc',
  DisplayOrderDesc = 'displayOrderDesc',
  CreatedAtAsc = 'createdAtAsc',
  CreatedAtDesc = 'createdAtDesc',
}
