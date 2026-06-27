export interface FilterLogsParameters {
  page?: string;
  limit?: string;
  ip?: string;
  method?: string;
  statusCode?: string;
  level?: string;
  userId?: string;
  endpoint?: string; // Search in message or endpoint
}
