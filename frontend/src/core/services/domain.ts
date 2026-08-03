import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type {
  LabRequest,
  TestExecution,
  Equipment,
  MaintenanceRecord,
  CuringTank,
  CuringRecord,
} from '../types';

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