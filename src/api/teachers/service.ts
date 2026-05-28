import type { AvatarTone } from '@/constants/avatar';
import { apiClient, apiClientPaged } from '@/lib/api-client';
import { uploadIfPresent } from '../files/service';
import { getSubjects } from '../subjects/service';
import type { Paginated } from '../shared/types';
import type {
  CreateTeacherInput,
  Teacher,
  TeacherListParams,
  TeacherStatus,
  TeacherStatusTab,
  UpdateTeacherInput
} from './types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

type TeacherSubjectDto = {
  id: number;
  name: string;
  primary: boolean;
};

type TeacherDto = {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  avatarUrl?: string;
  location?: string;
  bio?: string;
  status: string;
  rating: number;
  classCount: number;
  studentCount: number;
  subjects: TeacherSubjectDto[];
  createdAt?: string;
  updatedAt?: string;
};

type TeacherOptionDto = {
  id: number;
  fullName: string;
  email: string;
};

type TeacherStatusTabsDto = {
  active: number;
  onLeave: number;
  pending: number;
  total: number;
};

function pickTone(id: number): AvatarTone {
  const idx = ((id % AVATAR_TONES.length) + AVATAR_TONES.length) % AVATAR_TONES.length;
  return AVATAR_TONES[idx];
}

function deriveInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function mapTeacher(dto: TeacherDto): Teacher {
  const sortedSubjects = [...(dto.subjects ?? [])].sort(
    (a, b) => Number(b.primary) - Number(a.primary)
  );
  return {
    id: dto.id,
    userId: dto.userId,
    name: dto.fullName,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phone: dto.phone,
    initials: dto.initials || deriveInitials(dto.fullName),
    tone: pickTone(dto.id),
    subjects: sortedSubjects.map((s) => s.name),
    subjectsRaw: sortedSubjects,
    classCount: dto.classCount ?? 0,
    studentCount: dto.studentCount ?? 0,
    rating: dto.rating ?? 0,
    status: (dto.status as Teacher['status']) ?? 'pending',
    gender: dto.gender as Teacher['gender'] | undefined,
    dateOfBirth: dto.dateOfBirth,
    avatarUrl: dto.avatarUrl,
    location: dto.location
  };
}

function buildListQuery(params: TeacherListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page));
  search.set('size', String(params.perPage));
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  return search.toString();
}

export async function getTeachers(params: TeacherListParams): Promise<Paginated<Teacher>> {
  const paged = await apiClientPaged<TeacherDto>(`/api/teachers?${buildListQuery(params)}`);
  return {
    data: paged.data.map(mapTeacher),
    total: paged.totalElements,
    pageCount: Math.max(1, paged.totalPages)
  };
}

// Resolve subject names → ids using the live /api/subjects list.
async function resolveSubjectIds(primaryName: string, allNames: string[]) {
  const subjects = await getSubjects();
  const byName = new Map(subjects.map((s) => [s.name.toLowerCase(), s.id]));
  const primaryId = byName.get(primaryName.toLowerCase());
  if (primaryId == null) {
    throw new Error(`Không tìm thấy môn "${primaryName}". Vui lòng kiểm tra danh sách môn.`);
  }
  const uniqueNames = Array.from(new Set([primaryName, ...allNames].map((n) => n.toLowerCase())));
  const subjectIds = uniqueNames
    .map((lower) => byName.get(lower))
    .filter((id): id is number => typeof id === 'number');
  return { primaryId, subjectIds };
}

function buildUsername(firstName: string, lastName: string, phone: string): string {
  const slug = `${firstName}${lastName}`
    .normalize('NFD')
    .replaceAll(/[̀-ͯ]/g, '')
    .replaceAll(/[^a-zA-Z0-9]/g, '')
    .toLowerCase()
    .slice(0, 12);
  if (slug.length >= 3) return slug;
  return `user${phone.slice(-6)}`;
}

export async function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const [{ primaryId, subjectIds }, avatarUrl] = await Promise.all([
    resolveSubjectIds(input.primarySubject, input.tags),
    uploadIfPresent(input.avatar, 'TEACHER_AVATAR')
  ]);

  const body = {
    firstName,
    lastName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    username: buildUsername(firstName, lastName, input.phone),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth ? input.dateOfBirth.slice(0, 10) : undefined,
    location: input.location,
    primarySubjectId: primaryId,
    subjectIds,
    avatarUrl,
    sendOnboardingEmail: input.sendOnboardingEmail
  };

  const dto = await apiClient<TeacherDto>('/api/teachers', {
    method: 'POST',
    body: JSON.stringify(body)
  });
  return mapTeacher(dto);
}

export async function updateTeacherStatus(id: number, status: TeacherStatus): Promise<Teacher> {
  const dto = await apiClient<TeacherDto>(`/api/teachers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return mapTeacher(dto);
}

export async function deleteTeacher(id: number): Promise<void> {
  await apiClient<void>(`/api/teachers/${id}`, { method: 'DELETE' });
}

export async function updateTeacher(id: number, input: UpdateTeacherInput): Promise<Teacher> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const [{ primaryId, subjectIds }, avatarUrl] = await Promise.all([
    resolveSubjectIds(input.primarySubject, input.tags),
    uploadIfPresent(input.avatar, 'TEACHER_AVATAR')
  ]);

  const body = {
    firstName,
    lastName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    gender: input.gender,
    dateOfBirth: input.dateOfBirth ? input.dateOfBirth.slice(0, 10) : undefined,
    location: input.location,
    primarySubjectId: primaryId,
    subjectIds,
    // Only send when a new avatar was uploaded; null/undefined leaves the existing one untouched.
    avatarUrl
  };

  const dto = await apiClient<TeacherDto>(`/api/teachers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  });
  return mapTeacher(dto);
}

// Lightweight, non-paginated list for selectors (class assignment, scheduling).
export type TeacherOptionsParams = { search?: string; status?: string };
export async function getTeacherOptions(params: TeacherOptionsParams = {}): Promise<Teacher[]> {
  const qs = new URLSearchParams();
  if (params.status) qs.set('status', params.status);
  const path = qs.toString() ? `/api/teachers/options?${qs}` : '/api/teachers/options';
  const data = await apiClient<TeacherOptionDto[]>(path);
  let mapped = data.map<Teacher>((d) => ({
    id: d.id,
    userId: 0,
    name: d.fullName,
    email: d.email,
    phone: '',
    initials: deriveInitials(d.fullName),
    tone: pickTone(d.id),
    subjects: [],
    subjectsRaw: [],
    classCount: 0,
    studentCount: 0,
    rating: 0,
    status: 'active'
  }));
  if (params.search) {
    const q = params.search.toLowerCase();
    mapped = mapped.filter(
      (t) => t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q)
    );
  }
  return mapped;
}

export async function getTeacherStatusTabs(): Promise<TeacherStatusTab[]> {
  const dto = await apiClient<TeacherStatusTabsDto>('/api/teachers/status-tabs');
  return [
    { value: 'all', count: dto.total },
    { value: 'active', count: dto.active },
    { value: 'on_leave', count: dto.onLeave },
    { value: 'pending', count: dto.pending }
  ];
}
