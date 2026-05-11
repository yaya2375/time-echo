import http from './http';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@time-echo/shared';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await http.post('/auth/login', data);
  return res.data.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await http.post('/auth/register', data);
  return res.data.data;
}

export async function getMe() {
  const res = await http.get('/auth/me');
  return res.data.data;
}
