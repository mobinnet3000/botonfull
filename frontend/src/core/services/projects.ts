import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { Project } from '../types';

const projects = '/projects/';

export const projectApi = {
  list: listResource<Project>(projects),
  get: getResource<Project>(projects),
  create: createResource<Project, Partial<Project>>(projects),
  update: updateResource<Project>(projects),
  patch: patchResource<Project>(projects),
  remove: removeResource(projects),
};
