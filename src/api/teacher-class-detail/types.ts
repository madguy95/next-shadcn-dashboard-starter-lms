// Domain vocabulary for the teacher "Class detail" screen. The string-literal
// unions are kept self-contained so the api layer never depends on feature
// presentation code; the CSS class maps in `@/features/teacher/data`
// (classColorTokens, studentToneClass, attendanceStatusDot, …) are structurally
// keyed by the same literals, so values returned here index those maps directly.

export type ClassDetailColor = 'emerald' | 'sky' | 'amber' | 'violet' | 'rose' | 'slate';

export type StudentTone =
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

export const CLASS_DETAIL_STATUSES = ['running', 'upcoming', 'ended'] as const;
export type ClassDetailStatus = (typeof CLASS_DETAIL_STATUSES)[number];

export const ATTENDANCE_STATUSES = ['present', 'excused', 'absent', 'makeup', 'unmarked'] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const SESSION_STATUSES = ['reviewed', 'in_progress', 'taught', 'upcoming'] as const;
export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const NOTE_RATINGS = ['weak', 'average', 'good', 'great', 'excellent'] as const;
export type StudentNoteRating = (typeof NOTE_RATINGS)[number];

// ── Header / overview ──────────────────────────────────────────────────────────
export type ClassDetail = {
  id: string;
  classLabel: string;
  courseCode: string;
  courseName: string;
  status: ClassDetailStatus;
  title: string;
  location: string;
  schedule: string;
  termRange: string;
  sessionCurrent: number;
  sessionTotal: number;
  studentCount: number;
  presentLastWeek: number;
  absentLastWeek: number;
  /** Average attendance, percent (0–100). */
  attendanceRate: number;
  attendedCount: number;
  attendedTotal: number;
  needsReviewCount: number;
  /** Human label of the session that still needs reviews, e.g. "buổi 6 · 19/05". */
  needsReviewSession: string;
  color: ClassDetailColor;
  /** Session currently being taught/reviewed — default for attendance + notes tabs. */
  currentSessionId: string;
};

// ── Roster ───────────────────────────────────────────────────────────────────
export type ClassStudent = {
  id: string;
  name: string;
  initials: string;
  tone: StudentTone;
  age: number;
  grade: number;
  parentName: string;
  parentPhone: string;
  attendedSessions: number;
  totalSessions: number;
  lastStatus: AttendanceStatus;
  lastSessionLabel: string;
};

export type ClassStudentsResult = {
  students: ClassStudent[];
  /** Count after the search filter. */
  total: number;
  /** Count of the whole roster (ignores search). */
  totalAll: number;
};

// ── Sessions ───────────────────────────────────────────────────────────────────
export type ClassSession = {
  id: string;
  index: number;
  dateLabel: string;
  title: string;
  status: SessionStatus;
  needsReviewCount?: number;
};

export type ClassSessionsResult = {
  sessions: ClassSession[];
  currentSessionId: string;
};

export type SessionMeta = {
  id: string;
  /** e.g. "T2 · 19/05/2026 · 18:00–19:00". */
  dayLabel: string;
  /** e.g. "Buổi 6 · Mini game Cat & Mouse". */
  title: string;
  description: string;
  /** e.g. "18:00–19:00 · Phòng 301". */
  timeLabel: string;
};

// ── Attendance ───────────────────────────────────────────────────────────────
export type SessionAttendance = {
  sessionId: string;
  meta: SessionMeta | null;
  /** studentId -> status (every roster student is present in the map). */
  marks: Record<string, AttendanceStatus>;
  /** studentId -> per-student attendance note (only students with a note appear). */
  notes: Record<string, string>;
};

export type SaveAttendancePayload = {
  marks: Record<string, AttendanceStatus>;
  /** studentId -> per-student attendance note. Omitted entries clear the note. */
  notes?: Record<string, string>;
};

// ── Notes ───────────────────────────────────────────────────────────────────
export type SessionSummary = {
  comment: string;
  rating: StudentNoteRating;
};

export type StudentNote = {
  studentId: string;
  attendance: AttendanceStatus;
  note?: string;
  rating?: StudentNoteRating;
  tags?: string[];
  saved: boolean;
};

export type SessionNotes = {
  sessionId: string;
  meta: SessionMeta | null;
  summary: SessionSummary;
  notes: StudentNote[];
};

export type SaveNotesPayload = {
  summary: SessionSummary;
  notes: StudentNote[];
  /** true -> persist & notify parents; false -> save draft only. */
  sendToParents: boolean;
};

// ── Params ───────────────────────────────────────────────────────────────────
export type ClassStudentsParams = {
  search?: string;
};
