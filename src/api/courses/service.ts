import { apiClient, apiClientPaged } from '@/lib/api-client';
import { uploadIfPresent } from '../files/service';
import type { Paginated } from '../shared/types';
import type {
  Course,
  CourseListParams,
  CourseSessionInput,
  CourseStats,
  CourseStatus,
  CourseTool,
  CourseToolFilter,
  CourseToolTab,
  CreateCourseInput,
  DiscountRule,
  DiscountRuleInput,
  DuplicateCourseInput,
  PublicCourse,
  PublicCourseDetail,
  UpdateCourseInput
} from './types';

// Cover image + intro video are uploaded ahead of the create/update call via
// /api/files/upload/course-cover and /api/files/upload/course-intro-video; the
// resulting URLs are then forwarded as `coverUrl` / `introVideoUrl` in the JSON
// payload. Callers continue to pass raw File objects in CreateCourseInput.

type CourseSessionDto = {
  title: string;
  description?: string;
};

type CourseDiscountDto = {
  name: string;
  type: DiscountRule['type'];
  value?: unknown;
  condition?: DiscountRule['condition'];
  conditionDate?: string;
};

type CourseDto = {
  id: number;
  code: string;
  title: string;
  tagline?: string;
  description?: string;
  tool: CourseTool;
  status: CourseStatus;
  minAge: number;
  maxAge: number;
  totalSessions: number;
  sessionDurationMinutes: number;
  perClassCapacity: number;
  capacity: number;
  classes: number;
  enrolled: number;
  tuitionAmount: number;
  originalTuitionAmount?: number;
  coverUrl?: string;
  introVideoUrl?: string;
  pricingNotes?: string;
  version: string;
  curriculum?: string[];
  sessions?: CourseSessionDto[];
  discounts?: CourseDiscountDto[];
  createdAt?: string;
  updatedAt?: string;
};

function deriveCover(tool: CourseTool): string {
  return `${tool.toUpperCase()} · COVER`;
}

function mapDiscount(d: CourseDiscountDto): DiscountRule {
  const condition = (d.condition ?? 'none') as DiscountRule['condition'];
  if (d.type === 'special') {
    return {
      name: d.name,
      type: 'special',
      value: typeof d.value === 'string' ? d.value : String(d.value ?? ''),
      condition,
      conditionDate: d.conditionDate
    };
  }
  return {
    name: d.name,
    type: d.type,
    value: typeof d.value === 'number' ? d.value : Number(d.value ?? 0),
    condition,
    conditionDate: d.conditionDate
  };
}

function mapCourse(dto: CourseDto): Course {
  const sessions = dto.sessions?.map((s) => ({
    title: s.title,
    description: s.description ?? ''
  })) satisfies CourseSessionInput[] | undefined;

  return {
    id: String(dto.id),
    code: dto.code,
    title: dto.title,
    minAge: dto.minAge,
    maxAge: dto.maxAge,
    tagline: dto.tagline ?? dto.tool,
    totalSessions: dto.totalSessions,
    sessionDurationMinutes: dto.sessionDurationMinutes,
    classes: dto.classes ?? 0,
    enrolled: dto.enrolled ?? 0,
    capacity: dto.capacity ?? dto.perClassCapacity,
    status: dto.status,
    tool: dto.tool,
    cover: deriveCover(dto.tool),
    coverUrl: dto.coverUrl,
    introVideoUrl: dto.introVideoUrl,
    version: dto.version,
    tuitionAmount: dto.tuitionAmount,
    originalTuitionAmount: dto.originalTuitionAmount,
    perClassCapacity: dto.perClassCapacity,
    description: dto.description ?? '',
    curriculum: dto.curriculum ?? [],
    sessions,
    discounts: dto.discounts?.map(mapDiscount),
    pricingNotes: dto.pricingNotes
  };
}

function buildListQuery(params: CourseListParams): string {
  const search = new URLSearchParams();
  search.set('page', String(params.page ?? 1));
  search.set('size', String(params.size ?? 10));
  if (params.tool) search.set('tool', params.tool);
  if (params.status) search.set('status', params.status);
  if (params.search) search.set('search', params.search);
  return search.toString();
}

function toDiscountPayload(d: DiscountRuleInput) {
  return {
    name: d.name,
    type: d.type,
    value: d.value,
    condition: d.condition,
    conditionDate: d.conditionDate
  };
}

function toCreatePayload(
  input: CreateCourseInput,
  media: { coverUrl?: string; introVideoUrl?: string }
) {
  return {
    title: input.title,
    code: input.code,
    description: input.description,
    tool: input.tool,
    minAge: input.minAge,
    maxAge: input.maxAge,
    totalSessions: input.totalSessions,
    sessionDurationMinutes: input.sessionDurationMinutes,
    perClassCapacity: input.perClassCapacity,
    tags: input.tags,
    sessions: input.sessions,
    tuitionAmount: input.tuitionAmount,
    discounts: input.discounts.map(toDiscountPayload),
    pricingNotes: input.pricingNotes,
    coverUrl: media.coverUrl,
    introVideoUrl: media.introVideoUrl
  };
}

