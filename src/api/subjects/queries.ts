import { queryOptions } from '@tanstack/react-query';
import { getSubjects } from './service';

export const subjectKeys = {
  all: ['subjects'] as const,
  list: () => [...subjectKeys.all, 'list'] as const
};

export function subjectsListOptions() {
  return queryOptions({
    queryKey: subjectKeys.list(),
    queryFn: getSubjects,
    staleTime: 5 * 60 * 1000
  });
}
