import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { Client, Factory, SampleType, TestType, AcceptanceCriteria } from '../types';

export const clientApi = {
  list: listResource<Client>('/clients/'),
  get: getResource<Client>('/clients/'),
  create: createResource<Client, Partial<Client>>('/clients/'),
  update: updateResource<Client>('/clients/'),
  patch: patchResource<Client>('/clients/'),
  remove: removeResource('/clients/'),
};

export const factoryApi = {
  list: listResource<Factory>('/factories/'),
  get: getResource<Factory>('/factories/'),
  create: createResource<Factory, Partial<Factory>>('/factories/'),
  update: updateResource<Factory>('/factories/'),
  patch: patchResource<Factory>('/factories/'),
  remove: removeResource('/factories/'),
};

export const sampleTypeApi = {
  list: listResource<SampleType>('/sample-types/'),
  create: createResource<SampleType, Partial<SampleType>>('/sample-types/'),
  update: updateResource<SampleType>('/sample-types/'),
  patch: patchResource<SampleType>('/sample-types/'),
  remove: removeResource('/sample-types/'),
};

export const testTypeApi = {
  list: listResource<TestType>('/test-types/'),
  create: createResource<TestType, Partial<TestType>>('/test-types/'),
  update: updateResource<TestType>('/test-types/'),
  patch: patchResource<TestType>('/test-types/'),
  remove: removeResource('/test-types/'),
};

export const criteriaApi = {
  list: listResource<AcceptanceCriteria>('/acceptance-criteria/'),
  create: createResource<AcceptanceCriteria, Partial<AcceptanceCriteria>>('/acceptance-criteria/'),
  update: updateResource<AcceptanceCriteria>('/acceptance-criteria/'),
  patch: patchResource<AcceptanceCriteria>('/acceptance-criteria/'),
  remove: removeResource('/acceptance-criteria/'),
};
