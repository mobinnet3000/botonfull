import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { useSnackbar } from 'notistack';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const TOKEN_KEY = 'nboton_token';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Token ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error: unknown, fallback = 'خطا در ارتباط با سرور'): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'عدم دسترسی به شبکه';
    const data = error.response.data as { error?: { message?: unknown } } | undefined;
    const message = data?.error?.message;
    if (typeof message === 'string') return message;
    if (message && typeof message === 'object') {
      const first = Object.values(message)[0];
      if (first && typeof first === 'string') return first;
    }
    if (error.response.status === 403) return 'شما به این عملیات دسترسی ندارید';
    if (error.response.status === 404) return 'موردی یافت نشد';
    if (error.response.status === 500) return 'خطای داخلی سرور';
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}

export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(response.data as Blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

export function useNotifyError() {
  const { enqueueSnackbar } = useSnackbar();
  return (error: unknown, fallback?: string) =>
    enqueueSnackbar(getErrorMessage(error, fallback), { variant: 'error' });
}
