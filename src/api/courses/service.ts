import { MOCK_LATENCY_MS, sleep } from '../shared/mock-utils';
import type { Paginated } from '../shared/types';
import { courseCategoryTabConfig, courses } from './mock';
import type {
  Course,
  CourseCategoryTab,
  CourseListParams,
  CourseStats,
  CourseStatus,
  CreateCourseInput,
  DuplicateCourseInput,
  UpdateCourseInput
} from './types';

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

function buildCurriculum(input: Pick<CreateCourseInput, 'sessions'>): string[] {
  const curriculum = input.sessions.map((s, i) => s.title.trim() || `Session ${i + 1}`).slice(0, 8);
  if (input.sessions.length > curriculum.length) {
    curriculum.push(`… ${input.sessions.length - curriculum.length} more sessions`);
  }
  return curriculum.length ? curriculum : ['Outline pending'];
}

// Apply numeric discount rules (percentage/fixed) in declaration order;
// "special" rules don't change the headline tuition.
function applyDiscounts(base: number, discounts: CreateCourseInput['discounts']): number {
  return discounts.reduce((acc, rule) => {
    if (rule.type === 'percentage') return Math.max(0, Math.round(acc * (1 - rule.value / 100)));
    if (rule.type === 'fixed') return Math.max(0, acc - rule.value);
    return acc;
  }, base);
}

function nextCourseId(): string {
  // Mock IDs match the existing `c-N` shape; collision-safe against deletions.
  const taken = new Set(courses.map((c) => c.id));
  let n = courses.length + 1;
  while (taken.has(`c-${n}`)) n += 1;
  return `c-${n}`;
}

function bumpVersion(version: string): string {
  const match = /^v(\d+)\.(\d+)$/.exec(version);
  if (!match) return 'v0.2';
  const major = Number(match[1]);
  const minor = Number(match[2]);
  return `v${major}.${minor + 1}`;
}

export async function getCourseById(id: string): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const course = courses.find((c) => c.id === id);
  if (!course) throw new Error(`Course ${id} not found`);
  return course;
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const coverPrefix = COURSE_COVER_BY_CATEGORY[input.category] ?? 'COURSE';
  const discounted = applyDiscounts(input.tuitionAmount, input.discounts);
  const hasNumericDiscount = input.discounts.some(
    (d) => d.type === 'percentage' || d.type === 'fixed'
  );
  const course: Course = {
    id: nextCourseId(),
    code: input.code.trim(),
    title: input.title.trim(),
    minAge: input.minAge,
    maxAge: input.maxAge,
    tagline: input.tags[0] ?? input.level,
    totalSessions: input.totalSessions,
    sessionDurationMinutes: input.sessionDurationMinutes,
    classes: 0,
    enrolled: 0,
    capacity: input.perClassCapacity,
    status: 'draft',
    category: input.category,
    level: input.level,
    cover: `${coverPrefix} · COVER`,
    coverUrl: input.cover ? URL.createObjectURL(input.cover) : undefined,
    introVideoUrl: input.introVideo ? URL.createObjectURL(input.introVideo) : undefined,
    version: 'v0.1',
    tuitionAmount: discounted,
    originalTuitionAmount: hasNumericDiscount ? input.tuitionAmount : undefined,
    perClassCapacity: input.perClassCapacity,
    description: input.description.trim(),
    curriculum: buildCurriculum(input),
    sessions: input.sessions,
    discounts: input.discounts.length ? input.discounts : undefined,
    pricingNotes: input.pricingNotes?.trim() || undefined
  };
  courses.unshift(course);
  return course;
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Course ${id} not found`);
  const existing = courses[idx];

  const category = input.category ?? existing.category;
  const coverPrefix = COURSE_COVER_BY_CATEGORY[category] ?? 'COURSE';

  // Recompute tuition + originalTuition only when the caller touched pricing.
  // Otherwise preserve the existing values verbatim.
  const pricingTouched = typeof input.tuitionAmount === 'number' || input.discounts !== undefined;
  let tuitionAmount = existing.tuitionAmount;
  let originalTuitionAmount = existing.originalTuitionAmount;
  let discounts = input.discounts ?? existing.discounts;
  if (pricingTouched) {
    const nextDiscounts = input.discounts ?? existing.discounts ?? [];
    // We don't have a stored base amount on Course, so when only `discounts`
    // change without a new `tuitionAmount`, we keep the existing tuition.
    if (typeof input.tuitionAmount === 'number') {
      const hasNumeric = nextDiscounts.some((d) => d.type === 'percentage' || d.type === 'fixed');
      tuitionAmount = applyDiscounts(input.tuitionAmount, nextDiscounts);
      originalTuitionAmount = hasNumeric ? input.tuitionAmount : undefined;
    }
    discounts = nextDiscounts.length ? nextDiscounts : undefined;
  }

  const updated: Course = {
    ...existing,
    code: input.code?.trim() ?? existing.code,
    title: input.title?.trim() ?? existing.title,
    description: input.description?.trim() ?? existing.description,
    category,
    level: input.level ?? existing.level,
    minAge: input.minAge ?? existing.minAge,
    maxAge: input.maxAge ?? existing.maxAge,
    tagline: input.tags?.[0] ?? input.level ?? existing.tagline,
    totalSessions: input.totalSessions ?? existing.totalSessions,
    sessionDurationMinutes: input.sessionDurationMinutes ?? existing.sessionDurationMinutes,
    perClassCapacity: input.perClassCapacity ?? existing.perClassCapacity,
    capacity: input.perClassCapacity ?? existing.capacity,
    status: input.status ?? existing.status,
    cover: input.category ? `${coverPrefix} · COVER` : existing.cover,
    coverUrl: input.cover ? URL.createObjectURL(input.cover) : existing.coverUrl,
    introVideoUrl: input.introVideo
      ? URL.createObjectURL(input.introVideo)
      : existing.introVideoUrl,
    tuitionAmount,
    originalTuitionAmount,
    curriculum: input.sessions
      ? buildCurriculum({ sessions: input.sessions })
      : existing.curriculum,
    sessions: input.sessions ?? existing.sessions,
    discounts,
    pricingNotes:
      input.pricingNotes !== undefined
        ? input.pricingNotes.trim() || undefined
        : existing.pricingNotes,
    version: bumpVersion(existing.version)
  };
  courses[idx] = updated;
  return updated;
}

export async function deleteCourse(id: string): Promise<{ id: string }> {
  await sleep(MOCK_LATENCY_MS);
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Course ${id} not found`);
  courses.splice(idx, 1);
  return { id };
}

export async function duplicateCourse(
  id: string,
  input: DuplicateCourseInput = {}
): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const source = courses.find((c) => c.id === id);
  if (!source) throw new Error(`Course ${id} not found`);
  const copy: Course = {
    ...source,
    id: nextCourseId(),
    code: input.code?.trim() ?? `${source.code}-COPY`,
    title: input.title?.trim() ?? `${source.title} (copy)`,
    status: 'draft',
    version: 'v0.1',
    classes: 0,
    enrolled: 0
  };
  courses.unshift(copy);
  return copy;
}

export async function setCourseStatus(id: string, status: CourseStatus): Promise<Course> {
  await sleep(MOCK_LATENCY_MS);
  const idx = courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error(`Course ${id} not found`);
  courses[idx] = { ...courses[idx], status };
  return courses[idx];
}
