import { useQuery } from '@tanstack/react-query';
import type { ListParams } from '../services/core';
import type { Paginated } from '../types';

export function useListQuery<T>(
  key: string[],
  fetcher: (params?: ListParams) => Promise<Paginated<T>>,
  params?: ListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: [...key, params],
    queryFn: () => fetcher(params),
    enabled,
  });
}