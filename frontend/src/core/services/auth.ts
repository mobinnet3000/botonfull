import { apiRequest } from '../api/client';
import type { FullUserData, LoginRequest, LoginResponse, RegisterRequest, User } from '../types';

export const authApi = {
  login: (payload: LoginRequest) =>
    apiRequest<LoginResponse>({ method: 'POST', url: 'login/', data: payload }),

  register: (payload: RegisterRequest) =>
    apiRequest<User>({ method: 'POST', url: 'register/', data: payload }),

  fullData: () => apiRequest<FullUserData>({ method: 'GET', url: 'full-data/' }),
};
