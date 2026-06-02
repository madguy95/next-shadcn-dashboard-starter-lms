import { apiClient } from '@/lib/api-client';
import type { ChangePasswordInput } from './types';

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient('/api/user/change-password', {
    method: 'PUT',
    body: JSON.stringify(input)
  });
}
