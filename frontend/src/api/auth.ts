import api from '../lib/api';
import type { ApiResponse, User } from '../types';

export async function register(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', payload);
  if (!data.success || !data.data) throw new Error(data.error || 'Registration failed');
  return data.data;
}

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', payload);
  if (!data.success || !data.data) throw new Error(data.error || 'Login failed');
  return data.data;
}

export async function me() {
  const { data } = await api.get<ApiResponse<User>>('/auth/me');
  if (!data.success || !data.data) throw new Error(data.error || 'Unable to fetch profile');
  return data.data;
}
