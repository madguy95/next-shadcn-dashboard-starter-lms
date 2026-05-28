import { queryOptions } from '@tanstack/react-query';
import { getMasterDataByType } from './service';
import type { MasterDataType } from './types';

export const masterDataKeys = {
  all: ['master-data'] as const,
  byType: (type: MasterDataType) => [...masterDataKeys.all, type] as const
};

export function masterDataOptions(type: MasterDataType) {
  return queryOptions({
    queryKey: masterDataKeys.byType(type),
    queryFn: () => getMasterDataByType(type),
    staleTime: 5 * 60 * 1000
  });
}
