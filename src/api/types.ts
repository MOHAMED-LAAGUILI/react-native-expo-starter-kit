export interface PublicPost {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  message: string;
  code?: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
