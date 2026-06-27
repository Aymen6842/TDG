export interface PaginationParameters {
  page?: string;
  limit?: string;
}

export interface FilterNotificationsParameters extends PaginationParameters {
  userId?: string;
  isSeen?: string; // 'true' | 'false'
}

export interface PaginationParametersReturn {
  record?: string;
  page?: string;
  limit?: string;
}
