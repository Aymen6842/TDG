export interface StructuredLog {
  ip?: string;
  time: string;
  level: string;
  method: string;
  url?: string;
  responseTime: string;
  statusCode: number;
  message: string;
  request?: {
    body?: object | null;
    headers?: object | null;
  };
  response?: {
    body?: object | null;
    headers?: object | null;
  };
  userId?: string;
}

export interface LogFileEntry {
  ip: string; // IP address of the request
  responseTime: number; // Time taken to respond
  timestamp: string; // The time of the log
  level: string; // Log level
  message?: string; // Optional message
  method: string; // HTTP method
  endpoint: string; // Endpoint or URL
  statusCode: number; // HTTP status code
  stack?: string; // Stack trace if any
  userId?: string; // Extracted userId if present in stack
  request?: { body?: object | null; headers?: object | null }; // Full request object
  response?: { body?: object | null; headers?: object | null }; // Full response object
  [key: string]: unknown; // Any other dynamic fields
}

export interface LogFileInfo {
  name: string;
  size: string; // Could be improved to actual size
  date: string;
}

export interface LogsData {
  [category: string]: LogFileInfo[];
}
