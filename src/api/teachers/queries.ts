import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeacher,
  getTeacherOptions,
  getTeacherStatusTabs,
  getTeachers,
  updateTeacher,
  type TeacherOptionsParams
} from './service';
import type { CreateTeacherInput, TeacherListParams, UpdateTeacherInput } from './types';

export const teacherKeys = {
  all: ['admin', 'teachers'] as const,
  list: (params: TeacherListParams) => [...teacherKeys.all, 'list', params] as const,
  options: (params: TeacherOptionsParams) => [...teacherKeys.all, 'options', params] as const,
  statusTabs: () => [...teacherKeys.all, 'statusTabs'] as const
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

export function teacherOptionsQuery(params: TeacherOptionsParams = {}) {
  return queryOptions({
    queryKey: teacherKeys.options(params),
    queryFn: () => getTeacherOptions(params),
    placeholderData: keepPreviousData
  });
}

export function teacherStatusTabsOptions() {
  return queryOptions({
    queryKey: teacherKeys.statusTabs(),
    queryFn: getTeacherStatusTabs
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTeacherInput) => createTeacher(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    }
  });
}

export function useUpdateTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeacherInput }) =>
      updateTeacher(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    }
  });
}
