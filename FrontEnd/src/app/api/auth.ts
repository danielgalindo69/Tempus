import { apiRequest, clearAccessToken, setAccessToken } from './http';
import type { AuthResponse, BackendUser } from './types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
    retryOnUnauthorized: false,
  });
  setAccessToken(response.accessToken);
  return response;
}

export async function register(name: string, email: string, password: string): Promise<AuthResponse> {
  const response = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: { name, email, password },
    retryOnUnauthorized: false,
  });
  setAccessToken(response.accessToken);
  return response;
}

export async function logout(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST', retryOnUnauthorized: false });
  } finally {
    clearAccessToken();
  }
}

export async function getCurrentUser(): Promise<BackendUser> {
  const response = await apiRequest<{ user: BackendUser }>('/users/me');
  return response.user;
}
