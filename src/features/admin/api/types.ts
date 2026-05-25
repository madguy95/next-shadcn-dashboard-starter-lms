import type { AvatarTone } from '../data';

export type Paginated<T> = {
  data: T[];
  total: number;
  pageCount: number;
};

export const TEACHER_STATUSES = ['active', 'on_leave', 'pending'] as const;
export type TeacherStatus = (typeof TEACHER_STATUSES)[number];

export function isTeacherStatus(value: string | null | undefined): value is TeacherStatus {
  return !!value && (TEACHER_STATUSES as readonly string[]).includes(value);
}

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'] as const;
export type Gender = (typeof GENDERS)[number];

export type Teacher = {
  id: string;
  name: string;
  email: string;
  phone: string;
  initials: string;
  tone: AvatarTone;
  subjects: string[];
  classCount: number;
  studentCount: number;
  rating: number;
  status: TeacherStatus;
  gender?: Gender;
  dateOfBirth?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  location?: string;
};

export type TeacherStatusFilter = TeacherStatus | 'all';

export type TeacherStatusTab = {
  value: TeacherStatusFilter;
  count: number;
};

export type TeacherListParams = {
  page: number;
  perPage: number;
  status?: TeacherStatus;
  search?: string;
};

export type CreateTeacherInput = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  primarySubject: string;
  location: string;
  tags: string[];
  sendOnboardingEmail: boolean;
  gender: Gender;
  dateOfBirth: string;
  avatar?: File;
};

export type UpdateTeacherInput = Omit<CreateTeacherInput, 'sendOnboardingEmail'>;

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

export type Course = {
  id: string;
  code: string;
  title: string;
  ageRange: string;
  tagline: string;
  weeks: number;
  classes: number;
  enrolled: number;
  capacity: number;
  status: CourseStatus;
  category: CourseCategory;
  cover: string;
  version: string;
  tuition: string;
  perClassCapacity: number;
  description: string;
  curriculum: string[];
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
