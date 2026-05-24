import type { AvatarTone } from '../data';

export type TeacherStatus = 'active' | 'on_leave' | 'pending';

export type Teacher = {
  id: string;
  name: string;
  email: string;
  initials: string;
  tone: AvatarTone;
  subjects: string[];
  classCount: number;
  studentCount: number;
  rating: number;
  status: TeacherStatus;
};

export type TeacherCounts = {
  all: number;
  active: number;
  on_leave: number;
  pending: number;
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
