import type { AvatarTone } from '@/constants/avatar';

export const TEACHER_STATUSES = ['active', 'on_leave', 'pending'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export function isTeacherStatus(value: string | null | undefined): value is TeacherStatus {
  return !!value && (TEACHER_STATUSES as readonly string[]).includes(value);
}

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export type TeacherSubjectRef = {
  id: number;
  name: string;
  primary: boolean;
};

export type Teacher = {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone: string;
  initials: string;
  tone: AvatarTone;
  subjects: string[];
  subjectsRaw: TeacherSubjectRef[];
  classCount: number;
  studentCount: number;
  rating: number;
  status: TeacherStatus;
  gender?: Gender;
  dateOfBirth?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
};

export type TeacherStatusFilter = TeacherStatus | 'all';

export type TeacherStatusTab = {
  value: TeacherStatusFilter;
  count: number;
};

export type TeacherListParams = {
  page: number;
  perPage: number;
  status?: TeacherStatus;
  search?: string;
};

export type CreateTeacherInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primarySubject: string;
  location: string;
  tags: string[];
  sendOnboardingEmail: boolean;
  gender: Gender;
  dateOfBirth: string;
  // Raw File chosen in the form. The service layer uploads it via /api/files/upload/teacher-avatar
  // and forwards the resulting URL to the create endpoint — callers never need to pre-upload.
  avatar?: File;
};

export type UpdateTeacherInput = Omit<CreateTeacherInput, 'sendOnboardingEmail'>;
