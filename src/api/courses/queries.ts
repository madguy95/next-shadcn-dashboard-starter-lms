import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  deleteCourse,
  duplicateCourse,
  getCourseById,
  getCourseCategoryTabs,
  getCourses,
  setCourseStatus,
  updateCourse
} from './service';
import type {
  CourseListParams,
  CourseStatus,
  CreateCourseInput,
  DuplicateCourseInput,
  UpdateCourseInput
} from './types';

export const courseKeys = {
  all: ['admin', 'courses'] as const,
  list: (params: CourseListParams) => [...courseKeys.all, 'list', params] as const,
  detail: (id: string) => [...courseKeys.all, 'detail', id] as const,
  categoryTabs: () => [...courseKeys.all, 'categoryTabs'] as const
};

export function courseListOptions(params: CourseListParams) {
  return queryOptions({
    queryKey: courseKeys.list(params),
    queryFn: () => getCourses(params),
    placeholderData: keepPreviousData
  });
}

export function courseDetailOptions(id: string) {
  return queryOptions({
    queryKey: courseKeys.detail(id),
    queryFn: () => getCourseById(id),
    enabled: !!id
  });
}

export function courseCategoryTabsOptions() {
  return queryOptions({
    queryKey: courseKeys.categoryTabs(),
    queryFn: getCourseCategoryTabs
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCourseInput) => createCourse(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCourseInput }) =>
      updateCourse(id, input),
    onSuccess: (course) => {
      queryClient.setQueryData(courseKeys.detail(course.id), course);
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourse(id),
    onSuccess: ({ id }) => {
      queryClient.removeQueries({ queryKey: courseKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

export function useDuplicateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input?: DuplicateCourseInput }) =>
      duplicateCourse(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}

export function useSetCourseStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: CourseStatus }) =>
      setCourseStatus(id, status),
    onSuccess: (course) => {
      queryClient.setQueryData(courseKeys.detail(course.id), course);
      void queryClient.invalidateQueries({ queryKey: courseKeys.all });
    }
  });
}
