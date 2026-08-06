import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import { apiRequest } from '../api/client';
import type {
  LabRequest,
  TestExecution,
  Equipment,
  MaintenanceRecord,
  CuringTank,
  CuringRecord,
  SamplingSeries,
  Mold,
  SamplingSeriesPhoto,
  StructuralMember,
  PourSeries,
} from '../types';

export const structuralMemberApi = {
  list: listResource<StructuralMember>('/structural-members/'),
  get: getResource<StructuralMember>('/structural-members/'),
  create: createResource<StructuralMember, Partial<StructuralMember>>('/structural-members/'),
  update: updateResource<StructuralMember>('/structural-members/'),
  patch: patchResource<StructuralMember>('/structural-members/'),
  remove: removeResource('/structural-members/'),
};

export const pourSeriesApi = {
  list: listResource<PourSeries>('/pour-series/'),
  get: getResource<PourSeries>('/pour-series/'),
  create: createResource<PourSeries, Partial<PourSeries>>('/pour-series/'),
  update: updateResource<PourSeries>('/pour-series/'),
  patch: patchResource<PourSeries>('/pour-series/'),
  remove: removeResource('/pour-series/'),
};

export const seriesApi = {
  list: listResource<SamplingSeries>('/series/'),
  get: getResource<SamplingSeries>('/series/'),
  create: createResource<SamplingSeries, Partial<SamplingSeries>>('/series/'),
  update: updateResource<SamplingSeries>('/series/'),
  patch: patchResource<SamplingSeries>('/series/'),
  remove: removeResource('/series/'),
};

export const seriesPhotoApi = {
  create: (formData: FormData) =>
    apiRequest<SamplingSeriesPhoto>({
      method: 'POST',
      url: 'series-photos/',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export const moldApi = {
  list: listResource<Mold>('/molds/'),
  get: getResource<Mold>('/molds/'),
  update: updateResource<Mold>('/molds/'),
  patch: patchResource<Mold>('/molds/'),
  remove: removeResource('/molds/'),
  registerResult: (id: number, payload: Record<string, unknown>) =>
    apiRequest<Mold>({ method: 'POST', url: `/molds/${id}/register_result/`, data: payload }),
  registerResultForm: (id: number, formData: FormData) =>
    apiRequest<Mold>({
      method: 'POST',
      url: `/molds/${id}/register_result/`,
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  bulkUpdate: (payload: { ids: number[]; status?: string; priority?: string; technician?: number }) =>
    apiRequest<{ updated: number }>({ method: 'POST', url: '/molds/bulk_update/', data: payload }),
  assign: (payload: { ids: number[]; technician: number }) =>
    apiRequest<{ updated: number }>({ method: 'POST', url: '/molds/assign/', data: payload }),
};

export const requestApi = {
  list: listResource<LabRequest>('/lab-requests/'),
  get: getResource<LabRequest>('/lab-requests/'),
  create: createResource<LabRequest, Partial<LabRequest>>('/lab-requests/'),
  update: updateResource<LabRequest>('/lab-requests/'),
  patch: patchResource<LabRequest>('/lab-requests/'),
  remove: removeResource('/lab-requests/'),
};

export const testExecutionApi = {
  list: listResource<TestExecution>('/test-executions/'),
  get: getResource<TestExecution>('/test-executions/'),
  create: createResource<TestExecution, Partial<TestExecution>>('/test-executions/'),
  update: updateResource<TestExecution>('/test-executions/'),
  patch: patchResource<TestExecution>('/test-executions/'),
  remove: removeResource('/test-executions/'),
  approve: (id: number) => import('../api/client').then(({ apiRequest }) =>
    apiRequest<TestExecution>({ method: 'POST', url: `test-executions/${id}/approve/` })),
  reject: (id: number) => import('../api/client').then(({ apiRequest }) =>
    apiRequest<TestExecution>({ method: 'POST', url: `test-executions/${id}/reject/` })),
};

export const equipmentApi = {
  list: listResource<Equipment>('/equipment/'),
  get: getResource<Equipment>('/equipment/'),
  create: createResource<Equipment, Partial<Equipment>>('/equipment/'),
  update: updateResource<Equipment>('/equipment/'),
  patch: patchResource<Equipment>('/equipment/'),
  remove: removeResource('/equipment/'),
};

export const maintenanceApi = {
  list: listResource<MaintenanceRecord>('/maintenance-records/'),
  create: createResource<MaintenanceRecord, Partial<MaintenanceRecord>>('/maintenance-records/'),
  update: updateResource<MaintenanceRecord>('/maintenance-records/'),
  patch: patchResource<MaintenanceRecord>('/maintenance-records/'),
  remove: removeResource('/maintenance-records/'),
};

export const curingTankApi = {
  list: listResource<CuringTank>('/curing-tanks/'),
  create: createResource<CuringTank, Partial<CuringTank>>('/curing-tanks/'),
  update: updateResource<CuringTank>('/curing-tanks/'),
  patch: patchResource<CuringTank>('/curing-tanks/'),
  remove: removeResource('/curing-tanks/'),
};

export const curingRecordApi = {
  list: listResource<CuringRecord>('/curing-records/'),
  create: createResource<CuringRecord, Partial<CuringRecord>>('/curing-records/'),
  update: updateResource<CuringRecord>('/curing-records/'),
  patch: patchResource<CuringRecord>('/curing-records/'),
  remove: removeResource('/curing-records/'),
};