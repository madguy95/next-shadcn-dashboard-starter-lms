import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  applyClassLifecycleAction,
  createClass,
  getClassById,
  getClassStatusTabs,
  getClassStudents,
  getClasses,
  updateClass
} from './service';
import type {
  ClassListParams,
  CreateClassInput,
  LifecycleActionInput,
  UpdateClassInput
} from './types';

export const classKeys = {
  all: ['admin', 'classes'] as const,
  list: (params: ClassListParams) => [...classKeys.all, 'list', params] as const,
  detail: (id: string) => [...classKeys.all, 'detail', id] as const,
  students: (id: string) => [...classKeys.all, 'students', id] as const,
  statusTabs: () => [...classKeys.all, 'statusTabs'] as const
};

export function classListOptions(params: ClassListParams) {
  return queryOptions({
    queryKey: classKeys.list(params),
    queryFn: () => getClasses(params),
    placeholderData: keepPreviousData
  });
}

export function classDetailOptions(id: string) {
  return queryOptions({
    queryKey: classKeys.detail(id),
    queryFn: () => getClassById(id),
    enabled: !!id
  });
}

export function classStudentsOptions(id: string) {
  return queryOptions({
    queryKey: classKeys.students(id),
    queryFn: () => getClassStudents(id),
    enabled: !!id
  });
}

export function classStatusTabsOptions() {
  return queryOptions({
    queryKey: classKeys.statusTabs(),
    queryFn: getClassStatusTabs
  });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateClassInput) => createClass(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: classKeys.all });
    }
  });
}

export function useUpdateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClassInput }) => updateClass(id, input),
    onSuccess: (cls) => {
      queryClient.setQueryData(classKeys.detail(cls.id), cls);
      void queryClient.invalidateQueries({ queryKey: classKeys.all });
    }
  });
}

export function useClassLifecycleAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: LifecycleActionInput }) =>
      applyClassLifecycleAction(id, input),
    onSuccess: (cls) => {
      queryClient.setQueryData(classKeys.detail(cls.id), cls);
      void queryClient.invalidateQueries({ queryKey: classKeys.all });
    }
  });
}
