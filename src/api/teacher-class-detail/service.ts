import { apiClient } from '@/lib/api-client';
import type {
  AttendanceStatus,
  ClassDetail,
  ClassDetailColor,
  ClassDetailStatus,
  ClassSession,
  ClassSessionsResult,
  ClassStudent,
  ClassStudentsParams,
  ClassStudentsResult,
  SaveAttendancePayload,
  SaveNotesPayload,
  SessionAttendance,
  SessionMeta,
  SessionNotes,
  SessionStatus,
  SessionSummary,
  StudentNote,
  StudentNoteRating,
  StudentTone
} from './types';

// ── DTOs (wire shape from the backend) ─────────────────────────────────────────
type ClassDetailDto = {
  id: number | string;
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
  attendanceRate: number;
  attendedCount: number;
  attendedTotal: number;
  needsReviewCount: number;
  needsReviewSession: string;
  color?: ClassDetailColor;
  currentSessionId: string;
};

type ClassStudentDto = {
  id: string;
  name: string;
  initials: string;
  tone?: StudentTone;
  toneSeed?: number;
  age: number;
  grade: number;
  parentName: string;
  parentPhone: string;
  attendedSessions: number;
  totalSessions: number;
  lastStatus: AttendanceStatus;
  lastSessionLabel: string;
};

type ClassStudentsDto = {
  students: ClassStudentDto[];
  total: number;
  totalAll: number;
};

type ClassSessionDto = {
  id: string;
  index: number;
  dateLabel: string;
  title: string;
  status: SessionStatus;
  needsReviewCount?: number;
};

type ClassSessionsDto = {
  sessions: ClassSessionDto[];
  currentSessionId: string;
};

type SessionMetaDto = SessionMeta;

type SessionAttendanceDto = {
  sessionId: string;
  meta?: SessionMetaDto | null;
  marks: Record<string, AttendanceStatus>;
  notes?: Record<string, string> | null;
};

type StudentNoteDto = {
  studentId: string;
  attendance: AttendanceStatus;
  note?: string;
  rating?: StudentNoteRating;
  tags?: string[];
  saved: boolean;
};

type SessionNotesDto = {
  sessionId: string;
  meta?: SessionMetaDto | null;
  summary: SessionSummary;
  notes: StudentNoteDto[];
};

