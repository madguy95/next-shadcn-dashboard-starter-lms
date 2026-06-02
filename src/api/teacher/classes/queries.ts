import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getTeacherClassesSummary } from './service';
import type { TeacherClassesParams } from './types';

export const teacherClassesKeys = {
  all: ['teacher', 'classes'] as const,
  summary: (params: TeacherClassesParams = {}) =>
    [...teacherClassesKeys.all, 'summary', params] as const
};

export function teacherClassesSummaryOptions(params: TeacherClassesParams = {}) {
  return queryOptions({
    queryKey: teacherClassesKeys.summary(params),
    queryFn: () => getTeacherClassesSummary(params),
    // keepPreviousData keeps the current classes visible while a status switch
    // streams in — the caller pairs this with LoadingOverlay(isFetching) instead
    // of letting useSuspenseQuery re-suspend to the skeleton.
    placeholderData: keepPreviousData
  });
}
