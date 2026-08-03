import { apiRequest } from '../api/client';
import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { Sample, ActivityLog } from '../types';

const samples = '/samples/';

export const sampleApi = {
  list: listResource<Sample>(samples),
  get: getResource<Sample>(samples),
  create: createResource<Sample, Partial<Sample>>(samples),
  update: updateResource<Sample>(samples),
  patch: patchResource<Sample>(samples),
  remove: removeResource(samples),
  history: (id: number) => apiRequest<ActivityLog[]>({ method: 'GET', url: `samples/${id}/history/` }),
};
