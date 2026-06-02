import { apiClient } from '@/lib/api-client';
import type {
  TeacherClass,
  TeacherClassColor,
  TeacherClassesParams,
  TeacherClassesStats,
  TeacherClassesSummary,
  TeacherClassStatus,
  TeacherClassStudentPreview,
  TeacherStudentTone
} from './types';

// Color palette assigned to a class when the BE doesn't pin one — hashed off the
// class id so the same class always keeps the same swatch between renders.
const CLASS_COLORS: TeacherClassColor[] = ['emerald', 'sky', 'amber', 'violet', 'rose', 'slate'];

const STUDENT_TONES: TeacherStudentTone[] = [
  'emerald',
  'sky',
  'amber',
  'violet',
  'rose',
  'teal',
  'indigo',
  'lime',
  'orange',
  'pink',
  'cyan',
  'purple'
];

type StudentPreviewDto = {
  initials: string;
  /** Optional seed; otherwise we hash by position so tones stay stable. */
  toneSeed?: number;
};

type TeacherClassDto = {
  id: number | string;
  code: string;
  level: string;
  courseCode: string;
  title: string;
  classLabel: string;
  location: string;
  isOnline: boolean;
  schedule: string;
  studentCount: number;
  capacity?: number;
  sessionCurrent: number;
  sessionTotal: number;
  status: TeacherClassStatus;
  color?: TeacherClassColor;
  needsReviewCount?: number;
  endedAt?: string;
  daysRemaining?: number;
  studentsPreview?: StudentPreviewDto[];
  coverUrl?: string;
};

type TeacherClassesStatsDto = {
  classes: { total: number; running: number; upcoming: number; ended: number };
  students: { total: number };
};

type TeacherClassesSummaryDto = {
  stats: TeacherClassesStatsDto;
  classes: TeacherClassDto[];
};

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickColor(id: string): TeacherClassColor {
  return CLASS_COLORS[hashString(id) % CLASS_COLORS.length];
}

function pickTone(seed: number): TeacherStudentTone {
  const idx = ((seed % STUDENT_TONES.length) + STUDENT_TONES.length) % STUDENT_TONES.length;
  return STUDENT_TONES[idx];
}

function mapStudentPreview(dto: StudentPreviewDto, idx: number): TeacherClassStudentPreview {
  return {
    initials: dto.initials,
    tone: pickTone(dto.toneSeed ?? hashString(dto.initials) + idx)
  };
}

function mapClass(dto: TeacherClassDto): TeacherClass {
  const id = String(dto.id);
  return {
    id,
    code: dto.code,
    level: dto.level,
    courseCode: dto.courseCode,
    title: dto.title,
    classLabel: dto.classLabel,
    location: dto.location,
    isOnline: dto.isOnline,
    schedule: dto.schedule,
    studentCount: dto.studentCount,
    capacity: dto.capacity,
    sessionCurrent: dto.sessionCurrent,
    sessionTotal: dto.sessionTotal,
    status: dto.status,
    color: dto.color ?? pickColor(id),
    needsReviewCount: dto.needsReviewCount,
    endedAt: dto.endedAt,
    daysRemaining: dto.daysRemaining,
    studentsPreview: (dto.studentsPreview ?? []).map(mapStudentPreview),
    coverUrl: dto.coverUrl
  };
}

function mapStats(dto: TeacherClassesStatsDto): TeacherClassesStats {
  return {
    classes: {
      total: dto.classes.total,
      running: dto.classes.running,
      upcoming: dto.classes.upcoming,
      ended: dto.classes.ended
    },
    students: { total: dto.students.total }
  };
}

function buildQuery(params: TeacherClassesParams): string {
  const qs = new URLSearchParams();
  // `all` is the implicit default — only send a concrete status to the BE.
  if (params.status && params.status !== 'all') qs.set('status', params.status);
  return qs.toString();
}

export async function getTeacherClassesSummary(
  params: TeacherClassesParams = {}
): Promise<TeacherClassesSummary> {
  const qs = buildQuery(params);
  const endpoint = qs ? `/api/teacher/classes?${qs}` : '/api/teacher/classes';
  const dto = await apiClient<TeacherClassesSummaryDto>(endpoint);
  return {
    stats: mapStats(dto.stats),
    classes: dto.classes.map(mapClass)
  };
}
