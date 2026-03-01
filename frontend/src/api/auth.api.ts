import { apiClient } from './client';
import type {
  RegisterRequest,
  LoginRequest,
  GuestLoginRequest,
  AuthResponse,
  VerifyTokenResponse,
} from '../types';

export const authApi = {
  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/register', data).then((r) => r.data),

  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data).then((r) => r.data),

  guestLogin: (data: GuestLoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/guest', data).then((r) => r.data),

  verifyToken: (): Promise<VerifyTokenResponse> =>
    apiClient.get('/auth/verify').then((r) => r.data),
};
