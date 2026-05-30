// AvatarTone + avatarToneClass moved to @/constants/avatar (shared with api layer).
// Re-exported here for legacy importers — prefer the new path in new code.
import { avatarToneClass, type AvatarTone } from '@/constants/avatar';
export { avatarToneClass, type AvatarTone };

export type EnrollmentStatus = 'pending' | 'active' | 'waitlist' | 'rejected';

export const enrollmentStatusLabel: Record<EnrollmentStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  waitlist: 'Waitlist',
  rejected: 'Rejected'
};

export const enrollmentStatusClass: Record<EnrollmentStatus, string> = {
  pending: 'bg-amber-50 text-amber-800 border-amber-200',
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  waitlist: 'bg-slate-50 text-slate-700 border-slate-200',
  rejected: 'bg-rose-50 text-rose-800 border-rose-200'
};

// Teacher domain types + data moved to @/api/teachers/.
// UI metadata for teacher status stays here (presentation concern, not server data).
import type { TeacherStatus } from '@/api/teachers';

export const teacherStatusLabel: Record<TeacherStatus, string> = {
  active: 'Active',
  on_leave: 'On leave',
  pending: 'Pending'
};

export const teacherStatusClass: Record<TeacherStatus, string> = {
  active: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  on_leave: 'bg-slate-50 text-slate-700 border-slate-200',
  pending: 'bg-amber-50 text-amber-800 border-amber-200'
};

// Course domain types + data moved to @/api/courses/.
// UI metadata for course status stays here (presentation concern, not server data).
import type { CourseStatus } from '@/api/courses';
// Re-exported for legacy imports (e.g. add-class-dialog) that still pull `courses` from this module.
export { courses } from '@/api/courses';
export type { Course, CourseStatus, CourseTool } from '@/api/courses';

export const courseStatusClass: Record<CourseStatus, string> = {
  published: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  draft: 'bg-amber-50 text-amber-800 border-amber-200',
  unpublished: 'bg-muted text-muted-foreground border-border'
};

// Class domain types + data moved to @/api/classes/.
// UI metadata for class & student status stays here (presentation concern, not server data).
import type { ClassStatus, StudentStatus } from '@/api/classes';
// Re-exported for legacy importers (e.g. add-class-dialog, enrollments-view).
export { classStudents, classAssignOptions } from '@/api/classes';
export type {
  ClassRow,
  ClassStatus,
  ClassStudent,
  StudentStatus,
  ClassAssignOption
} from '@/api/classes';

export const classStatusClass: Record<ClassStatus, string> = {
  draft: 'bg-muted text-muted-foreground border-border',
  open: 'bg-sky-50 text-sky-800 border-sky-200',
  full: 'bg-amber-50 text-amber-800 border-amber-200',
  ongoing: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-slate-50 text-slate-700 border-slate-200',
  unpublished: 'bg-zinc-50 text-zinc-700 border-zinc-200',
  cancelled: 'bg-rose-50 text-rose-800 border-rose-200'
};

export const studentStatusClass: Record<StudentStatus, string> = {
  on_track: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  at_risk: 'bg-amber-50 text-amber-800 border-amber-200',
  absent_x3: 'bg-rose-50 text-rose-800 border-rose-200'
};

// Enrollment domain types + data moved to @/api/enrollments/.
// Only presentation metadata (status badge label/class) lives here, alongside
// the dashboard's mock recent-enrollments feed.

// Schedule domain types + data moved to @/api/schedule/.
// Only the category → tailwind class maps stay here (presentation concern).
import type { ScheduleEventCategory } from '@/api/schedule';
export type { ScheduleEvent, ScheduleEventCategory } from '@/api/schedule';

export const scheduleCategoryClass: Record<ScheduleEventCategory, string> = {
  scratch: 'bg-slate-50 text-slate-900 border-slate-200 border-l-slate-500',
  python: 'bg-sky-50 text-sky-900 border-sky-200 border-l-sky-500',
  web: 'bg-violet-50 text-violet-900 border-violet-200 border-l-violet-500',
  robotics: 'bg-amber-50 text-amber-900 border-amber-200 border-l-amber-500',
  game_ai: 'bg-emerald-50 text-emerald-900 border-emerald-200 border-l-emerald-500'
};

export const scheduleCategoryDot: Record<ScheduleEventCategory, string> = {
  scratch: 'bg-slate-500',
  python: 'bg-sky-500',
  web: 'bg-violet-500',
  robotics: 'bg-amber-500',
  game_ai: 'bg-emerald-500'
};
