import { apiClient, apiClientPaged } from '@/lib/api-client';
import type { Paginated } from '../shared/types';
import type {
  ConsultationListParams,
  ConsultationRequest,
  ConsultationStatus,
  UpdateConsultationStatusInput
} from './types';

type ConsultationRequestDto = {
  id: number;
  parentName: string;
  parentPhone: string;
  childName?: string;
  interestedCourseId?: number;
  interestedCourseTitle?: string;
  note?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt?: string;
};

function mapConsultationRequest(dto: ConsultationRequestDto): ConsultationRequest {
  return {
    id: String(dto.id),
    parentName: dto.parentName,
    parentPhone: dto.parentPhone,
    childName: dto.childName,
    interestedCourseId: dto.interestedCourseId != null ? String(dto.interestedCourseId) : undefined,
    interestedCourseTitle: dto.interestedCourseTitle,
    note: dto.note,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function buildListQuery(params: ConsultationListParams): string {
  const qs = new URLSearchParams();
  qs.set('page', String(params.page));
  qs.set('size', String(params.perPage));
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  return qs.toString();
}

export async function getConsultationRequests(
  params: ConsultationListParams
): Promise<Paginated<ConsultationRequest>> {
  const paged = await apiClientPaged<ConsultationRequestDto>(
    `/api/admin/consultation-requests?${buildListQuery(params)}`
  );
  return {
    data: paged.data.map(mapConsultationRequest),
    total: paged.totalElements,
    pageCount: Math.max(1, paged.totalPages)
  };
}

export async function getConsultationRequestById(id: string): Promise<ConsultationRequest> {
  const dto = await apiClient<ConsultationRequestDto>(`/api/admin/consultation-requests/${id}`);
  return mapConsultationRequest(dto);
}

export async function updateConsultationStatus(
  id: string,
  input: UpdateConsultationStatusInput
): Promise<ConsultationRequest> {
  const dto = await apiClient<ConsultationRequestDto>(
    `/api/admin/consultation-requests/${id}/status`,
    { method: 'PATCH', body: JSON.stringify({ status: input.status }) }
  );
  return mapConsultationRequest(dto);
}

export async function deleteConsultationRequest(id: string): Promise<void> {
  await apiClient<void>(`/api/admin/consultation-requests/${id}`, { method: 'DELETE' });
}
