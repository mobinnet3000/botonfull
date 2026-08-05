import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { StructuralMember } from '../types';

const structuralMembers = '/structural-members/';

export const structuralMemberApi = {
  list: listResource<StructuralMember>(structuralMembers),
  get: getResource<StructuralMember>(structuralMembers),
  create: createResource<StructuralMember, Partial<StructuralMember>>(structuralMembers),
  update: updateResource<StructuralMember>(structuralMembers),
  patch: patchResource<StructuralMember>(structuralMembers),
  remove: removeResource(structuralMembers),
  
  // Project-specific endpoints
  listByProject: (projectId: number, params?: Record<string, unknown>) => 
    listResource<StructuralMember>(structuralMembers)({
      ...params,
      project: projectId,
    }),
};