const STUDENT_TONES: StudentTone[] = [
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

const CLASS_COLORS: ClassDetailColor[] = ['emerald', 'sky', 'amber', 'violet', 'rose', 'slate'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function pickColor(id: string): ClassDetailColor {
  return CLASS_COLORS[hashString(id) % CLASS_COLORS.length];
}

function pickTone(seed: number): StudentTone {
  const idx = ((seed % STUDENT_TONES.length) + STUDENT_TONES.length) % STUDENT_TONES.length;
  return STUDENT_TONES[idx];
}

// ── Mappers (DTO -> domain) ─────────────────────────────────────────────────────
function mapDetail(dto: ClassDetailDto): ClassDetail {
  const id = String(dto.id);
  return {
    id,
    classLabel: dto.classLabel,
    courseCode: dto.courseCode,
    courseName: dto.courseName,
    status: dto.status,
    title: dto.title,
    location: dto.location,
    schedule: dto.schedule,
    termRange: dto.termRange,
    sessionCurrent: dto.sessionCurrent,
    sessionTotal: dto.sessionTotal,
    studentCount: dto.studentCount,
    presentLastWeek: dto.presentLastWeek,
    absentLastWeek: dto.absentLastWeek,
    attendanceRate: dto.attendanceRate,
    attendedCount: dto.attendedCount,
    attendedTotal: dto.attendedTotal,
    needsReviewCount: dto.needsReviewCount,
    needsReviewSession: dto.needsReviewSession,
    color: dto.color ?? pickColor(id),
    currentSessionId: dto.currentSessionId
  };
}

function mapStudent(dto: ClassStudentDto, idx: number): ClassStudent {
  return {
    id: dto.id,
    name: dto.name,
    initials: dto.initials,
    tone: dto.tone ?? pickTone(dto.toneSeed ?? hashString(dto.initials) + idx),
    age: dto.age,
    grade: dto.grade,
    parentName: dto.parentName,
    parentPhone: dto.parentPhone,
    attendedSessions: dto.attendedSessions,
    totalSessions: dto.totalSessions,
    lastStatus: dto.lastStatus,
    lastSessionLabel: dto.lastSessionLabel
  };
}

function mapSession(dto: ClassSessionDto): ClassSession {
  return {
    id: dto.id,
    index: dto.index,
    dateLabel: dto.dateLabel,
    title: dto.title,
    status: dto.status,
    needsReviewCount: dto.needsReviewCount
  };
}

function mapNote(dto: StudentNoteDto): StudentNote {
  return {
    studentId: dto.studentId,
    attendance: dto.attendance,
    note: dto.note,
    rating: dto.rating,
    tags: dto.tags,
    saved: dto.saved
  };
}

// ── Reads ──────────────────────────────────────────────────────────────────────
export async function getClassDetail(classId: string): Promise<ClassDetail> {
  const dto = await apiClient<ClassDetailDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/detail`
  );
  return mapDetail(dto);
}

export async function getClassStudents(
  classId: string,
  params: ClassStudentsParams = {}
): Promise<ClassStudentsResult> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  const query = qs.toString();
  const endpoint = `/api/teacher/classes/${encodeURIComponent(classId)}/students${
    query ? `?${query}` : ''
  }`;
  const dto = await apiClient<ClassStudentsDto>(endpoint);
  return {
    students: dto.students.map(mapStudent),
    total: dto.total,
    totalAll: dto.totalAll
  };
}

export async function getClassSessions(classId: string): Promise<ClassSessionsResult> {
  const dto = await apiClient<ClassSessionsDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/sessions`
  );
  return {
    sessions: dto.sessions.map(mapSession),
    currentSessionId: dto.currentSessionId
  };
}

export async function getSessionAttendance(
  classId: string,
  sessionId: string
): Promise<SessionAttendance> {
  const dto = await apiClient<SessionAttendanceDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/sessions/${encodeURIComponent(
      sessionId
    )}/attendance`
  );
  return {
    sessionId: dto.sessionId,
    meta: dto.meta ?? null,
    marks: dto.marks,
    notes: dto.notes ?? {}
  };
}

export async function getSessionNotes(classId: string, sessionId: string): Promise<SessionNotes> {
  const dto = await apiClient<SessionNotesDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/sessions/${encodeURIComponent(
      sessionId
    )}/notes`
  );
  return {
    sessionId: dto.sessionId,
    meta: dto.meta ?? null,
    summary: dto.summary,
    notes: dto.notes.map(mapNote)
  };
}

// ── Writes ─────────────────────────────────────────────────────────────────────
export async function saveSessionAttendance(
  classId: string,
  sessionId: string,
  payload: SaveAttendancePayload
): Promise<SessionAttendance> {
  const dto = await apiClient<SessionAttendanceDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/sessions/${encodeURIComponent(
      sessionId
    )}/attendance`,
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return {
    sessionId: dto.sessionId,
    meta: dto.meta ?? null,
    marks: dto.marks,
    notes: dto.notes ?? {}
  };
}

export async function saveSessionNotes(
  classId: string,
  sessionId: string,
  payload: SaveNotesPayload
): Promise<SessionNotes> {
  const dto = await apiClient<SessionNotesDto>(
    `/api/teacher/classes/${encodeURIComponent(classId)}/sessions/${encodeURIComponent(
      sessionId
    )}/notes`,
    { method: 'POST', body: JSON.stringify(payload) }
  );
  return {
    sessionId: dto.sessionId,
    meta: dto.meta ?? null,
    summary: dto.summary,
    notes: dto.notes.map(mapNote)
  };
}
