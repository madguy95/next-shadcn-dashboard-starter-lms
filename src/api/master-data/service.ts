import { apiClient } from '@/lib/api-client';
import type { MasterDataItem, MasterDataType } from './types';

export async function getMasterDataByType(type: MasterDataType): Promise<MasterDataItem[]> {
  return apiClient<MasterDataItem[]>(`/api/public/master-data?type=${encodeURIComponent(type)}`);
}
