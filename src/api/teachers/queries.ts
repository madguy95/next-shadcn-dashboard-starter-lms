import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createTeacher,
  deleteTeacher,
  getTeacherOptions,
  getTeacherStatusTabs,
  getTeachers,
  updateTeacher,
  updateTeacherStatus,
  type TeacherOptionsParams
} from './service';
import type {
  CreateTeacherInput,
  TeacherListParams,
  TeacherStatus,
  UpdateTeacherInput
} from './types';

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
    mutationFn: ({ id, input }: { id: number; input: UpdateTeacherInput }) =>
      updateTeacher(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    }
  });
}

export function useUpdateTeacherStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: TeacherStatus }) =>
      updateTeacherStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    }
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTeacher(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: teacherKeys.all });
    }
  });
}
