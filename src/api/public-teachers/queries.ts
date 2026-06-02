import { queryOptions } from '@tanstack/react-query';
import { getPublicTeachers } from './service';

export const publicTeacherKeys = {
  all: ['public', 'teachers'] as const
};

export function publicTeachersOptions() {
  return queryOptions({
    queryKey: publicTeacherKeys.all,
    queryFn: getPublicTeachers,
    staleTime: 5 * 60 * 1000
  });
}
