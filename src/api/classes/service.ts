import type { AvatarTone } from '@/constants/avatar';
import { apiClient, apiClientPaged } from '@/lib/api-client';
import type { Paginated } from '../shared/types';
import { classStudents } from './mock';
import type {
  ClassLifecycleStatus,
  ClassListParams,
  ClassRow,
  ClassStats,
  ClassStatus,
  ClassStatusFilter,
  ClassStatusTab,
  ClassStudent,
  CreateClassInput,
  LifecycleActionInput,
  UpdateClassInput
} from './types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

type ClassCourseDto = {
  id: number;
  code: string;
  title: string;
  totalSessions?: number;
};

type ClassTeacherDto = {
  id: number;
  fullName: string;
  initials?: string;
};

type ClassDaySchedule = {
  day: string;
  startTime: string;
  endTime: string;
};

type ClassDto = {
  id: number;
  name: string;
  label?: string;
  location: string;
  room?: string;
  schedule: string;
  enrolled: number;
  capacity: number;
  lifecycleStatus: ClassLifecycleStatus;
  status: ClassStatus;
  visibility?: string;
  cancellationReason?: string;
  totalSessions?: number;
  startDate?: string;
  endDate?: string;
  course?: ClassCourseDto;
  teacher?: ClassTeacherDto;
  daySchedules?: ClassDaySchedule[];
};

// BE returns long counters keyed by display status / lifecycle. Keep the shape
// loose here because we project only the fields the UI consumes.
type ClassStatusTabsDto = {
  all: number;
  draft: number;
  open: number;
  full: number;
  ongoing: number;
  completed: number;
  unpublished: number;
  cancelled: number;
};

function pickTone(id: number | undefined): AvatarTone {
  if (id == null) return 'foreground';
  const idx = ((id % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}

function deriveInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function teacherShortFrom(name?: string): string {
  if (!name) return '—';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0]}.`;
}

function mapClass(dto: ClassDto): ClassRow {
  const teacherName = dto.teacher?.fullName;
  return {
    id: String(dto.id),
    name: dto.name,
    label: dto.label,
    courseId: dto.course?.id != null ? String(dto.course.id) : undefined,
    courseCode: dto.course?.code ?? '—',
    courseTitle: dto.course?.title ?? '—',
    location: dto.location,
    room: dto.room,
    teacherId: dto.teacher?.id != null ? String(dto.teacher.id) : undefined,
    teacherInitials: dto.teacher?.initials || (teacherName ? deriveInitials(teacherName) : '··'),
    teacherShort: teacherShortFrom(teacherName),
    teacherTone: pickTone(dto.teacher?.id),
    schedule: dto.schedule,
    daySchedules: dto.daySchedules,
    enrolled: dto.enrolled ?? 0,
    capacity: dto.capacity ?? 0,
    visibility: dto.visibility,
    lifecycleStatus: dto.lifecycleStatus,
    status: dto.status,
    cancellationReason: dto.cancellationReason,
    totalSessions: dto.totalSessions ?? dto.course?.totalSessions,
    startDate: dto.startDate,
    endDate: dto.endDate
  };
}

function buildListQuery(params: ClassListParams): string {
  const search = new URLSearchParams();
  search.set('page', '1');
  search.set('size', '100');
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  return search.toString();
}

function toCreatePayload(input: CreateClassInput) {
  return {
    courseId: Number(input.courseId),
    teacherId: Number(input.teacherId),
    label: input.label,
    location: input.location,
    room: input.room || undefined,
    daySchedules: input.daySchedules,
    startDate: input.startDate,
    endDate: input.endDate,
    capacity: input.capacity,
    visibility: input.visibility
  };
}

function toUpdatePayload(input: UpdateClassInput) {
  const body: Record<string, unknown> = {};
  if (input.courseId !== undefined) body.courseId = Number(input.courseId);
  if (input.teacherId !== undefined) body.teacherId = Number(input.teacherId);
  if (input.label !== undefined) body.label = input.label;
  if (input.location !== undefined) body.location = input.location;
  // Empty string is an explicit "clear room" signal — forward as empty so the
  // BE's normalize() turns it into NULL; null/undefined means "don't touch".
  if (input.room !== undefined) body.room = input.room;
  if (input.daySchedules !== undefined) body.daySchedules = input.daySchedules;
  if (input.startDate !== undefined) body.startDate = input.startDate;
  if (input.endDate !== undefined) body.endDate = input.endDate;
  if (input.capacity !== undefined) body.capacity = input.capacity;
  if (input.visibility !== undefined) body.visibility = input.visibility;
  return body;
}

export async function getClasses(params: ClassListParams): Promise<Paginated<ClassRow>> {
  const paged = await apiClientPaged<ClassDto>(`/api/classes?${buildListQuery(params)}`);
  return {
    data: paged.data.map(mapClass),
    total: paged.totalElements,
    pageCount: Math.max(1, paged.totalPages)
  };
}

export async function getClassStatusTabs(): Promise<ClassStatusTab[]> {
  const dto = await apiClient<ClassStatusTabsDto>('/api/classes/status-tabs');
  const tabs: { value: ClassStatusFilter; count: number }[] = [
    { value: 'all', count: dto.all },
    { value: 'draft', count: dto.draft },
    { value: 'open', count: dto.open },
    { value: 'full', count: dto.full },
    { value: 'ongoing', count: dto.ongoing },
    { value: 'completed', count: dto.completed },
    { value: 'unpublished', count: dto.unpublished },
    { value: 'cancelled', count: dto.cancelled }
  ];
  return tabs;
}

export async function getClassStats(): Promise<ClassStats> {
  return apiClient<ClassStats>('/api/classes/stats');
}

export async function getClassById(id: string): Promise<ClassRow> {
  const dto = await apiClient<ClassDto>(`/api/classes/${id}`);
  return mapClass(dto);
}

export async function getClassStudents(classId: string): Promise<ClassStudent[]> {
  // Roster endpoint is out of scope for the class CRUD wiring — keep the mock
  // fallback so the detail panel still renders while the backend lands.
  const roster = classStudents.filter((s) => s.classId === classId);
  return roster.length ? roster : classStudents;
}

export async function createClass(input: CreateClassInput): Promise<ClassRow> {
  const dto = await apiClient<ClassDto>('/api/classes', {
    method: 'POST',
    body: JSON.stringify(toCreatePayload(input))
  });
  return mapClass(dto);
}

export async function updateClass(id: string, input: UpdateClassInput): Promise<ClassRow> {
  const dto = await apiClient<ClassDto>(`/api/classes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toUpdatePayload(input))
  });
  return mapClass(dto);
}

export async function applyClassLifecycleAction(
  id: string,
  input: LifecycleActionInput
): Promise<ClassRow> {
  const dto = await apiClient<ClassDto>(`/api/classes/${id}/lifecycle`, {
    method: 'PATCH',
    body: JSON.stringify(input)
  });
  return mapClass(dto);
}
