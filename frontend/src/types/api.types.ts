export interface BackendError {
  error: string;
  details?: Array<{ field: string; message: string }>;
}

export interface Pagination {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  posts: T[];
  pagination: Pagination;
}

export interface MessageResponse {
  message: string;
}

export interface ParsedApiError {
  message: string;
  fieldErrors: Record<string, string>;
  status: number;
}
