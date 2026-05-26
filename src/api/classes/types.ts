import type { AvatarTone } from '@/constants/avatar';

export const CLASS_STATUSES = ['running', 'upcoming', 'ended'] as const;
export type ClassStatus = (typeof CLASS_STATUSES)[number];

export type ClassStatusFilter = ClassStatus | 'all';

export function isClassStatus(value: string | null | undefined): value is ClassStatus {
  return !!value && (CLASS_STATUSES as readonly string[]).includes(value);
}

export const STUDENT_STATUSES = ['on_track', 'at_risk', 'absent_x3'] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export type ClassRow = {
  id: string;
  name: string;
  courseId?: string;
  courseCode: string;
  courseTitle: string;
  location: string;
  teacherId?: string;
  teacherInitials: string;
  teacherShort: string;
  teacherTone: AvatarTone;
  schedule: string;
  enrolled: number;
  capacity: number;
  status: ClassStatus;
  currentSessionIndex?: number;
  totalSessions?: number;
};

export type ClassStudent = {
  id: string;
  classId: string;
  name: string;
  initials: string;
  tone: AvatarTone;
  grade: number;
  age: number;
  attendance: number;
  status: StudentStatus;
};

export type ClassAssignOption = {
  id: string;
  label: string;
  schedule: string;
  detail: string;
  enrolled: number;
  capacity: number;
  disabled?: boolean;
};

export type ClassStatusTab = {
  value: ClassStatusFilter;
  count: number;
};

export type ClassListParams = {
  status?: ClassStatus;
  search?: string;
};

export type ClassStats = {
  total: number;
  running: number;
  upcoming: number;
  ended: number;
};

export type DayScheduleInput = {
  day: string;
  startTime: string;
  endTime: string;
};

export type CreateClassInput = {
  courseId: string;
  label: string;
  teacherId: string;
  location: string;
  daySchedules: DayScheduleInput[];
  startDate: string;
  endDate: string;
  capacity: number;
  visibility: string;
};
