import { apiRequest } from '../api/client';
import { listResource, getResource } from './core';
import type { AppNotification, AppFile, ActivityLog, AdminUser, DashboardStats, QcAnalysis } from '../types';

export const notificationApi = {
  list: listResource<AppNotification>('/notifications/'),
  read: (id: number) => apiRequest<unknown>({ method: 'POST', url: `notifications/${id}/read/` }),
  readAll: () => apiRequest<unknown>({ method: 'POST', url: 'notifications/read_all/' }),
};

export const fileApi = {
  list: listResource<AppFile>('/files/'),
  upload: (formData: FormData) =>
    apiRequest<AppFile>({
      method: 'POST',
      url: 'files/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  remove: (id: number) => apiRequest<unknown>({ method: 'DELETE', url: `files/${id}/` }),
};

export const activityApi = {
  list: listResource<ActivityLog>('/activity-logs/'),
};

export const userApi = {
  list: listResource<import('../types').AdminUser>('/users/'),
  create: (payload: Partial<import('../types').AdminUser> & { password?: string }) =>
    apiRequest<import('../types').AdminUser>({ method: 'POST', url: 'users/', data: payload }),
  update: (id: number, payload: Record<string, unknown>) =>
    apiRequest<import('../types').AdminUser>({ method: 'PATCH', url: `users/${id}/`, data: payload }),
  remove: (id: number) => apiRequest<unknown>({ method: 'DELETE', url: `users/${id}/` }),
};

export const dashboardApi = {
  stats: () => apiRequest<DashboardStats>({ method: 'GET', url: 'dashboard/' }),
};

export const qcApi = {
  analysis: (sample: number, testType?: number) =>
    apiRequest<QcAnalysis>({
      method: 'GET',
      url: 'qc/analysis/',
      params: { sample, test_type: testType },
    }),
};

export const profileApi = {
  getList: listResource<never>('/profiles/'),
  update: (id: number, payload: Record<string, unknown>) =>
    apiRequest<never>({ method: 'PUT', url: `profiles/${id}/`, data: payload }),
};

export const ticketApi = {
  list: listResource<import('../types').Ticket>('/tickets/'),
  create: (payload: { title: string; priority?: string }) =>
    apiRequest<import('../types').Ticket>({ method: 'POST', url: 'tickets/', data: payload }),
  message: (payload: { ticket: number; message: string }) =>
    apiRequest<unknown>({ method: 'POST', url: 'ticket-messages/', data: payload }),
};