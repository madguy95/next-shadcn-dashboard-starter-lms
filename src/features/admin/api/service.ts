import type {
  Course,
  CourseCategoryTab,
  CourseListParams,
  CourseStats,
  CreateCourseInput,
  CreateTeacherInput,
  Paginated,
  Teacher,
  TeacherListParams,
  TeacherStatusTab,
  UpdateTeacherInput
} from './types';
import type { AvatarTone } from '../data';
import { courseCategoryTabConfig, courses, teacherStatusTabConfig, teachers } from './mock';

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

const AVATAR_TONES: AvatarTone[] = ['rose', 'sky', 'violet', 'amber', 'emerald', 'foreground'];

function buildInitials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
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

export async function getCourses(params: CourseListParams): Promise<Paginated<Course>> {
  await sleep(MOCK_LATENCY_MS);

  let filtered = courses;
  if (params.category) {
    filtered = filtered.filter((c) => c.category === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q)
    );
  }

  return { data: filtered, total: filtered.length, pageCount: 1 };
}

export async function getCourseCategoryTabs(): Promise<CourseCategoryTab[]> {
  await sleep(MOCK_LATENCY_MS);
  return courseCategoryTabConfig.map((tab) => ({
    ...tab,
    count:
      tab.value === 'all' ? courses.length : courses.filter((c) => c.category === tab.value).length
  }));
}

// Header stats — kept fast so the server-rendered page description doesn't block on mock latency.
export async function getCourseStats(): Promise<CourseStats> {
  return {
    total: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    drafts: courses.filter((c) => c.status === 'draft').length
  };
}

const COURSE_COVER_BY_CATEGORY: Record<string, string> = {
  coding: 'CODE',
  design: 'DSGN',
  robotics: 'ROBO',
  stem: 'STEM',
  language: 'LANG',
  game: 'GAME'
};

const VND_FORMATTER = new Intl.NumberFormat('vi-VN');

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const id = `c-${courses.length + 1}`;
  const coverPrefix = COURSE_COVER_BY_CATEGORY[input.category] ?? 'COURSE';
  const curriculum = input.sessions.map((s, i) => s.title.trim() || `Session ${i + 1}`).slice(0, 8);
  if (input.sessions.length > curriculum.length) {
    curriculum.push(`… ${input.sessions.length - curriculum.length} more sessions`);
  }
  // Apply numeric discount rules (percentage/fixed) in declaration order;
  // "special" rules don't change the headline tuition.
  const discounted = input.discounts.reduce((acc, rule) => {
    if (rule.type === 'percentage') return Math.max(0, Math.round(acc * (1 - rule.value / 100)));
    if (rule.type === 'fixed') return Math.max(0, acc - rule.value);
    return acc;
  }, input.tuitionAmount);
  const course: Course = {
    id,
    code: input.code.trim(),
    title: input.title.trim(),
    ageRange: `Ages ${input.minAge}–${input.maxAge}`,
    tagline: input.tags[0] ?? input.level,
    weeks: input.weeks,
    classes: 0,
    enrolled: 0,
    capacity: input.perClassCapacity * Math.max(1, input.sessionsPerWeek),
    status: 'draft',
    category: input.category,
    cover: `${coverPrefix} · COVER`,
    version: 'v0.1',
    tuition: `${VND_FORMATTER.format(discounted)}₫`,
    perClassCapacity: input.perClassCapacity,
    description: input.description.trim(),
    curriculum: curriculum.length ? curriculum : ['Outline pending']
  };
  courses.unshift(course);
  return course;
}
