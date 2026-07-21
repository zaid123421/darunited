export interface GlobalResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  status_code?: number;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
