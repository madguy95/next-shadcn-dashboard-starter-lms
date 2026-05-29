import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getScheduleFilters, getScheduleMonth, getScheduleWeek } from './service';
import type { ScheduleParams } from './types';

export const scheduleKeys = {
  all: ['admin', 'schedule'] as const,
  week: (params: ScheduleParams) => [...scheduleKeys.all, 'week', params] as const,
  month: (params: ScheduleParams) => [...scheduleKeys.all, 'month', params] as const,
  filters: () => [...scheduleKeys.all, 'filters'] as const
};

export function scheduleWeekOptions(params: ScheduleParams = {}) {
  return queryOptions({
    queryKey: scheduleKeys.week(params),
    queryFn: () => getScheduleWeek(params),
    placeholderData: keepPreviousData
  });
}

export function scheduleMonthOptions(params: ScheduleParams = {}) {
  return queryOptions({
    queryKey: scheduleKeys.month(params),
    queryFn: () => getScheduleMonth(params),
    placeholderData: keepPreviousData
  });
}

export function scheduleFiltersOptions() {
  return queryOptions({
    queryKey: scheduleKeys.filters(),
    queryFn: getScheduleFilters
  });
}
