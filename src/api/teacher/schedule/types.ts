// Self-contained colour union — structurally identical to the `ClassColor` keys
// of `classColorTokens` in `@/features/teacher/data`, so values index that map
// without casting.
export type TeacherScheduleColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

export type TeacherScheduleEvent = {
  id: string;
  classId: string;
  classLabel: string;
  courseCode: string;
  title: string;
  /** 0 = Monday … 6 = Sunday. */
  dayIndex: number;
  /** Absolute minutes from midnight (e.g. 18:00 -> 1080). */
  startMin: number;
  durationMin: number;
  location: string;
  isOnline: boolean;
  studentCount: number;
  color: TeacherScheduleColor;
  isMakeup: boolean;
  makeupStudent?: string;
};

export type TeacherScheduleDay = {
  dayOfMonth: number;
  isToday: boolean;
  /** ISO date (YYYY-MM-DD). */
  isoDate: string;
};

export type TeacherScheduleClassChip = {
  id: string;
  label: string;
  color: TeacherScheduleColor;
};

export type TeacherScheduleSummary = {
  /** ISO date (YYYY-MM-DD). */
  weekStart: string;
  weekEnd: string;
  /** Set only when today is inside the week. */
  todayIso?: string;
  sessionsThisWeek: number;
  teachingMinutes: number;
  onlineCount: number;
  makeupCount: number;
};

export type TeacherScheduleWeek = {
  summary: TeacherScheduleSummary;
  days: TeacherScheduleDay[];
  events: TeacherScheduleEvent[];
  classChips: TeacherScheduleClassChip[];
};

export type TeacherScheduleParams = {
  /** Any day in the target week (YYYY-MM-DD). Omitted = current week. */
  anchor?: string;
  /** Filter to a single class (chip id). */
  classId?: string;
};
