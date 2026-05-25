export const COURSE_STATUSES = ['published', 'draft'] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const COURSE_CATEGORIES = [
  'coding',
  'design',
  'robotics',
  'stem',
  'language',
  'game'
] as const;
export type CourseCategory = (typeof COURSE_CATEGORIES)[number];

export type CourseCategoryFilter = CourseCategory | 'all';

export function isCourseCategory(value: string | null | undefined): value is CourseCategory {
  return !!value && (COURSE_CATEGORIES as readonly string[]).includes(value);
}

export const COURSE_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

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
  weeks: number;
  classes: number;
  enrolled: number;
  capacity: number;
  status: CourseStatus;
  category: CourseCategory;
  level: CourseLevel;
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

export type CourseCategoryTab = {
  value: CourseCategoryFilter;
  count: number;
};

export type CourseListParams = {
  category?: CourseCategory;
  search?: string;
};

export type CourseStats = {
  total: number;
  published: number;
  drafts: number;
};

export type CreateCourseInput = {
  title: string;
  code: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  minAge: number;
  maxAge: number;
  weeks: number;
  sessionsPerWeek: number;
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
