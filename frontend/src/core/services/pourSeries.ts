import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { PourSeries } from '../types';

const pourSeries = '/pour-series/';

export const pourSeriesApi = {
  list: listResource<PourSeries>(pourSeries),
  get: getResource<PourSeries>(pourSeries),
  create: createResource<PourSeries, Partial<PourSeries>>(pourSeries),
  update: updateResource<PourSeries>(pourSeries),
  patch: patchResource<PourSeries>(pourSeries),
  remove: removeResource(pourSeries),
  
  // Structural member-specific endpoints
  listByMember: (memberId: number, params?: Record<string, unknown>) => 
    listResource<PourSeries>(pourSeries)({
      ...params,
      structural_member: memberId,
    }),
  
  // Project-specific endpoints
  listByProject: (projectId: number, params?: Record<string, unknown>) => 
    listResource<PourSeries>(pourSeries)({
      ...params,
      structural_member__project: projectId,
    }),
};
