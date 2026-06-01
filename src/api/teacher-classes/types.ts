// Domain vocabulary for the teacher "My classes" screen. These string-literal
// unions are kept self-contained so the api layer never depends on feature
// presentation code; the CSS class maps in `@/features/teacher/data`
// (classColorTokens, studentToneClass) are structurally keyed by the same
// literals, so values returned here index those maps without extra casting.
export type TeacherClassColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

export type TeacherStudentTone =
  | 'emerald'
  | 'sky'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'teal'
  | 'indigo'
  | 'lime'
  | 'orange'
  | 'pink'
  | 'cyan'
  | 'purple';

export const TEACHER_CLASS_STATUSES = ['running', 'upcoming', 'ended'] as const;
export type TeacherClassStatus = (typeof TEACHER_CLASS_STATUSES)[number];

export type TeacherClassStatusFilter = TeacherClassStatus | 'all';

export function isTeacherClassStatusFilter(
  v: string | null | undefined
): v is TeacherClassStatusFilter {
  return v === 'all' || (!!v && (TEACHER_CLASS_STATUSES as readonly string[]).includes(v));
}

export type TeacherClassStudentPreview = {
  initials: string;
  tone: TeacherStudentTone;
};

export type TeacherClass = {
  id: string;
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
  color: TeacherClassColor;
  needsReviewCount?: number;
  endedAt?: string;
  daysRemaining?: number;
  studentsPreview: TeacherClassStudentPreview[];
  coverUrl?: string;
};

export type TeacherClassesStats = {
  /** Total classes the teacher owns, with a per-status breakdown. */
  classes: { total: number; running: number; upcoming: number; ended: number };
  /** Total students rolled up across all the teacher's classes. */
  students: { total: number };
};

export type TeacherClassesSummary = {
  stats: TeacherClassesStats;
  classes: TeacherClass[];
};

export type TeacherClassesParams = {
  /** Server-side status filter. `all` (or omitted) returns every class. */
  status?: TeacherClassStatusFilter;
};