function toUpdatePayload(
  input: UpdateCourseInput,
  media: { coverUrl?: string; introVideoUrl?: string }
) {
  const body: Record<string, unknown> = {};
  if (input.title !== undefined) body.title = input.title;
  if (input.code !== undefined) body.code = input.code;
  if (input.description !== undefined) body.description = input.description;
  if (input.tool !== undefined) body.tool = input.tool;
  if (input.status !== undefined) body.status = input.status;
  if (input.minAge !== undefined) body.minAge = input.minAge;
  if (input.maxAge !== undefined) body.maxAge = input.maxAge;
  if (input.totalSessions !== undefined) body.totalSessions = input.totalSessions;
  if (input.sessionDurationMinutes !== undefined)
    body.sessionDurationMinutes = input.sessionDurationMinutes;
  if (input.perClassCapacity !== undefined) body.perClassCapacity = input.perClassCapacity;
  if (input.tags !== undefined) body.tags = input.tags;
  if (input.sessions !== undefined) body.sessions = input.sessions;
  if (input.tuitionAmount !== undefined) body.tuitionAmount = input.tuitionAmount;
  if (input.discounts !== undefined) body.discounts = input.discounts.map(toDiscountPayload);
  if (input.pricingNotes !== undefined) body.pricingNotes = input.pricingNotes;
  // Only send URL when a new file was uploaded — leaving the field out preserves the existing one.
  if (media.coverUrl !== undefined) body.coverUrl = media.coverUrl;
  if (media.introVideoUrl !== undefined) body.introVideoUrl = media.introVideoUrl;
  return body;
}

export async function getCourses(params: CourseListParams): Promise<Paginated<Course>> {
  const paged = await apiClientPaged<CourseDto>(`/api/courses?${buildListQuery(params)}`);
  return {
    data: paged.data.map(mapCourse),
    total: paged.totalElements,
    pageCount: paged.totalPages
  };
}

export async function getCourseToolTabs(): Promise<CourseToolTab[]> {
  const tabs = await apiClient<{ value: string; count: number }[]>('/api/courses/tool-tabs');
  return tabs.map((t) => ({
    value: t.value as CourseToolFilter,
    count: t.count
  }));
}

export async function getCourseStats(): Promise<CourseStats> {
  return apiClient<CourseStats>('/api/courses/stats');
}

export async function getCourseById(id: string): Promise<Course> {
  const dto = await apiClient<CourseDto>(`/api/courses/${id}`);
  return mapCourse(dto);
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  // Upload media in parallel before creating the course so a single 4xx from
  // either upload short-circuits the call without leaving a half-created entity.
  const [coverUrl, introVideoUrl] = await Promise.all([
    uploadIfPresent(input.cover, 'COURSE_COVER'),
    uploadIfPresent(input.introVideo, 'COURSE_INTRO_VIDEO')
  ]);
  const dto = await apiClient<CourseDto>('/api/courses', {
    method: 'POST',
    body: JSON.stringify(toCreatePayload(input, { coverUrl, introVideoUrl }))
  });
  return mapCourse(dto);
}

export async function updateCourse(id: string, input: UpdateCourseInput): Promise<Course> {
  const [coverUrl, introVideoUrl] = await Promise.all([
    uploadIfPresent(input.cover, 'COURSE_COVER'),
    uploadIfPresent(input.introVideo, 'COURSE_INTRO_VIDEO')
  ]);
  const dto = await apiClient<CourseDto>(`/api/courses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toUpdatePayload(input, { coverUrl, introVideoUrl }))
  });
  return mapCourse(dto);
}

export async function deleteCourse(id: string): Promise<{ id: string }> {
  await apiClient<void>(`/api/courses/${id}`, { method: 'DELETE' });
  return { id };
}

export async function duplicateCourse(
  id: string,
  input: DuplicateCourseInput = {}
): Promise<Course> {
  const dto = await apiClient<CourseDto>(`/api/courses/${id}/duplicate`, {
    method: 'POST',
    body: JSON.stringify({
      code: input.code,
      title: input.title
    })
  });
  return mapCourse(dto);
}

export async function setCourseStatus(id: string, status: CourseStatus): Promise<Course> {
  const dto = await apiClient<CourseDto>(`/api/courses/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return mapCourse(dto);
}

/**
 * Public, unauthenticated course catalog. Hits a permitAll endpoint so it can be called
 * from the marketing site without a JWT. Uses server-side pagination for SEO.
 */
export async function getPublicCourses(params: {
  page: number;
  size: number;
}): Promise<Paginated<PublicCourse>> {
  const paged = await apiClientPaged<PublicCourse>(
    `/api/public/courses?page=${params.page}&size=${params.size}`
  );
  return {
    data: paged.data,
    total: paged.totalElements,
    pageCount: paged.totalPages
  };
}

/**
 * Public detail for one published course (full description + sessions + intro video).
 * Returns 404 if the course is not published.
 */
export async function getPublicCourseById(id: number | string): Promise<PublicCourseDetail> {
  return apiClient<PublicCourseDetail>(`/api/public/courses/${id}`);
}
