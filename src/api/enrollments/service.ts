import type { AvatarTone } from '@/constants/avatar';
import { apiClient, apiClientPaged } from '@/lib/api-client';
import type { Paginated } from '../shared/types';
import type {
  ApproveEnrollmentInput,
  BulkActionInput,
  BulkActionResult,
  CreateEnrollmentInput,
  Enrollment,
  EnrollmentChannel,
  EnrollmentListParams,
  EnrollmentStatus,
  EnrollmentStatusTab,
  PaymentStatus,
  RejectEnrollmentInput,
  UpdatePaymentInput
} from './types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

type EnrollmentCourseDto = {
  id: number;
  code: string;
  title: string;
  totalSessions?: number;
  minAge?: number;
  maxAge?: number;
};

type EnrollmentClassDto = {
  id: number;
  name: string;
  label?: string;
  schedule?: string;
  enrolled: number;
  capacity: number;
};

type EnrollmentDto = {
  id: number;
  studentName: string;
  initials?: string;
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
  requestedCourse?: EnrollmentCourseDto;
  assignedClass?: EnrollmentClassDto;
  createdAt?: string;
  updatedAt?: string;
};

type EnrollmentStatusTabsDto = {
  all: number;
  pending: number;
  active: number;
  waitlist: number;
  rejected: number;
};

type BulkActionResultDto = {
  updated: number;
  skipped: number;
  updatedIds: number[];
  skippedIds: number[];
};

function pickTone(id: number): AvatarTone {
  const idx = ((id % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}

function deriveInitials(name: string): string {
  if (!name) return '··';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapCourseRef(c?: EnrollmentCourseDto): Enrollment['requestedCourse'] {
  if (!c) return undefined;
  return {
    id: String(c.id),
    code: c.code,
    title: c.title,
    totalSessions: c.totalSessions,
    minAge: c.minAge,
    maxAge: c.maxAge
  };
}

function mapClassRef(c?: EnrollmentClassDto): Enrollment['assignedClass'] {
  if (!c) return undefined;
  return {
    id: String(c.id),
    name: c.name,
    label: c.label,
    schedule: c.schedule,
    enrolled: c.enrolled ?? 0,
    capacity: c.capacity ?? 0
  };
}

function mapEnrollment(dto: EnrollmentDto): Enrollment {
  return {
    id: String(dto.id),
    studentName: dto.studentName,
    initials: dto.initials || deriveInitials(dto.studentName),
    tone: pickTone(dto.id),
    studentAge: dto.studentAge,
    studentGrade: dto.studentGrade,
    parentName: dto.parentName,
    parentPhone: dto.parentPhone,
    parentEmail: dto.parentEmail,
    note: dto.note,
    status: dto.status,
    channel: dto.channel,
    rejectionReason: dto.rejectionReason,
    paymentAmount: dto.paymentAmount,
    paymentStatus: dto.paymentStatus,
    submittedAt: dto.submittedAt,
    approvedAt: dto.approvedAt,
    waitlistedAt: dto.waitlistedAt,
    rejectedAt: dto.rejectedAt,
    requestedCourse: mapCourseRef(dto.requestedCourse),
    assignedClass: mapClassRef(dto.assignedClass),
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt
  };
}

function buildListQuery(params: EnrollmentListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('size', String(params.perPage));
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  return search.toString();
}

export async function getEnrollments(params: EnrollmentListParams): Promise<Paginated<Enrollment>> {
  const paged = await apiClientPaged<EnrollmentDto>(`/api/enrollments?${buildListQuery(params)}`);
  return {
    data: paged.data.map(mapEnrollment),
    total: paged.totalElements,
    pageCount: Math.max(1, paged.totalPages)
  };
}

export async function getEnrollmentById(id: string): Promise<Enrollment> {
  const dto = await apiClient<EnrollmentDto>(`/api/enrollments/${id}`);
  return mapEnrollment(dto);
}

export async function getEnrollmentStatusTabs(): Promise<EnrollmentStatusTab[]> {
  const dto = await apiClient<EnrollmentStatusTabsDto>('/api/enrollments/status-tabs');
  return [
    { value: 'all', count: dto.all },
    { value: 'pending', count: dto.pending },
    { value: 'active', count: dto.active },
    { value: 'waitlist', count: dto.waitlist },
    { value: 'rejected', count: dto.rejected }
  ];
}

export async function createEnrollment(input: CreateEnrollmentInput): Promise<Enrollment> {
  const body = {
    studentName: input.studentName.trim(),
    studentAge: input.studentAge,
    studentGrade: input.studentGrade,
    parentName: input.parentName.trim(),
    parentPhone: input.parentPhone?.trim() || undefined,
    parentEmail: input.parentEmail?.trim() || undefined,
    requestedCourseId: Number(input.requestedCourseId),
    note: input.note?.trim() || undefined,
    channel: input.channel ?? 'parent_app',
    paymentAmount: input.paymentAmount,
    paymentStatus: input.paymentStatus
  };
  const dto = await apiClient<EnrollmentDto>('/api/enrollments', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return mapEnrollment(dto);
}

export async function approveEnrollment(
  id: string,
  input: ApproveEnrollmentInput
): Promise<Enrollment> {
  const dto = await apiClient<EnrollmentDto>(`/api/enrollments/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ classId: Number(input.classId) })
  });
  return mapEnrollment(dto);
}

export async function waitlistEnrollment(id: string): Promise<Enrollment> {
  const dto = await apiClient<EnrollmentDto>(`/api/enrollments/${id}/waitlist`, {
    method: 'PATCH'
  });
  return mapEnrollment(dto);
}

export async function rejectEnrollment(
  id: string,
  input: RejectEnrollmentInput
): Promise<Enrollment> {
  const dto = await apiClient<EnrollmentDto>(`/api/enrollments/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason: input.reason.trim() })
  });
  return mapEnrollment(dto);
}

export async function updateEnrollmentPayment(
  id: string,
  input: UpdatePaymentInput
): Promise<Enrollment> {
  const body: { status: PaymentStatus; amount?: number } = { status: input.status };
  if (input.amount != null) body.amount = input.amount;
  const dto = await apiClient<EnrollmentDto>(`/api/enrollments/${id}/payment`, {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
  return mapEnrollment(dto);
}

export async function bulkActionEnrollments(input: BulkActionInput): Promise<BulkActionResult> {
  const body = {
    ids: input.ids.map(Number),
    action: input.action,
    classId: input.classId != null ? Number(input.classId) : undefined
  };
  const dto = await apiClient<BulkActionResultDto>('/api/enrollments/bulk', {
    method: 'PATCH',
    body: JSON.stringify(body)
  });
  return {
    updated: dto.updated,
    skipped: dto.skipped,
    updatedIds: dto.updatedIds.map(String),
    skippedIds: dto.skippedIds.map(String)
  };
}
