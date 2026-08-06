import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import { apiRequest } from '../api/client';
import type { Project, ProjectSettings, AccountingData } from '../types';

const projects = '/projects/';

export const projectApi = {
  list: listResource<Project>(projects),
  get: getResource<Project>(projects),
  create: createResource<Project, Partial<Project>>(projects),
  update: updateResource<Project>(projects),
  patch: patchResource<Project>(projects),
  remove: removeResource(projects),
  updateSettings: (id: number, payload: Partial<ProjectSettings>) =>
    apiRequest<ProjectSettings>({ method: 'PATCH', url: `${projects}${id}/settings/`, data: payload }),
  accounting: (id: number) =>
    apiRequest<AccountingData>({ method: 'GET', url: `${projects}${id}/accounting/` }),
};
