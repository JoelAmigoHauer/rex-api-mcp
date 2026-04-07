import {
  REX_AUTH_URL,
  REX_BASE_ENDPOINT,
  TOKEN_REFRESH_BUFFER_MS,
  RATE_LIMIT_MAX_PER_MINUTE,
} from "../constants";
import type { TokenResponse, PaginatedResponse } from "../types";
import { formatError } from "../utils";

class RexClient {
  private apiKey: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private requestTimestamps: number[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async authenticate(): Promise<void> {
    const res = await fetch(REX_AUTH_URL, {
      method: "GET",
      headers: {
        "x-api-key": this.apiKey,
      },
    });

    if (!res.ok) {
      throw new Error(
        `Authentication failed: ${res.status} ${res.statusText}`
      );
    }

    const data = (await res.json()) as TokenResponse;
    this.accessToken = data.access_token;
    this.tokenExpiresAt = new Date(data.expires_on).getTime();
  }

  private async ensureAuthenticated(): Promise<void> {
    const now = Date.now();
    if (!this.accessToken || now >= this.tokenExpiresAt - TOKEN_REFRESH_BUFFER_MS) {
      await this.authenticate();
    }
  }

  private enforceRateLimit(): void {
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;
    this.requestTimestamps = this.requestTimestamps.filter(
      (ts) => ts > oneMinuteAgo
    );
    if (this.requestTimestamps.length >= RATE_LIMIT_MAX_PER_MINUTE) {
      const oldestInWindow = this.requestTimestamps[0]!;
      const waitMs = oldestInWindow + 60_000 - now + 100;
      throw new Error(
        `Rate limit approaching (${this.requestTimestamps.length}/${RATE_LIMIT_MAX_PER_MINUTE} requests in last minute). Wait ${Math.ceil(waitMs / 1000)}s before retrying.`
      );
    }
    this.requestTimestamps.push(now);
  }

  async request<T>(
    method: string,
    path: string,
    params?: Record<string, string>,
    body?: Record<string, unknown>,
    retried = false
  ): Promise<T> {
    await this.ensureAuthenticated();
    this.enforceRateLimit();

    const url = new URL(`${REX_BASE_ENDPOINT}${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }

    const res = await fetch(url.toString(), {
      method,
      headers: {
        "x-api-key": this.apiKey,
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (res.status === 401 && !retried) {
      this.accessToken = null;
      return this.request<T>(method, path, params, body, true);
    }

    if (res.status === 429) {
      const retryAfter = res.headers.get("Retry-After");
      const waitSeconds = retryAfter ? parseInt(retryAfter, 10) : 2;
      if (!retried) {
        await new Promise((resolve) =>
          setTimeout(resolve, waitSeconds * 1000)
        );
        return this.request<T>(method, path, params, body, true);
      }
      throw Object.assign(
        new Error(`Rate limit exceeded. Retry after ${waitSeconds}s.`),
        { status: 429 }
      );
    }

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw Object.assign(
        new Error(text || res.statusText),
        { status: res.status }
      );
    }

    return (await res.json()) as T;
  }

  async get<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("GET", path, params);
  }

  async put<T>(
    path: string,
    body: Record<string, unknown>,
    params?: Record<string, string>
  ): Promise<T> {
    return this.request<T>("PUT", path, params, body);
  }

  async getList<T>(
    path: string,
    params?: Record<string, string>
  ): Promise<PaginatedResponse<T>> {
    const raw = await this.get<Record<string, unknown>>(path, params);

    const data = Array.isArray(raw) ? raw : (raw as Record<string, unknown>)["data"] ?? raw;
    const totalRecords =
      typeof (raw as Record<string, unknown>)["total_records"] === "number"
        ? ((raw as Record<string, unknown>)["total_records"] as number)
        : Array.isArray(data)
          ? (data as T[]).length
          : 0;
    const pageNumber = parseInt(params?.["page_number"] ?? "1", 10);
    const pageSize = parseInt(params?.["page_size"] ?? "50", 10);

    const items = (Array.isArray(data) ? data : [data]) as T[];

    return {
      data: items,
      page_number: pageNumber,
      page_size: pageSize,
      total_records: totalRecords,
      has_more: pageNumber * pageSize < totalRecords,
    };
  }
}

let clientInstance: RexClient | null = null;

export function getRexClient(): RexClient {
  if (!clientInstance) {
    const apiKey = process.env.REX_API_KEY;
    if (!apiKey) {
      throw new Error(
        "REX_API_KEY environment variable is required. Generate one at REX Back Office > Settings > Integrations > API Management."
      );
    }
    clientInstance = new RexClient(apiKey);
  }
  return clientInstance;
}

export type { RexClient };
