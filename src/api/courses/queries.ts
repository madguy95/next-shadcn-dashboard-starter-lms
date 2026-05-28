import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCourse,
  deleteCourse,
  duplicateCourse,
  getCourseById,
  getCourseToolTabs,
  getCourses,
  getPublicCourseById,
  getPublicCourses,
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
  toolTabs: () => [...courseKeys.all, 'toolTabs'] as const,
  // Separate key space — public list lives outside the 'admin' subtree so admin
  // mutations don't accidentally invalidate the unauthenticated landing/enrollment query
  // (different endpoint, different shape, different cache lifetime).
  publicList: (limit: number) => ['public', 'courses', { limit }] as const,
  publicDetail: (id: string) => ['public', 'courses', 'detail', id] as const
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

export function courseToolTabsOptions() {
  return queryOptions({
    queryKey: courseKeys.toolTabs(),
    queryFn: getCourseToolTabs
  });
}

export function publicCoursesOptions(limit = 24) {
  return queryOptions({
    queryKey: courseKeys.publicList(limit),
    queryFn: () => getPublicCourses(limit),
    // Marketing/enrollment data doesn't change minute-to-minute; cache for 5 min so navigating
    // home → enrollment → back doesn't refetch.
    staleTime: 5 * 60 * 1000
  });
}

export function publicCourseDetailOptions(id: string | number | null | undefined) {
  // Stable string key + guard against opening the detail sheet before an id is known.
  const key = id == null ? '' : String(id);
  return queryOptions({
    queryKey: courseKeys.publicDetail(key),
    queryFn: () => getPublicCourseById(key),
    enabled: !!key,
    staleTime: 5 * 60 * 1000
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
