export const COURSE_STATUSES = ['published', 'draft', 'unpublished'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

// Tool codes are the source of truth in the backend master_data table (type='tool').
// The FE treats CourseTool as an open-ended string so the dropdown stays driven by
// the API rather than a hardcoded enum.
export type CourseTool = string;

export type CourseToolFilter = CourseTool | 'all';

export type CourseSessionInput = {
  title: string;
  description: string;
};

export const DISCOUNT_TYPES = ['percentage', 'fixed', 'special'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export const DISCOUNT_CONDITIONS = ['none', 'before_date', 'has_sibling', 'trial_only'] as const;
export type DiscountCondition = (typeof DISCOUNT_CONDITIONS)[number];

export type DiscountRuleInput =
  | {
      name: string;
      type: 'percentage';
      value: number;
      condition: DiscountCondition;
      conditionDate?: string;
    }
  | {
      name: string;
      type: 'fixed';
      value: number;
      condition: DiscountCondition;
      conditionDate?: string;
    }
  | {
      name: string;
      type: 'special';
      value: string;
      condition: DiscountCondition;
      conditionDate?: string;
    };

// Discount rules stored on a saved Course have the same shape as the input form.
export type DiscountRule = DiscountRuleInput;

export type Course = {
  id: string;
  code: string;
  title: string;
  minAge: number;
  maxAge: number;
  tagline: string;
  totalSessions: number;
  sessionDurationMinutes: number;
  classes: number;
  enrolled: number;
  capacity: number;
  status: CourseStatus;
  tool: CourseTool;
  cover: string;
  // Real image / video URLs once the user uploads media. The string `cover`
  // field above is a stable text placeholder used when no image exists.
  coverUrl?: string;
  introVideoUrl?: string;
  version: string;
  // Final tuition in VND (raw amount). UI formats via formatTuition().
  tuitionAmount: number;
  // Pre-discount tuition in VND. Set only when numeric discounts apply so the
  // detail panel can render a strike-through next to the headline price.
  originalTuitionAmount?: number;
  perClassCapacity: number;
  description: string;
  curriculum: string[];
  // Full session data once the course has been created via the wizard or edited.
  // Existing courses created before this field was introduced may not have it —
  // the edit dialog derives starter sessions from `curriculum` in that case.
  sessions?: CourseSessionInput[];
  discounts?: DiscountRule[];
  pricingNotes?: string;
};

export type CourseToolTab = {
  value: CourseToolFilter;
  count: number;
};

export type CourseListParams = {
  tool?: CourseTool;
  status?: CourseStatus;
  search?: string;
  page?: number;
  size?: number;
};

export type CourseStats = {
  total: number;
  published: number;
  drafts: number;
  unpublished: number;
};

export type CreateCourseInput = {
  title: string;
  code: string;
  description: string;
  tool: CourseTool;
  minAge: number;
  maxAge: number;
  totalSessions: number;
  sessionDurationMinutes: number;
  perClassCapacity: number;
  tags: string[];
  cover?: File;
  introVideo?: File;
  sessions: CourseSessionInput[];
  tuitionAmount: number;
  discounts: DiscountRuleInput[];
  pricingNotes?: string;
};

// Partial update — every field optional. File fields are kept because the mock
// service swaps them in-place via URL.createObjectURL; a real API would route
// the File parts through a separate upload endpoint.
export type UpdateCourseInput = Partial<CreateCourseInput> & {
  status?: CourseStatus;
};

export type DuplicateCourseInput = {
  title?: string;
  code?: string;
};

export type PublicCourseListParams = {
  page: number;
  size: number;
  search?: string;
  tool?: string;
  sort?: string;
};

// Lean public payload returned by GET /api/public/courses for the marketing landing page.
// Always represents a published course; no internal status / sessions / discounts.
export type PublicCourse = {
  id: number;
  code: string;
  title: string;
  tagline?: string;
  description?: string;
  tool: CourseTool;
  minAge: number;
  maxAge: number;
  totalSessions: number;
  sessionDurationMinutes: number;
  tuitionAmount: number;
  originalTuitionAmount?: number;
  coverUrl?: string;
  // ISO timestamp — used FE-side to derive "isNew" badges.
  createdAt?: string;
};

// Detailed public payload returned by GET /api/public/courses/{id}. Superset of PublicCourse
// with the full session list + intro video + pricing notes so the detail sheet can render real content.
export type PublicCourseDetail = PublicCourse & {
  perClassCapacity: number;
  introVideoUrl?: string;
  pricingNotes?: string;
  sessions: CourseSessionInput[];
};
