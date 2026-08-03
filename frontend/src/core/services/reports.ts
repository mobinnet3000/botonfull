import { apiRequest } from '../api/client';
import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { Report, ReportRevision } from '../types';

const reports = '/reports/';

export const reportApi = {
  list: listResource<Report>(reports),
  get: getResource<Report>(reports),
  create: createResource<Report, Partial<Report>>(reports),
  update: updateResource<Report>(reports),
  patch: patchResource<Report>(reports),
  remove: removeResource(reports),
  review: (id: number) => apiRequest<Report>({ method: 'POST', url: `reports/${id}/review/` }),
  approve: (id: number) => apiRequest<Report>({ method: 'POST', url: `reports/${id}/approve/` }),
  reject: (id: number) => apiRequest<Report>({ method: 'POST', url: `reports/${id}/reject/` }),
  revisions: (id: number) =>
    apiRequest<ReportRevision[]>({ method: 'GET', url: `reports/${id}/revisions/` }),
  pdf: (id: number) => `reports/${id}/pdf/`,
};