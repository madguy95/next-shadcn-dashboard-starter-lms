import { apiClient } from '@/lib/api-client';
import type { ScheduleFilters, ScheduleMonth, ScheduleParams, ScheduleWeek } from './types';

function buildQuery(params: ScheduleParams): string {
  const qs = new URLSearchParams();
  if (params.anchor) qs.set('anchor', params.anchor);
  if (params.view) qs.set('view', params.view);
  if (params.teacherId) qs.set('teacherId', params.teacherId);
  if (params.classId) qs.set('classId', params.classId);
  if (params.location) qs.set('location', params.location);
  return qs.toString();
}

export async function getScheduleWeek(params: ScheduleParams = {}): Promise<ScheduleWeek> {
  const qs = buildQuery(params);
  const endpoint = qs ? `/api/admin/schedule?${qs}` : '/api/admin/schedule';
  return apiClient<ScheduleWeek>(endpoint);
}

export async function getScheduleMonth(params: ScheduleParams = {}): Promise<ScheduleMonth> {
  const qs = buildQuery({ ...params, view: 'month' });
  return apiClient<ScheduleMonth>(`/api/admin/schedule/month?${qs}`);
}

export async function getScheduleFilters(): Promise<ScheduleFilters> {
  return apiClient<ScheduleFilters>('/api/admin/schedule/filters');
}
