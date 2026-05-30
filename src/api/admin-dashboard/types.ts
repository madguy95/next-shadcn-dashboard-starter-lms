import type { AvatarTone } from '@/constants/avatar';
import type { EnrollmentChannel, EnrollmentStatus } from '../enrollments/types';
import type { ScheduleEventCategory } from '../schedule/types';

export const DASHBOARD_PERIODS = ['week', 'month', 'term'] as const;
export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export function isDashboardPeriod(v: string | null | undefined): v is DashboardPeriod {
  return !!v && (DASHBOARD_PERIODS as readonly string[]).includes(v);
}

export type DashboardCoursesKpi = {
  active: number;
  delta: number;
  /** 7 normalized values in [0..1] — Mon..Sun activity for the spark bars. */
  weeklyTrend: number[];
};

export type DashboardClassesKpi = {
  running: number;
  delta: number;
  offline: number;
  online: number;
};

export type DashboardStudentSample = {
  initials: string;
  tone: AvatarTone;
};

export type DashboardStudentsKpi = {
  enrolled: number;
  delta: number;
  sample: DashboardStudentSample[];
  /** Students enrolled minus the size of `sample`, used for the "+N" chip. */
  remaining: number;
};

export type DashboardPendingKpi = {
  count: number;
  /** Human-friendly average wait label, e.g. "1d 4h". Omitted when count is 0. */
  avgWaitLabel?: string;
};

export type DashboardKpis = {
  courses: DashboardCoursesKpi;
  classes: DashboardClassesKpi;
  students: DashboardStudentsKpi;
  pending: DashboardPendingKpi;
};

export type DashboardRecentEnrollment = {
  id: string;
  studentName: string;
  initials: string;
  tone: AvatarTone;
  grade?: number;
  age?: number;
  course: string;
  channel: EnrollmentChannel;
  /** ISO date string. */
  submittedAt: string;
  status: EnrollmentStatus;
};

export type UpcomingClassBadgeKind = 'live' | 'online' | 'low_cap';

export type UpcomingClassBadge = {
  kind: UpcomingClassBadgeKind;
  label: string;
};

export type DashboardUpcomingClass = {
  id: string;
  classId?: string;
  /** "HH:mm" 24h. */
  startTime: string;
  durationMin: number;
  title: string;
  detail: string;
  category: ScheduleEventCategory;
  badge?: UpcomingClassBadge;
};

export type DashboardCourseFill = {
  id: string;
  code?: string;
  name: string;
  enrolled: number;
  capacity: number;
};

export type DashboardHeader = {
  greetingName?: string;
  /** "Summer Term 2026 · Week 4 of 12" */
  termLabel?: string;
  /** "Today · Mon, May 23" */
  todayLabel: string;
};

export type DashboardSummary = {
  header: DashboardHeader;
  kpis: DashboardKpis;
  recentEnrollments: DashboardRecentEnrollment[];
  upcomingClasses: DashboardUpcomingClass[];
  courseFill: DashboardCourseFill[];
};

export type DashboardSummaryParams = {
  period?: DashboardPeriod;
};
