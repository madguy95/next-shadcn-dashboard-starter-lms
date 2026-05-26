import type { useTranslations } from 'next-intl';
import * as z from 'zod';
import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  DISCOUNT_CONDITIONS,
  DISCOUNT_TYPES,
  type CourseCategory,
  type CourseLevel,
  type DiscountCondition,
  type DiscountRuleInput,
  type DiscountType
} from '@/api/courses';

export const MAX_DESC = 240;
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const MAX_COVER_SIZE = 5 * 1024 * 1024;

export const stepKeys = ['basics', 'outline', 'pricing'] as const;
export type StepKey = (typeof stepKeys)[number];

export type SessionValue = { title: string; description: string };

export type DiscountValue = {
  name: string;
  type: DiscountType;
  value: string;
  condition: DiscountCondition;
  conditionDate: string;
};

export type CourseFormValues = {
  title: string;
  code: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  minAge: number | '';
  maxAge: number | '';
  totalSessions: number | '';
  sessionDurationMinutes: number | '';
  perClassCapacity: number | '';
  tags: string[];
  cover: File[];
  introVideo: File[];
  sessions: SessionValue[];
  tuitionAmount: number | '';
  discounts: DiscountValue[];
  pricingNotes: string;
};

export const defaultValues: CourseFormValues = {
  title: '',
  code: '',
  description: '',
  category: 'stem',
  level: 'intermediate',
  minAge: 12,
  maxAge: 15,
  totalSessions: 20,
  sessionDurationMinutes: 75,
  perClassCapacity: 12,
  tags: [],
  cover: [],
  introVideo: [],
  sessions: [],
  tuitionAmount: 3000000,
  discounts: [],
  pricingNotes: ''
};

export const blankDiscount = (): DiscountValue => ({
  name: '',
  type: 'percentage',
  value: '',
  condition: 'none',
  conditionDate: ''
});

export const stepFieldNames: Record<StepKey, (keyof CourseFormValues)[]> = {
  basics: [
    'title',
    'code',
    'description',
    'category',
    'level',
    'minAge',
    'maxAge',
    'totalSessions',
    'sessionDurationMinutes',
    'perClassCapacity',
    'tags',
    'cover',
    'introVideo'
  ],
  outline: ['sessions'],
  pricing: ['tuitionAmount', 'discounts', 'pricingNotes']
};

type ValidationT = ReturnType<typeof useTranslations>;

export function buildBaseSchema(tValidation: ValidationT) {
  return z.object({
    title: z.string().trim().min(1, tValidation('titleRequired')),
    code: z
      .string()
      .trim()
      .min(1, tValidation('codeRequired'))
      .regex(/^[A-Z0-9-]{3,10}$/, tValidation('codeFormat')),
    description: z
      .string()
      .trim()
      .min(1, tValidation('descriptionRequired'))
      .max(MAX_DESC, tValidation('descriptionMax', { max: MAX_DESC })),
    category: z.enum(COURSE_CATEGORIES, { error: tValidation('categoryRequired') }),
    level: z.enum(COURSE_LEVELS, { error: tValidation('levelRequired') }),
    minAge: z
      .number({ error: tValidation('minAgeRange') })
      .int()
      .min(3, tValidation('minAgeRange'))
      .max(99, tValidation('minAgeRange')),
    maxAge: z
      .number({ error: tValidation('maxAgeRange') })
      .int()
      .min(3, tValidation('maxAgeRange'))
      .max(99, tValidation('maxAgeRange')),
    totalSessions: z
      .number({ error: tValidation('totalSessionsMin') })
      .int()
      .min(1, tValidation('totalSessionsMin')),
    sessionDurationMinutes: z
      .number({ error: tValidation('sessionDurationMin') })
      .int()
      .min(1, tValidation('sessionDurationMin')),
    perClassCapacity: z
      .number({ error: tValidation('capacityMin') })
      .int()
      .min(1, tValidation('capacityMin')),
    tags: z.array(z.string()),
    cover: z.array(z.instanceof(File)).max(1),
    introVideo: z.array(z.instanceof(File)).max(1),
    sessions: z
      .array(
        z.object({
          title: z.string(),
          description: z.string()
        })
      )
      .min(1, tValidation('sessionsRequired'))
      .superRefine((arr, ctx) => {
        arr.forEach((s, i) => {
          if (!s.title.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'title'],
              message: tValidation('sessionTitleRequired', { n: i + 1 })
            });
          }
        });
      }),
    tuitionAmount: z.number({ error: tValidation('tuitionMin') }).min(0, tValidation('tuitionMin')),
    discounts: z
      .array(
        z.object({
          name: z.string(),
          type: z.enum(DISCOUNT_TYPES),
          value: z.string(),
          condition: z.enum(DISCOUNT_CONDITIONS),
          conditionDate: z.string()
        })
      )
      .superRefine((arr, ctx) => {
        const today = new Date(new Date().setHours(0, 0, 0, 0));
        arr.forEach((d, i) => {
          if (!d.name.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: [i, 'name'],
              message: tValidation('discountNameRequired', { n: i + 1 })
            });
          }
          if (d.type === 'special') {
            if (!d.value.trim()) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'value'],
                message: tValidation('discountSpecialValueRequired', { n: i + 1 })
              });
            }
          } else {
            const n = Number(d.value);
            if (Number.isNaN(n)) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'value'],
                message: tValidation(
                  d.type === 'percentage' ? 'discountPercentRange' : 'discountAmountMin',
                  { n: i + 1 }
                )
              });
            } else if (d.type === 'percentage' && (n < 0 || n > 100)) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'value'],
                message: tValidation('discountPercentRange', { n: i + 1 })
              });
            } else if (d.type === 'fixed' && n < 0) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'value'],
                message: tValidation('discountAmountMin', { n: i + 1 })
              });
            }
          }
          if (d.condition === 'before_date') {
            if (!d.conditionDate) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'conditionDate'],
                message: tValidation('discountDateRequired', { n: i + 1 })
              });
            } else if (new Date(d.conditionDate) < today) {
              ctx.addIssue({
                code: 'custom',
                path: [i, 'conditionDate'],
                message: tValidation('discountDatePast', { n: i + 1 })
              });
            }
          }
        });
      }),
    pricingNotes: z.string()
  });
}

export type BaseSchema = ReturnType<typeof buildBaseSchema>;

export function buildSchema(baseSchema: BaseSchema, tValidation: ValidationT) {
  return baseSchema.refine((v) => Number(v.maxAge) >= Number(v.minAge), {
    path: ['maxAge'],
    message: tValidation('ageOrder')
  });
}

// Convert a zod issue.path (e.g. ['discounts', 0, 'name']) into the
// TanStack form field name format ('discounts[0].name').
export const zodPathToFieldName = (path: readonly PropertyKey[]) =>
  path.reduce<string>((acc, segment, i) => {
    if (i === 0) return String(segment);
    return typeof segment === 'number' ? `${acc}[${segment}]` : `${acc}.${String(segment)}`;
  }, '');

// Map a form-shaped discount (everything is a string) into the API-shaped one
// (numeric value for percentage/fixed). Shared by the add and edit dialogs.
export function toDiscountRuleInput(d: DiscountValue): DiscountRuleInput {
  const base = {
    name: d.name.trim(),
    condition: d.condition,
    conditionDate: d.conditionDate || undefined
  };
  if (d.type === 'special') {
    return { ...base, type: 'special', value: d.value.trim() };
  }
  return { ...base, type: d.type, value: Number(d.value) };
}
