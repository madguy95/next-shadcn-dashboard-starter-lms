import type { Paginated, Teacher, TeacherCounts, TeacherListParams } from './types';
import { teacherCounts, teachers } from './mock';

// Simulated network latency so loading states are exercised during development.
const MOCK_LATENCY_MS = 3000;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

export async function getTeacherCounts(): Promise<TeacherCounts> {
  await sleep(MOCK_LATENCY_MS);
  return teacherCounts;
}
