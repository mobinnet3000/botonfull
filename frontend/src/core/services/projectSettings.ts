import { getResource, updateResource } from './core';
import type { ProjectSettings } from '../types';

const projectSettings = '/project-settings/';

export const projectSettingsApi = {
  get: (projectId: number) => 
    getResource<ProjectSettings>(`${projectSettings}${projectId}/`),
  update: (projectId: number, data: Partial<ProjectSettings>) => 
    updateResource<ProjectSettings>(`${projectSettings}${projectId}/`)(projectId, data),
};
