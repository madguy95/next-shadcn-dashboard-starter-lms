import { courses } from '../courses/mock';
import { MOCK_LATENCY_MS, sleep } from '../shared/mock-utils';
import type { Paginated } from '../shared/types';
import { teachers } from '../teachers/mock';
import { classRows, classStatusTabConfig, classStudents } from './mock';
import type {
  ClassListParams,
  ClassRow,
  ClassStats,
  ClassStatusTab,
  ClassStudent,
  CreateClassInput
} from './types';

export async function getClasses(params: ClassListParams): Promise<Paginated<ClassRow>> {
  await sleep(MOCK_LATENCY_MS);

  let filtered = classRows;
  if (params.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.courseTitle.toLowerCase().includes(q) ||
        c.courseCode.toLowerCase().includes(q) ||
        c.teacherShort.toLowerCase().includes(q)
    );
  }

  return { data: filtered, total: filtered.length, pageCount: 1 };
}

export async function getClassStatusTabs(): Promise<ClassStatusTab[]> {
  await sleep(MOCK_LATENCY_MS);
  return classStatusTabConfig.map((tab) => ({
    ...tab,
    count:
      tab.value === 'all'
        ? classRows.length
        : classRows.filter((c) => c.status === tab.value).length
  }));
}

// Header stats — kept fast so the server-rendered page description doesn't block on mock latency.
export async function getClassStats(): Promise<ClassStats> {
  return {
    total: classRows.length,
    running: classRows.filter((c) => c.status === 'running').length,
    upcoming: classRows.filter((c) => c.status === 'upcoming').length,
    ended: classRows.filter((c) => c.status === 'ended').length
  };
}

export async function getClassById(id: string): Promise<ClassRow> {
  await sleep(MOCK_LATENCY_MS);
  const cls = classRows.find((c) => c.id === id);
  if (!cls) throw new Error(`Class ${id} not found`);
  return cls;
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  await sleep(MOCK_LATENCY_MS);
  // Mock data only has a roster attached to cl-1; fall back to it for other classes
  // so the panel always renders something during development.
  const roster = classStudents.filter((s) => s.classId === classId);
  return roster.length ? roster : classStudents;
}

// Build a schedule label like "Mon · Wed · 09:00" when every day shares the same
// start time, or "Mon 09:00 · Wed 14:00" when they differ. Mirrors the format
// shown in the existing mock rows so the new entry blends with the table.
function composeSchedule(daySchedules: { day: string; startTime: string }[]): string {
  if (daySchedules.length === 0) return '—';
  const allSameTime = daySchedules.every((s) => s.startTime === daySchedules[0].startTime);
  if (allSameTime) {
    return `${daySchedules.map((s) => s.day).join(' · ')} · ${daySchedules[0].startTime}`;
  }
  return daySchedules.map((s) => `${s.day} ${s.startTime}`).join(' · ');
}

// "Linh Nguyễn" → "Linh N." (first name + last initial). Falls back to raw name.
function teacherShortFrom(name?: string): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function nextClassId(): string {
  const taken = new Set(classRows.map((c) => c.id));
  let n = classRows.length + 1;
  while (taken.has(`cl-${n}`)) n += 1;
  return `cl-${n}`;
}

export async function createClass(input: CreateClassInput): Promise<ClassRow> {
  await sleep(MOCK_LATENCY_MS);
  const course = courses.find((c) => c.id === input.courseId);
  const teacher = teachers.find((t) => t.id === input.teacherId);
  // Compose a short label like "Scratch · A4" by combining the course's tagline-friendly
  // first word with the user-typed label, falling back to the raw label if a course
  // wasn't found (shouldn't happen — schema requires it).
  const coursePrefix = course?.title.split(' ')[0] ?? 'Class';
  const row: ClassRow = {
    id: nextClassId(),
    name: input.label.trim() ? `${coursePrefix} · ${input.label.trim()}` : coursePrefix,
    courseId: input.courseId,
    courseCode: course?.code ?? '—',
    courseTitle: course?.title ?? '—',
    location: input.location,
    teacherId: input.teacherId,
    teacherInitials: teacher?.initials ?? '··',
    teacherShort: teacherShortFrom(teacher?.name),
    teacherTone: teacher?.tone ?? 'foreground',
    schedule: composeSchedule(input.daySchedules),
    enrolled: 0,
    capacity: input.capacity,
    status: 'upcoming',
    totalSessions: course?.totalSessions
  };
  classRows.unshift(row);
  return row;
}
