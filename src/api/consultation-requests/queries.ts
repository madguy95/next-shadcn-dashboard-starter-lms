import { keepPreviousData, queryOptions, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  deleteConsultationRequest,
  getConsultationRequestById,
  getConsultationRequests,
  updateConsultationStatus
} from './service';
import type { ConsultationListParams, UpdateConsultationStatusInput } from './types';

export const consultationKeys = {
  all: ['admin', 'consultation-requests'] as const,
  list: (params: ConsultationListParams) => [...consultationKeys.all, 'list', params] as const,
  detail: (id: string) => [...consultationKeys.all, 'detail', id] as const
};

export function consultationListOptions(params: ConsultationListParams) {
  return queryOptions({
    queryKey: consultationKeys.list(params),
    queryFn: () => getConsultationRequests(params),
    placeholderData: keepPreviousData
  });
}

export function consultationDetailOptions(id: string) {
  return queryOptions({
    queryKey: consultationKeys.detail(id),
    queryFn: () => getConsultationRequestById(id),
    enabled: !!id
  });
}

export function useUpdateConsultationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateConsultationStatusInput }) =>
      updateConsultationStatus(id, input),
    onSuccess: (req) => {
      queryClient.setQueryData(consultationKeys.detail(req.id), req);
      void queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    }
  });
}

export function useDeleteConsultationRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteConsultationRequest(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: consultationKeys.all });
    }
  });
}
