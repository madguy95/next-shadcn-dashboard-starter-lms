import type { AvatarTone } from '@/constants/avatar';
import { MOCK_LATENCY_MS, sleep } from '../shared/mock-utils';
import type { Paginated } from '../shared/types';
import { teacherStatusTabConfig, teachers } from './mock';
import type {
  CreateTeacherInput,
  Teacher,
  TeacherListParams,
  TeacherStatusTab,
  UpdateTeacherInput
} from './types';

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

function buildInitials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

export async function getTeachers(params: TeacherListParams): Promise<Paginated<Teacher>> {
  await sleep(MOCK_LATENCY_MS);

  let filtered = teachers;
  if (params.status) {
    filtered = filtered.filter((t) => t.status === params.status);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / params.perPage));
  const start = (params.page - 1) * params.perPage;
  const data = filtered.slice(start, start + params.perPage);

  return { data, total, pageCount };
}

export async function createTeacher(input: CreateTeacherInput): Promise<Teacher> {
  await sleep(MOCK_LATENCY_MS);
  const id = `T-${String(teachers.length + 1).padStart(3, '0')}`;
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const name = `${firstName} ${lastName}`.trim();
  const subjects = [input.primarySubject, ...input.tags.filter((t) => t !== input.primarySubject)];
  const tone = AVATAR_TONES[teachers.length % AVATAR_TONES.length];
  const avatarUrl = input.avatar ? URL.createObjectURL(input.avatar) : undefined;
  const teacher: Teacher = {
    id,
    name,
    firstName,
    lastName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    initials: buildInitials(firstName, lastName),
    tone,
    subjects,
    location: input.location,
    classCount: 0,
    studentCount: 0,
    rating: 0,
    status: 'pending',
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    avatarUrl
  };
  teachers.unshift(teacher);
  return teacher;
}

export async function updateTeacher(id: string, input: UpdateTeacherInput): Promise<Teacher> {
  await sleep(MOCK_LATENCY_MS);
  const idx = teachers.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Teacher ${id} not found`);
  const existing = teachers[idx];
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const subjects = [input.primarySubject, ...input.tags.filter((t) => t !== input.primarySubject)];
  const updated: Teacher = {
    ...existing,
    name: `${firstName} ${lastName}`.trim(),
    firstName,
    lastName,
    email: input.email.trim(),
    phone: input.phone.trim(),
    initials: buildInitials(firstName, lastName),
    subjects,
    location: input.location,
    gender: input.gender,
    dateOfBirth: input.dateOfBirth,
    avatarUrl: input.avatar ? URL.createObjectURL(input.avatar) : existing.avatarUrl
  };
  teachers[idx] = updated;
  return updated;
}

export async function getTeacherStatusTabs(): Promise<TeacherStatusTab[]> {
  await sleep(MOCK_LATENCY_MS);
  return teacherStatusTabConfig.map((tab) => ({
    ...tab,
    count:
      tab.value === 'all' ? teachers.length : teachers.filter((t) => t.status === tab.value).length
  }));
}
