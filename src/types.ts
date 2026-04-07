export interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_on: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page_number: number;
  page_size: number;
  total_records: number;
  has_more: boolean;
}

export interface RexApiError {
  status: number;
  message: string;
  details?: string;
}

export interface ToolSuccessResponse {
  [key: string]: unknown;
  content: Array<{ type: "text"; text: string }>;
  structuredContent: Record<string, unknown>;
}

export interface ToolErrorResponse {
  [key: string]: unknown;
  isError: true;
  content: Array<{ type: "text"; text: string }>;
}

export type ToolResponse = ToolSuccessResponse | ToolErrorResponse;
