export const MASTER_DATA_TYPES = ['tool', 'subject', 'location', 'room'] as const;
export type MasterDataType = (typeof MASTER_DATA_TYPES)[number];

export type MasterDataItem = {
  id: number;
  type: MasterDataType;
  code: string;
  name: string;
  description?: string;
  position: number;
  active: boolean;
  metadata?: Record<string, unknown>;
};
