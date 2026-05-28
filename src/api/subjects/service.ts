import { apiClient } from '@/lib/api-client';
import type { Subject } from './types';

export async function getSubjects(): Promise<Subject[]> {
  return apiClient<Subject[]>('/api/subjects');
}
