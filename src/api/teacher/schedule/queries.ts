import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getTeacherScheduleWeek } from './service';
import type { TeacherScheduleParams } from './types';

export const teacherScheduleKeys = {
  all: ['teacher', 'schedule'] as const,
  week: (params: TeacherScheduleParams = {}) =>
    [...teacherScheduleKeys.all, 'week', params] as const
};

export function teacherScheduleWeekOptions(params: TeacherScheduleParams = {}) {
  return queryOptions({
    queryKey: teacherScheduleKeys.week(params),
    queryFn: () => getTeacherScheduleWeek(params),
    // keepPreviousData keeps the current week visible while navigating — paired
    // with LoadingOverlay(isFetching) instead of a Suspense fallback flash.
    placeholderData: keepPreviousData
  });
}
