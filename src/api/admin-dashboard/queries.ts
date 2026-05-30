import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getAdminDashboardSummary } from './service';
import type { DashboardSummaryParams } from './types';

export const adminDashboardKeys = {
  all: ['admin', 'dashboard'] as const,
  summary: (params: DashboardSummaryParams = {}) =>
    [...adminDashboardKeys.all, 'summary', params] as const
};

export function adminDashboardSummaryOptions(params: DashboardSummaryParams = {}) {
  return queryOptions({
    queryKey: adminDashboardKeys.summary(params),
    queryFn: () => getAdminDashboardSummary(params),
    // keepPreviousData stops useSuspenseQuery from re-suspending when the
    // period changes — the previous snapshot stays visible while the new one
    // streams in, and the caller pairs this with LoadingOverlay(isFetching).
    placeholderData: keepPreviousData
  });
}
