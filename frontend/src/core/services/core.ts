import { apiRequest } from '../api/client';
import type { Paginated } from '../types';

export interface ListParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: string | number | boolean | undefined;
}

function toParams(params?: ListParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (!params) return out;
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') out[key] = String(value);
  }
  return out;
}

export const listResource = <T>(resource: string) => (params?: ListParams) =>
  apiRequest<Paginated<T>>({ method: 'GET', url: resource, params: toParams(params) });

export const getResource = <T>(resource: string) => (id: number | string) =>
  apiRequest<T>({ method: 'GET', url: `${resource}${id}/` });

export const createResource = <T, P = Partial<T>>(resource: string) => (payload: P) =>
  apiRequest<T>({ method: 'POST', url: resource, data: payload });

export const updateResource = <T, P = Partial<T>>(resource: string) => (id: number, payload: P) =>
  apiRequest<T>({ method: 'PUT', url: `${resource}${id}/`, data: payload });

export const patchResource = <T, P = Partial<T>>(resource: string) => (id: number, payload: P) =>
  apiRequest<T>({ method: 'PATCH', url: `${resource}${id}/`, data: payload });

export const removeResource = (resource: string) => (id: number) =>
  apiRequest<{ detail?: string }>({ method: 'DELETE', url: `${resource}${id}/` });

export const actionResource =
  (resource: string) =>
  (id: number, action: string, method: 'post' | 'get' = 'post', data?: unknown) =>
    apiRequest<unknown>({
      method: method.toUpperCase(),
      url: `${resource}${id}/${action}/`,
      data,
    });

export const uploadResource = (resource: string) => (formData: FormData) =>
  apiRequest<unknown>({
    method: 'POST',
    url: resource,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
