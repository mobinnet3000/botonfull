import { apiRequest } from '../api/client';
import { listResource, getResource, createResource, updateResource, patchResource, removeResource } from './core';
import type { CalendarSchedule, Transaction } from '../types';

export const calendarApi = {
  schedule: (params: { from?: string; to?: string } = {}) =>
    apiRequest<CalendarSchedule>({ method: 'GET', url: '/calendar/schedule/', params }),
};

const transactions = '/transactions/';

export const transactionApi = {
  list: listResource<Transaction>(transactions),
  get: getResource<Transaction>(transactions),
  create: createResource<Transaction, Partial<Transaction>>(transactions),
  update: updateResource<Transaction>(transactions),
  patch: patchResource<Transaction>(transactions),
  remove: removeResource(transactions),
};
