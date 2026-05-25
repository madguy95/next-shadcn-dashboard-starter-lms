import type { AvatarTone } from '../data';

export const TEACHER_STATUSES = ['active', 'on_leave', 'pending'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export function isTeacherStatus(value: string | null | undefined): value is TeacherStatus {
  return !!value && (TEACHER_STATUSES as readonly string[]).includes(value);
}

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  tone: AvatarTone;
  subjects: string[];
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

export type Paginated<T> = {
  data: T[];
  total: number;
  pageCount: number;
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
  avatar?: File;
};

export type UpdateTeacherInput = Omit<CreateTeacherInput, 'sendOnboardingEmail'>;
