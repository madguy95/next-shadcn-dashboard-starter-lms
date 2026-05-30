import type { AvatarTone } from '@/constants/avatar';
import { apiClient } from '@/lib/api-client';
import type {
  DashboardCourseFill,
  DashboardRecentEnrollment,
  DashboardSummary,
  DashboardSummaryParams,
  DashboardUpcomingClass,
  UpcomingClassBadge
} from './types';
import type { EnrollmentChannel, EnrollmentStatus } from '../enrollments/types';
import type { ScheduleEventCategory } from '../schedule/types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

type RecentEnrollmentDto = {
  id: number;
  studentName: string;
  initials?: string;
  studentGrade?: number;
  studentAge?: number;
  courseTitle: string;
  channel: EnrollmentChannel;
  submittedAt: string;
  status: EnrollmentStatus;
};

type UpcomingClassDto = {
  id: number;
  classId?: number;
  startTime: string;
  durationMin: number;
  title: string;
  detail: string;
  category: ScheduleEventCategory;
  badge?: UpcomingClassBadge;
};

type CourseFillDto = {
  id: number;
  code?: string;
  name: string;
  enrolled: number;
  capacity: number;
};

type StudentSampleDto = {
  initials: string;
  /** Optional seed the BE may pass; otherwise we hash position deterministically. */
  toneSeed?: number;
};

type DashboardSummaryDto = {
  header: {
    greetingName?: string;
    termLabel?: string;
    todayLabel: string;
  };
  kpis: {
    courses: { active: number; delta: number; weeklyTrend: number[] };
    classes: { running: number; delta: number; offline: number; online: number };
    students: {
      enrolled: number;
      delta: number;
      sample: StudentSampleDto[];
    };
    pending: { count: number; avgWaitLabel?: string };
  };
  recentEnrollments: RecentEnrollmentDto[];
  upcomingClasses: UpcomingClassDto[];
  courseFill: CourseFillDto[];
};

function pickTone(seed: number): AvatarTone {
  const idx = ((seed % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}

function deriveInitials(name: string): string {
  if (!name) return '··';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapEnrollment(dto: RecentEnrollmentDto): DashboardRecentEnrollment {
  return {
    id: String(dto.id),
    studentName: dto.studentName,
    initials: dto.initials || deriveInitials(dto.studentName),
    tone: pickTone(dto.id),
    grade: dto.studentGrade,
    age: dto.studentAge,
    course: dto.courseTitle,
    channel: dto.channel,
    submittedAt: dto.submittedAt,
    status: dto.status
  };
}

function mapUpcoming(dto: UpcomingClassDto): DashboardUpcomingClass {
  return {
    id: String(dto.id),
    classId: dto.classId != null ? String(dto.classId) : undefined,
    startTime: dto.startTime,
    durationMin: dto.durationMin,
    title: dto.title,
    detail: dto.detail,
    category: dto.category,
    badge: dto.badge
  };
}

function mapCourseFill(dto: CourseFillDto): DashboardCourseFill {
  return {
    id: String(dto.id),
    code: dto.code,
    name: dto.name,
    enrolled: dto.enrolled,
    capacity: dto.capacity
  };
}

function buildQuery(params: DashboardSummaryParams): string {
  const qs = new URLSearchParams();
  if (params.period) qs.set('period', params.period);
  return qs.toString();
}

export async function getAdminDashboardSummary(
  params: DashboardSummaryParams = {}
): Promise<DashboardSummary> {
  const qs = buildQuery(params);
  const endpoint = qs ? `/api/admin/dashboard?${qs}` : '/api/admin/dashboard';
  const dto = await apiClient<DashboardSummaryDto>(endpoint);
  const sample = dto.kpis.students.sample.map((s, idx) => ({
    initials: s.initials,
    tone: pickTone(s.toneSeed ?? idx)
  }));
  return {
    header: dto.header,
    kpis: {
      courses: dto.kpis.courses,
      classes: dto.kpis.classes,
      students: {
        enrolled: dto.kpis.students.enrolled,
        delta: dto.kpis.students.delta,
        sample,
        remaining: Math.max(0, dto.kpis.students.enrolled - sample.length)
      },
      pending: dto.kpis.pending
    },
    recentEnrollments: dto.recentEnrollments.map(mapEnrollment),
    upcomingClasses: dto.upcomingClasses.map(mapUpcoming),
    courseFill: dto.courseFill.map(mapCourseFill)
  };
}
