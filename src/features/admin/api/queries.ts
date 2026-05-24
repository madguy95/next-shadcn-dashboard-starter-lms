import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getTeacherCounts, getTeachers } from './service';
import type { TeacherListParams } from './types';

export const teacherKeys = {
  all: ['admin', 'teachers'] as const,
  list: (params: TeacherListParams) => [...teacherKeys.all, 'list', params] as const,
  counts: () => [...teacherKeys.all, 'counts'] as const
};

export function teacherListOptions(params: TeacherListParams) {
  return queryOptions({
    queryKey: teacherKeys.list(params),
    queryFn: () => getTeachers(params),
    // Keep previous page's data visible while fetching the next — enables overlay UX
    // instead of clearing the table on every page/filter change.
    placeholderData: keepPreviousData
  });
}

export function teacherCountsOptions() {
  return queryOptions({
    queryKey: teacherKeys.counts(),
    queryFn: getTeacherCounts
  });
}
