import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import {
  getClassDetail,
  getClassSessions,
  getClassStudents,
  getSessionAttendance,
  getSessionNotes
} from './service';

export const teacherClassDetailKeys = {
  all: ['teacher', 'class-detail'] as const,
  detail: (classId: string) => [...teacherClassDetailKeys.all, classId, 'detail'] as const,
  students: (classId: string, search?: string) =>
    [...teacherClassDetailKeys.all, classId, 'students', { search: search ?? '' }] as const,
  sessions: (classId: string) => [...teacherClassDetailKeys.all, classId, 'sessions'] as const,
  attendance: (classId: string, sessionId: string) =>
    [...teacherClassDetailKeys.all, classId, 'attendance', sessionId] as const,
  notes: (classId: string, sessionId: string) =>
    [...teacherClassDetailKeys.all, classId, 'notes', sessionId] as const
};

export function classDetailOptions(classId: string) {
  return queryOptions({
    queryKey: teacherClassDetailKeys.detail(classId),
    queryFn: () => getClassDetail(classId),
    // keepPreviousData stops useSuspenseQuery from re-suspending to the page
    // skeleton on refetch; the screen surfaces movement via LoadingOverlay instead.
    placeholderData: keepPreviousData
  });
}

export function classStudentsOptions(classId: string, search?: string) {
  return queryOptions({
    queryKey: teacherClassDetailKeys.students(classId, search),
    queryFn: () => getClassStudents(classId, { search }),
    // Keep the current roster on screen while a search query streams in.
    placeholderData: keepPreviousData
  });
}

export function classSessionsOptions(classId: string) {
  return queryOptions({
    queryKey: teacherClassDetailKeys.sessions(classId),
    queryFn: () => getClassSessions(classId),
    placeholderData: keepPreviousData
  });
}

export function sessionAttendanceOptions(classId: string, sessionId: string) {
  return queryOptions({
    queryKey: teacherClassDetailKeys.attendance(classId, sessionId),
    queryFn: () => getSessionAttendance(classId, sessionId),
    enabled: Boolean(sessionId),
    placeholderData: keepPreviousData
  });
}

export function sessionNotesOptions(classId: string, sessionId: string) {
  return queryOptions({
    queryKey: teacherClassDetailKeys.notes(classId, sessionId),
    queryFn: () => getSessionNotes(classId, sessionId),
    enabled: Boolean(sessionId),
    placeholderData: keepPreviousData
  });
}
