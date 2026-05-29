import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  approveEnrollment,
  bulkActionEnrollments,
  createEnrollment,
  getEnrollmentById,
  getEnrollmentStatusTabs,
  getEnrollments,
  rejectEnrollment,
  updateEnrollmentPayment,
  waitlistEnrollment
} from './service';
import { classKeys } from '@/api/classes/queries';
import type {
  ApproveEnrollmentInput,
  BulkActionInput,
  CreateEnrollmentInput,
  EnrollmentListParams,
  RejectEnrollmentInput,
  UpdatePaymentInput
} from './types';

export const enrollmentKeys = {
  all: ['admin', 'enrollments'] as const,
  list: (params: EnrollmentListParams) => [...enrollmentKeys.all, 'list', params] as const,
  detail: (id: string) => [...enrollmentKeys.all, 'detail', id] as const,
  statusTabs: () => [...enrollmentKeys.all, 'statusTabs'] as const
};

export function enrollmentListOptions(params: EnrollmentListParams) {
  return queryOptions({
    queryKey: enrollmentKeys.list(params),
    queryFn: () => getEnrollments(params),
    placeholderData: keepPreviousData
  });
}

export function enrollmentDetailOptions(id: string) {
  return queryOptions({
    queryKey: enrollmentKeys.detail(id),
    queryFn: () => getEnrollmentById(id),
    enabled: !!id
  });
}

export function enrollmentStatusTabsOptions() {
  return queryOptions({
    queryKey: enrollmentKeys.statusTabs(),
    queryFn: getEnrollmentStatusTabs
  });
}

// Status-mutating ops also touch class seat counters on the BE, so the class
// caches need to drop with the enrollment caches.
function invalidateEnrollmentCaches(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: enrollmentKeys.all });
  void queryClient.invalidateQueries({ queryKey: classKeys.all });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEnrollmentInput) => createEnrollment(input),
    onSuccess: () => invalidateEnrollmentCaches(queryClient)
  });
}

export function useApproveEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ApproveEnrollmentInput }) =>
      approveEnrollment(id, input),
    onSuccess: (enrollment) => {
      queryClient.setQueryData(enrollmentKeys.detail(enrollment.id), enrollment);
      invalidateEnrollmentCaches(queryClient);
    }
  });
}

export function useWaitlistEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => waitlistEnrollment(id),
    onSuccess: (enrollment) => {
      queryClient.setQueryData(enrollmentKeys.detail(enrollment.id), enrollment);
      invalidateEnrollmentCaches(queryClient);
    }
  });
}

export function useRejectEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RejectEnrollmentInput }) =>
      rejectEnrollment(id, input),
    onSuccess: (enrollment) => {
      queryClient.setQueryData(enrollmentKeys.detail(enrollment.id), enrollment);
      invalidateEnrollmentCaches(queryClient);
    }
  });
}

export function useUpdateEnrollmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePaymentInput }) =>
      updateEnrollmentPayment(id, input),
    onSuccess: (enrollment) => {
      queryClient.setQueryData(enrollmentKeys.detail(enrollment.id), enrollment);
      invalidateEnrollmentCaches(queryClient);
    }
  });
}

export function useBulkActionEnrollments() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkActionInput) => bulkActionEnrollments(input),
    onSuccess: () => invalidateEnrollmentCaches(queryClient)
  });
}
