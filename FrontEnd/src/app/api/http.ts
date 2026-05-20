export interface ApiErrorBody {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
}

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined>;
  retryOnUnauthorized?: boolean;
}

const ACCESS_TOKEN_KEY = 'timeflow.accessToken';
const DEFAULT_API_URL = 'http://localhost:3001/api';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? DEFAULT_API_URL;

export class ApiClientError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

function buildUrl(path: string, query?: ApiRequestOptions['query']): string {
  const url = new URL(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function createHeaders(body: unknown, headers?: HeadersInit): Headers {
  const requestHeaders = new Headers(headers);

  if (body !== undefined && !(body instanceof FormData) && !requestHeaders.has('Content-Type')) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  const token = getAccessToken();
  if (token && !requestHeaders.has('Authorization')) {
    requestHeaders.set('Authorization', `Bearer ${token}`);
  }

  return requestHeaders;
}

async function parseError(response: Response): Promise<ApiClientError> {
  let payload: ApiErrorBody | undefined;

  try {
    payload = await response.json();
  } catch {
    payload = undefined;
  }

  const code = payload?.error?.code ?? 'REQUEST_ERROR';
  const message = payload?.error?.message ?? `Request failed with status ${response.status}`;

  return new ApiClientError(response.status, code, message, payload?.error?.details);
}

export async function refreshAccessToken(): Promise<string> {
  const response = await fetch(buildUrl('/auth/refresh'), {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    clearAccessToken();
    throw await parseError(response);
  }

  const data = (await response.json()) as { accessToken: string };
  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { body, query, retryOnUnauthorized = true, ...init } = options;
  const response = await fetch(buildUrl(path, query), {
    ...init,
    credentials: 'include',
    headers: createHeaders(body, init.headers),
    body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401 && retryOnUnauthorized && getAccessToken()) {
    await refreshAccessToken();
    return apiRequest<T>(path, { ...options, retryOnUnauthorized: false });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
