export const CONSULTATION_STATUSES = ['new', 'contacted', 'enrolled', 'not_interested'] as const;
export type ConsultationStatus = (typeof CONSULTATION_STATUSES)[number];

export type ConsultationStatusFilter = ConsultationStatus | 'all';

export function isConsultationStatus(
  value: string | null | undefined
): value is ConsultationStatus {
  return !!value && (CONSULTATION_STATUSES as readonly string[]).includes(value);
}

export type ConsultationRequest = {
  id: string;
  parentName: string;
  parentPhone: string;
  childName?: string;
  interestedCourseId?: string;
  interestedCourseTitle?: string;
  note?: string;
  status: ConsultationStatus;
  createdAt: string;
  updatedAt?: string;
};

export type ConsultationListParams = {
  page: number;
  perPage: number;
  status?: ConsultationStatus;
  search?: string;
};

export type UpdateConsultationStatusInput = {
  status: ConsultationStatus;
};
