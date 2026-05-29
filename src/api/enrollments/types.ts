import type { AvatarTone } from '@/constants/avatar';

export const ENROLLMENT_STATUSES = ['pending', 'active', 'waitlist', 'rejected'] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];

export type EnrollmentStatusFilter = EnrollmentStatus | 'all';

export function isEnrollmentStatus(value: string | null | undefined): value is EnrollmentStatus {
  return !!value && (ENROLLMENT_STATUSES as readonly string[]).includes(value);
}

export const ENROLLMENT_CHANNELS = ['parent_app', 'website', 'referral'] as const;
export type EnrollmentChannel = (typeof ENROLLMENT_CHANNELS)[number];

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'partial'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const BULK_ACTIONS = ['approve', 'waitlist'] as const;
export type BulkAction = (typeof BULK_ACTIONS)[number];

export type EnrollmentCourseRef = {
  id: string;
  code: string;
  title: string;
  totalSessions?: number;
  minAge?: number;
  maxAge?: number;
};

export type EnrollmentClassRef = {
  id: string;
  name: string;
  label?: string;
  schedule?: string;
  enrolled: number;
  capacity: number;
};

export type Enrollment = {
  id: string;
  studentName: string;
  initials: string;
  tone: AvatarTone;
  studentAge?: number;
  studentGrade?: number;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  note?: string;
  status: EnrollmentStatus;
  channel: EnrollmentChannel;
  rejectionReason?: string;
  paymentAmount?: number;
  paymentStatus?: PaymentStatus;
  submittedAt?: string;
  approvedAt?: string;
  waitlistedAt?: string;
  rejectedAt?: string;
  requestedCourse?: EnrollmentCourseRef;
  assignedClass?: EnrollmentClassRef;
  createdAt?: string;
  updatedAt?: string;
};

export type EnrollmentStatusTab = {
  value: EnrollmentStatusFilter;
  count: number;
};

export type EnrollmentListParams = {
  page: number;
  perPage: number;
  status?: EnrollmentStatus;
  search?: string;
};

export type CreateEnrollmentInput = {
  studentName: string;
  studentAge?: number;
  studentGrade?: number;
  parentName: string;
  parentPhone?: string;
  parentEmail?: string;
  requestedCourseId: string;
  note?: string;
  channel?: EnrollmentChannel;
  paymentAmount?: number;
  paymentStatus?: PaymentStatus;
};

export type ApproveEnrollmentInput = {
  classId: string;
};

export type RejectEnrollmentInput = {
  reason: string;
};

export type UpdatePaymentInput = {
  status: PaymentStatus;
  // Omit to keep the existing amount untouched.
  amount?: number;
};

export type BulkActionInput = {
  ids: string[];
  action: BulkAction;
  classId?: string;
};

export type BulkActionResult = {
  updated: number;
  skipped: number;
  updatedIds: string[];
  skippedIds: string[];
};
