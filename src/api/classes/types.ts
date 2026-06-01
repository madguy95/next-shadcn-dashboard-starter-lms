import type { AvatarTone } from '@/constants/avatar';

// Stored, admin-controlled lifecycle. Only this value is mutable through the
// lifecycle endpoint — derived display status (open/full/ongoing/completed)
// is computed by the BE from lifecycle + dates + capacity.
export const CLASS_LIFECYCLE_STATUSES = ['draft', 'published', 'unpublished', 'cancelled'] as const;
export type ClassLifecycleStatus = (typeof CLASS_LIFECYCLE_STATUSES)[number];

// Display status the UI renders and filters on. Returned by BE in `status`.
// `open`/`full`/`ongoing`/`completed` collapse from `lifecycle = published`.
export const CLASS_STATUSES = [
  'draft',
  'open',
  'full',
  'ongoing',
  'completed',
  'unpublished',
  'cancelled'
] as const;
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
  label?: string;
  courseId?: string;
  courseCode: string;
  courseTitle: string;
  location: string;
  room?: string;
  teacherId?: string;
  teacherInitials: string;
  teacherShort: string;
  teacherTone: AvatarTone;
  schedule: string;
  // Structured day schedules so the edit form can rehydrate inputs (the `schedule`
  // string is the composed label and isn't reversible).
  daySchedules?: DayScheduleInput[];
  enrolled: number;
  capacity: number;
  visibility?: string;
  // Stored — drives action buttons (publish/unpublish/cancel).
  lifecycleStatus: ClassLifecycleStatus;
  // Derived — drives badge / tab filters.
  status: ClassStatus;
  cancellationReason?: string;
  totalSessions?: number;
  startDate?: string;
  endDate?: string;
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
  page?: number;
  size?: number;
  status?: ClassStatus;
  search?: string;
  courseId?: string;
};

export type ClassStats = {
  total: number;
  draft: number;
  open: number;
  full: number;
  ongoing: number;
  completed: number;
  unpublished: number;
  cancelled: number;
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
  // Optional physical room — omit / empty string for online-only classes.
  room?: string;
  daySchedules: DayScheduleInput[];
  startDate: string;
  endDate: string;
  capacity: number;
  visibility: string;
};

// Status / lifecycle aren't editable via this DTO — they go through a
// dedicated lifecycle endpoint so transitions and edits don't get tangled.
export type UpdateClassInput = Partial<CreateClassInput>;

export const CLASS_LIFECYCLE_ACTIONS = ['publish', 'unpublish', 'cancel'] as const;
export type ClassLifecycleAction = (typeof CLASS_LIFECYCLE_ACTIONS)[number];

export type LifecycleActionInput = {
  action: ClassLifecycleAction;
  reason?: string;
};
