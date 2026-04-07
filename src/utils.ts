import type { ToolErrorResponse, ToolSuccessResponse } from "./types";

export function formatSuccess(data: Record<string, unknown>): ToolSuccessResponse {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

export function formatError(status: number, rawMessage: string): ToolErrorResponse {
  let message: string;

  switch (status) {
    case 401:
      message = `Authentication failed (401). Check that REX_API_KEY is set and valid. ${rawMessage}`;
      break;
    case 403:
      message = `Access denied (403). Check API key permissions in REX Back Office > Settings > Integrations > API Management. ${rawMessage}`;
      break;
    case 404:
      message = `Resource not found (404). Verify the ID exists in RetailExpress. ${rawMessage}`;
      break;
    case 429:
      message = `Rate limit exceeded (429). RetailExpress allows 300 requests/minute. Wait and retry. ${rawMessage}`;
      break;
    default:
      if (status >= 500) {
        message = `RetailExpress server error (${status}). Try again later. ${rawMessage}`;
      } else {
        message = `Request failed (${status}). ${rawMessage}`;
      }
  }

  return {
    isError: true,
    content: [{ type: "text", text: message }],
  };
}

export function stripUndefined(
  params: Record<string, unknown>
): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = String(value);
    }
  }
  return cleaned;
}
